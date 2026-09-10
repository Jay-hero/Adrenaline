export const sections = [
  ["home", "Нүүрний гол хэсэг"],
  ["stats", "Статистик"],
  ["tracker", "Дадлын хөтөч"],
  ["about", "Бидний тухай"],
  ["membership", "Гишүүнчлэл"],
  ["coaches", "Дасгалжуулагч"],
  ["schedule", "Цагийн хуваарь"],
  ["contact", "Холбоо барих"],
  ["final", "Доод уриалга"],
] as const;
export type SectionId = (typeof sections)[number][0];
export type SiteDesign = {
  order: SectionId[];
  hidden: SectionId[];
  accent: string;
  background: string;
  surface: string;
  text: string;
  font: "sans" | "serif";
  textSize: number;
  spacing: number;
  radius: number;
  stickyCta: boolean;
};
export const defaultDesign: SiteDesign = {
  order: sections.map(([id]) => id),
  hidden: [],
  accent: "#e31b23",
  background: "#08090b",
  surface: "#101216",
  text: "#f5f5f3",
  font: "sans",
  textSize: 17,
  spacing: 100,
  radius: 0,
  stickyCta: true,
};
const ids = new Set<string>(sections.map(([id]) => id));
export function normalizeDesign(value?: Partial<SiteDesign>): SiteDesign {
  const v = value || {};
  const order = Array.isArray(v.order) ? v.order.filter((id) => ids.has(id)) : [];
  const color = (x: unknown, fallback: string) =>
    typeof x === "string" && /^#[0-9a-f]{6}$/i.test(x) ? x : fallback;
  const number = (x: unknown, min: number, max: number, fallback: number) =>
    typeof x === "number" && Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : fallback;
  return {
    order: [...new Set([...order, ...defaultDesign.order])],
    hidden: Array.isArray(v.hidden) ? [...new Set(v.hidden.filter((id) => ids.has(id)))] : [],
    accent: color(v.accent, defaultDesign.accent),
    background: color(v.background, defaultDesign.background),
    surface: color(v.surface, defaultDesign.surface),
    text: color(v.text, defaultDesign.text),
    font: v.font === "serif" ? "serif" : "sans",
    textSize: number(v.textSize, 16, 22, 17),
    spacing: number(v.spacing, 56, 160, 100),
    radius: number(v.radius, 0, 32, 0),
    stickyCta: typeof v.stickyCta === "boolean" ? v.stickyCta : true,
  };
}
export function designStyle(value?: Partial<SiteDesign>) {
  const d = normalizeDesign(value);
  return {
    "--red": d.accent,
    "--bg": d.background,
    "--panel": d.surface,
    "--white": d.text,
    "--muted": `color-mix(in srgb, ${d.text} 68%, ${d.background})`,
    "--design-size": `${d.textSize}px`,
    "--design-space": `${d.spacing}px`,
    "--design-radius": `${d.radius}px`,
    background: d.background,
    color: d.text,
    fontFamily:
      d.font === "serif"
        ? "Georgia, Times New Roman, serif"
        : "var(--font-geist-sans), Arial, sans-serif",
  };
}
