const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4321/trip');
    await page.waitForTimeout(2000);

    // 1. Check duplicate IDs
    const duplicates = await page.evaluate(() => {
      const allIds = document.querySelectorAll('[id]');
      const idMap = {};
      allIds.forEach(el => {
        idMap[el.id] = (idMap[el.id] || 0) + 1;
      });
      return Object.entries(idMap).filter(([id, count]) => count > 1);
    });
    console.log('重複的 id 清單：', duplicates);

    // CDP setup
    const client = await page.context().newCDPSession(page);
    await client.send('DOM.enable');

    async function getListenerCount(selector) {
      try {
        const { root: { nodeId } } = await client.send('DOM.getDocument');
        const { nodeId: targetNodeId } = await client.send('DOM.querySelector', {
          nodeId,
          selector
        });
        if (!targetNodeId) return `Element ${selector} not found`;

        const { object: { objectId } } = await client.send('DOM.resolveNode', {
          nodeId: targetNodeId
        });

        const { listeners } = await client.send('DOMDebugger.getEventListeners', {
          objectId
        });
        
        const clickListeners = listeners.filter(l => l.type === 'click');
        return `綁定了 ${clickListeners.length} 個 click 事件監聽器`;
      } catch (e) {
        return "Error getting listeners: " + e.message;
      }
    }

    console.log('\n「行程」分頁「+ 新增景點」按鈕 (#btn-open-spot-modal)：');
    console.log(await getListenerCount('#btn-open-spot-modal'));

    console.log('\n「收藏」分頁「+ 新增品項」按鈕 (#btn-open-add-modal)：');
    console.log(await getListenerCount('#btn-open-add-modal'));

  } catch (e) {
    console.error("Script error:", e);
  } finally {
    await browser.close();
  }
})();
