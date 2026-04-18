"use client";

/** Full-page shell: #MainDiv, #RightPanel (sections + legacy Main.js hooks), #LeftPanel, script loader. */
import "../styles/right-panel-sections.css";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import HandParticleLayer from "./HandParticleLayer";
import LeftPanelHero from "./LeftPanelHero";
import TechStackSection from "./tech-stack/TechStackSection";
import { SiteThemeProvider } from "./site-theme/SiteThemeProvider";

const SECTION_IDS = [
  "Section1",
  "Section2",
  "Section3",
  "Section4",
  "Section5",
] as const;

const SECTION_LABELS: Record<(typeof SECTION_IDS)[number], string> = {
  Section1: "Tech stack",
  Section2: "Projects",
  Section3: "Experience",
  Section4: "Education",
  Section5: "Accolades",
};

/** Top of `el` within `scroller`’s scroll coordinate system (offsetTop breaks when offsetParent ≠ scroller). */
function topWithinScroller(scroller: HTMLElement, el: HTMLElement): number {
  const sr = scroller.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  return scroller.scrollTop + (er.top - sr.top);
}

function scrollToSection(
  rightPanel: HTMLDivElement | null,
  sectionId: (typeof SECTION_IDS)[number],
) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  const offset = window.innerHeight * 0.1;
  if (window.innerWidth > 1024 && rightPanel) {
    const top = topWithinScroller(rightPanel, target) - offset;
    rightPanel.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  } else {
    const y =
      target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }
}

function activeSectionId(
  rightPanel: HTMLDivElement | null,
): (typeof SECTION_IDS)[number] {
  const threshold = 150;
  const desktop = window.innerWidth > 1024 && rightPanel;

  if (desktop) {
    const y = rightPanel!.scrollTop + threshold;
    let i = SECTION_IDS.length;
    while (--i > 0) {
      const el = document.getElementById(SECTION_IDS[i]!);
      if (!el) continue;
      const top = topWithinScroller(rightPanel!, el);
      if (y >= top) return SECTION_IDS[i]!;
    }
    return SECTION_IDS[0]!;
  }

  const y = window.scrollY + threshold;
  let i = SECTION_IDS.length;
  while (--i > 0) {
    const el = document.getElementById(SECTION_IDS[i]!);
    if (!el) continue;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (y >= top) return SECTION_IDS[i]!;
  }
  return SECTION_IDS[0]!;
}

const LEGACY_SCRIPTS = [
  "/Scripts/ModelFiles.js",
  "/Scripts/RenderingFunctions.js",
  "/Scripts/TerminalFunction.js",
  "/Scripts/Main.js",
] as const;

let legacyScriptsLoading: Promise<void> | null = null;

const CACHE_BUST = `?v=${Date.now()}`;

type ProjectItem = {
  href: string;
  title: string;
  tech: string;
};

type ExperienceItem = {
  headline: string;
  text: string;
  href?: string;
};

type EducationItem = {
  school: string;
  degree: string;
  details: string[];
};

type AccoladeItem = {
  id: string;
  title: ReactNode;
  body: ReactNode;
};

const PROJECT_ITEMS: ProjectItem[] = [
  {
    href: "https://ds-cuk.vercel.app/",
    title: "Web App: Date Sheet Management ",
    tech: "TS React Tailwind Postgres Vercel",
  },
  {
    href: "https://github.com/m4milaad/Pyhton-Projects/tree/main/Coffee%20Machine",
    title: "Cancer Diagnosis Model ",
    tech: "Python Scikit-learn Pandas NumPy",
  },
  {
    href: "https://yge.ct.ws/",
    title: "Website: Yuva Global Enterprises ",
    tech: "HTML CSS JS DNS",
  },
  {
    href: "https://github.com/m4milaad/Pyhton-Projects/tree/main/States%20Guessing%20Game",
    title: "States Guessing Game ",
    tech: "Python Pandas Turtle Game",
  },
  {
    href: "https://github.com/m4milaad/Banking-System-",
    title: "Banking System ",
    tech: "Java OOP CLI Application",
  },
  {
    href: "https://github.com/m4milaad/Pyhton-Projects/tree/main/Peek%20Hour",
    title: "Peek Hour Game ",
    tech: "Python Turtle Game",
  },
] as const;

