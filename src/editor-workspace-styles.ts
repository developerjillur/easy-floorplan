import { css } from "lit";

/** Editor chrome follows HA's theme; the drawing continues to use skin tokens. */
export const editorWorkspaceStyles = css`
  :host { display: block; min-width: 0; }
  .editor {
    --editor-ink: var(--primary-text-color, #24323d);
    --editor-muted: var(--secondary-text-color, #697781);
    --editor-paper: var(--card-background-color, #fff);
    --editor-ground: var(--secondary-background-color, #f3f5f7);
    --editor-line: var(--divider-color, #dfe5e9);
    --editor-accent: var(--primary-color, #00897b);
    container: workspace / inline-size;
    display: flex;
    flex-direction: column;
    gap: 0;
    color: var(--editor-ink);
    background: var(--editor-paper);
    border: 1px solid var(--editor-line);
    border-radius: 12px;
    font: inherit;
    font-size: 13px;
  }
  button, input, select { font: inherit; }
  button {
    min-height: 34px;
    text-transform: none;
    transition: background-color 120ms, border-color 120ms;
  }
  button:hover:not(:disabled) { background: var(--editor-ground); }
  button:focus-visible, input:focus-visible, select:focus-visible {
    outline: 2px solid var(--editor-accent);
    outline-offset: 2px;
  }
  button.active, button.active:hover {
    color: var(--editor-accent);
    background: color-mix(in srgb, var(--editor-accent) 12%, var(--editor-paper));
    border-color: color-mix(in srgb, var(--editor-accent) 35%, var(--editor-line));
  }
  .toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--editor-line);
    flex: none;
  }
  .editor-brand { display: flex; align-items: center; gap: 10px; min-width: 0; margin-right: auto; }
  .editor-brand > ha-icon {
    --mdc-icon-size: 23px;
    color: var(--editor-accent);
    padding: 9px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--editor-accent) 10%, var(--editor-paper));
  }
  .editor-brand > div { display: grid; gap: 3px; min-width: 0; }
  .editor-eyebrow { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--editor-muted); }
  .editor-brand strong { font-size: 16px; font-weight: 600; max-width: 30ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .toolbar .apply-error { flex-basis: 100%; font-size: 12px; color: var(--error-color, #c62828); }
  .toolbar { position: relative; }
  .toolbar .add-pop { min-width: 310px; }
  .toolbar .add-entry { justify-content: flex-start; }
  .toolbar .furn-cell { padding: 7px 3px; font-size: 11px; }
  .add-furn-scroll { scrollbar-width: thin; }
  .floors .pop { left: 0; right: auto; }
  .toolbar button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 11px; }
  .toolbar button ha-icon { --mdc-icon-size: 18px; }
  .toolbar .apply-btn, .toolbar .apply-btn:hover {
    background: var(--editor-accent);
    border-color: var(--editor-accent);
    color: var(--text-primary-color, #fff);
  }
  .workspace { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0; min-width: 0; }
  .tool-rail {
    display: flex;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid var(--editor-line);
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .tool-rail button {
    display: flex;
    flex: 1 0 58px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 58px;
    padding: 8px 4px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: 10px;
    color: var(--editor-muted);
    background: transparent;
  }
  .tool-rail ha-icon { --mdc-icon-size: 21px; }
  .tool-rail button.active {
    color: var(--editor-accent);
    background: color-mix(in srgb, var(--editor-accent) 12%, var(--editor-paper));
    border-color: color-mix(in srgb, var(--editor-accent) 25%, var(--editor-line));
  }
  .canvas-column { min-width: 0; display: flex; flex-direction: column; background: var(--editor-ground); }
  .canvas-heading { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--editor-paper); border-bottom: 1px solid var(--editor-line); }
  .canvas-heading .spacer { flex: 1; }
  .canvas-heading .icon-btn { display: flex; align-items: center; gap: 6px; color: var(--editor-muted); border-color: transparent; }
  .canvas-heading ha-icon { --mdc-icon-size: 18px; }
  .floors { min-width: 0; gap: 6px; }
  .floors > ha-icon { color: var(--editor-muted); }
  .floors > label { display: none; }
  .floors select { max-width: 180px; min-width: 60px; font-weight: 600; border-color: transparent; background: transparent; }
  .floors > button { display: inline-flex; align-items: center; justify-content: center; width: 30px; padding: 5px; border-color: transparent; }
  .canvas-outer { padding: 18px; min-width: 0; }
  .canvas-wrap { border-radius: 4px; border-color: var(--editor-line); resize: vertical; box-shadow: 0 2px 12px #00000006; background: var(--editor-paper); }
  .grid { stroke-opacity: .11; }
  .zoom-overlay { right: 30px; bottom: 30px; gap: 0; padding: 3px; background: var(--editor-paper); border: 1px solid var(--editor-line); border-radius: 8px; box-shadow: 0 3px 10px #0000000d; }
  .zoom-overlay button { border: 0; min-height: 30px; background: transparent; }
  .zoom-overlay button:hover { background: var(--editor-ground); }
  .zoom-overlay ha-icon { --mdc-icon-size: 17px; }
  .context-bar { margin: 0; padding: 10px 14px; gap: 8px; background: var(--editor-paper); border: 0; border-top: 1px solid var(--editor-line); border-radius: 0; }
  .context-bar .ctx-label { border: 0; padding: 0; text-transform: none; letter-spacing: 0; font-size: 12px; }
  .context-bar .ctx-hint { font-size: 11px; line-height: 1.5; }
  .context-bar .ctx-divider { margin-left: auto; }
  .context-bar button { font-size: 11px; min-height: 28px; padding: 4px 8px; }
  .context-bar .seg + .ctx-hint { display: none; }
  .side { display: flex; flex-direction: column; min-width: 0; gap: 0; border-top: 1px solid var(--editor-line); background: var(--editor-paper); }
  .inspector-heading { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 18px 16px; border-bottom: 1px solid var(--editor-line); font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
  .inspector-count { color: var(--editor-muted); font-weight: 400; letter-spacing: 0; text-transform: none; }
  .edit-area, .panel { border: 0; border-radius: 0; padding: 16px; }
  .panel { border-top: 1px solid var(--editor-line); }
  .side .rows { display: flex; flex-direction: column; gap: 0; }
  .side .rows > * { width: 100%; box-sizing: border-box; }
  .edit-head { display: grid; grid-template-columns: 22px minmax(0, 1fr) repeat(3, 30px); gap: 5px; padding-bottom: 16px; margin: 0; }
  .edit-head .head-spacer { display: none; }
  .edit-head .edit-title { font-size: 13px; }
  .edit-head button { min-height: 30px; padding: 5px; justify-content: center; border-color: transparent; }
  .cfg-group, .cfg-group:not(.open), .cfg-group:first-of-type { width: 100%; margin: 0; padding: 12px 0; border: 0; border-top: 1px solid var(--editor-line); }
  .cfg-group-title { min-height: 24px; margin: 0; padding: 2px 0; font-size: 12px; font-weight: 600; letter-spacing: 0; }
  .cfg-group-title:hover:not(:disabled) { background: transparent; color: var(--editor-accent); }
  .cfg-group.open > .cfg-group-title { margin-bottom: 14px; }
  .cfg-group-title ha-icon { --mdc-icon-size: 16px; }
  .side .row { gap: 8px; margin-bottom: 12px; }
  .side .row label { font-size: 12px; flex-basis: 94px; color: var(--editor-muted); }
  .side .row input[type="text"], .side .row input[type="number"], .side .row select { min-height: 34px; box-sizing: border-box; padding: 7px 9px; border-radius: 6px; border-color: var(--editor-line); font-size: 12px; }
  .side .row input.num { flex: 1; width: 0; }
  .side .row input[type="range"] { flex: 1; width: 0; min-width: 0; accent-color: var(--editor-accent); }
  .side .row input[type="range"] + input.num { flex: 0 0 62px; min-width: 62px; }
  .side .hint { font-size: 12px; line-height: 1.6; }
  .inspector-empty { padding: 24px 8px 30px; display: grid; justify-items: center; text-align: center; }
  .inspector-empty > ha-icon { --mdc-icon-size: 30px; padding: 14px; background: var(--editor-ground); border-radius: 14px; color: var(--editor-muted); margin-bottom: 16px; }
  .inspector-empty strong { font-size: 14px; font-weight: 600; }
  .inspector-empty p { color: var(--editor-muted); line-height: 1.7; margin: 8px 0 16px; max-width: 26ch; }
  .inspector-empty span { color: var(--editor-muted); font-size: 11px; }
  .section-toggle { flex-wrap: wrap; gap: 6px; }
  .section-toggle .section-summary { width: 100%; margin-left: 22px; font-size: 11px; }
  .section-toggle .section-title-inline { text-transform: none; letter-spacing: 0; font-size: 12px; font-weight: 600; color: var(--editor-ink); }
  /* The popover top layer escapes HA's transformed edit dialog. */
  .editor.fullscreen {
    position: fixed;
    inset: 0;
    z-index: 100;
    width: auto;
    height: auto;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    box-sizing: border-box;
    overflow: hidden;
  }
  .editor.fullscreen .workspace { display: grid; flex: 1; min-height: 0; overflow-y: auto; }
  .editor.fullscreen .side { flex: none; max-height: none; padding: 0; }
  .editor.fullscreen .canvas-outer { display: block; flex: none; min-height: 260px; }
  .editor.fullscreen .canvas-wrap { height: 50vh; min-height: 240px; }
  @container workspace (min-width: 1000px) {
    .workspace, .editor.fullscreen .workspace {
      grid-template-columns: 76px minmax(0, 1fr) 320px;
      height: clamp(520px, 72vh, 880px);
      overflow: hidden;
      border-radius: 0 0 12px 12px;
    }
    .tool-rail { flex-direction: column; border-bottom: 0; border-right: 1px solid var(--editor-line); overflow-y: auto; overflow-x: hidden; }
    .tool-rail button { flex: 0 0 auto; min-height: 58px; }
    .canvas-column { min-height: 0; }
    .canvas-outer, .editor.fullscreen .canvas-outer { flex: 1; min-height: 0; display: flex; flex-direction: column; }
    .canvas-wrap, .editor.fullscreen .canvas-wrap { flex: 1; height: auto; min-height: 0; aspect-ratio: auto !important; resize: none; }
    .side, .editor.fullscreen .side { overflow-y: auto; overflow-x: hidden; border-top: 0; border-left: 1px solid var(--editor-line); scrollbar-width: thin; }
    .inspector-heading { position: sticky; top: 0; background: var(--editor-paper); z-index: 2; }
    .context-bar > .ctx-hint { flex: 1 1 180px; }
    .editor.fullscreen .workspace { height: auto; border-radius: 0; }
  }
  @container workspace (max-width: 599px) {
    .toolbar { padding: 10px; gap: 6px; }
    .editor-brand { width: 100%; margin-bottom: 4px; }
    .toolbar .group { margin-right: auto; }
    .toolbar button { padding: 7px 9px; }
    .toolbar > .pop-wrap { position: static; }
    .toolbar .add-pop { left: 8px; right: 8px; top: calc(100% + 4px); width: auto; min-width: 0; }
    .add-furn-scroll { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .tool-rail { padding: 6px; }
    .canvas-heading { padding: 6px 8px; }
    .floors select { max-width: 125px; }
    .canvas-outer { padding: 10px; }
    .canvas-wrap { min-height: 220px; }
    .zoom-overlay { right: 18px; bottom: 18px; }
    .context-bar { padding: 10px; }
    .context-bar > .ctx-hint { flex: 1 1 180px; }
    .context-bar .ctx-divider { flex-basis: 100%; height: 0; min-height: 0; margin: 0; }
    .editor.fullscreen .workspace { display: block; }
    .editor.fullscreen .canvas-wrap { height: 40vh; }
  }
  @media (prefers-reduced-motion: reduce) { button { transition: none; } }
`;
