"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { SiteContent } from "./site-data";
import published from "./published-content.json";
import { normalizeDesign } from "../lib/design";
import s from "./home.module.css";

const money = new Intl.NumberFormat("mn-MN");
const arrow = <span aria-hidden="true">↗</span>;
const phoneLink = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;
function safeLink(url?: string) {
  try { const parsed = new URL(url || ""); return parsed.protocol === "https:" ? parsed.href : undefined; }
  catch { return undefined; }
}

export default function Home() {
  const [content, setContent] = useState<SiteContent>(published as SiteContent);
  const [offline, setOffline] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [photo, setPhoto] = useState<{ src: string; label: string } | null>(null);
  const root = useRef<HTMLElement>(null);
  const lightbox = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const visual = new URLSearchParams(location.search).has("visual-editor");
    const controller = new AbortController();
    if (!visual) {
      fetch("/api/content", { cache: "no-store", signal: controller.signal })
        .then(r => { if (!r.ok) throw new Error("content unavailable"); return r.json(); })
        .then(data => { if (!data?.home || !data?.siteInfo || !Array.isArray(data.pages) || !Array.isArray(data.membershipPlans) || !Array.isArray(data.coaches)) throw new Error("invalid content"); setContent(data); })
        .catch(error => { if (error.name !== "AbortError") setOffline(true); });
      return () => controller.abort();
    }
    document.documentElement.classList.add("visual-editor-page");
    const receive = (event: MessageEvent) => {
      if (event.origin === location.origin && event.source === parent && event.data?.type === "ADRENALINE_PREVIEW_CONTENT") setContent(event.data.content);
    };
    const pick = (event: MouseEvent) => {
      const element = (event.target as HTMLElement).closest<HTMLElement>("[data-edit-section]");
      if (!element) return;
      event.preventDefault(); event.stopPropagation();
      parent.postMessage({ type: "ADRENALINE_PICK_SECTION", section: element.dataset.editSection, label: element.dataset.editLabel }, location.origin);
    };
    window.addEventListener("message", receive);
    document.addEventListener("click", pick, true);
    parent.postMessage({ type: "ADRENALINE_PREVIEW_READY" }, location.origin);
    return () => { window.removeEventListener("message", receive); document.removeEventListener("click", pick, true); document.documentElement.classList.remove("visual-editor-page"); };
  }, []);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add(s.revealed); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    root.current?.querySelectorAll("[data-reveal]").forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [content]);

  useEffect(() => {
    if (!photo) return;
    const dialog = lightbox.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previous; trigger.current?.focus(); };
  }, [photo]);

  const design = normalizeDesign(content.design);
  const h = content.home;
  const info = content.siteInfo as SiteContent["siteInfo"] & { phone2?: string };
  const phone = info.phone;
  const gym = content.pages.find(page => !page.deleted && page.status === "published" && page.title.trim() === "Заал");
  const gallery = [...new Set([gym?.heroImage, ...(gym?.blocks.filter(block => !block.hidden && !block.deleted && block.type === "image").map(block => block.image) || [])].filter((src): src is string => Boolean(src)))];
  const labels = ["Кардио бүс", "Заалны үүд", "Хүчний бэлтгэлийн бүс"];
  const coaches = content.coaches.filter(coach => coach.name?.trim() && coach.image);
  const mapUrl = safeLink(info.mapUrl);
  const query = mapUrl ? new URL(mapUrl).searchParams.get("query") || `${info.name} ${info.address}` : `${info.name} ${info.address}`;
  const mapEmbed = info.mapUrl === published.siteInfo.mapUrl
    ? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.712252407674!2d106.89012679999999!3d47.9226049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d9693b48098fc4b%3A0x7f9e146d5261093d!2sAdrenaline%20Sport%20Fitness%20Center!5e0!3m2!1sen!2smn!4v1790652581161!5m2!1sen!2smn"
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const mapLink = mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const facebook = safeLink(info.facebookUrl);
  const visible = (id: "about" | "membership" | "coaches" | "contact") => !design.hidden.includes(id);
  const links = [["about", "Заал"], ["membership", "Үнэ, багц"], ["contact", "Байршил, холбоо"]].filter(([id]) => visible(id as "about" | "membership" | "contact"));
  const theme = { "--accent": design.accent, "--ink": design.background, "--paper": design.text, "--surface": design.surface } as CSSProperties;

  return <main ref={root} className={s.root} style={theme} id="top">
    <a className={s.skip} href="#about">Үндсэн мэдээлэл рүү</a>
    <header className={s.header} data-edit-section="home" data-edit-label="Толгой хэсэг">
      <a href="#top" className={s.brand} aria-label="Adrenaline — нүүр"><Image src="/adrenaline-logo.jpg" alt="" width={44} height={44} /><span><strong>{h.brandTitle}</strong><small>{h.brandSubtitle}</small></span></a>
      <nav id="main-navigation" className={`${s.nav} ${menu ? s.navOpen : ""}`} aria-label="Үндсэн цэс" onKeyDown={event => { if (event.key === "Escape") { setMenu(false); menuButton.current?.focus(); } }}>
        {links.map(([id, label]) => <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>{label}</a>)}
      </nav>
      <a className={s.headerCall} href={phoneLink(phone)}>{phone} {arrow}</a>
      <button ref={menuButton} className={s.menuButton} type="button" aria-label={menu ? "Цэс хаах" : "Цэс нээх"} aria-expanded={menu} aria-controls="main-navigation" onClick={() => setMenu(value => !value)}>{menu ? "✕" : "☰"}</button>
    </header>
    <section className={s.hero} data-edit-section="home" data-edit-label="Нүүрний танилцуулга">
      {gallery[0] && <Image className={s.heroImage} src={gallery[0]} alt="Adrenaline фитнессийн кардио тоног төхөөрөмжтэй заал" fill sizes="100vw" preload />}
      <div className={s.heroShade} />
      <div className={s.heroContent}><p className={s.eyebrow}><span className={s.redDot} /> УЛААНБААТАР · ADRENALINE FITNESS</p><h1>{h.hero.title}<br /><em>{h.hero.accent}</em></h1><p className={s.heroDescription}>{h.hero.copy}</p>
        <div className={s.actions}>{visible("membership") && <a className={s.primary} href="#membership">ҮНЭ, БАГЦ ХАРАХ {arrow}</a>}{visible("about") && <a className={s.secondary} href="#about">ЗААЛТАЙ ТАНИЛЦАХ <span aria-hidden="true">↓</span></a>}</div>
      </div>
      <div className={s.heroBottom}><span>ӨӨРИЙНХӨӨ ТӨЛӨӨ. ӨНӨӨДРӨӨС.</span><a href="#contact">{info.address} {arrow}</a></div><span className={s.heroIndex} aria-hidden="true">01 / AD</span>
    </section>
    {visible("about") && <section className={s.section} id="about" data-edit-section="pages" data-edit-label="Заалны зураг ба танилцуулга">
      <div className={s.sectionHeading} data-reveal><div><p className={s.eyebrow}>01 / МАНАЙ ОРЧИН</p><h2>ТАНЫ ДАРААГИЙН<br /><span>АХИЦ ЭНДЭЭС.</span></h2></div><div className={s.sectionIntro}><p>{gym?.excerpt || h.about.copy}</p><p className={s.muted}>Тоног төхөөрөмж, орчинтойгоо зургаар танилцаарай.</p></div></div>
      <div className={s.gallery}>{gallery.map((src, i) => <button type="button" className={s.galleryTile} key={src} onClick={event => { trigger.current = event.currentTarget; setPhoto({ src, label: labels[i] || "Заалны зураг" }); }} aria-label={`${labels[i] || "Заалны зураг"} — томруулж харах`} data-reveal>
        <Image src={src} alt={labels[i] || "Adrenaline заалны орчин"} fill sizes={i === 0 ? "(max-width: 700px) 100vw, 60vw" : "(max-width: 700px) 50vw, 35vw"} /><span className={s.photoCaption}><span><small>0{i + 1}</small>{labels[i] || "Манай орчин"}</span><b aria-hidden="true">↗</b></span>
      </button>)}</div>
      {visible("coaches") && coaches.map(coach => <article key={coach.id || coach.name} className={s.coach} data-edit-section="coaches" data-edit-label="Дасгалжуулагч" data-reveal><Image src={coach.image!} alt={coach.name!} width={100} height={120} className={s.coachImage} /><div><p className={s.eyebrow}>{coach.role}</p><h3>{coach.name}</h3><p>{coach.copy}</p></div><a href={phoneLink(phone)} className={s.textLink}>Багштай бэлтгэх {arrow}</a></article>)}
    </section>}
    {visible("membership") && <section className={`${s.section} ${s.pricing}`} id="membership" data-edit-section="membership" data-edit-label="Үнэ ба гишүүнчлэл">
      <div className={s.sectionHeading} data-reveal><div><p className={s.eyebrow}>02 / ҮНЭ, ГИШҮҮНЧЛЭЛ</p><h2>{h.membership.title}<br /><span>{h.membership.accent}</span></h2></div><p className={s.sectionIntro}>{h.membership.copy}</p></div>
      {offline && <p className={s.notice} role="status">Сүүлд нийтлэгдсэн мэдээллийг харуулж байна. Одоогийн үнэ, нөхцөлийг утсаар баталгаажуулна уу.</p>}
      <div className={s.plans}>{content.membershipPlans.map((plan, index) => <article key={plan.id} className={`${s.plan} ${plan.featured ? s.featured : ""}`} data-reveal><div className={s.planTop}><span>0{index + 1}</span>{plan.featured && <span className={s.badge}>{h.membership.badge}</span>}</div><h3>{plan.duration}</h3><p className={s.planName}>{plan.name}</p><p className={s.price}>{money.format(plan.price)}<span>₮</span></p><p className={s.planDescription}>{plan.description}</p>{plan.features.length > 0 && <ul>{plan.features.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>}<a className={plan.featured ? s.primary : s.secondary} href={phoneLink(phone)} aria-label={`${plan.duration} — утсаар лавлах`}>БАГЦ ЛАВЛАХ {arrow}</a></article>)}</div>
      <p className={s.priceNote}>{h.membership.note}</p>
    </section>}
    {visible("contact") && <section className={`${s.section} ${s.contact}`} id="contact" data-edit-section="contact" data-edit-label="Байршил ба холбоо">
      <div className={s.sectionHeading} data-reveal><div><p className={s.eyebrow}>03 / БАЙРШИЛ, ХОЛБОО</p><h2>БИДЭНТЭЙ<br /><span>ЭНД УУЛЗААРАЙ.</span></h2></div><p className={s.sectionIntro}>Заалаа үзэх, багцаа сонгох, бэлтгэлээ эхлэх.<br />Бидэнтэй шууд холбогдоорой.</p></div>
      <div className={s.contactGrid}><div className={s.contactDetails} data-reveal><span className={s.eyebrow}>ХОЛБОО БАРИХ</span><a className={s.phone} href={phoneLink(phone)}>{phone} {arrow}</a>{info.phone2 && <a className={s.phoneSecondary} href={phoneLink(info.phone2)}>{info.phone2} {arrow}</a>}<div className={s.address}><span className={s.eyebrow}>МАНАЙ ХАЯГ</span><p>{info.address}</p><a className={s.textLink} href={mapLink} target="_blank" rel="noopener noreferrer">Google Maps дээр нээх {arrow}</a></div><p className={s.muted}>Ажиллах цаг болон тухайн өдрийн мэдээллийг утсаар лавлаарай.</p><div className={s.socials}>{facebook && <a href={facebook} target="_blank" rel="noopener noreferrer">Facebook {arrow}</a>}{info.email?.trim() && <a href={`mailto:${info.email}`}>{info.email} {arrow}</a>}</div></div>
        <div className={s.mapPanel} data-reveal><div className={s.mapView}>{!mapLoaded && <a className={s.mapFallback} href={mapLink} target="_blank" rel="noopener noreferrer"><span className={s.mapPin} aria-hidden="true">⌖</span><strong>ADRENALINE FITNESS</strong><span>{info.address}</span><b>Google Maps дээр харах ↗</b></a>}<iframe title="Adrenaline Fitness — Google Maps байршил" src={mapEmbed} loading="eager" referrerPolicy="no-referrer-when-downgrade" onLoad={() => setMapLoaded(true)} allowFullScreen /></div><div className={s.mapFooter}><span><i className={s.redDot} /> ADRENALINE FITNESS</span><a href={mapLink} target="_blank" rel="noopener noreferrer" aria-label="Google Maps дээр байршил нээх">{arrow}</a></div></div>
      </div>
    </section>}
    <footer className={s.footer}><a href="#top" className={s.footerBrand}>ADRENALINE<span>FITNESS SPORT CENTER</span></a><p>© {new Date().getFullYear()} {h.footer.copyright}</p><div><Link href="/admin">Админ</Link><a href="#top">Дээш ↑</a></div></footer>
    {design.stickyCta && <div className={s.mobileBar}><a href={phoneLink(phone)}>ЗАЛГАХ {arrow}</a><a href={mapLink} target="_blank" rel="noopener noreferrer">БАЙРШИЛ {arrow}</a></div>}
    {photo && <dialog ref={lightbox} className={s.lightbox} onCancel={() => setPhoto(null)} onClick={event => { if (event.target === event.currentTarget) setPhoto(null); }} onClose={() => setPhoto(null)} aria-label={photo.label}><button type="button" className={s.closePhoto} onClick={() => setPhoto(null)} aria-label="Зураг хаах" autoFocus>✕</button><div className={s.lightboxImage}><Image src={photo.src} alt={photo.label} fill sizes="95vw" /></div><p>{photo.label}</p></dialog>}
  </main>;
}
