// dsh-ui-shim client - standalone three-column shim (extracted from web-ui-all)
// Stamps data-pane/data-dsh-frame so other plugins can target sidebar/conversation/details
// without depending on the official DOM class names (which change per build).
if (typeof window === 'undefined' || !window.__ModuleLoader__) { /* server-side import of this bundle: no-op */ } else {
window.__ModuleLoader__.load({
  id: "@snow-the/dsh-ui-shim",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
}

    // health marker: set as soon as this client executes (guide_boot uiChecks target)
    document.documentElement.setAttribute("data-dsh-shim-mounted", "");

    /** Column shims: element selector → attribute to stamp. */
    const COLUMN_SHIMS = [
      ["[class*=\"sidebarCol\"]", "data-pane=\"sidebar\""],
      ["[class*=\"centerCol\"]", "data-pane=\"conversation\""],
      ["[class*=\"detailsCol\"]", "data-pane=\"details\""]
    ];
    /** One pass over the current DOM. Returns false once every stamp is already in place. */
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
    /** Coalesce mutation bursts into one pass per frame. */
    function schedulePass() {
      if (shimScheduled) return;
      shimScheduled = true;
      requestAnimationFrame(() => {
        shimScheduled = false;
        applyShims();
      });
    }
    let shimScheduled = false;
    /** Required services: none - the shim must run before any DOM mount waits. */
    const inject = [];
    /**
     * Register the shim for the page lifetime.
     * @param ctx - client root context.
     */
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
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
