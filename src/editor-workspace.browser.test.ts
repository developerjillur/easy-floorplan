import { afterEach, describe, expect, it } from "vitest";
import "./editor";
import type { FloorplanCardEditor } from "./editor";
import type { FloorplanCardConfig } from "./types";

const config = (): FloorplanCardConfig => ({
  type: "custom:easy-floorplan-card", title: "Workspace test", width: 1000, height: 1200,
  floors: [{
    id: "ground", name: "Ground", walls: [], openings: [], areas: [],
    items: [], texts: [], trackers: [],
    furniture: [{ id: "sofa", type: "sofa", x: 200, y: 200, w: 180, h: 80 }],
  }],
});

async function settle(editor: FloorplanCardEditor) {
  await editor.updateComplete;
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  await editor.updateComplete;
}

async function mount(width: number) {
  const editor = document.createElement("easy-floorplan-card-editor") as FloorplanCardEditor;
  editor.style.width = `${width}px`;
  editor.setConfig(config());
  document.body.append(editor);
  await settle(editor);
  const root = editor.shadowRoot!;
  const el = (selector: string) => root.querySelector<HTMLElement>(selector)!;
  return { editor, root, el, rect: (selector: string) => el(selector).getBoundingClientRect() };
}

afterEach(() => { document.body.innerHTML = ""; });

describe("responsive editor workspace", () => {
  it("docks the tools and inspector beside a fully visible tall plan", async () => {
    const t = await mount(1300);
    expect(t.rect(".tool-rail").right).toBeLessThanOrEqual(t.rect(".canvas-column").left + 1);
    expect(t.rect(".canvas-column").right).toBeLessThanOrEqual(t.rect(".side").left + 1);
    expect(t.rect(".canvas-wrap").width).toBeGreaterThan(500);
    expect(t.rect(".stage").height).toBeLessThanOrEqual(t.el(".canvas-wrap").clientHeight + 1);
    expect(t.rect(".stage").width).toBeLessThanOrEqual(t.el(".canvas-wrap").clientWidth + 1);
  });

  it.each([360, 560, 900])("keeps controls and selected properties inside a %ipx editor", async (width) => {
    const t = await mount(width);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    expect(t.rect(".tool-rail").bottom).toBeLessThanOrEqual(t.rect(".canvas-column").top + 1);
    expect(t.rect(".canvas-column").bottom).toBeLessThanOrEqual(t.rect(".side").top + 1);
    expect(t.rect(".side").width).toBeLessThanOrEqual(width);
    for (const input of t.root.querySelectorAll<HTMLElement>(".side input, .side select")) {
      const r = input.getBoundingClientRect();
      expect(r.left).toBeGreaterThanOrEqual(t.rect(".side").left);
      expect(r.right).toBeLessThanOrEqual(t.rect(".side").right);
      expect(r.width).toBeGreaterThan(40);
    }
  });

  it("preserves manual zoom on resize and refits when requested", async () => {
    const t = await mount(1300);
    t.root.querySelector<HTMLButtonElement>('[title="Reset zoom to 100%"]')!.click();
    await settle(t.editor);
    t.editor.style.width = "1100px";
    await settle(t.editor);
    expect(t.el(".zoom-val-btn").textContent?.trim()).toBe("100%");
    t.root.querySelector<HTMLButtonElement>('[aria-label="Fit to view"]')!.click();
    await settle(t.editor);
    expect(t.rect(".stage").height).toBeLessThanOrEqual(t.el(".canvas-wrap").clientHeight + 1);
    // Home Assistant reparents the editor when its dialog changes layout.
    t.editor.remove();
    t.editor.style.width = "1250px";
    document.body.append(t.editor);
    await settle(t.editor);
    expect(t.rect(".stage").height).toBeLessThanOrEqual(t.el(".canvas-wrap").clientHeight + 1);
  });

  it("keeps the insert menu inside a narrow editor", async () => {
    const t = await mount(360);
    t.root.querySelector<HTMLButtonElement>('.toolbar button[aria-haspopup="true"]')!.click();
    await settle(t.editor);
    expect(t.rect(".add-pop").left).toBeGreaterThanOrEqual(t.rect(".editor").left);
    expect(t.rect(".add-pop").right).toBeLessThanOrEqual(t.rect(".editor").right);
  });

  it("refits changed plan dimensions and can zoom out from below 50%", async () => {
    const t = await mount(1300);
    t.editor.setConfig({ ...config(), height: 3000 });
    await settle(t.editor);
    const before = t.rect(".stage").width;
    expect(t.rect(".stage").height).toBeLessThanOrEqual(t.el(".canvas-wrap").clientHeight + 1);
    t.root.querySelector<HTMLButtonElement>('[aria-label="Zoom out"]')!.click();
    await settle(t.editor);
    expect(t.rect(".stage").width).toBeLessThan(before);
  });

  it("opens a narrow dialog into a fullscreen workspace and returns", async () => {
    const t = await mount(560);
    t.root.querySelector<HTMLButtonElement>(".expand-toggle")!.click();
    await settle(t.editor);
    expect(t.rect(".editor").width).toBeCloseTo(window.innerWidth, 0);
    expect(t.rect(".editor").height).toBeCloseTo(window.innerHeight, 0);
    expect(t.rect(".stage").height).toBeLessThanOrEqual(t.el(".canvas-wrap").clientHeight + 1);
    t.root.querySelector<HTMLButtonElement>(".expand-toggle")!.click();
    await settle(t.editor);
    expect(t.rect(".editor").width).toBeCloseTo(560, 0);
    expect(t.rect(".canvas-column").bottom).toBeLessThanOrEqual(t.rect(".side").top + 1);
  });

  it("edits through the inspector and can undo the change", async () => {
    const t = await mount(1300);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    const emitted: FloorplanCardConfig[] = [];
    t.editor.addEventListener("config-changed", (event) => emitted.push((event as CustomEvent).detail.config));
    const width = t.root.querySelector<HTMLInputElement>("#field-w")!;
    expect(width).not.toBeNull(); // Shape opens with the selection.
    width.value = "240";
    width.dispatchEvent(new Event("change", { bubbles: true }));
    await settle(t.editor);
    expect(emitted[emitted.length - 1].floors![0].furniture[0].w).toBe(240);
    t.root.querySelector<HTMLButtonElement>('[aria-label="Undo"]')!.click();
    await settle(t.editor);
    expect(emitted[emitted.length - 1].floors![0].furniture[0].w).toBe(180);
  });
});
