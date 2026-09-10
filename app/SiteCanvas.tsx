import { Children, isValidElement, type ReactNode, type CSSProperties } from "react";
import { designStyle, normalizeDesign, type SiteDesign, type SectionId } from "../lib/design";
export default function SiteCanvas({
  design,
  children,
}: {
  design?: SiteDesign;
  children: ReactNode;
}) {
  const d = normalizeDesign(design);
  const all = Children.toArray(children);
  const sectionId = (child: ReactNode) =>
    isValidElement(child)
      ? (child.props as { "data-layout-section"?: SectionId })["data-layout-section"]
      : undefined;
  const header = all.filter((x) => isValidElement(x) && x.type === "header");
  const rest = all.filter((x) => !sectionId(x) && !(isValidElement(x) && x.type === "header"));
  const ordered = d.order
    .filter((id) => !d.hidden.includes(id))
    .map((id) => all.find((x) => sectionId(x) === id));
  return (
    <main
      className={design ? "site-canvas" : "site-layout"}
      id="top"
      style={design ? (designStyle(d) as CSSProperties) : undefined}
    >
      {header}
      {ordered}
      {rest}
    </main>
  );
}
