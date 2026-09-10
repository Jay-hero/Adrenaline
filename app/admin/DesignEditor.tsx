"use client";
import {
  defaultDesign,
  normalizeDesign,
  sections,
  type SiteDesign,
  type SectionId,
} from "../../lib/design";
export default function DesignEditor({
  value,
  change,
  preview,
}: {
  value?: SiteDesign;
  change: (v: SiteDesign) => void;
  preview: () => void;
}) {
  const d = normalizeDesign(value);
  const patch = (v: Partial<SiteDesign>) => change({ ...d, ...v });
  function move(id: SectionId, delta: number) {
    const order = [...d.order],
      from = order.indexOf(id),
      to = from + delta;
    if (to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    patch({ order });
  }
  return (
    <div className="design-manager">
      <article className="admin-card">
        <h2>Харагдах байдал ба бүтэц</h2>
        <p>Өөрчлөлт шууд харагдацад тусна. “Өөрчлөлт хадгалах” дарсны дараа нийтэд харагдана.</p>
        <button type="button" className="add" onClick={preview}>
          ◫ ШУУД ХАРАГДАЦ НЭЭХ
        </button>
      </article>
      <article className="admin-card">
        <h2>Нүүр хуудасны секцүүд</h2>
        <p>Секцийг хасахад мэдээлэл нь үлдэнэ. Буцаах товчоор сэргээнэ.</p>
        {d.order.map((id, index) => (
          <div key={id} className={`design-section ${d.hidden.includes(id) ? "is-hidden" : ""}`}>
            <div>
              <strong>{sections.find(([key]) => key === id)?.[1]}</strong>
              <small>{d.hidden.includes(id) ? "Хассан" : "Харагдаж байна"}</small>
            </div>
            <div>
              <button
                type="button"
                aria-label={`${id} дээш`}
                disabled={index === 0}
                onClick={() => move(id, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`${id} доош`}
                disabled={index === d.order.length - 1}
                onClick={() => move(id, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  patch({
                    hidden: d.hidden.includes(id)
                      ? d.hidden.filter((x) => x !== id)
                      : [...d.hidden, id],
                  })
                }
              >
                {d.hidden.includes(id) ? "Буцаах" : "Хасах"}
              </button>
            </div>
          </div>
        ))}
      </article>
      <article className="admin-card">
        <h2>Өнгө ба бичвэр</h2>
        <div className="formgrid">
          {(
            [
              ["accent", "Онцлох өнгө"],
              ["background", "Үндсэн дэвсгэр"],
              ["surface", "Картын дэвсгэр"],
              ["text", "Бичвэрийн өнгө"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <input
                type="color"
                value={d[key]}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
              <small>{d[key]}</small>
            </label>
          ))}
          <label>
            <span>Үсгийн хэв</span>
            <select
              value={d.font}
              onChange={(e) => patch({ font: e.target.value as SiteDesign["font"] })}
            >
              <option value="sans">Цэвэр, орчин үеийн</option>
              <option value="serif">Сонгодог</option>
            </select>
          </label>
          {(
            [
              ["textSize", "Үндсэн текстийн хэмжээ", 16, 22],
              ["spacing", "Секц хоорондын зай", 56, 160],
              ["radius", "Товч, картын булан", 0, 32],
            ] as const
          ).map(([key, label, min, max]) => (
            <label key={key}>
              <span>
                {label}: {d[key]} px
              </span>
              <input
                type="range"
                min={min}
                max={max}
                value={d[key]}
                onChange={(e) => patch({ [key]: Number(e.target.value) })}
              />
            </label>
          ))}
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={d.stickyCta}
            onChange={(e) => patch({ stickyCta: e.target.checked })}
          />
          Доод тогтмол захиалгын товчийг харуулах
        </label>
        <p>Өнгө сонгохдоо бичвэр, дэвсгэрийн ялгаралтыг шууд харагдац дээр шалгаарай.</p>
        <button
          type="button"
          className="add"
          onClick={() => {
            if (
              confirm("Харагдах байдлыг анхны тохиргоонд буцаах уу? Контентын текст өөрчлөгдөхгүй.")
            )
              change(structuredClone(defaultDesign));
          }}
        >
          Анхны тохиргоонд буцаах
        </button>
      </article>
    </div>
  );
}
