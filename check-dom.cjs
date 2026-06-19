const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4321/trip');
    await page.waitForTimeout(2000);

    // Switch to JapanCollection tab
    await page.evaluate(() => {
      const tab = document.querySelector('[data-target="#collect"]');
      if (tab) tab.click();
    });
    await page.waitForTimeout(1000);

    // Helper function to get DOM details
    async function inspectModal(modalId, triggerSelector) {
      console.log(`\n================ INSPECTING #${modalId} ================`);
      // Ensure modal is closed first
      await page.evaluate((id) => {
        const m = document.getElementById(id);
        if (m) m.style.display = 'none';
        document.body.classList.remove('modal-open');
      }, modalId);

      // Click the trigger
      console.log(`Clicking trigger: ${triggerSelector}`);
      await page.evaluate((sel) => {
        const btn = document.querySelector(sel);
        if (btn) btn.click();
      }, triggerSelector);
      
      await page.waitForTimeout(500); // Wait for modal animation/logic

      const details = await page.evaluate((id) => {
        const modal = document.getElementById(id);
        if (!modal) return { error: `Modal #${id} not found.` };
        
        const computed = window.getComputedStyle(modal);
        
        // Find parent
        let parentInfo = modal.parentNode ? modal.parentNode.tagName + (modal.parentNode.id ? '#' + modal.parentNode.id : '') + (modal.parentNode.className ? '.' + Array.from(modal.parentNode.classList).join('.') : '') : 'none';
        
        // Check highest z-index on page
        const allElements = document.querySelectorAll('*');
        const higherZIndexElements = [];
        const modalZ = parseInt(computed.zIndex) || 0;
        
        Array.from(allElements).forEach(el => {
          if (el === modal || modal.contains(el)) return;
          const style = window.getComputedStyle(el);
          const z = parseInt(style.zIndex);
          if (!isNaN(z) && z > modalZ && style.display !== 'none') {
             higherZIndexElements.push({
               tag: el.tagName,
               id: el.id,
               className: el.className,
               zIndex: z
             });
          }
        });

        return {
          bodyHasModalOpen: document.body.classList.contains('modal-open'),
          styleDisplay: modal.style.display,
          computedDisplay: computed.display,
          computedPosition: computed.position,
          computedZIndex: computed.zIndex,
          parent: parentInfo,
          higherZElements: higherZIndexElements.slice(0, 5) // just top 5
        };
      }, modalId);

      console.log(`- body modal-open class: ${details.bodyHasModalOpen}`);
      console.log(`- element.style.display: ${details.styleDisplay}`);
      console.log(`- computed display: ${details.computedDisplay}`);
      console.log(`- computed position: ${details.computedPosition}`);
      console.log(`- computed z-index: ${details.computedZIndex}`);
      console.log(`- Parent Node: ${details.parent}`);
      console.log(`- Elements with higher z-index:`, details.higherZElements);
    }

    // Inspect Item Modal
    await inspectModal('item-modal', '#btn-open-add-modal');

    // Inspect Auth Modal
    await inspectModal('auth-modal', '#btn-login-modal');

  } catch (e) {
    console.error("Script error:", e);
  } finally {
    await browser.close();
  }
})();
