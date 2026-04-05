"use client";

import "../../styles/right-panel-tech-stack.css";
import { useSiteTheme } from "../site-theme/SiteThemeProvider";
import { techRow1, techRow2, type TechItem } from "./tech-stack-data";
import { useIntersectionObserver } from "./useIntersectionObserver";

function TechPill({ item }: { item: TechItem }) {
  return (
    <div className="rp-tech-pill">
      {item.svg ? (
        <svg
          viewBox="0 0 24 24"
          className="rp-tech-icon"
          style={{ color: item.color }}
          aria-hidden
          dangerouslySetInnerHTML={{ __html: item.svg }}
        />
      ) : (
        <span
          className="rp-tech-initials"
          style={{ backgroundColor: item.color }}
        >
          {item.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      {item.name}
    </div>
  );
}

function TechMarquee({ items, reverse }: { items: TechItem[]; reverse?: boolean }) {
  const pills = items.map((item) => <TechPill key={item.name} item={item} />);
  return (
    <div className="rp-tech-marquee-wrap">
      <div className="rp-tech-marquee-outer">
        <div
          className={
            reverse
              ? "rp-tech-marquee-track rp-tech-marquee-track--rev"
              : "rp-tech-marquee-track"
          }
        >
          <div className="rp-tech-marquee-group">{pills}</div>
          <div className="rp-tech-marquee-group" aria-hidden>
            {items.map((item, i) => (
              <TechPill key={`${item.name}-dup-${i}`} item={item} />
            ))}
          </div>
        </div>
        <div className="rp-tech-marquee-edge rp-tech-marquee-edge--left" aria-hidden />
        <div className="rp-tech-marquee-edge rp-tech-marquee-edge--right" aria-hidden />
      </div>
    </div>
  );
}

function TechStackBlock() {
  const { dark } = useSiteTheme();
  const { ref: techRef, isVisible } = useIntersectionObserver(0.12);

  return (
    <>
      <h2>Tech stack</h2>
      <p>Technologies I work with to ship reliable products.</p>
      <br />
      <div
        className={dark ? "rp-tech-root is-dark" : "rp-tech-root"}
      >
        <section
          ref={techRef}
          className={
            isVisible ? "rp-tech-panel rp-tech-panel--inview" : "rp-tech-panel"
          }
          aria-label="Tech stack"
        >
          <TechMarquee items={techRow1} />
          <TechMarquee items={techRow2} reverse />
        </section>
      </div>
    </>
  );
}

export default function TechStackSection() {
  return <TechStackBlock />;
}
