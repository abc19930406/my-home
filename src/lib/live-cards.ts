// 首頁/管理頁是 prerender 靜態頁，cards 在 build time 烤進 HTML，改完要等重新部署才生效。
// 這裡在載入後重讀 cards 表並「原地更新」既有卡片：讀取成功才替換，失敗一律保留靜態版。
// 不整區重繪的原因：CardSection 有 scoped CSS(data-astro-cid-*)，旅行地圖卡有專屬 id/子選單/點擊處理，
// 重繪會讓樣式與互動失效。文字一律用 textContent/屬性 setter，不用 innerHTML 塞資料庫內容。

const SECTION_ORDER = ['知識與創作', '生活記錄', '工具'];

function cidAttr(el: Element): string | undefined {
  return el.getAttributeNames().find((n) => n.startsWith('data-astro-cid'));
}

function withCid<T extends Element>(el: T, cid?: string): T {
  if (cid) el.setAttribute(cid, '');
  return el;
}

function updateCard(cardEl: Element, row: any, cid?: string) {
  const isTravel = cardEl.classList.contains('travel-map-card');

  const iconEl = cardEl.querySelector('.card-icon');
  if (iconEl && row.icon) iconEl.className = `ti ti-${row.icon} card-icon`;

  // 標題：有連結且非旅行地圖用 <a>，否則 <span>；型態不同時替換元素(沿用 scoped 屬性)
  const titleEl = cardEl.querySelector('.card-title');
  if (titleEl) {
    const wantLink = !!row.url && !isTravel;
    const isLink = titleEl.tagName === 'A';
    if (wantLink) {
      let a = titleEl as HTMLAnchorElement;
      if (!isLink) {
        a = withCid(document.createElement('a'), cid);
        a.className = 'card-title card-title--link';
        titleEl.replaceWith(a);
      }
      a.textContent = row.title;
      a.setAttribute('href', row.url);
    } else {
      let span = titleEl as HTMLElement;
      if (isLink) {
        span = withCid(document.createElement('span'), cid);
        span.className = 'card-title';
        titleEl.replaceWith(span);
      }
      span.textContent = row.title;
    }
  }

  const descEl = cardEl.querySelector('.card-desc');
  if (descEl) descEl.textContent = row.description ?? '';

  // 子連結
  const children: { title: string; url: string }[] = Array.isArray(row.children) ? row.children : [];
  let childBox = cardEl.querySelector('.card-children');
  if (children.length === 0) {
    childBox?.remove();
  } else {
    if (!childBox) {
      childBox = withCid(document.createElement('div'), cid);
      childBox.className = 'card-children';
      descEl?.after(childBox);
    }
    childBox.replaceChildren(
      ...children.map((c) => {
        const a = withCid(document.createElement('a'), cid);
        a.className = 'child-link';
        a.setAttribute('href', c.url);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        const arrow = withCid(document.createElement('span'), cid);
        arrow.className = 'child-arrow';
        arrow.textContent = '→';
        a.append(arrow, ` ${c.title}`);
        return a;
      })
    );
  }

  // 管理頁的編輯按鈕：資料集同步為資料庫最新值(編輯 Modal 以標題比對更新，過期的標題會匹配 0 列)
  const editBtn = cardEl.querySelector('.edit-btn') as HTMLElement | null;
  if (editBtn) {
    editBtn.dataset.id = row.id ?? '';
    editBtn.dataset.title = row.title ?? '';
    editBtn.dataset.desc = row.description ?? '';
    editBtn.dataset.url = row.url ?? '';
  }
}

export async function refreshCardsFromDb(supabase: any) {
  try {
    const { data, error } = await supabase.from('cards').select('*').order('sort_order', { ascending: true });
    if (error || !Array.isArray(data) || data.length === 0) return;

    const sections = Array.from(document.querySelectorAll('.card-section'));
    for (const name of SECTION_ORDER) {
      const sectionEl = sections.find((s) => s.querySelector('.section-title')?.textContent?.includes(name));
      if (!sectionEl) continue;
      const rows = data.filter((r: any) => r.section === name);
      const cardEls = Array.from(sectionEl.querySelectorAll('.card'));
      // 卡片數不一致代表結構有變動(UI 只能編輯既有卡片)，該分區保留靜態版，寧可不動也不掉卡片
      if (rows.length === 0 || rows.length !== cardEls.length) continue;
      const cid = cidAttr(sectionEl);
      rows.forEach((row: any, i: number) => updateCard(cardEls[i], row, cid));
    }
  } catch (err) {
    console.warn('重讀卡片失敗，保留建置時的內容', err);
  }
}
