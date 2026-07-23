"use client";

import { useEffect, useState } from "react";
import { defaultContent, type MembershipPlan, type SiteContent } from "./site-data";

type Payment = {
  invoiceId: string;
  qrImage?: string;
  shortUrl?: string;
  bankUrls?: Array<{ name: string; logo?: string; link: string }>;
};

const money = new Intl.NumberFormat("mn-MN");

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [day, setDay] = useState(0);
  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "checking" | "paid" | "error">("idle");
  const [message, setMessage] = useState("");
  const [content,setContent]=useState<SiteContent>(defaultContent);
  const {coaches,membershipPlans,schedule,siteInfo}=content;
  const h=content.home;
  useEffect(()=>{if(new URLSearchParams(location.search).has("visual-editor"))return;fetch("/api/content",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(setContent).catch(()=>{})},[]);
  useEffect(()=>{
    const visual=new URLSearchParams(location.search).has("visual-editor");
    if(!visual)return;
    document.documentElement.classList.add("visual-editor-page");
    const receive=(event:MessageEvent)=>{if(event.origin===location.origin&&event.data?.type==="ADRENALINE_PREVIEW_CONTENT")setContent(event.data.content)};
    const pick=(event:MouseEvent)=>{const el=(event.target as HTMLElement).closest<HTMLElement>("[data-edit-section]");if(!el)return;event.preventDefault();event.stopPropagation();parent.postMessage({type:"ADRENALINE_PICK_SECTION",section:el.dataset.editSection,label:el.dataset.editLabel},location.origin)};
    window.addEventListener("message",receive);document.addEventListener("click",pick,true);
    parent.postMessage({type:"ADRENALINE_PREVIEW_READY"},location.origin);
    return()=>{window.removeEventListener("message",receive);document.removeEventListener("click",pick,true);document.documentElement.classList.remove("visual-editor-page")};
  },[]);

  useEffect(() => {
    if (!plan) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeCheckout();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [plan]);

  function closeCheckout() {
    setPlan(null);
    setPayment(null);
    setStatus("idle");
    setMessage("");
  }

  async function createInvoice() {
    if (!plan) return;
    setStatus("loading");
    try {
      const response = await fetch("/api/qpay/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const result = (await response.json()) as Payment & { error?: string };
      if (!response.ok) throw new Error(result.error || "QPay нэхэмжлэх үүсгэж чадсангүй.");
      setPayment(result);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Төлбөрийн хүсэлт амжилтгүй боллоо.");
    }
  }

  async function checkPayment() {
    if (!payment) return;
    setStatus("checking");
    try {
      const response = await fetch("/api/qpay/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: payment.invoiceId }),
      });
      const result = (await response.json()) as { paid?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || "Төлбөр шалгаж чадсангүй.");
      setStatus(result.paid ? "paid" : "ready");
      setMessage(result.paid ? "Төлбөр амжилттай баталгаажлаа." : "Төлбөр хараахан баталгаажаагүй байна.");
    } catch (error) {
      setStatus("ready");
      setMessage(error instanceof Error ? error.message : "Төлбөр шалгаж чадсангүй.");
    }
  }

  return (
    <main>
      <header data-edit-section="home" data-edit-label="Толгой хэсэг ба цэс">
        <a className="brand" href="#home">
          <img src="/adrenaline-logo.jpg" alt="" />
          <span><strong>{h.brandTitle}</strong><small>{h.brandSubtitle}</small></span>
        </a>
        <nav className={menu ? "open" : ""}>
          {[["about", h.nav.about], ["membership", h.nav.membership], ["coaches", h.nav.coaches], ["schedule", h.nav.schedule], ["contact", h.nav.contact]].map(([id, label]) => (
            <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>{label}</a>
          ))}
          {content.pages.filter((item) => item.status === "published" && item.showInNav).map((item) => <a href={`/${item.slug}`} key={item.id}>{item.title}</a>)}
        </nav>
        <a className="top-cta" href="#membership">{h.topCta}</a>
        <button className="menu" type="button" aria-label="Цэс" aria-expanded={menu} onClick={() => setMenu(!menu)}><i /><i /></button>
      </header>

      <section className="hero" id="home" data-edit-section="home" data-edit-label="Hero хэсэг">
        <div className="grid-lines" />
        <div className="hero-copy">
          <span className="kicker"><i /> {h.hero.kicker}</span>
          <h1>{h.hero.title}<br /><em>{h.hero.accent}</em></h1>
          <p>{h.hero.copy}</p>
          <div className="actions">
            <a className="btn primary" href="#membership">{h.hero.primaryCta}</a>
            <a className="btn ghost" href="#schedule">{h.hero.secondaryCta}</a>
          </div>
        </div>
        <div className="emblem" aria-hidden="true">
          <div className="orbit one" /><div className="orbit two" />
          <img src="/adrenaline-logo.jpg" alt="" />
          <span>{h.hero.orbitText}</span>
        </div>
      </section>

      <section className="stats" data-edit-section="home" data-edit-label="Статистик">
        {h.stats.map((item, i) => (
          <div key={item.id}><small>0{i + 1}</small><strong>{item.value}</strong><span>{item.label}</span></div>
        ))}
      </section>

      <section className="section about" id="about" data-edit-section="home" data-edit-label="Бидний тухай">
        <Title number="01" label={h.about.label} title={<>{h.about.title}<br /><em>{h.about.accent}</em></>} copy={h.about.copy} />
        <div className="values">
          {h.about.values.map((item, i) => (
            <article key={item.id}><small>A / 0{i + 1}</small><b aria-hidden="true">{item.symbol}</b><h3>{item.title}</h3><p>{item.copy}</p></article>
          ))}
        </div>
      </section>

      <section className="section memberships" id="membership" data-edit-section="membership" data-edit-label="Гишүүнчлэл">
        <Title number="02" label={h.membership.label} title={<>{h.membership.title}<br /><em>{h.membership.accent}</em></>} copy={h.membership.copy} />
        <div className="plans">
          {membershipPlans.map((item) => (
            <article className={item.featured ? "featured" : ""} key={item.id}>
              {item.featured && <span className="badge">{h.membership.badge}</span>}
              <small>{item.duration}</small><h3>{item.name}</h3><p>{item.description}</p>
              <div className="price"><strong>{money.format(item.price)}₮</strong><span>{h.membership.priceSuffix}</span></div>
              <ul>{item.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
              <button className={`btn ${item.featured ? "primary" : "ghost"}`} type="button" onClick={() => setPlan(item)}>{h.membership.button}</button>
            </article>
          ))}
        </div>
        <p className="note">{h.membership.note}</p>
      </section>

      <section className="section coach-section" id="coaches" data-edit-section="coaches" data-edit-label="Дасгалжуулагч">
        <Title number="03" label={h.coachSection.label} title={<>{h.coachSection.title}<br /><em>{h.coachSection.accent}</em></>} copy={h.coachSection.copy} />
        <div className="coaches">
          {coaches.map((coach, i) => (
            <article key={coach.id || coach.role}>
              <div className={`portrait ${coach.image?"has-image":""}`}>{coach.image?<img src={coach.image} alt={coach.name || coach.role}/>:<span>{coach.code}</span>}<small>0{i + 1}</small></div>
              <div className="coach-copy"><small>{coach.focus}</small><h3>{coach.name || coach.role}</h3>{coach.name&&<b>{coach.role}</b>}<p>{coach.copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section timetable" id="schedule" data-edit-section="schedule" data-edit-label="Цагийн хуваарь">
        <Title number="04" label={h.timetable.label} title={<>{h.timetable.title}<br /><em>{h.timetable.accent}</em></>} copy={h.timetable.copy} />
        <div className="schedule">
          <div className="days" role="tablist">{schedule.map((item, i) => <button className={day === i ? "active" : ""} role="tab" aria-selected={day === i} type="button" key={item.day} onClick={() => setDay(i)}><small>0{i + 1}</small>{item.day}</button>)}</div>
          <div className="sessions" role="tabpanel">
            <div className="session-title"><strong>{schedule[day].day}</strong><span>{schedule[day].sessions.length} {h.timetable.countSuffix}</span></div>
            {schedule[day].sessions.map(([time, title]) => <div className="session" key={`${time}-${title}`}><time>{time}</time><strong>{title}</strong><a href="#contact">↗</a></div>)}
          </div>
        </div>
        <p className="note">{h.timetable.note}</p>
      </section>

      <section className="section contact" id="contact" data-edit-section="contact" data-edit-label="Холбоо барих">
        <div className="contact-copy">
          <span className="section-kicker">05 · {h.contact.label}</span>
          <h2>{h.contact.title}<br /><em>{h.contact.accent}</em></h2>
          <p>{h.contact.copy}</p>
          <div className="contact-list"><a href={`tel:${siteInfo.phone}`}><small>{h.contact.phoneLabel}</small><strong>{siteInfo.phone}</strong><span>↗</span></a><a href={`mailto:${siteInfo.email}`}><small>{h.contact.emailLabel}</small><strong>{siteInfo.email}</strong><span>↗</span></a><div><small>{h.contact.addressLabel}</small><strong>{siteInfo.address}</strong></div></div>
        </div>
        <div className="map"><div className="map-lines" /><span><img src="/adrenaline-logo.jpg" alt="" /></span><footer><div><small>{h.contact.mapEyebrow}</small><strong>{h.contact.mapButton}</strong></div><a href={siteInfo.mapUrl||"#contact"} target={siteInfo.mapUrl?"_blank":undefined}>↗</a></footer></div>
      </section>

      <section className="final" data-edit-section="home" data-edit-label="Доод уриалга"><span>{h.finalCta.eyebrow}</span><h2>{h.finalCta.title}<br />{h.finalCta.accent}</h2><a className="btn primary" href="#membership">{h.finalCta.button}</a></section>
      <footer className="site-footer" data-edit-section="home" data-edit-label="Footer"><div className="brand"><img src="/adrenaline-logo.jpg" alt="" /><span><strong>{h.brandTitle}</strong><small>{h.brandSubtitle}</small></span></div><p>© {new Date().getFullYear()} {h.footer.copyright} · <a href="/admin">{h.footer.adminLabel}</a></p><a href="#home">{h.footer.backToTop}</a></footer>
      <a className="sticky" href="#membership">{h.finalCta.button}</a>

      {plan && <div className="backdrop" onMouseDown={closeCheckout}><section className="modal" role="dialog" aria-modal="true" aria-label="QPay төлбөр" onMouseDown={(event) => event.stopPropagation()}><button className="close" type="button" onClick={closeCheckout}>×</button><span className="section-kicker">{h.payment.label}</span><h2>{plan.name}</h2><div className="summary"><span>{plan.duration}</span><strong>{money.format(plan.price)}₮</strong></div>
        {(status === "idle" || status === "loading") && <><p>{h.payment.intro}</p><button className="btn primary" type="button" disabled={status === "loading"} onClick={createInvoice}>{status === "loading" ? h.payment.creating : h.payment.createButton}</button></>}
        {status === "error" && <div className="error"><strong>{h.payment.pendingTitle}</strong><p>{message}</p><p>{h.payment.pendingCopy}</p><a className="btn ghost" href={`tel:${siteInfo.phone}`}>{h.payment.phoneButton}</a></div>}
        {payment && ["ready", "checking", "paid"].includes(status) && <div className="pay-ready">{payment.qrImage && <img className="qr" src={payment.qrImage.startsWith("data:") ? payment.qrImage : `data:image/png;base64,${payment.qrImage}`} alt="QPay QR" />}<p>{h.payment.qrCopy}</p>{payment.shortUrl && <a className="btn primary" href={payment.shortUrl} target="_blank" rel="noreferrer">{h.payment.openButton}</a>}<button className="check" type="button" disabled={status === "checking" || status === "paid"} onClick={checkPayment}>{status === "paid" ? h.payment.paid : status === "checking" ? h.payment.checking : h.payment.checkButton}</button>{message && <small>{message}</small>}</div>}
      </section></div>}
    </main>
  );
}

function Title({ number, label, title, copy }: { number: string; label: string; title: React.ReactNode; copy: string }) {
  return <div className="title"><div><span className="section-kicker">{number} · {label}</span><h2>{title}</h2></div><p>{copy}</p></div>;
}