const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    headline: "Skillified Mentor | June 2025",
    href: "/Images/certificate.pdf",
    text: "Built a machine learning model for cancer diagnosis and analyzed the Framingham dataset to study glucose levels and heart disease risk.",
  },
  {
    headline: "Yuva Global Enterprises | Dec 2024 - Present",
    text: "Led the development and maintenance of the Yuva Global Enterprises website (HTML, CSS, JavaScript). Additionally, managed key digital operations.",
  },
  {
    headline: "ByteNovators | Feb 2024 - Dec 2024",
    text: "Validated software quality and user experience through comprehensive testing methodologies. Concurrently, managed Facebook leads and ads for clients.",
  },
  {
    headline: "Current Projects | 2023 - Present",
    text: "Engineered an interactive online resume website (HTML, CSS, JS). Key Python projects include development of Peek Hour and States Guessing Game. Developed a Java-based banking system with object-oriented principles.",
  },
] as const;

const EDUCATION_ITEMS: EducationItem[] = [
  {
    school: "Central University of Kashmir, Gaderbal",
    degree:
      "Bachelor of Technology (B.Tech), CSE | Expected Graduation: July 2027",
    details: [
      "Relevant Coursework: C, Java.",
      "Activities: Coding Competition, Event Management.",
    ],
  },
  {
    school: "Sri Pratap Higher Secondary School, Srinagar",
    degree: "10+2 | Graduated: 2022",
    details: [
      "Relevant Coursework: Non-Medical.",
      "Activities: Badminton, Football, Table Tennis.",
    ],
  },
] as const;

const ACCOLADE_ITEMS: AccoladeItem[] = [
  {
    id: "open-build-challenge-2025",
    title: (
      <>
        1<sup>st</sup> Position in Open Build Challenge | NIT Srinagar | 2025
      </>
    ),
    body: (
      <>
        Organised by FOSS NIT Srinagar in collabration with{" "}
        <a
          href="https://fossunited.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          FOSS United
        </a>
        .
      </>
    ),
  },
  {
    id: "coding-competition-cuk-2025",
    title: (
      <>
        3<sup>rd</sup> Position in Coding Competition | Central University of
        Kashmir | 2025
      </>
    ),
    body: (
      <>
        Hosted by{" "}
        <a
          href="https://codesquad-one.vercel.app/"
          className="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Code Squad
        </a>{" "}
        during their Cyber Concave 2025 event.
      </>
    ),
  },
  {
    id: "iust-tech-summit-2025",
    title: "Coding Challenge (Participation) | Tech Summit IUST | 2025",
    body: "Participated in the Coding Challenge during Tech Summit 2025, held as part of Foundation Week.",
  },
  {
    id: "oci-foundations-2025",
    title: (
      <a
        href="https://catalog-education.oracle.com/ords/certview/sharebadge?id=20239024792714BF5CAC484CB35B78330060C9DC6F08F530A0FEE782FDECE86E"
        target="_blank"
        rel="noopener noreferrer"
        className="Experience"
      >
        OCI 2025 Certified AI Foundations Associate | Oracle | 2025
      </a>
    ),
    body: "Successfully passed the OCI AI Foundations Associate (1Z0 1122 25) certification with 95 percent.",
  },
  {
    id: "aiml-workshop-nit-2025",
    title: "5-Day AI/ML Workshop | NIT Srinagar | 2025",
    body: "Hands on training in machine learning concepts and practical implementation.",
  },
  {
    id: "gaming-coordinator-cuk-2025",
    title: "Coordinator of Gaming Competition | Central University of Kashmir | 2025",
    body: "Recognized for leadership and coordination during Cyber Concave 2025, including the BGMI event.",
  },
] as const;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src + CACHE_BUST;
    el.async = false;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(el);
  });
}

/** Main.js expects `.Project` + `p[data-value]` (scramble on hover). */
function ProjectCard({
  href,
  title,
  titleDataValue,
  tech,
  techDataValue,
}: {
  href: string;
  title: string;
  titleDataValue: string;
  tech: string;
  techDataValue: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="Project rp-project"
    >
      <div className="rp-project-row">
        <p
          className="rp-project-title"
          data-value={titleDataValue}
          style={{
            fontWeight: "bold",
            whiteSpace: "pre",
          }}
        >
          {title}
        </p>
        <div className="Separator rp-project-sep" />
        <p data-value="2025">2025</p>
      </div>
      <p className="rp-project-tech" data-value={techDataValue}>
        {tech}
      </p>
    </a>
  );
}

