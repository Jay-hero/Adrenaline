"use client";

import { useEffect, useState } from "react";
import { coaches, membershipPlans, schedule, siteInfo, type MembershipPlan } from "./site-data";

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
      <header>
        <a className="brand" href="#home">
          <img src="/adrenaline-logo.jpg" alt="" />
          <span><strong>ADRENALINE</strong><small>FITNESS SPORT CENTER</small></span>
        </a>
        <nav className={menu ? "open" : ""}>
          {[["about", "Бидний тухай"], ["membership", "Гишүүнчлэл"], ["coaches", "Дасгалжуулагч"], ["schedule", "Хуваарь"], ["contact", "Холбоо"]].map(([id, label]) => (
            <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>{label}</a>
          ))}
        </nav>
        <a className="top-cta" href="#membership">ЭРХ АВАХ ↗</a>
        <button className="menu" type="button" aria-label="Цэс" aria-expanded={menu} onClick={() => setMenu(!menu)}><i /><i /></button>
      </header>

      <section className="hero" id="home">
        <div className="grid-lines" />
        <div className="hero-copy">
          <span className="kicker"><i /> FITNESS • STRENGTH • COMMUNITY</span>
          <h1>ХҮЧЭЭ СЭРЭЭ.<br /><em>ХЯЗГААРАА ДАВ.</em></h1>
          <p>Зөв орчин, зөв хөтөлбөр, зөв хүмүүсийн дунд өөрийн хамгийн хүчтэй хувилбарыг бүтээ.</p>
          <div className="actions">
            <a className="btn primary" href="#membership">ГИШҮҮНЧЛЭЛ СОНГОХ ↗</a>
            <a className="btn ghost" href="#schedule">ХИЧЭЭЛИЙН ХУВААРЬ</a>
          </div>
        </div>
        <div className="emblem" aria-hidden="true">
          <div className="orbit one" /><div className="orbit two" />
          <img src="/adrenaline-logo.jpg" alt="" />
          <span>FOCUS · POWER · DISCIPLINE</span>
        </div>
      </section>

      <section className="stats">
        {[ ["7", "хоног нээлттэй"], ["3", "гишүүнчлэлийн сонголт"], ["1:1", "зорилгод тохирсон зөвлөгөө"] ].map(([value, label], i) => (
          <div key={label}><small>0{i + 1}</small><strong>{value}</strong><span>{label}</span></div>
        ))}
      </section>

      <section className="section about" id="about">
        <Title number="01" label="БИДНИЙ ТУХАЙ" title={<>ДАСГАЛ БОЛ ЗӨВХӨН<br /><em>БИЕИЙН ХӨДӨЛГӨӨН БИШ.</em></>} copy="Adrenaline бол зорилгоо тодорхойлж, өөрийгөө сорьж, тогтвортой ахиц гаргах хүмүүсийн орон зай." />
        <div className="values">
          {[ ["◎", "ЗОРИЛГОД ТӨВЛӨРНӨ", "Таны түвшин, боломж, зорилгод нийцсэн бодит алхмаас эхэлнэ."], ["▥", "АХИЦЫГ ХЭМЖИНЭ", "Мэдрэмжээс гадна ахиц, давтамж, гүйцэтгэлийг харна."], ["◉", "ХАМТДАА ХҮЧТЭЙ", "Дэмждэг, урам өгдөг, тууштай байхад туслах community."] ].map(([symbol, title, copy], i) => (
            <article key={title}><small>A / 0{i + 1}</small><b aria-hidden="true">{symbol}</b><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="section memberships" id="membership">
        <Title number="02" label="ГИШҮҮНЧЛЭЛ" title={<>ӨӨРИЙН ХЭМНЭЛЭЭ<br /><em>СОНГО.</em></>} copy="Нэг өдрийн сэдэл биш, үргэлжлэх систем. Танд тохирох хугацаагаа сонгоод QPay-аар эрхээ аваарай." />
        <div className="plans">
          {membershipPlans.map((item) => (
            <article className={item.featured ? "featured" : ""} key={item.id}>
              {item.featured && <span className="badge">ХАМГИЙН ЭРЭЛТТЭЙ</span>}
              <small>{item.duration}</small><h3>{item.name}</h3><p>{item.description}</p>
              <div className="price"><strong>{money.format(item.price)}₮</strong><span>/ эрх</span></div>
              <ul>{item.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
              <button className={`btn ${item.featured ? "primary" : "ghost"}`} type="button" onClick={() => setPlan(item)}>QPAY-ААР АВАХ ↗</button>
            </article>
          ))}
        </div>
        <p className="note">* Үнэ, нөхцөл нь жишиг мэдээлэл бөгөөд албан ёсны мэдээллээр шинэчилнэ.</p>
      </section>

      <section className="section coach-section" id="coaches">
        <Title number="03" label="ДАСГАЛЖУУЛАГЧИД" title={<>ТАНЫ АХИЦЫН<br /><em>АРД БАЙХ ХҮМҮҮС.</em></>} copy="Мэргэжлийн чиглэл бүрээр зөв техник, бодит ахиц, тогтвортой үр дүнд хөтөлнө." />
        <div className="coaches">
          {coaches.map((coach, i) => (
            <article key={coach.role}>
              <div className="portrait"><span>{coach.code}</span><small>0{i + 1}</small></div>
              <div className="coach-copy"><small>{coach.focus}</small><h3>{coach.role}</h3><p>{coach.copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section timetable" id="schedule">
        <Title number="04" label="ЦАГИЙН ХУВААРЬ" title={<>ӨДӨР БҮР<br /><em>ХӨДӨЛГӨӨНТЭЙ.</em></>} copy="Өөрийн хэмнэлд тохирох өдрөө сонго. Групп хичээлийн суудал хязгаартай." />
        <div className="schedule">
          <div className="days" role="tablist">{schedule.map((item, i) => <button className={day === i ? "active" : ""} role="tab" aria-selected={day === i} type="button" key={item.day} onClick={() => setDay(i)}><small>0{i + 1}</small>{item.day}</button>)}</div>
          <div className="sessions" role="tabpanel">
            <div className="session-title"><strong>{schedule[day].day}</strong><span>3 хичээл</span></div>
            {schedule[day].sessions.map(([time, title]) => <div className="session" key={`${time}-${title}`}><time>{time}</time><strong>{title}</strong><a href="#contact">↗</a></div>)}
          </div>
        </div>
        <p className="note">* Хуваарь нь загвар мэдээлэл бөгөөд бодит хуваариар шинэчилнэ.</p>
      </section>

      <section className="section contact" id="contact">
        <div className="contact-copy">
          <span className="section-kicker">05 · БАЙРШИЛ & ХОЛБОО</span>
          <h2>ЭХНИЙ АЛХМАА<br /><em>ӨНӨӨДӨР ХИЙ.</em></h2>
          <p>Гишүүнчлэл, дасгалжуулагч болон туршилтын эрхийн талаар бидэнтэй холбогдоорой.</p>
          <div className="contact-list"><a href={`tel:${siteInfo.phone}`}><small>УТАС</small><strong>{siteInfo.phone}</strong><span>↗</span></a><a href={`mailto:${siteInfo.email}`}><small>И-МЭЙЛ</small><strong>{siteInfo.email}</strong><span>↗</span></a><div><small>ХАЯГ</small><strong>{siteInfo.address}</strong></div></div>
        </div>
        <div className="map"><div className="map-lines" /><span><img src="/adrenaline-logo.jpg" alt="" /></span><footer><div><small>ADRENALINE FITNESS</small><strong>БАЙРШИЛ ХАРАХ</strong></div><a href="#contact">↗</a></footer></div>
      </section>

      <section className="final"><span>READY WHEN YOU ARE</span><h2>ХҮЧТЭЙ ЭХЭЛ.<br />ТУУШТАЙ ҮРГЭЛЖЛҮҮЛ.</h2><a className="btn primary" href="#membership">ГИШҮҮНЧЛЭЛ АВАХ ↗</a></section>
      <footer className="site-footer"><div className="brand"><img src="/adrenaline-logo.jpg" alt="" /><span><strong>ADRENALINE</strong><small>FITNESS SPORT CENTER</small></span></div><p>© {new Date().getFullYear()} Adrenaline Fitness</p><a href="#home">ДЭЭШ ↑</a></footer>
      <a className="sticky" href="#membership">ГИШҮҮНЧЛЭЛ АВАХ ↗</a>

      {plan && <div className="backdrop" onMouseDown={closeCheckout}><section className="modal" role="dialog" aria-modal="true" aria-label="QPay төлбөр" onMouseDown={(event) => event.stopPropagation()}><button className="close" type="button" onClick={closeCheckout}>×</button><span className="section-kicker">QPAY ГИШҮҮНЧЛЭЛ</span><h2>{plan.name}</h2><div className="summary"><span>{plan.duration}</span><strong>{money.format(plan.price)}₮</strong></div>
        {(status === "idle" || status === "loading") && <><p>QPay нэхэмжлэх үүсгээд банкны апп-аар төлнө. Төлбөр баталгаажмагц эрхийг идэвхжүүлнэ.</p><button className="btn primary" type="button" disabled={status === "loading"} onClick={createInvoice}>{status === "loading" ? "ҮҮСГЭЖ БАЙНА..." : "QPAY НЭХЭМЖЛЭХ ҮҮСГЭХ"}</button></>}
        {status === "error" && <div className="error"><strong>QPay холболт хүлээгдэж байна</strong><p>{message}</p><p>Merchant credential нэмэхэд автоматаар ажиллана.</p><a className="btn ghost" href={`tel:${siteInfo.phone}`}>УТСААР ХОЛБОГДОХ</a></div>}
        {payment && ["ready", "checking", "paid"].includes(status) && <div className="pay-ready">{payment.qrImage && <img className="qr" src={payment.qrImage.startsWith("data:") ? payment.qrImage : `data:image/png;base64,${payment.qrImage}`} alt="QPay QR" />}<p>QR кодыг уншуулах эсвэл QPay-г нээнэ үү.</p>{payment.shortUrl && <a className="btn primary" href={payment.shortUrl} target="_blank" rel="noreferrer">QPAY НЭЭХ ↗</a>}<button className="check" type="button" disabled={status === "checking" || status === "paid"} onClick={checkPayment}>{status === "paid" ? "✓ ТӨЛБӨР БАТАЛГААЖЛАА" : status === "checking" ? "ШАЛГАЖ БАЙНА..." : "ТӨЛБӨР ШАЛГАХ"}</button>{message && <small>{message}</small>}</div>}
      </section></div>}
    </main>
  );
}

function Title({ number, label, title, copy }: { number: string; label: string; title: React.ReactNode; copy: string }) {
  return <div className="title"><div><span className="section-kicker">{number} · {label}</span><h2>{title}</h2></div><p>{copy}</p></div>;
}

