const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4321/trip');
    await page.waitForTimeout(2000);

    // Verify type-management-modal form and button visibility
    const isFormVisible = await page.evaluate(() => {
      const modal = document.getElementById('type-management-modal');
      // Force show it to check dimensions
      modal.classList.add('show');
      
      const form = document.getElementById('add-type-form');
      const submitBtn = form.querySelector('button[type="submit"]');
      
      // Force layout calculation
      const formRect = form.getBoundingClientRect();
      const btnRect = submitBtn.getBoundingClientRect();
      
      // Cleanup
      modal.classList.remove('show');
      
      return {
        formHeight: formRect.height,
        btnHeight: btnRect.height,
        btnVisible: btnRect.height > 0 && btnRect.width > 0,
        formOverflow: getComputedStyle(form).overflow
      };
    });
    
    console.log("「管理類型」表單狀態:", isFormVisible);
    
    // Check if the auth buttons exist in TripPlanner
    const authButtonsExist = await page.evaluate(() => {
      return !!document.querySelector('.mode-toggle-container .top-right-auth-container');
    });
    console.log("行程分頁是否有登入/登出按鈕:", authButtonsExist);

  } catch (e) {
    console.error("Script error:", e);
  } finally {
    await browser.close();
  }
})();
