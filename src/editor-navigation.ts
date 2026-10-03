import type { SelKind } from "./editor-geometry";

export interface InspectorPage {
  id: string;
  label: string;
  groups: readonly string[];
}

// These are destinations, not disclosures. Each group belongs to one page;
// the editor renders only that page, so changing category never adds nesting.
export const PROJECT_PAGES: readonly InspectorPage[] = [
  { id: "plan", label: "Plan & floors", groups: ["Project", "Floor image", "Floor switcher"] },
  { id: "colors", label: "Colors & style", groups: ["Look", "Named colors"] },
  { id: "view", label: "View & scale", groups: ["Display"] },
  { id: "lighting", label: "Lighting", groups: ["Sunlight", "Night dimming"] },
  { id: "devices", label: "Device behavior", groups: ["Devices"] },
  { id: "symbols", label: "Symbol library", groups: ["Symbols"] },
];

const properties: InspectorPage = { id: "properties", label: "Properties", groups: [] };
const actions: InspectorPage = { id: "actions", label: "Actions", groups: ["Behavior"] };

export const SELECTION_PAGES: Record<SelKind, readonly InspectorPage[]> = {
  furniture: [properties, { id: "sensor", label: "Sensor & state", groups: ["What it reads", "Color"] }, actions],
  opening: [
    properties,
    { id: "sensors", label: "Sensors & shutter", groups: ["What it reads", "Shutter"] },
    { id: "appearance", label: "Style & sunlight", groups: ["Badge", "Color", "Sunlight"] },
    actions,
  ],
  item: [
    properties,
    { id: "readings", label: "Readings", groups: ["What it reads"] },
    { id: "appearance", label: "Style & effects", groups: ["Label", "Badge", "Color", "Effects"] },
    actions,
    { id: "visibility", label: "Visibility", groups: ["Visibility"] },
  ],
  area: [properties, { id: "sensor", label: "Sensors & devices", groups: ["What it reads", "Color", "Home Assistant area"] }, actions],
  tracker: [
    properties,
    { id: "sensors", label: "Sensors", groups: ["Sensors"] },
    { id: "marker", label: "Marker", groups: ["Marker"] },
  ],
  text: [properties],
  wall: [properties],
};
