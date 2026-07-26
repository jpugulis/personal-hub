import Image from "next/image";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { imageSize } from "@/lib/sheets";
import { DIAGRAMS } from "@/components/sheet/Diagrams";

/**
 * Renders a sheet body from markdown.
 *
 * Beyond GFM (tables, strikethrough) the following fenced blocks are supported.
 * They exist because markdown has no native syntax for them and I'd rather
 * authors write a fenced block than raw HTML. Full spec: content/README.md
 *
 *   ```figure   src / alt / caption / note
 *   ```diagram  a key from DIAGRAMS
 *   ```note     label + paragraphs (side remark)
 *   ```verdict  label + paragraphs (boxed conclusion)
 *   ```video    Bunny Stream id / library / caption
 *   ```gallery  one "path | caption" per line
 *
 * Conventions:
 *   ## Latvian heading | 01 — English subtitle
 *   Bolding the first cell of a table row tints that row.
 */

/** Parse `key: value` lines from a block, returning leftovers as `_body`. */
function kv(src: string): Record<string, string> & { _body: string } {
  const out: Record<string, string> = {};
  const rest: string[] = [];
  let stillHead = true;
  for (const line of src.split("\n")) {
    const m = stillHead ? line.match(/^([a-zA-Z]+):\s*(.*)$/) : null;
    if (m) out[m[1]] = m[2].trim();
    else {
      if (line.trim()) stillHead = false;
      rest.push(line);
    }
  }
  return { ...out, _body: rest.join("\n").trim() };
}

function resolve(base: string, src: string): string {
  if (/^https?:\/\//.test(src)) return src;
  return `${base}/${src.replace(/^\//, "")}`;
}

function Figure({ base, src, alt, caption, note }: {
  base: string; src: string; alt?: string; caption?: string; note?: string;
}) {
  const url = resolve(base, src);
  const { width, height } = imageSize(url);
  return (
    <figure className="art-fig">
      <Image src={url} alt={alt || caption || ""} width={width} height={height} sizes="100vw" />
      {(caption || note) && (
        <figcaption>
          <span>{caption}</span>
          {note && <span>{note}</span>}
        </figcaption>
      )}
    </figure>
  );
}

function Paras({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).filter(Boolean).map((p, i) => (
        <p key={i}>
          <Markdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <>{children}</> }}>
            {p}
          </Markdown>
        </p>
      ))}
    </>
  );
}

function Video({ base, src, poster, id, library, caption }: {
  base: string; src?: string; poster?: string;
  id?: string; library?: string; caption?: string;
}) {
  // Three sources, in order of preference:
  //   src      a URL served over a CDN (Bunny Storage + pull zone) — plain
  //            MP4, right choice for short clips, no transcoding needed
  //   id .mp4  a file under /public — fine under ~5 MB
  //   library+id  Bunny Stream — HLS and adaptive bitrate, for long video
  const direct = src || (id && /\.(mp4|webm)$/i.test(id) ? id : undefined);

  return (
    <figure className="art-fig art-video">
      {direct ? (
        <video
          controls
          preload="metadata"
          playsInline
          src={resolve(base, direct)}
          {...(poster ? { poster: resolve(base, poster) } : {})}
        />
      ) : (
        <div className="art-video-frame">
          <iframe
            src={`https://iframe.mediadelivery.net/embed/${library}/${id}?autoplay=false&preload=false`}
            loading="lazy"
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
            allowFullScreen
            title={caption || "Video"}
          />
        </div>
      )}
      {caption && (
        <figcaption>
          <span>{caption}</span>
        </figcaption>
      )}
    </figure>
  );
}

function Gallery({ base, src }: { base: string; src: string }) {
  const items = src
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [p, cap = ""] = l.split("|").map((x) => x.trim());
      return { p, cap };
    });
  return (
    <div className={`art-gallery art-gallery-${Math.min(items.length, 3)}`}>
      {items.map(({ p, cap }) => {
        const url = resolve(base, p);
        const { width, height } = imageSize(url);
        return (
          <figure key={p}>
            <Image src={url} alt={cap} width={width} height={height}
              sizes="(max-width: 760px) 100vw, 33vw" />
            {cap && <figcaption>{cap}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}

/** Bold-first-cell rows get the tint class. */
function rowClass(children: React.ReactNode): string | undefined {
  const kids = Array.isArray(children) ? children : [children];
  const first = kids.find((c) => !!c && typeof c === "object");
  const el = first as { props?: { children?: unknown } } | undefined;
  const inner = el?.props?.children;
  const arr = Array.isArray(inner) ? inner : [inner];
  const bold = arr.some(
    (c) => !!c && typeof c === "object" && (c as { type?: string }).type === "strong"
  );
  return bold ? "em" : undefined;
}

export default function SheetBody({ body, base }: { body: string; base: string }) {
  const components: Components = {
    // fenced blocks return block-level elements, so unwrap <pre>
    pre: ({ children }) => <>{children}</>,

    code({ className, children }) {
      const lang = /language-(\w+)/.exec(className || "")?.[1];
      const src = String(children).replace(/\n$/, "");

      if (!lang) return <code>{children}</code>;

      switch (lang) {
        case "figure": {
          const f = kv(src);
          return <Figure base={base} src={f.src} alt={f.alt} caption={f.caption} note={f.note} />;
        }
        case "diagram": {
          const d = DIAGRAMS[src.trim()];
          if (!d) return null;
          return (
            <div className="art-dia">
              {d.el}
              <div className="dl">{d.label}</div>
            </div>
          );
        }
        case "note":
        case "verdict": {
          const n = kv(src);
          return (
            <div className={lang === "note" ? "art-note" : "art-verdict"}>
              {n.label && <div className="lbl">{n.label}</div>}
              <Paras text={n._body} />
            </div>
          );
        }
        case "video": {
          const v = kv(src);
          return (
            <Video base={base} src={v.src} poster={v.poster} id={v.id}
              library={v.library} caption={v.caption} />
          );
        }
        case "gallery":
          return <Gallery base={base} src={src} />;
        default:
          return (
            <pre>
              <code className={className}>{children}</code>
            </pre>
          );
      }
    },

    h2({ children }) {
      const text = String(
        Array.isArray(children) ? children.join("") : children
      );
      const [lv, en] = text.split("|").map((s) => s.trim());
      return (
        <h2>
          {en && <span className="n">{en}</span>}
          {lv}
        </h2>
      );
    },

    img({ src, alt }) {
      if (typeof src !== "string") return null;
      return <Figure base={base} src={src} alt={alt} caption={alt} />;
    },

    table: ({ children }) => (
      <div className="art-tw">
        <table className="art-t">{children}</table>
      </div>
    ),
    tr: ({ children }) => <tr className={rowClass(children)}>{children}</tr>,

    a({ href, children }) {
      const ext = !!href && /^https?:\/\//.test(href);
      return (
        <a href={href} {...(ext ? { target: "_blank", rel: "noopener" } : {})}>
          {children}
        </a>
      );
    },
  };

  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {body}
    </Markdown>
  );
}
