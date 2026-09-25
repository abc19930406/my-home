// 主標題/副標題的讀取與管理員編輯：首頁(Welcome.astro)與管理頁(admin.astro)共用同一份邏輯，
// 都讀寫 status(id=1) 的 site_title/site_subtitle，不各寫一套。
// subtitleSuffix 只是「顯示層」附加文字(例如管理頁的「 (管理模式)」)：編輯框與寫入資料庫的永遠是純值。
const DEFAULT_TITLE = 'The Corner Table';
const DEFAULT_SUBTITLE = '一個安靜角落，存放思緒與生活';

interface Options {
  isAdmin: boolean;
  subtitleSuffix?: string;
}

export async function initTitleEditor(supabase: any, { isAdmin, subtitleSuffix = '' }: Options) {
  const $ = (id: string) => document.getElementById(id) as any;
  const titleEl = $('site-name');
  const subtitleEl = $('site-subtitle');
  const titleForm = $('title-edit-form');
  const titleInput = $('input-site-title');
  const subtitleInput = $('input-site-subtitle');
  const editTitleBtn = $('edit-title-btn');
  const saveTitleBtn = $('save-title-btn');
  const cancelTitleBtn = $('cancel-title-btn');
  if (!titleEl || !subtitleEl) return;

  // 目前的「純值」(不含顯示層後綴)；編輯時一律用這兩個值，不從畫面文字反推
  let curTitle: string = titleEl.textContent || DEFAULT_TITLE;
  let curSubtitle: string = (subtitleEl.textContent || DEFAULT_SUBTITLE).replace(subtitleSuffix, '');

  // 一律 textContent，不經 innerHTML
  const applyTitles = (title?: string | null, subtitle?: string | null) => {
    curTitle = (title || '').trim() || DEFAULT_TITLE;
    curSubtitle = (subtitle || '').trim() || DEFAULT_SUBTITLE;
    titleEl.textContent = curTitle;
    subtitleEl.textContent = curSubtitle + subtitleSuffix;
    if (titleInput) titleInput.value = curTitle;
    if (subtitleInput) subtitleInput.value = curSubtitle;
    const footerName = $('footer-site-name');
    if (footerName) footerName.textContent = curTitle;
  };

  // 頁面是靜態的：存檔後到重新部署完成前重新整理會看到舊 HTML，所以載入時再讀一次資料庫覆蓋畫面；
  // 失敗或無資料就保留 SSR 值(預設值)
  try {
    const { data: titleRow } = await supabase.from('status').select('site_title, site_subtitle').eq('id', 1).single();
    if (titleRow) applyTitles(titleRow.site_title, titleRow.site_subtitle);
  } catch (err) {
    console.warn('讀取標題失敗，使用預設/建置時的值', err);
  }

  if (!titleForm || !editTitleBtn) return;
  if (isAdmin) editTitleBtn.style.display = 'flex';

  const setEditing = (editing: boolean) => {
    titleForm.style.display = editing ? 'block' : 'none';
    titleEl.style.display = editing ? 'none' : '';
    subtitleEl.style.display = editing ? 'none' : '';
    editTitleBtn.style.display = editing ? 'none' : (isAdmin ? 'flex' : 'none');
  };

  editTitleBtn.addEventListener('click', () => {
    titleInput.value = curTitle;
    subtitleInput.value = curSubtitle;
    setEditing(true);
  });
  cancelTitleBtn?.addEventListener('click', () => setEditing(false));

  saveTitleBtn?.addEventListener('click', async () => {
    if (!isAdmin) return;
    const newTitle = titleInput.value.trim();
    const newSubtitle = subtitleInput.value.trim();
    const prevTitle = curTitle;
    const prevSubtitle = curSubtitle;

    // 樂觀更新；空白存 null，畫面回退預設值
    applyTitles(newTitle, newSubtitle);
    setEditing(false);

    try {
      const { data, error } = await supabase
        .from('status')
        .update({ site_title: newTitle || null, site_subtitle: newSubtitle || null })
        .eq('id', 1)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('沒有權限或資料不存在');

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetch('/api/trigger-deploy', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + session.access_token },
        }).catch(() => {});
      }
    } catch (err) {
      console.error('儲存標題失敗:', err);
      applyTitles(prevTitle, prevSubtitle);
      alert('儲存失敗，請檢查權限');
    }
  });
}