export default function PortfolioShell() {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] =
    useState<(typeof SECTION_IDS)[number]>("Section1");

  const updateActiveFromScroll = useCallback(() => {
    setActiveSection(activeSectionId(rightPanelRef.current));
  }, []);

  useEffect(() => {
    if (legacyScriptsLoading) return;

    legacyScriptsLoading = (async () => {
      for (const src of LEGACY_SCRIPTS) {
        await loadScript(src);
      }
    })().catch((e) => {
      console.error(e);
      legacyScriptsLoading = null;
    });

    return () => {};
  }, []);

  useLayoutEffect(() => {
    const panel = rightPanelRef.current;
    const onScroll = () => updateActiveFromScroll();
    panel?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateActiveFromScroll();
    return () => {
      panel?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateActiveFromScroll]);

  return (
    <SiteThemeProvider>
      <canvas id="Canvas3D" />
      <div id="MainDiv">
        <div id="MouseGlow" />
        <div id="MouseGlowBlur" />
        <HandParticleLayer />
        <div id="RightPanel" ref={rightPanelRef}>
          <div id="Section1" className="Section">
            <TechStackSection />
          </div>
          <div id="Section2" className="Section rp-section">
            <h2>Projects</h2>
            <p className="rp-section-intro">
              Below are some of the projects I have developed. This is a selection
              of projects I&apos;ve worked on. I plan to revisit and polish these
              projects in the future, improving their code with my current level of
              expertise.
            </p>
            {PROJECT_ITEMS.map((project) => (
              <ProjectCard
                key={project.href}
                href={project.href}
                title={project.title}
                titleDataValue={project.title}
                tech={project.tech}
                techDataValue={project.tech}
              />
            ))}
          </div>
          <div id="Section3" className="Section rp-section">
            <h2>Experience</h2>
            <div className="rp-timeline">
              {EXPERIENCE_ITEMS.map((item) => (
                <div key={item.headline} className="rp-exp-block">
                  <p className="rp-exp-headline">
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="Experience"
                      >
                        <span className="rp-inline-em">{item.headline}</span>
                      </a>
                    ) : (
                      <span className="rp-inline-em">{item.headline}</span>
                    )}
                  </p>
                  <p className="rp-exp-text">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div id="Section4" className="Section rp-section">
            <h2>Education</h2>
            <div className="rp-edu-grid">
              {EDUCATION_ITEMS.map((item) => (
                <div key={item.school} className="rp-edu-card">
                  <p className="rp-edu-school">
                    <span className="rp-inline-em">{item.school}</span>
                  </p>
                  <p className="rp-edu-degree">
                    <span className="rp-inline-em">{item.degree}</span>
                  </p>
                  {item.details.map((detail) => (
                    <p key={detail} className="rp-edu-detail">
                      {detail}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div id="Section5" className="Section rp-section">
            <h2>Accolades</h2>
            <div className="rp-accolade-list">
              {ACCOLADE_ITEMS.map((item) => (
                <article key={item.id} className="rp-accolade">
                  <p className="rp-accolade-title">
                    {typeof item.title === "string" ? (
                      <span className="rp-inline-em">{item.title}</span>
                    ) : (
                      item.title
                    )}
                  </p>
                  <p className="rp-accolade-body">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
          <p className="rp-footer-credit">
            Built by <span className="rp-inline-em">Milad Ajaz Bhat</span> with <span className="rp-inline-em">Next.js</span>, <span className="rp-inline-em">React</span>, and{" "}
            <span className="rp-inline-em">TypeScript</span>. The 3D desk and retro CLI run on raw <span className="rp-inline-em">WebGL2</span> with{" "}
            <span className="rp-inline-em">HTML</span>, <span className="rp-inline-em">CSS</span>, and <span className="rp-inline-em">JavaScript</span> — no game engine or UI
            framework on the scene. Edited in <span className="rp-inline-em">Visual Studio Code</span>.
          </p>
        </div>
        <div id="LeftPanel">
          <LeftPanelHero />
          <nav className="NavContainer" aria-label="Sections">
            {SECTION_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={`NavItem${activeSection === id ? " Active" : ""}`}
                data-section={id}
                onClick={() => scrollToSection(rightPanelRef.current, id)}
              >
                <span className="NavItemDot" aria-hidden />
                <span className="NavItemText">{SECTION_LABELS[id]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <button
        type="button"
        id="MainButton"
        aria-label="Toggle retro terminal (3D view)"
      >
        <span className="main-btn-terminal-icon" aria-hidden>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"
              stroke="currentColor"
              strokeWidth="1.75"
            />
            <path
              d="M8 10h.01M8 14h8M12 10h4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span id="ButtonText">Open Terminal</span>
        <span id="ButtonArrow" aria-hidden>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <audio id="ComputerBoot" src="/Sounds/ComputerBoot.mp3" />
      <audio id="ComputerAmbient" src="/Sounds/ComputerAmbient.mp3" />
      <audio id="ComputerBeep" src="/Sounds/ComputerBeep.mp3" />
      <audio id="KeyboardPressed" src="/Sounds/KeyboardPressed.mp3" />
    </SiteThemeProvider>
  );
}
