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

  it.each([320, 360, 560, 740])("keeps controls and selected properties inside a %ipx editor", async (width) => {
    const t = await mount(width);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    expect(t.el(".side").checkVisibility()).toBe(false);
    expect(t.el(".tool-compact").checkVisibility()).toBe(true);
    expect(t.root.querySelectorAll(".tool-compact option")).toHaveLength(8);
    for (const button of t.root.querySelectorAll<HTMLElement>(".toolbar button, .canvas-heading button, .canvas-heading select")) {
      const r = button.getBoundingClientRect();
      expect(r.left).toBeGreaterThanOrEqual(t.rect(".editor").left);
      expect(r.right).toBeLessThanOrEqual(t.rect(".editor").right);
    }
    t.el(".inspector-jump").click();
    await settle(t.editor);
    expect(t.el(".canvas-column").checkVisibility()).toBe(true);
    expect(t.el(".side").checkVisibility()).toBe(true);
    expect(t.rect(".side").width).toBeLessThanOrEqual(width);
    for (const input of t.root.querySelectorAll<HTMLElement>(".side input, .side select")) {
      const r = input.getBoundingClientRect();
      expect(r.left).toBeGreaterThanOrEqual(t.rect(".side").left);
      expect(r.right).toBeLessThanOrEqual(t.rect(".side").right);
      expect(r.width).toBeGreaterThan(40);
    }
  });

  it.each([780, 842, 900, 999])("keeps plan and properties together at the %ipx tablet width", async (width) => {
    const t = await mount(width);
    expect(t.el(".tool-rail").checkVisibility()).toBe(false);
    expect(t.el(".tool-compact").checkVisibility()).toBe(true);
    expect(t.rect(".toolbar").height).toBeLessThan(70);
    expect(t.rect(".canvas-column").right).toBeLessThanOrEqual(t.rect(".side").left + 1);
    expect(t.rect(".canvas-wrap").width).toBeGreaterThan(450);
    expect(t.rect(".stage").height).toBeLessThanOrEqual(t.el(".canvas-wrap").clientHeight + 1);
    expect(t.rect(".stage").width).toBeLessThanOrEqual(t.el(".canvas-wrap").clientWidth + 1);
  });

  it("opens project fields directly and switches tabs without moving the selected element", async () => {
    const t = await mount(1300);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    const emitted: unknown[] = [];
    t.editor.addEventListener("config-changed", (event) => emitted.push(event));
    const selection = t.el("#selection-tab");
    selection.focus();
    selection.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true }));
    await settle(t.editor);
    expect(t.el("#project-tab").getAttribute("aria-selected")).toBe("true");
    expect(t.root.activeElement).toBe(t.el("#project-tab"));
    expect(t.root.querySelector("#field-title")).not.toBeNull();
    expect(t.el("#selection-panel").hidden).toBe(true);
    t.el("#project-tab").dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, composed: true }));
    await settle(t.editor);
    expect(t.root.activeElement).toBe(selection);
    expect(t.root.querySelector<HTMLInputElement>("#field-w")?.value).toBe("180");
    expect(emitted).toEqual([]);
  });

  it("returns to the selection inspector when a different canvas object is selected", async () => {
    const t = await mount(1300);
    t.el("#project-tab").click();
    await settle(t.editor);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    expect(t.el("#selection-tab").getAttribute("aria-selected")).toBe("true");
    expect(t.root.querySelector("#field-w")).not.toBeNull();
  });

  it("opens and closes mobile properties while preserving manual zoom", async () => {
    const t = await mount(360);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    t.el('[title="Reset zoom to 100%"]')?.click();
    await settle(t.editor);
    const canvas = t.el(".canvas-wrap");
    t.el(".inspector-jump").click();
    await settle(t.editor);
    expect(t.root.activeElement).toBe(t.el("#selection-tab"));
    expect(t.el(".canvas-column").checkVisibility()).toBe(true);
    expect(t.el(".side").checkVisibility()).toBe(true);
    t.el(".canvas-jump").click();
    await settle(t.editor);
    expect(t.root.activeElement).toBe(canvas);
    expect(t.el(".canvas-column").checkVisibility()).toBe(true);
    expect(t.el(".zoom-val-btn").textContent?.trim()).toBe("100%");
    t.el(".inspector-jump").click();
    await settle(t.editor);
    expect(t.root.querySelector<HTMLInputElement>("#field-w")?.value).toBe("180");
  });

  it("contains long project and floor names without hiding document actions", async () => {
    const t = await mount(320);
    const c = config();
    c.title = "A long project title that should never hide Apply or Expand";
    c.floors![0].name = "A long ground floor name that should stay inside its picker";
    t.editor.setConfig(c);
    await settle(t.editor);
    expect(t.el(".editor").scrollWidth).toBeLessThanOrEqual(t.el(".editor").clientWidth);
    expect(t.rect(".apply-btn").right).toBeLessThanOrEqual(t.rect(".editor").right);
  });

  it("keeps the edited object visible in the phone preview while properties scroll", async () => {
    const t = await mount(360);
    const c = config();
    c.floors![0].furniture[0].y = 1000;
    t.editor.setConfig(c);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    t.el('[title="Reset zoom to 100%"]').click();
    await settle(t.editor);
    t.el(".inspector-jump").click();
    await settle(t.editor);
    const preview = t.rect(".canvas-wrap");
    const selected = t.rect(".stage .selected");
    expect(selected.top).toBeGreaterThanOrEqual(preview.top);
    expect(selected.bottom).toBeLessThanOrEqual(preview.bottom);
    expect(t.el(".zoom-val-btn").textContent?.trim()).toBe("100%");
    // Zoom controls have their own space, so they cannot cover the edited object.
    expect(t.rect(".zoom-overlay").top).toBeGreaterThanOrEqual(preview.bottom);
    const width = t.el("#field-w") as HTMLInputElement;
    width.value = "240";
    width.dispatchEvent(new Event("change", { bubbles: true }));
    await settle(t.editor);
    expect(t.rect(".stage .selected").width).toBeGreaterThan(selected.width);
    t.el(".side").scrollTop = t.el(".side").scrollHeight;
    await settle(t.editor);
    expect(t.rect(".canvas-wrap").top).toBe(preview.top);
    expect(t.rect(".canvas-wrap").height).toBe(preview.height);
  });

  it.each([286, 320, 560])("fits a landscape plan in a %ipx editor without page overflow", async (width) => {
    const t = await mount(width);
    t.editor.setConfig({ ...config(), height: 720 });
    await settle(t.editor);
    expect(t.el(".editor").scrollWidth).toBeLessThanOrEqual(t.el(".editor").clientWidth);
    expect(t.rect(".stage").width).toBeLessThanOrEqual(t.el(".canvas-wrap").clientWidth + 1);
    expect(t.rect(".stage").height).toBeLessThanOrEqual(t.el(".canvas-wrap").clientHeight + 1);
    if (width < 400) expect(t.rect(".apply-btn").top).toBeCloseTo(t.rect(".expand-toggle").top, 0);
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

  it.each([286, 360, 560, 640, 842, 900, 1300])("keeps the insert menu inside a %ipx editor", async (width) => {
    const t = await mount(width);
    t.root.querySelector<HTMLButtonElement>('.toolbar button[aria-haspopup="true"]')!.click();
    await settle(t.editor);
    expect(t.rect(".add-pop").left).toBeGreaterThanOrEqual(t.rect(".editor").left);
    expect(t.rect(".add-pop").right).toBeLessThanOrEqual(t.rect(".editor").right);
    expect(t.rect(".add-pop").height).toBeLessThanOrEqual(window.innerHeight - 100);
    expect(t.rect(".furn-cell svg").height).toBeGreaterThanOrEqual(30);
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
    expect(t.el(".side").checkVisibility()).toBe(false);
  });

  it("edits through the inspector and can undo the change", async () => {
    const t = await mount(1300);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    const emitted: FloorplanCardConfig[] = [];
    t.editor.addEventListener("config-changed", (event) => emitted.push((event as CustomEvent).detail.config));
    const width = t.root.querySelector<HTMLInputElement>("#field-w")!;
    expect(width).not.toBeNull(); // Essentials need no disclosure clicks.
    width.value = "240";
    width.dispatchEvent(new Event("change", { bubbles: true }));
    await settle(t.editor);
    expect(emitted[emitted.length - 1].floors![0].furniture[0].w).toBe(240);
    t.root.querySelector<HTMLButtonElement>('[aria-label="Undo"]')!.click();
    await settle(t.editor);
    expect(emitted[emitted.length - 1].floors![0].furniture[0].w).toBe(180);
    expect(t.root.querySelector<HTMLInputElement>("#field-w")?.value).toBe("180");
    t.el('[aria-label="Redo"]').click();
    await settle(t.editor);
    expect(t.root.querySelector<HTMLInputElement>("#field-w")?.value).toBe("240");
  });
  it("opens each furniture category directly without repeating its properties", async () => {
    const t = await mount(1300);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    const picker = t.el('[aria-label="Object settings category"]') as HTMLSelectElement;
    expect(t.root.querySelector("#field-type")).not.toBeNull();
    const seen = new Set<string>();
    for (const option of picker.options) {
      picker.value = option.value;
      picker.dispatchEvent(new Event("change", { bubbles: true }));
      await settle(t.editor);
      expect(t.root.querySelector("button.cfg-group-title")).toBeNull();
      for (const field of t.root.querySelectorAll<HTMLInputElement>('[id^="field-"]')) {
        expect(seen.has(field.id)).toBe(false);
        seen.add(field.id);
      }
    }
    expect(seen).toEqual(new Set(["field-type", "field-w", "field-h", "field-angle", "field-entity", "field-goToFloor"]));
  });

  it("makes project settings reachable from the mobile plan", async () => {
    const t = await mount(360);
    t.el(".project-settings").click();
    await settle(t.editor);
    expect(t.el(".side").checkVisibility()).toBe(true);
    expect(t.el("#project-panel").hidden).toBe(false);
    expect(t.root.querySelector("#field-title")).not.toBeNull();
    expect(t.rect(".row.col > label").height).toBeLessThan(30);
    t.el(".canvas-jump").click();
    await settle(t.editor);
    expect(t.el(".canvas-column").checkVisibility()).toBe(true);
  });

  it("chooses every mobile drawing tool without scrolling a toolbar", async () => {
    const t = await mount(320);
    const picker = t.el(".tool-compact select") as HTMLSelectElement;
    for (const option of picker.options) {
      picker.value = option.value;
      picker.dispatchEvent(new Event("change", { bubbles: true }));
      await settle(t.editor);
      expect(t.root.querySelector(".tool-rail button.active")?.textContent?.trim()).toBe(option.textContent);
      expect(t.el(".canvas-column").checkVisibility()).toBe(true);
    }
  });

  it("keeps category navigation visible while scrolling a long settings page", async () => {
    const t = await mount(360);
    t.el(".project-settings").click();
    await settle(t.editor);
    const picker = t.el('[aria-label="Project settings category"]') as HTMLSelectElement;
    picker.value = "view";
    picker.dispatchEvent(new Event("change", { bubbles: true }));
    await settle(t.editor);
    t.el(".side").scrollTop = t.el(".side").scrollHeight;
    await settle(t.editor);
    const category = picker.getBoundingClientRect();
    expect(category.top).toBeGreaterThanOrEqual(t.rect(".inspector-heading").bottom);
    expect(category.bottom).toBeLessThan(t.rect(".side").bottom);
    picker.value = "plan";
    picker.dispatchEvent(new Event("change", { bubbles: true }));
    await settle(t.editor);
    expect(t.el(".side").scrollTop).toBe(0);
    expect(t.el("#field-title").checkVisibility()).toBe(true);
  });

  it("shows staircase navigation without expanding Actions", async () => {
    const t = await mount(1300);
    const c = config();
    c.floors![0].furniture[0] = { ...c.floors![0].furniture[0], type: "stairs", goToFloor: "up" };
    t.editor.setConfig(c);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    const field = t.el("#field-goToFloor") as HTMLSelectElement;
    expect(field.value).toBe("up");
    const emitted: FloorplanCardConfig[] = [];
    t.editor.addEventListener("config-changed", (event) => emitted.push((event as CustomEvent).detail.config));
    field.value = "down";
    field.dispatchEvent(new Event("change", { bubbles: true }));
    await settle(t.editor);
    expect(emitted[emitted.length - 1]!.floors![0].furniture[0].goToFloor).toBe("down");
  });

  it.each([
    { kind: "wall", collection: "walls", field: "kind", value: "railing", expected: "railing" },
    { kind: "opening", collection: "openings", field: "entity", value: "cover.test", expected: "cover.test" },
    { kind: "item", collection: "items", field: "entity", value: "light.test", expected: "light.test" },
    { kind: "text", collection: "texts", field: "entity", value: "", expected: undefined },
    { kind: "tracker", collection: "trackers", field: "w", value: "140", expected: 140 },
    { kind: "area", collection: "areas", field: "opacity", value: "0.3", expected: 0.3 },
  ] as const)("edits $kind essentials through the existing config rules", async (test) => {
    const t = await mount(1300);
    const c = config();
    Object.assign(c.floors![0], {
      walls: [{ id: "target", x1: 50, y1: 50, x2: 300, y2: 50 }],
      openings: [{ id: "target", type: "door", x: 150, y: 50, length: 80, angle: 0 }],
      items: [{ id: "target", entity: "sensor.test", kind: "sensor", x: 150, y: 100 }],
      texts: [{ id: "target", text: "Reading", entity: "sensor.test", attribute: "value", x: 150, y: 150 }],
      trackers: [{ id: "target", x: 100, y: 250, w: 100, h: 100 }],
      areas: [{ id: "target", name: "Room", points: [{ x: 50, y: 50 }, { x: 300, y: 50 }, { x: 300, y: 200 }] }],
    });
    t.editor.hass = { states: { "cover.test": { state: "closed", attributes: { device_class: "window" } } }, entities: {} } as unknown as FloorplanCardEditor["hass"];
    t.editor.setConfig(c);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: test.kind, id: "target" }];
    await settle(t.editor);
    const emitted: FloorplanCardConfig[] = [];
    t.editor.addEventListener("config-changed", (event) => emitted.push((event as CustomEvent).detail.config));
    if (test.kind === "opening") {
      const picker = t.el('[aria-label="Object settings category"]') as HTMLSelectElement;
      picker.value = "sensors";
      picker.dispatchEvent(new Event("change", { bubbles: true }));
      await settle(t.editor);
    }
    const field = t.el(`#field-${test.field}`) as HTMLInputElement;
    expect(field.checkVisibility()).toBe(true);
    if (test.kind === "item") expect(t.el("#field-size").checkVisibility()).toBe(true);
    field.value = test.value;
    field.dispatchEvent(new Event("change", { bubbles: true }));
    await settle(t.editor);
    const element = emitted[emitted.length - 1]!.floors![0][test.collection]![0] as unknown as Record<string, unknown>;
    expect(element[test.field]).toBe(test.expected);
    if (test.kind === "item") expect(element.kind).toBe("light");
    if (test.kind === "opening") expect(element.type).toBe("window");
    if (test.kind === "text") expect(element.attribute).toBeUndefined();
    // Changing objects returns to its primary properties without carrying the old category.
    const picker = t.root.querySelector<HTMLSelectElement>('[aria-label="Object settings category"]');
    if (picker) {
      picker.value = picker.options[picker.options.length - 1].value;
      picker.dispatchEvent(new Event("change", { bubbles: true }));
      await settle(t.editor);
      (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
      await settle(t.editor);
      expect((t.el('[aria-label="Object settings category"]') as HTMLSelectElement).value).toBe("properties");
      expect(t.root.querySelector("#field-w")).not.toBeNull();
    }
  });

  it("returns to the mobile plan when undo removes the selected object", async () => {
    const t = await mount(360);
    (t.editor as unknown as { _selection: unknown[] })._selection = [{ kind: "furniture", id: "sofa" }];
    await settle(t.editor);
    t.el(".inspector-jump").click();
    await settle(t.editor);
    t.el('[aria-label="Duplicate"]').click();
    await settle(t.editor);
    expect(t.el(".side").checkVisibility()).toBe(true);
    t.el('[aria-label="Undo"]').click();
    await settle(t.editor);
    expect(t.el(".canvas-column").checkVisibility()).toBe(true);
    expect(t.el(".side").checkVisibility()).toBe(false);
    expect(t.root.querySelector(".inspector-jump")).toBeNull();
  });

});
