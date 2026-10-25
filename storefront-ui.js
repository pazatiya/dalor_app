/* Presentation, keyboard support and modal focus management. No commerce/API changes. */
(() => {
  let previousFocus = null;
  let activeDialog = null;
  const panelIds = ['sheet', 'csheet', 'sortSheet', 'meScreen', 'promoScreen', 'weeklyModal', 'chatWin'];
  const focusable = 'button:not(:disabled), a[href], input:not([type="hidden"]), textarea, select, [tabindex="0"]';
  const visible = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden';
  function sync() {
    panelIds.forEach(id => {
      const panel = document.getElementById(id);
      const open = panel.classList.contains('on');
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
    });
    document.querySelectorAll('.cat-chip').forEach(el => el.setAttribute('aria-pressed',String(el.classList.contains('active'))));
    document.querySelectorAll('.sort-opt').forEach(el => {
      el.setAttribute('role','radio'); el.tabIndex = 0;
      el.setAttribute('aria-checked',String(el.classList.contains('active')));
    });
    document.querySelectorAll('.cchip,.schip:not(.out)').forEach(el => el.setAttribute('aria-pressed',String(el.classList.contains('on'))));
    const open = panelIds.map(id => document.getElementById(id)).filter(el => el.classList.contains('on'));
    const next = open.length ? open[open.length-1] : null;
    document.getElementById('store-main').inert = !!next;
    document.querySelector('.store-header').inert = !!next;
    document.querySelector('.bnav').inert = !!next;
    if (next !== activeDialog) {
      if (next && !activeDialog) previousFocus = document.activeElement;
      activeDialog = next;
      if (next) requestAnimationFrame(() => {
        const first = [...next.querySelectorAll(focusable)].find(visible);
        first?.focus({preventScroll:true});
      });
      else if (previousFocus?.isConnected) { previousFocus.focus({preventScroll:true}); previousFocus=null; }
    }
  }
  const observer = new MutationObserver(sync);
  panelIds.forEach(id => observer.observe(document.getElementById(id), {attributes:true,attributeFilter:['class']}));
  ['catsBar','sheetBody','sortSheet'].forEach(id => observer.observe(document.getElementById(id), {childList:true,subtree:true,attributes:true,attributeFilter:['class']}));
  document.querySelector('.sort-options').setAttribute('role','radiogroup');
  document.querySelector('.sort-options').setAttribute('aria-label','מיון מוצרים');
  document.getElementById('sortSheet').setAttribute('aria-label','מיון מוצרים');
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('weeklyModal').classList.contains('on')) closeWeeklyModal();
      else if (document.getElementById('chatWin').classList.contains('on')) toggleChat();
      else if (document.getElementById('promoScreen').classList.contains('on')) closePromoScreen();
      else if (document.getElementById('meScreen').classList.contains('on')) navTo('home');
      else if (document.getElementById('sortSheet').classList.contains('on')) closeSortSheet();
      else if (document.getElementById('csheet').classList.contains('on')) closeCart();
      else closeSheet();
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card,.sort-opt,.cchip,.schip:not(.out)')) {
      e.preventDefault(); e.target.click();
    }
    if (e.key === 'Tab' && activeDialog) {
      const nodes = [...activeDialog.querySelectorAll(focusable)].filter(visible);
      const first = nodes[0], last = nodes[nodes.length-1];
      if (e.shiftKey && (document.activeElement===first || !activeDialog.contains(document.activeElement))) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement===last) {e.preventDefault(); first?.focus();}
    }
  });
  sync();
})();
