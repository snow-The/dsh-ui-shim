// dsh-ui-shim client - standalone column shim (extracted from web-ui-all)
// Stamps data-pane/data-dsh-frame so other plugins can target sidebar/conversation/details
// without depending on the official DOM class names (which change per build).
window.__ModuleLoader__.load({
  id: "@snow-the/dsh-ui-shim",
  factory: () => {
    const module = { exports: {} };

    // health marker: set as soon as this client executes (guide_boot uiChecks target)
    document.documentElement.setAttribute("data-dsh-shim-mounted", "");

    /** Legacy class-name shims (older official builds). */
    const COLUMN_SHIMS = [
      ["[class*=\"sidebarCol\"]", "data-pane=\"sidebar\""],
      ["[class*=\"centerCol\"]", "data-pane=\"conversation\""],
      ["[class*=\"detailsCol\"]", "data-pane=\"details\""]
    ];
    function applyShims() {
      let changed = false;
      for (const [selector, attribute] of COLUMN_SHIMS) {
        const el = document.querySelector(selector);
        const eq = attribute.indexOf("=");
        const name = attribute.slice(0, eq);
        const value = attribute.slice(eq + 1).replace(/^"|"$/g, "");
        if (el !== null && el.getAttribute(name) !== value) {
          el.setAttribute(name, value);
          changed = true;
        }
      }
      // slot-anchored pass: header slot -> its column -> frame + siblings
      const slotHost = document.querySelector('[data-slot="conversation.session.header"]');
      if (slotHost) {
        let frame = slotHost;
        for (let i = 0; i < 6 && frame && !frame.getAttribute('data-dsh-frame'); i++) {
          frame = frame.parentElement;
        }
        if (frame && frame.getAttribute('data-dsh-frame') !== '') {
          frame.setAttribute('data-dsh-frame', '');
          changed = true;
        }
        let col = slotHost.parentElement;
        if (col && !col.getAttribute('data-pane')) {
          col.setAttribute('data-pane', 'conversation');
          changed = true;
          const prev = col.previousElementSibling;
          const next = col.nextElementSibling;
          if (prev && !prev.getAttribute('data-pane')) { prev.setAttribute('data-pane', 'sidebar'); changed = true; }
          if (next && !next.getAttribute('data-pane')) { next.setAttribute('data-pane', 'details'); changed = true; }
        }
      }
      // tablist fallback (older official builds)
      const tabsEl = document.querySelector("[class*=tabs][role=tablist]");
      if (tabsEl) {
        let center = tabsEl.closest("[class*=Col]") || tabsEl.parentElement;
        if (center && !center.getAttribute('data-pane')) {
          center.setAttribute('data-pane', 'conversation');
          changed = true;
          const prev = center.previousElementSibling;
          const next = center.nextElementSibling;
          if (prev && !prev.getAttribute('data-pane')) { prev.setAttribute('data-pane', 'sidebar'); changed = true; }
          if (next && !next.getAttribute('data-pane')) { next.setAttribute('data-pane', 'details'); changed = true; }
        }
      }
      return changed;
    }
    function schedulePass() {
      if (shimScheduled) return;
      shimScheduled = true;
      requestAnimationFrame(() => {
        shimScheduled = false;
        applyShims();
      });
    }
    let shimScheduled = false;
    const inject = [];
    // factory-level bootstrap: runs immediately, does NOT depend on apply()
    applyShims();
    const observer = new MutationObserver(schedulePass);
    observer.observe(document.body, { childList: true, subtree: true });
    function apply(ctx) {
      ctx.effect(() => { applyShims(); });
    }
    module.exports.apply = apply;
    module.exports.inject = inject;
    return module.exports;
  }
});
