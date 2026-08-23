// dsh-ui-shim client - standalone three-column shim (extracted from web-ui-all)
// Stamps data-pane/data-dsh-frame so other plugins can target sidebar/conversation/details
// without depending on the official DOM class names (which change per build).
window.__ModuleLoader__.load({
  id: "@snow-the/dsh-ui-shim",
  factory: () => {
    const module = { exports: {} };

    // health marker: set as soon as this client executes (guide_boot uiChecks target)
    document.documentElement.setAttribute("data-dsh-shim-mounted", "");

    /** Column shims: element selector → attribute to stamp. */
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
      const frame = document.querySelector("[class*=\"sidebarCol\"]")?.parentElement ?? null;
      if (frame !== null && frame.getAttribute("data-dsh-frame") !== "") {
        frame.setAttribute("data-dsh-frame", "");
        changed = true;
      }
      const tabsEl = document.querySelector("[class*=tabs][role=tablist]");
      if (tabsEl) {
        let center = tabsEl.closest("[class*=Col]") || tabsEl.parentElement;
        if (center && !center.getAttribute("data-pane")) {
          center.setAttribute("data-pane", "conversation");
          const prev = center.previousElementSibling;
          const next = center.nextElementSibling;
          if (prev && !prev.getAttribute("data-pane")) { prev.setAttribute("data-pane", "sidebar"); changed = true; }
          if (next && !next.getAttribute("data-pane")) { next.setAttribute("data-pane", "details"); changed = true; }
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
    function apply(ctx) {
      ctx.effect(() => {
        applyShims();
        const observer = new MutationObserver(schedulePass);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => {
          observer.disconnect();
          shimScheduled = false;
        };
      });
    }
    module.exports.apply = apply;
    module.exports.inject = inject;
    return module.exports;
  }
});
