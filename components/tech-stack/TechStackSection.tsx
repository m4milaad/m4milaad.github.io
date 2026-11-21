import type { CSSProperties } from "react";
import { techRow1, techRow2 } from "./tech-stack-data";

export const TECH_ITEMS = [...techRow1, ...techRow2];

/** The stack set as one run of type; a name underlines in its brand colour on hover. */
export default function TechStackSection() {
  return (
    <ul className="rp-tech">
      {TECH_ITEMS.map((item) => (
        <li key={item.name} style={{ "--brand": item.color } as CSSProperties}>
          <span>{item.name}</span>
        </li>
      ))}
    </ul>
  );
}
