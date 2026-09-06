import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteContent } from "../../lib/content";

export const dynamic = "force-dynamic";

async function findPage(slug: string) {
  const content = await getSiteContent();
  return { content, page: content.pages.find((item) => item.slug === slug && item.status === "published") };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await findPage(slug);
  if (!page) return {};
  return { title: page.seoTitle || `${page.title} | Adrenaline Fitness`, description: page.seoDescription || page.excerpt };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { content, page } = await findPage(slug);
  if (!page) notFound();
  const navPages = content.pages.filter((item) => item.status === "published" && item.showInNav);
  return <main className="cms-page">
    <header className="cms-header"><a className="brand" href="/"><img src="/adrenaline-logo.jpg" alt=""/><span><strong>ADRENALINE</strong><small>FITNESS SPORT CENTER</small></span></a><nav>{navPages.map((item)=><a key={item.id} href={`/${item.slug}`}>{item.title}</a>)}<a href="/#membership">Гишүүнчлэл</a><a href="/#contact">Холбоо</a></nav><a className="top-cta" href="/#membership">ЭРХ АВАХ ↗</a></header>
    <section className={`cms-hero ${page.heroImage?"has-photo":""}`} style={page.heroImage?{backgroundImage:`linear-gradient(90deg,#08090bee,#08090b77),url(${page.heroImage})`}:undefined}><div><span>ADRENALINE · {page.title.toUpperCase()}</span><h1>{page.title}</h1><p>{page.excerpt}</p></div></section>
    <article className="cms-body">{page.blocks.map((block)=>{
      if(block.type==="heading") return <h2 key={block.id}>{block.title}</h2>;
      if(block.type==="text") return <div className="cms-text" key={block.id}>{(block.body||"").split("\n").map((line,i)=><p key={i}>{line}</p>)}</div>;
      if(block.type==="image") return block.image?<figure key={block.id}><img src={block.image} alt={block.title||""}/>{block.title&&<figcaption>{block.title}</figcaption>}</figure>:null;
      return <div className="cms-cta" key={block.id}><div><h3>{block.title}</h3><p>{block.body}</p></div><a className="btn primary" href={block.buttonUrl||"/#contact"}>{block.buttonLabel||"ХОЛБОГДОХ"} ↗</a></div>;
    })}</article>
    <footer className="cms-footer"><div className="brand"><img src="/adrenaline-logo.jpg" alt=""/><span><strong>ADRENALINE</strong><small>FITNESS SPORT CENTER</small></span></div><p>© {new Date().getFullYear()} Adrenaline Fitness</p><a href="/">НҮҮР ХУУДАС ↑</a></footer>
  </main>;
}
