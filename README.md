# dsh-ui-shim

Standalone three-column shim for DeepSeek Harness web UI.

Stamps `data-pane="sidebar|conversation|details"` and `data-dsh-frame` on the layout so other plugins (notemap, web-ui-all, ...) can target columns without depending on official DOM class names.

Health marker: `data-dsh-shim-mounted` on <html> - verify with guide_boot uiChecks.
