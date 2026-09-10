export const blockWidths = ["narrow", "content", "full"] as const;
export const blockAlignments = ["left", "center", "right"] as const;
export const blockTones = ["default", "surface", "accent"] as const;

type CmsItem = { id: string; deleted?: boolean };
type BlockView = {
  width?: string;
  align?: string;
  tone?: string;
};

export function moveActiveItem<T extends CmsItem>(items: T[], id: string, delta: number): T[] {
  const active = items.filter((item) => !item.deleted);
  const from = active.findIndex((item) => item.id === id);
  const target = active[from + delta];
  if (from < 0 || !target) return items;
  const next = [...items];
  const fromIndex = next.findIndex((item) => item.id === id);
  const targetIndex = next.findIndex((item) => item.id === target.id);
  [next[fromIndex], next[targetIndex]] = [next[targetIndex], next[fromIndex]];
  return next;
}

export function blockView(block: BlockView) {
  return {
    width: blockWidths.includes(block.width as (typeof blockWidths)[number])
      ? block.width
      : "content",
    align: blockAlignments.includes(block.align as (typeof blockAlignments)[number])
      ? block.align
      : "left",
    tone: blockTones.includes(block.tone as (typeof blockTones)[number])
      ? block.tone
      : "default",
  } as const;
}
