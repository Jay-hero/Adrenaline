"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  defaultContent,
  type CmsBlock,
  type CmsPage,
  type HomeContent,
  type SiteContent,
} from "../site-data";
import DesignEditor from "./DesignEditor";
import { normalizeDesign } from "../../lib/design";
import { moveActiveItem } from "../../lib/cms-layout";
type Tab =
  | "home"
  | "info"
  | "plans"
  | "payment"
  | "coaches"
  | "schedule"
  | "pages"
  | "design";
const menu: [Tab, string][] = [
  ["design", "Харагдах байдал / секц"],
  ["home", "Нүүр хуудас"],
  ["info", "Холбоо"],
  ["plans", "Гишүүнчлэл"],
  ["payment", "Төлбөр"],
  ["coaches", "Дасгалжуулагч"],
  ["schedule", "Хуваарь"],
  ["pages", "Хуудас"],
];
const uid = () => crypto.randomUUID();
export default function Editor({ email, signout }: { email: string; signout: string }) {
  const [c, setC] = useState<SiteContent>(defaultContent),
    [tab, setTab] = useState<Tab>("home"),
    [msg, setMsg] = useState("Ачаалж байна..."),
    [editing, setEditing] = useState<string | null>(null),
    [visual, setVisual] = useState(false),
    [picked, setPicked] = useState("Нүүр хуудас");
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState("");
  const dirty = loaded && JSON.stringify(c) !== saved;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    fetch("/api/admin/content")
      .then(async (r) => {
        const x = await r.json();
        if (!r.ok) throw Error(x.error);
        const next = { ...defaultContent, ...x, pages: x.pages || [] };
        setC(next);
        setSaved(JSON.stringify(next));
        setLoaded(true);
        setMsg("");
      })
      .catch((e) => setMsg(e.message));
  }, []);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: "ADRENALINE_PREVIEW_CONTENT", content: c },
      location.origin,
    );
  }, [c, visual]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if(event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      if(event.data?.type === 'ADRENALINE_PREVIEW_READY') {
        frame.current?.contentWindow?.postMessage({type:'ADRENALINE_PREVIEW_CONTENT',content:c},location.origin);
        return;
      }
      if (event.data?.type !== "ADRENALINE_PICK_SECTION")
        return;
      const section = String(event.data.section || "home");
      const target: Tab =
        section === "membership"
          ? "plans"
          : section === "coaches"
            ? "coaches"
            : section === "schedule"
              ? "schedule"
              : section === "contact"
                ? "info"
                : "home";
      setTab(target);
      setEditing(null);
      setPicked(String(event.data.label || section));
      setTimeout(
        () => document.querySelector(".admin-work")?.scrollTo({ top: 0, behavior: "smooth" }),
        0,
      );
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [c]);
  async function save() {
    if (!loaded || saving || !dirty) return;
    setSaving(true);
    setMsg("Хадгалж байна...");
    const body = JSON.stringify(c);
    try {
      const r = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (r.status === 403) {
        setMsg("Нэвтрэх хугацаа дууссан байна. Өөрчлөлтөө хадгалахын өмнө дахин нэвтэрнэ үү.");
        return;
      }
      const x = await r.json();
      if (!r.ok) throw Error(x.error || "Хадгалж чадсангүй.");
      setSaved(body);
      setMsg("Амжилттай хадгаллаа");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Холболт тасарлаа. Дахин хадгална уу.");
    } finally {
      setSaving(false);
    }
  }
  const page = c.pages.find((p) => p.id === editing);
  return (
    <main className={`admin-shell ${visual ? "visual-admin" : ""}`}>
      <aside>
        <Link className="admin-logo" href="/">
          <Image src="/adrenaline-logo.jpg" alt="" width={46} height={46} />
          <b>
            ADRENALINE
            <br />
            <small>CONTROL CENTER</small>
          </b>
        </Link>
        {menu.map(([k, v]) => (
          <button
            className={tab === k ? "active" : ""}
            onClick={() => {
              setTab(k);
              setEditing(null);
            }}
            key={k}
          >
            {v}
          </button>
        ))}
        <footer>
          {email}
          <a href={signout}>Гарах</a>
        </footer>
      </aside>
      <section className="admin-work">
        <header>
          <div>
            <small>{visual ? `LIVE ЗАСВАР · ${picked}` : "САЙТЫН УДИРДЛАГА"}</small>
            <h1>{editing ? "ХУУДАС ЗАСАХ" : menu.find((x) => x[0] === tab)?.[1]}</h1>
          </div>
          <div>
            <button className="visual-toggle" onClick={() => setVisual(!visual)}>
              {visual ? "☷ ЭНГИЙН ХАРАХ" : "◫ LIVE ХАРАХ"}
            </button>
            <button disabled={!dirty || saving} onClick={()=>{if(confirm('Хадгалаагүй өөрчлөлтүүдийг буцаах уу?')){setC(JSON.parse(saved));setEditing(null);setMsg('Хамгийн сүүлд хадгалсан хувилбарыг сэргээв.')}}}>ӨӨРЧЛӨЛТ БУЦААХ</button>
            <Link href="/" target="_blank">
              Сайт харах ↗
            </Link>
            <button disabled={!loaded || saving || !dirty} onClick={save}>
              {saving ? "ХАДГАЛЖ БАЙНА…" : "ӨӨРЧЛӨЛТ ХАДГАЛАХ"}
            </button>
          </div>
        </header>
        {msg && (
          <p role="status" className="admin-msg">
            {msg}
            {!loaded && msg !== "Ачаалж байна..." && (
              <button onClick={() => location.reload()}>Дахин ачаалах</button>
            )}
          </p>
        )}
        {dirty && <p className="admin-msg">Хадгалаагүй өөрчлөлт байна</p>}
        {visual && (
          <div className="live-preview">
            <div className="preview-bar">
              <span>
                <i /> LIVE PREVIEW
              </span>
              <small>Сайт дээрх хэсэг дээр дарж сонгоно</small>
            </div>
            <iframe
              ref={frame}
              src="/?visual-editor=1"
              title="Сайтын шууд харагдац"
              onLoad={() =>
                frame.current?.contentWindow?.postMessage(
                  { type: "ADRENALINE_PREVIEW_CONTENT", content: c },
                  location.origin,
                )
              }
            />
          </div>
        )}
        <fieldset
          disabled={!loaded || saving}
          style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
        >
          {tab === "design" && (
            <DesignEditor
              value={c.design}
              change={(design) => setC({ ...c, design: normalizeDesign(design) })}
              preview={() => setVisual(true)}
            />
          )}
          {tab === "home" && <HomeEditor home={c.home} change={(home) => setC({ ...c, home })} />}
          {tab === "info" && (
            <Card title="Холбоо барих мэдээлэл">
              <div className="formgrid">
                {Object.entries(c.siteInfo).map(([k, v]) => (
                  <Field
                    key={k}
                    label={k}
                    value={v || ""}
                    change={(x) => setC({ ...c, siteInfo: { ...c.siteInfo, [k]: x } })}
                  />
                ))}
              </div>
            </Card>
          )}
          {tab === "plans" && (
            <>
              <button className="add top-add" onClick={addPlan}>
                + ГИШҮҮНЧЛЭЛ НЭМЭХ
              </button>
              {c.membershipPlans.map((p, i) => (
                <Card key={p.id} title={p.name}>
                  <button className="block-remove" onClick={() => removePlan(i)}>
                    Устгах
                  </button>
                  <div className="formgrid">
                    <Field label="Нэр" value={p.name} change={(v) => plan(i, { name: v })} />
                    <Field
                      label="Хугацаа"
                      value={p.duration}
                      change={(v) => plan(i, { duration: v })}
                    />
                    <Field
                      label="Үнэ"
                      value={String(p.price)}
                      type="number"
                      change={(v) => plan(i, { price: Number(v) })}
                    />
                    <Field
                      label="Тайлбар"
                      value={p.description}
                      change={(v) => plan(i, { description: v })}
                    />
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={Boolean(p.featured)}
                        onChange={(e) => plan(i, { featured: e.target.checked })}
                      />{" "}
                      Онцлох багц
                    </label>
                    <Field
                      wide
                      area
                      label="Давуу талууд (мөр бүрт нэг)"
                      value={p.features.join("\n")}
                      change={(v) => plan(i, { features: v.split("\n").filter(Boolean) })}
                    />
                  </div>
                </Card>
              ))}
            </>
          )}
          {tab === "payment" && (
            <PaymentEditor
              payment={c.home.payment}
              plans={c.membershipPlans}
              changePayment={(key, value) =>
                setC({
                  ...c,
                  home: { ...c.home, payment: { ...c.home.payment, [key]: value } },
                })
              }
              changePlan={plan}
            />
          )}
          {tab === "coaches" && (
            <>
              <button className="add top-add" onClick={addCoach}>
                + ДАСГАЛЖУУЛАГЧ НЭМЭХ
              </button>
              {c.coaches.map((p, i) => (
                <Card key={p.id || i} title={p.name || p.role}>
                  <button className="block-remove" onClick={() => removeCoach(i)}>
                    Устгах
                  </button>
                  <div className="coachform">
                    <Upload image={p.image} done={(v) => coach(i, { image: v })} />
                    <div className="formgrid">
                      <Field
                        label="Нэр"
                        value={p.name || ""}
                        change={(v) => coach(i, { name: v })}
                      />
                      <Field
                        label="Албан тушаал"
                        value={p.role}
                        change={(v) => coach(i, { role: v })}
                      />
                      <Field label="Товчлол" value={p.code} change={(v) => coach(i, { code: v })} />
                      <Field
                        label="Чиглэл"
                        value={p.focus}
                        change={(v) => coach(i, { focus: v })}
                      />
                      <Field
                        area
                        label="Танилцуулга"
                        value={p.copy}
                        change={(v) => coach(i, { copy: v })}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
          {tab === "schedule" && (
            <>
              <button className="add top-add" onClick={addDay}>
                + ӨДӨР НЭМЭХ
              </button>
              {c.schedule.map((d, di) => (
                <Card key={`${d.day}-${di}`} title={d.day}>
                  <button className="block-remove" onClick={() => removeDay(di)}>
                    Өдөр устгах
                  </button>
                  <div className="day-name">
                    <Field label="Өдрийн нэр" value={d.day} change={(v) => renameDay(di, v)} />
                  </div>
                  {d.sessions.map((s, si) => (
                    <div className="sessionrow" key={si}>
                      <Field label="Цаг" value={s[0]} change={(v) => session(di, si, 0, v)} />
                      <Field label="Хичээл" value={s[1]} change={(v) => session(di, si, 1, v)} />
                      <button onClick={() => removeSession(di, si)}>×</button>
                    </div>
                  ))}
                  <button className="add" onClick={() => addSession(di)}>
                    + Хичээл нэмэх
                  </button>
                </Card>
              ))}
            </>
          )}
          {tab === "pages" && !page && (
            <>
              <PageList
                pages={c.pages.filter((item) => !item.deleted)}
                add={addPage}
                edit={setEditing}
                remove={removePage}
                move={movePage}
              />
              {c.pages.some((item) => item.deleted) && (
                <Card title="Хассан хуудсууд">
                  <p>Буцаахад ноорог төлөвт орно. Шалгаад нийтэлж болно.</p>
                  {c.pages
                    .filter((item) => item.deleted)
                    .map((item) => (
                      <div className="design-section" key={item.id}>
                        <strong>{item.title}</strong>
                        <button
                          type="button"
                          onClick={() =>
                            updatePage(item.id, {
                              deleted: false,
                              status: "draft",
                              showInNav: false,
                            })
                          }
                        >
                          Ноорогт буцаах
                        </button>
                      </div>
                    ))}
                </Card>
              )}
            </>
          )}{" "}
          {tab === "pages" && page && (
            <PageEditor
              page={page}
              back={() => setEditing(null)}
              change={(patch) => updatePage(page.id, patch)}
              addBlock={(type) => addBlock(page.id, type)}
              updateBlock={(id, patch) => updateBlock(page.id, id, patch)}
              removeBlock={(id) => removeBlock(page.id, id)}
              moveBlock={(id, delta) => moveBlock(page.id, id, delta)}
              restoreBlock={(id) => updateBlock(page.id, id, { deleted: false, hidden: true })}
            />
          )}{" "}
        </fieldset>
      </section>
    </main>
  );
  function plan(i: number, p: Partial<SiteContent["membershipPlans"][number]>) {
    const a = [...c.membershipPlans];
    a[i] = { ...a[i], ...p };
    setC({ ...c, membershipPlans: a });
  }
  function coach(i: number, p: Partial<SiteContent["coaches"][number]>) {
    const a = [...c.coaches];
    a[i] = { ...a[i], ...p };
    setC({ ...c, coaches: a });
  }
  function session(di: number, si: number, f: 0 | 1, v: string) {
    const a = structuredClone(c.schedule);
    a[di].sessions[si][f] = v;
    setC({ ...c, schedule: a });
  }
  function addSession(di: number) {
    const a = structuredClone(c.schedule);
    a[di].sessions.push(["18:00", "Шинэ хичээл"]);
    setC({ ...c, schedule: a });
  }
  function removeSession(di: number, si: number) {
    const a = structuredClone(c.schedule);
    a[di].sessions.splice(si, 1);
    setC({ ...c, schedule: a });
  }
  function addPlan() {
    setC({
      ...c,
      membershipPlans: [
        ...c.membershipPlans,
        {
          id: uid(),
          name: "ШИНЭ БАГЦ",
          duration: "1 сарын эрх",
          price: 0,
          description: "Багцын тайлбар",
          features: ["Давуу тал"],
        },
      ],
    });
  }
  function removePlan(i: number) {
    setC({ ...c, membershipPlans: c.membershipPlans.filter((_, x) => x !== i) });
  }
  function addCoach() {
    setC({
      ...c,
      coaches: [
        ...c.coaches,
        {
          id: uid(),
          code: "PT",
          name: "",
          image: "",
          role: "Дасгалжуулагч",
          focus: "Мэргэшсэн чиглэл",
          copy: "Танилцуулга",
        },
      ],
    });
  }
  function removeCoach(i: number) {
    setC({ ...c, coaches: c.coaches.filter((_, x) => x !== i) });
  }
  function addDay() {
    setC({
      ...c,
      schedule: [...c.schedule, { day: "ШИНЭ ӨДӨР", sessions: [["18:00", "Шинэ хичээл"]] }],
    });
  }
  function removeDay(i: number) {
    if (c.schedule.length <= 1) {
      setMsg("Хуваарьт хамгийн багадаа нэг өдөр үлдэх ёстой.");
      return;
    }
    setC({ ...c, schedule: c.schedule.filter((_, x) => x !== i) });
  }
  function renameDay(i: number, v: string) {
    const a = structuredClone(c.schedule);
    a[i].day = v;
    setC({ ...c, schedule: a });
  }
  function addPage() {
    const p: CmsPage = {
      id: uid(),
      title: "Шинэ хуудас",
      slug: `page-${Date.now()}`,
      excerpt: "Хуудасны товч танилцуулга",
      status: "draft",
      showInNav: false,
      seoTitle: "",
      seoDescription: "",
      blocks: [],
    };
    setC({ ...c, pages: [...c.pages, p] });
    setEditing(p.id);
  }
  function movePage(id: string, delta: number) {
    const pages = moveActiveItem(c.pages, id, delta);
    if (pages !== c.pages) setC({ ...c, pages });
  }
  function removePage(id: string) {
    if (!confirm("Энэ хуудсыг сайтаас хасах уу? Хадгалсны дараа нийтэд харагдахгүй болно. Хассан хуудсуудаас буцааж болно.")) return;
    setC({ ...c, pages: c.pages.map((p) => p.id === id ? {...p,deleted:true} : p) });
  }
  function updatePage(id: string, patch: Partial<CmsPage>) {
    setC({ ...c, pages: c.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  }
  function addBlock(pid: string, type: CmsBlock["type"]) {
    const b: CmsBlock = {
      id: uid(),
      type,
      title: type === "heading" ? "Шинэ гарчиг" : "",
      body: type === "text" ? "Энд текстээ бичнэ үү." : "",
      buttonLabel: type === "cta" ? "ХОЛБОГДОХ" : "",
      buttonUrl: type === "cta" ? "/#contact" : "",
      hidden: false,
      width: "content",
      align: "left",
      tone: "default",
    };
    updatePage(pid, { blocks: [...(c.pages.find((p) => p.id === pid)?.blocks || []), b] });
  }
  function updateBlock(pid: string, bid: string, patch: Partial<CmsBlock>) {
    const p = c.pages.find((x) => x.id === pid);
    if (p)
      updatePage(pid, { blocks: p.blocks.map((b) => (b.id === bid ? { ...b, ...patch } : b)) });
  }
  function moveBlock(pid: string, bid: string, delta: number) {
    const pageToUpdate = c.pages.find((item) => item.id === pid);
    if (!pageToUpdate) return;
    const blocks = moveActiveItem(pageToUpdate.blocks, bid, delta);
    if (blocks !== pageToUpdate.blocks) updatePage(pid, { blocks });
  }
  function removeBlock(pid: string, bid: string) {
    if (!confirm("Энэ секцийг хуудаснаас хасах уу? Хассан секцээс дараа нь сэргээж болно."))
      return;
    const p = c.pages.find((x) => x.id === pid);
    if (p)
      updatePage(pid, {
        blocks: p.blocks.map((block) =>
          block.id === bid ? { ...block, deleted: true, hidden: true } : block,
        ),
      });
  }
}
function HomeEditor({ home, change }: { home: HomeContent; change: (h: HomeContent) => void }) {
  const patch = <K extends keyof HomeContent>(key: K, value: HomeContent[K]) =>
    change({ ...home, [key]: value });
  const group = <K extends keyof HomeContent>(key: K, field: string, value: string) =>
    patch(key, { ...(home[key] as object), [field]: value } as HomeContent[K]);
  return (
    <div className="home-editor">
      <Card title="Брэнд ба үндсэн цэс">
        <div className="formgrid">
          <Field
            label="Брэндийн нэр"
            value={home.brandTitle}
            change={(v) => patch("brandTitle", v)}
          />
          <Field
            label="Дэд нэр"
            value={home.brandSubtitle}
            change={(v) => patch("brandSubtitle", v)}
          />
          {Object.entries(home.nav).map(([k, v]) => (
            <Field
              key={k}
              label={`Цэс — ${k}`}
              value={v}
              change={(x) => patch("nav", { ...home.nav, [k]: x })}
            />
          ))}
          <Field label="Толгой CTA" value={home.topCta} change={(v) => patch("topCta", v)} />
        </div>
      </Card>
      <Card title="Hero хэсэг">
        <div className="formgrid">
          <Field
            label="Жижиг гарчиг"
            value={home.hero.kicker}
            change={(v) => group("hero", "kicker", v)}
          />
          <Field
            label="Үндсэн гарчиг"
            value={home.hero.title}
            change={(v) => group("hero", "title", v)}
          />
          <Field
            label="Онцлох гарчиг"
            value={home.hero.accent}
            change={(v) => group("hero", "accent", v)}
          />
          <Field
            wide
            area
            label="Тайлбар"
            value={home.hero.copy}
            change={(v) => group("hero", "copy", v)}
          />
          <Field
            label="Үндсэн товч"
            value={home.hero.primaryCta}
            change={(v) => group("hero", "primaryCta", v)}
          />
          <Field
            label="Хоёрдогч товч"
            value={home.hero.secondaryCta}
            change={(v) => group("hero", "secondaryCta", v)}
          />
          <Field
            label="Логоны доорх текст"
            value={home.hero.orbitText}
            change={(v) => group("hero", "orbitText", v)}
          />
        </div>
      </Card>
      <Card title="Статистик">
        <button
          className="add inline-add"
          onClick={() =>
            patch("stats", [...home.stats, { id: uid(), value: "0", label: "Шинэ үзүүлэлт" }])
          }
        >
          + ҮЗҮҮЛЭЛТ НЭМЭХ
        </button>
        {home.stats.map((s, i) => (
          <div className="editable-row" key={s.id}>
            <Field
              label="Утга"
              value={s.value}
              change={(v) =>
                patch(
                  "stats",
                  home.stats.map((x, n) => (n === i ? { ...x, value: v } : x)),
                )
              }
            />
            <Field
              label="Тайлбар"
              value={s.label}
              change={(v) =>
                patch(
                  "stats",
                  home.stats.map((x, n) => (n === i ? { ...x, label: v } : x)),
                )
              }
            />
            <button
              onClick={() =>
                patch(
                  "stats",
                  home.stats.filter((_, n) => n !== i),
                )
              }
            >
              ×
            </button>
          </div>
        ))}
      </Card>
      <SectionEditor
        title="Бидний тухай — гарчиг"
        data={home.about}
        fields={["label", "title", "accent", "copy"]}
        change={(k, v) => group("about", k, v)}
      />
      <Card title="Бидний тухай — давуу талууд">
        <button
          className="add inline-add"
          onClick={() =>
            patch("about", {
              ...home.about,
              values: [
                ...home.about.values,
                { id: uid(), symbol: "◎", title: "Шинэ давуу тал", copy: "Тайлбар" },
              ],
            })
          }
        >
          + ДАВУУ ТАЛ НЭМЭХ
        </button>
        {home.about.values.map((v, i) => (
          <div className="value-editor" key={v.id}>
            <div className="formgrid">
              <Field label="Дүрс" value={v.symbol} change={(x) => values(i, { symbol: x })} />
              <Field label="Гарчиг" value={v.title} change={(x) => values(i, { title: x })} />
              <Field
                wide
                area
                label="Тайлбар"
                value={v.copy}
                change={(x) => values(i, { copy: x })}
              />
            </div>
            <button
              className="block-remove"
              onClick={() =>
                patch("about", {
                  ...home.about,
                  values: home.about.values.filter((_, n) => n !== i),
                })
              }
            >
              Устгах
            </button>
          </div>
        ))}
      </Card>
      <SectionEditor
        title="Гишүүнчлэлийн хэсэг"
        data={home.membership}
        fields={["label", "title", "accent", "copy", "badge", "priceSuffix", "button", "note"]}
        change={(k, v) => group("membership", k, v)}
      />
      <SectionEditor
        title="Дасгалжуулагчийн хэсэг"
        data={home.coachSection}
        fields={["label", "title", "accent", "copy"]}
        change={(k, v) => group("coachSection", k, v)}
      />
      <SectionEditor
        title="Хуваарийн хэсэг"
        data={home.timetable}
        fields={["label", "title", "accent", "copy", "countSuffix", "note"]}
        change={(k, v) => group("timetable", k, v)}
      />
      <SectionEditor
        title="Холбоо барих хэсгийн текст"
        data={home.contact}
        fields={[
          "label",
          "title",
          "accent",
          "copy",
          "phoneLabel",
          "emailLabel",
          "addressLabel",
          "mapEyebrow",
          "mapButton",
        ]}
        change={(k, v) => group("contact", k, v)}
      />
      <SectionEditor
        title="Доод CTA"
        data={home.finalCta}
        fields={["eyebrow", "title", "accent", "button"]}
        change={(k, v) => group("finalCta", k, v)}
      />
      <SectionEditor
        title="Footer"
        data={home.footer}
        fields={["copyright", "backToTop", "adminLabel"]}
        change={(k, v) => group("footer", k, v)}
      />
    </div>
  );
  function values(i: number, p: Partial<HomeContent["about"]["values"][number]>) {
    patch("about", {
      ...home.about,
      values: home.about.values.map((x, n) => (n === i ? { ...x, ...p } : x)),
    });
  }
}
function PaymentEditor({
  payment,
  plans,
  changePayment,
  changePlan,
}: {
  payment: HomeContent["payment"];
  plans: SiteContent["membershipPlans"];
  changePayment: (key: keyof HomeContent["payment"], value: string) => void;
  changePlan: (index: number, patch: Partial<SiteContent["membershipPlans"][number]>) => void;
}) {
  return (
    <div className="payment-editor">
      <Card title="Багцын төлбөрийн мэдээлэл">
        <p className="admin-card-note">
          Энд өөрчилсөн үнэ төлбөрийн цонх болон нүүр хуудасны гишүүнчлэлийн картанд зэрэг
          шинэчлэгдэнэ.
        </p>
        <div className="payment-plan-list">
          {plans.map((item, index) => (
            <section key={item.id} className="payment-plan-row">
              <h3>{item.name || `Багц ${index + 1}`}</h3>
              <div className="formgrid">
                <Field
                  label="Багцын нэр"
                  value={item.name}
                  change={(value) => changePlan(index, { name: value })}
                />
                <Field
                  label="Хугацаа"
                  value={item.duration}
                  change={(value) => changePlan(index, { duration: value })}
                />
                <Field
                  label="Үнэ (₮)"
                  type="number"
                  value={String(item.price)}
                  change={(value) => changePlan(index, { price: Math.max(0, Number(value) || 0) })}
                />
                <Field
                  label="Төлбөрийн тайлбар"
                  value={item.description}
                  change={(value) => changePlan(index, { description: value })}
                />
              </div>
            </section>
          ))}
        </div>
      </Card>
      <SectionEditor
        title="QPay төлбөрийн цонхны мэдээлэл"
        data={payment}
        fields={Object.keys(payment)}
        change={(key, value) => changePayment(key as keyof HomeContent["payment"], value)}
      />
      <Card title="QPay холболтын хамгаалалт">
        <p className="admin-card-note">
          Merchant username, password, invoice code зэрэг нууц мэдээлэл энэ админ хэсэгт
          харагдахгүй, хадгалагдахгүй. Энд зөвхөн хэрэглэгчид харагдах үнэ болон тайлбаруудыг
          шинэчилнэ.
        </p>
      </Card>
    </div>
  );
}
function SectionEditor({
  title,
  data,
  fields,
  change,
}: {
  title: string;
  data: Record<string, string> | object;
  fields: string[];
  change: (k: string, v: string) => void;
}) {
  const labels: Record<string, string> = {
    label: "Хэсгийн нэр",
    title: "Үндсэн гарчиг",
    accent: "Онцлох гарчиг",
    copy: "Тайлбар",
    badge: "Онцлох тэмдэг",
    priceSuffix: "Үнийн дагавар",
    button: "Товчны текст",
    note: "Тайлбар тэмдэглэл",
    countSuffix: "Тооны дагавар",
    phoneLabel: "Утасны нэр",
    emailLabel: "Имэйлийн нэр",
    addressLabel: "Хаягийн нэр",
    mapEyebrow: "Газрын зургийн жижиг гарчиг",
    mapButton: "Газрын зургийн товч",
    eyebrow: "Жижиг гарчиг",
    copyright: "Copyright",
    backToTop: "Дээш товч",
    adminLabel: "Админ холбоос",
    intro: "Төлбөрийн тайлбар",
    createButton: "Нэхэмжлэл үүсгэх товч",
    creating: "Үүсгэж буй төлөв",
    pendingTitle: "Хүлээгдэж буй гарчиг",
    pendingCopy: "Хүлээгдэж буй тайлбар",
    phoneButton: "Утсаар холбогдох товч",
    qrCopy: "QR тайлбар",
    openButton: "QPay нээх товч",
    checkButton: "Төлбөр шалгах товч",
    checking: "Шалгаж буй төлөв",
    paid: "Төлөгдсөн төлөв",
  };
  return (
    <Card title={title}>
      <div className="formgrid">
        {fields.map((k) => (
          <Field
            key={k}
            label={labels[k] || k}
            value={(data as Record<string, string>)[k] || ""}
            area={
              k === "copy" || k === "note" || k === "intro" || k === "pendingCopy" || k === "qrCopy"
            }
            change={(v) => change(k, v)}
          />
        ))}
      </div>
    </Card>
  );
}
function blockLabel(type: CmsBlock["type"]) {
  return {
    heading: "Гарчиг",
    text: "Текст",
    image: "Зураг",
    cta: "Уриалга / CTA",
  }[type];
}
function PageList({
  pages,
  add,
  edit,
  remove,
  move,
}: {
  pages: CmsPage[];
  add: () => void;
  edit: (id: string) => void;
  remove: (id: string) => void;
  move: (id: string, delta: number) => void;
}) {
  return (
    <div className="page-manager">
      <div className="page-manager-head">
        <div>
          <h2>Хуудас</h2>
          <p>Нүүр хуудаснаас тусдаа мэдээллийн хуудсууд.</p>
        </div>
        <button onClick={add}>+ ШИНЭ ХУУДАС</button>
      </div>
      {pages.length === 0 ? (
        <div className="empty-pages">
          <b>Одоогоор нэмэлт хуудас алга.</b>
          <p>“Шинэ хуудас” товчоор эхний хуудсаа үүсгэнэ үү.</p>
        </div>
      ) : (
        <div className="page-list">
          {pages.map((p, index) => (
            <article key={p.id}>
              <div>
                <span className={p.status}>
                  {p.status === "published" ? "НИЙТЭЛСЭН" : "НООРОГ"}
                </span>
                <h3>{p.title}</h3>
                <small>/{p.slug}</small>
              </div>
              <div>
                <button
                  type="button"
                  aria-label={`${p.title} хуудсыг дээш зөөх`}
                  disabled={index === 0}
                  onClick={() => move(p.id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`${p.title} хуудсыг доош зөөх`}
                  disabled={index === pages.length - 1}
                  onClick={() => move(p.id, 1)}
                >
                  ↓
                </button>
                <a href={`/${p.slug}`} target="_blank">
                  Харах ↗
                </a>
                <button onClick={() => edit(p.id)}>Засах</button>
                <button className="danger" onClick={() => remove(p.id)}>
                  Устгах
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
function PageEditor({
  page,
  back,
  change,
  addBlock,
  updateBlock,
  removeBlock,
  moveBlock,
  restoreBlock,
}: {
  page: CmsPage;
  back: () => void;
  change: (p: Partial<CmsPage>) => void;
  addBlock: (t: CmsBlock["type"]) => void;
  updateBlock: (id: string, p: Partial<CmsBlock>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, delta: number) => void;
  restoreBlock: (id: string) => void;
}) {
  const activeBlocks = page.blocks.filter((block) => !block.deleted);
  const deletedBlocks = page.blocks.filter((block) => block.deleted);
  return (
    <div className="page-editor">
      <button className="back" onClick={back}>
        ← ХУУДСЫН ЖАГСААЛТ
      </button>
      <Card title="Үндсэн тохиргоо">
        <div className="formgrid">
          <Field label="Хуудасны нэр" value={page.title} change={(v) => change({ title: v })} />
          <Field label="URL slug" value={page.slug} change={(v) => change({ slug: slugify(v) })} />
          <Field
            wide
            area
            label="Товч танилцуулга"
            value={page.excerpt}
            change={(v) => change({ excerpt: v })}
          />
          <Select
            label="Төлөв"
            value={page.status}
            change={(v) => change({ status: v as CmsPage["status"] })}
            options={[
              ["draft", "Ноорог"],
              ["published", "Нийтэлсэн"],
            ]}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={page.showInNav}
              onChange={(e) => change({ showInNav: e.target.checked })}
            />{" "}
            Үндсэн цэсэнд харуулах
          </label>
        </div>
        <div className="hero-upload">
          <span>Hero зураг</span>
          <Upload image={page.heroImage} done={(v) => change({ heroImage: v })} />
        </div>
      </Card>
      <Card title="SEO">
        <div className="formgrid">
          <Field label="SEO гарчиг" value={page.seoTitle} change={(v) => change({ seoTitle: v })} />
          <Field
            label="Meta тайлбар"
            value={page.seoDescription}
            change={(v) => change({ seoDescription: v })}
          />
        </div>
      </Card>
      <div className="blocks-head">
        <div>
          <h2>Хуудасны секцүүд</h2>
          <p>Секц нэмэх, дарааллыг солих, нуух эсвэл харагдах байдлыг тохируулна.</p>
        </div>
        <div>
          <button onClick={() => addBlock("heading")}>+ Гарчиг</button>
          <button onClick={() => addBlock("text")}>+ Текст</button>
          <button onClick={() => addBlock("image")}>+ Зураг</button>
          <button onClick={() => addBlock("cta")}>+ CTA</button>
        </div>
      </div>
      {activeBlocks.length === 0 && (
        <div className="empty-pages">
          <b>Одоогоор секц алга.</b>
          <p>Дээрх товчнуудаас секцийн төрлөө сонгоод нэмнэ үү.</p>
        </div>
      )}
      {activeBlocks.map((b, i) => (
        <BlockEditor
          key={b.id}
          block={b}
          index={i}
          count={activeBlocks.length}
          change={(p) => updateBlock(b.id, p)}
          remove={() => removeBlock(b.id)}
          move={(delta) => moveBlock(b.id, delta)}
        />
      ))}
      {deletedBlocks.length > 0 && (
        <Card title="Хассан секцүүд">
          <p>Сэргээсэн секц эхлээд нууц төлөвтэй орно.</p>
          {deletedBlocks.map((block) => (
            <div className="design-section" key={block.id}>
              <div>
                <strong>{blockLabel(block.type)}</strong>
                <small>{block.title || block.body || "Хоосон секц"}</small>
              </div>
              <button type="button" onClick={() => restoreBlock(block.id)}>
                Сэргээх
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
function BlockEditor({
  block,
  index,
  count,
  change,
  remove,
  move,
}: {
  block: CmsBlock;
  index: number;
  count: number;
  change: (p: Partial<CmsBlock>) => void;
  remove: () => void;
  move: (delta: number) => void;
}) {
  return (
    <Card title={`${index + 1}. ${blockLabel(block.type)}`}>
      <div className="block-actions">
        <button
          type="button"
          aria-label={`${index + 1}-р секцийг дээш зөөх`}
          disabled={index === 0}
          onClick={() => move(-1)}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label={`${index + 1}-р секцийг доош зөөх`}
          disabled={index === count - 1}
          onClick={() => move(1)}
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => change({ hidden: !block.hidden })}
        >
          {block.hidden ? "Харуулах" : "Нуух"}
        </button>
        <button className="danger" type="button" onClick={remove}>
          Хасах
        </button>
      </div>
      <div className="block-view-settings">
        <Select
          label="Өргөн"
          value={block.width || "content"}
          change={(value) => change({ width: value as CmsBlock["width"] })}
          options={[
            ["narrow", "Нарийн"],
            ["content", "Контент"],
            ["full", "Бүтэн өргөн"],
          ]}
        />
        <Select
          label="Зэрэгцүүлэлт"
          value={block.align || "left"}
          change={(value) => change({ align: value as CmsBlock["align"] })}
          options={[
            ["left", "Зүүн"],
            ["center", "Төв"],
            ["right", "Баруун"],
          ]}
        />
        <Select
          label="Дэвсгэр"
          value={block.tone || "default"}
          change={(value) => change({ tone: value as CmsBlock["tone"] })}
          options={[
            ["default", "Үндсэн"],
            ["surface", "Карт"],
            ["accent", "Онцлох"],
          ]}
        />
      </div>
      {block.hidden && <p className="section-hidden-note">Энэ секц нийтэд харагдахгүй.</p>}
      <div className="formgrid">
        {block.type === "heading" && (
          <Field
            wide
            label="Гарчиг"
            value={block.title || ""}
            change={(v) => change({ title: v })}
          />
        )}{" "}
        {block.type === "text" && (
          <Field
            wide
            area
            label="Текст"
            value={block.body || ""}
            change={(v) => change({ body: v })}
          />
        )}{" "}
        {block.type === "image" && (
          <>
            <Upload image={block.image} done={(v) => change({ image: v })} />
            <Field
              label="Зургийн тайлбар"
              value={block.title || ""}
              change={(v) => change({ title: v })}
            />
          </>
        )}{" "}
        {block.type === "cta" && (
          <>
            <Field
              label="CTA гарчиг"
              value={block.title || ""}
              change={(v) => change({ title: v })}
            />
            <Field label="Тайлбар" value={block.body || ""} change={(v) => change({ body: v })} />
            <Field
              label="Товчны текст"
              value={block.buttonLabel || ""}
              change={(v) => change({ buttonLabel: v })}
            />
            <Field
              label="Товчны холбоос"
              value={block.buttonUrl || ""}
              change={(v) => change({ buttonUrl: v })}
            />
          </>
        )}
      </div>
    </Card>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="admin-card">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
function Field({
  label,
  value,
  change,
  area,
  type = "text",
  wide,
}: {
  label: string;
  value: string;
  change: (v: string) => void;
  area?: boolean;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "wide" : ""}>
      <span>{label}</span>
      {area ? (
        <textarea value={value} onChange={(e) => change(e.target.value)} />
      ) : (
        <input type={type} value={value} onChange={(e) => change(e.target.value)} />
      )}
    </label>
  );
}
function Select({
  label,
  value,
  change,
  options,
}: {
  label: string;
  value: string;
  change: (v: string) => void;
  options: string[][];
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(e) => change(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
function Upload({ image, done }: { image?: string; done: (v: string) => void }) {
  const [msg, setMsg] = useState("");
  async function up(f?: File) {
    if (!f) return;
    setMsg("Оруулж байна...");
    const b = new FormData();
    b.append("file", f);
    const r = await fetch("/api/admin/upload", { method: "POST", body: b });
    const x = await r.json();
    if (r.ok) {
      done(x.url);
      setMsg("✓ Зураг орлоо");
    } else setMsg(x.error);
  }
  return (
    <div className="uploader">
      {image ? <Image src={image} alt="" width={180} height={225} sizes="180px" /> : <div>PHOTO</div>}
      <label>
        ЗУРАГ ОРУУЛАХ
        <input type="file" accept="image/*" onChange={(e) => up(e.target.files?.[0])} />
      </label>
      <small>{msg}</small>
    </div>
  );
}
function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
