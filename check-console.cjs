const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });
  page.on('pageerror', error => {
    errors.push(`[Uncaught Exception] ${error.message}\n${error.stack}`);
  });

  try {
    await page.goto('http://localhost:4321/trip');
    await page.waitForTimeout(2000);

    const tripId = await page.evaluate(() => window.currentTripId);
    console.log("window.currentTripId =", tripId);

    // Get errors before clicking
    console.log("\n--- Initial Errors ---");
    errors.forEach(e => console.log(e));
    errors.length = 0; // clear

    // We can evaluate JS to click to avoid playwright visibility issues
    await page.evaluate(() => {
      const tab = document.querySelector('[data-target="#collect"]');
      if (tab) tab.click();
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent.includes('新增品項'));
      if (addBtn) addBtn.click();
    });
    await page.waitForTimeout(1000);

    console.log("\n--- Errors after clicking '新增品項' ---");
    errors.forEach(e => console.log(e));
  } catch (e) {
    console.log("Script error:", e);
  } finally {
    await browser.close();
  }
})();
