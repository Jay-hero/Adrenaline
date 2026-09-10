import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteContent } from "../../lib/content";
import { designStyle, normalizeDesign } from "../../lib/design";
import { blockView } from "../../lib/cms-layout";
import type { CSSProperties, ReactNode } from "react";

export const dynamic = "force-dynamic";

async function findPage(slug: string) {
  const content = await getSiteContent();
  return {
    content,
    page: content.pages.find(
      (item) => !item.deleted && item.slug === slug && item.status === "published",
    ),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await findPage(slug);
  if (!page) return {};
  return {
    title: page.seoTitle || `${page.title} | Adrenaline Fitness`,
    description: page.seoDescription || page.excerpt,
  };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { content, page } = await findPage(slug);
  if (!page) notFound();
  const navPages = content.pages.filter(
    (item) => !item.deleted && item.status === "published" && item.showInNav,
  );
  return (
    <main
      className={`cms-page ${content.design ? "site-canvas" : ""}`}
      style={content.design ? (designStyle(content.design) as CSSProperties) : undefined}
    >
      <header className="cms-header">
        <Link className="brand" href="/">
          <Image src="/adrenaline-logo.jpg" alt="" width={46} height={46} />
          <span>
            <strong>ADRENALINE</strong>
            <small>FITNESS SPORT CENTER</small>
          </span>
        </Link>
        <nav>
          {navPages.map((item) => (
            <Link key={item.id} href={`/${item.slug}`}>
              {item.title}
            </Link>
          ))}
          {!normalizeDesign(content.design).hidden.includes("membership") && (
            <Link href="/#membership">Гишүүнчлэл</Link>
          )}
          {!normalizeDesign(content.design).hidden.includes("contact") && (
            <Link href="/#contact">Холбоо</Link>
          )}
        </nav>
        {!normalizeDesign(content.design).hidden.includes("membership") && (
          <Link className="top-cta" href="/#membership">
            ЭРХ АВАХ ↗
          </Link>
        )}
      </header>
      <section
        className={`cms-hero ${page.heroImage ? "has-photo" : ""}`}
        style={
          page.heroImage
            ? {
                backgroundImage: `linear-gradient(90deg,#08090bee,#08090b77),url(${page.heroImage})`,
              }
            : undefined
        }
      >
        <div>
          <span>ADRENALINE · {page.title.toUpperCase()}</span>
          <h1>{page.title}</h1>
          <p>{page.excerpt}</p>
        </div>
      </section>
      <article className="cms-body">
        {page.blocks
          .filter((block) => !block.deleted && !block.hidden)
          .map((block) => {
            const view = blockView(block);
            let section: ReactNode;
            if (block.type === "heading") section = <h2>{block.title}</h2>;
            else if (block.type === "text")
              section = (
                <div className="cms-text">
                  {(block.body || "").split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              );
            else if (block.type === "image")
              section = block.image ? (
                <figure>
                  <Image
                    src={block.image}
                    alt={block.title || ""}
                    width={1200}
                    height={800}
                    sizes="(max-width: 800px) 100vw, 1200px"
                  />
                  {block.title && <figcaption>{block.title}</figcaption>}
                </figure>
              ) : null;
            else
              section = (
                <div className="cms-cta">
                  <div>
                    <h3>{block.title}</h3>
                    <p>{block.body}</p>
                  </div>
                  <a className="btn primary" href={block.buttonUrl || "/#contact"}>
                    {block.buttonLabel || "ХОЛБОГДОХ"} ↗
                  </a>
                </div>
              );
            return (
              <section
                className={`cms-block cms-block-${view.width} cms-align-${view.align} cms-tone-${view.tone}`}
                key={block.id}
              >
                {section}
              </section>
            );
          })}
      </article>
      <footer className="cms-footer">
        <div className="brand">
          <Image src="/adrenaline-logo.jpg" alt="" width={46} height={46} />
          <span>
            <strong>ADRENALINE</strong>
            <small>FITNESS SPORT CENTER</small>
          </span>
        </div>
        <p>© {new Date().getFullYear()} Adrenaline Fitness</p>
        <Link href="/">НҮҮР ХУУДАС ↑</Link>
      </footer>
    </main>
  );
}
