const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4321/trip');
    await page.waitForTimeout(2000); // let JS initialize

    const logs = [];
    page.on('console', msg => {
      // Only keep messages we care about
      if (msg.text().includes('ms]')) {
        logs.push(msg.text());
      }
    });

    console.log("=== 測試「行程」分頁 (#spot-modal) ===\n監看器已啟動，請點擊「+ 新增景點」按鈕");
    await page.evaluate(() => {
      const modal = document.getElementById('spot-modal');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          console.log(`[${performance.now().toFixed(1)}ms] Modal 屬性變化: ${m.attributeName} 新值: ${modal.getAttribute(m.attributeName)}`);
        });
      });
      observer.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });

      const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          console.log(`[${performance.now().toFixed(1)}ms] BODY class 變化: ${document.body.className}`);
        });
      });
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    });

    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const btn = document.getElementById('btn-open-spot-modal');
      if (btn) btn.click();
    });
    
    await page.waitForTimeout(2000);
    
    // Close it
    await page.evaluate(() => {
      const btnClose = document.getElementById('btn-spot-modal-close');
      if (btnClose) btnClose.click();
    });
    
    await page.waitForTimeout(1000);
    console.log(logs.join('\n'));
    logs.length = 0; // reset logs

    console.log("\n=== 測試「收藏」分頁 (#item-modal) ===\n監看器已啟動，請點擊「+ 新增品項」按鈕");
    await page.click('button[data-target="japan"]');
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const modal = document.getElementById('item-modal');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          console.log(`[${performance.now().toFixed(1)}ms] Modal 屬性變化: ${m.attributeName} 新值: ${modal.getAttribute(m.attributeName)}`);
        });
      });
      observer.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
    });

    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const btn = document.getElementById('btn-open-add-modal');
      if (btn) btn.click();
    });
    
    await page.waitForTimeout(2000);
    
    // Close it
    await page.evaluate(() => {
      const btnClose = document.getElementById('btn-modal-close');
      if (btnClose) btnClose.click();
    });
    
    await page.waitForTimeout(1000);
    console.log(logs.join('\n'));

  } catch (e) {
    console.error("Script error:", e);
  } finally {
    await browser.close();
  }
})();
