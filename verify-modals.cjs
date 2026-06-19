const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4321/trip');
    await page.waitForTimeout(2000);

    const displays = await page.evaluate(() => {
      const tModal = document.querySelector('.travel-modal-overlay');
      const jModal = document.querySelector('.japan-modal-overlay');
      return {
        tModalDisplay: tModal ? getComputedStyle(tModal).display : 'null',
        jModalDisplay: jModal ? getComputedStyle(jModal).display : 'null'
      };
    });
    
    console.log(`travel modal display: ${displays.tModalDisplay}`);
    console.log(`japan modal display: ${displays.jModalDisplay}`);

    // Verify "新增景點" modal
    await page.evaluate(() => document.getElementById('btn-open-spot-modal')?.click());
    await page.waitForTimeout(1000);
    const spotModalVisible = await page.evaluate(() => {
      const m = document.getElementById('spot-modal');
      return m && m.classList.contains('show') && getComputedStyle(m).opacity === '1';
    });
    console.log('行程分頁點擊「+ 新增景點」，Modal 正確顯示:', spotModalVisible);
    
    // Close it
    await page.evaluate(() => document.getElementById('btn-spot-modal-close')?.click());
    await page.waitForTimeout(500);

    // Switch to Japan Collection tab
    await page.click('button[data-target="japan"]');
    await page.waitForTimeout(1000);

    // Verify "新增品項" modal
    await page.evaluate(() => document.getElementById('btn-open-add-modal')?.click());
    await page.waitForTimeout(1000);
    const addModalVisible = await page.evaluate(() => {
      const m = document.getElementById('item-modal');
      return m && getComputedStyle(m).display === 'flex';
    });
    console.log('收藏分頁點擊「+ 新增品項」，Modal 正確顯示:', addModalVisible);

  } catch (e) {
    console.error("Script error:", e);
  } finally {
    await browser.close();
  }
})();
