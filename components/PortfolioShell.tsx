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
  Section4: "Accolades",
  Section5: "Education",
};

/** Top of `el` within `scroller`'s scroll coordinate system (offsetTop breaks when offsetParent ≠ scroller). */
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
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
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
  name: string;
  description: string;
  technology: readonly string[];
  year: number;
  githubLink: string;
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
  org?: string;
  year?: string;
  badge?: "gold" | "bronze" | "cert";
  href?: string;
  body: ReactNode;
};

const PROJECT_ITEMS: readonly ProjectItem[] = [
  {
    name: "CUK Acadex",
    description:
      "A full-stack academic management platform with AI-powered RAG search, automated exam scheduling, real-time collaboration, role-based access, and a native Android app.",
    technology: [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "Supabase",
      "PostgreSQL",
      "pgvector",
      "RAG",
      "Python",
      "Kotlin",
      "Android",
    ],
    year: 2025,
    githubLink: "https://github.com/m4milaad/schedule-savvy-schedules",
  },
  {
    name: "KATHE English-to-Kashmiri Translation",
    description:
      "A low-resource neural machine-translation pipeline using NLLB-200, IndicTrans2, LoRA fine-tuning, back-translation, ensemble inference, and BLEU/chrF++ evaluation.",
    technology: [
      "Python",
      "PyTorch",
      "Hugging Face Transformers",
      "NLLB-200",
      "IndicTrans2",
      "LoRA",
      "PEFT",
      "BLEU",
      "chrF++",
      "Kaggle",
    ],
    year: 2026,
    githubLink: "https://github.com/m4milaad/bpccEngtoKash",
  },
  {
    name: "SentinelFlow",
    description:
      "A Redis-backed distributed rate-limiting service with multiple traffic-control algorithms, REST APIs, observability, load testing, and Docker/Kubernetes deployment.",
    technology: [
      "Java",
      "Spring Boot",
      "Redis",
      "REST API",
      "Prometheus",
      "Docker",
      "Kubernetes",
      "React",
      "TypeScript",
      "JUnit",
    ],
    year: 2026,
    githubLink: "https://github.com/m4milaad/SentinelFlow",
  },
  {
    name: "BIS AI",
    description:
      "An offline-first multilingual product-safety platform with AI chat, product-image analysis, hybrid semantic search, PWA support, and low-bandwidth features.",
    technology: [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "PWA",
      "Supabase",
      "PostgreSQL",
      "pgvector",
      "Gemini API",
      "RAG",
      "Deno",
    ],
    year: 2026,
    githubLink: "https://github.com/m4milaad/bis-ai",
  },
  {
    name: "2AI Conference",
    description:
      "A production conference platform with event registration, payment processing, cloud media storage, Supabase backend services, and a live public website.",
    technology: [
      "React",
      "JavaScript",
      "Vite",
      "Tailwind CSS",
      "Supabase",
      "PostgreSQL",
      "Edge Functions",
      "ICICI Eazypay",
      "Cloudflare R2",
    ],
    year: 2026,
    githubLink: "https://github.com/m4milaad/2ai-Conference",
  },
  {
    name: "repo-ready",
    description:
      "An offline Python CLI that evaluates repository readiness, generates deterministic CI-compatible reports, and safely scaffolds missing project files.",
    technology: [
      "Python",
      "Python CLI",
      "Pytest",
      "Docker",
      "GitHub Actions",
      "JSON",
      "Standard Library",
    ],
    year: 2026,
    githubLink: "https://github.com/m4milaad/repo-ready",
  },
] as const;

const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    headline: "Student Intern | NIT Srinagar | Dec 2025 - Feb 2026",
    text: "Full-time hybrid internship focused on practical software development and institutional systems at the Department of Training and Placement.",
  },
  {
    headline: "Web Developer | Yuva Global Enterprises | Dec 2024 - Jul 2025",
    text: "Developed and maintained the company website (HTML, CSS, JavaScript) on-site. Supported key digital operations and client engagement.",
  },
  {
    headline: "Mentor | Skillified | Jun 2025 - Jul 2025",
    href: "/Images/certificate.pdf",
    text: "Built a machine learning model for cancer diagnosis achieving 95% accuracy, and analyzed the Framingham dataset to predict heart disease risk.",
  },
  {
    headline: "Campus Ambassador | Google | May 2026 - Present",
    text: "Serving as Campus Ambassador at Google, bridging the gap between Google technologies and the student community through events, workshops, and mentorship.",
  },
  {
    headline: "Mentor | GirlScript Summer of Code | May 2026 - Present",
    text: "Mentoring open-source contributors at GSSoC, guiding project contributions, code reviews, and collaborative development practices.",
  },
  {
    headline: "Campus Lead | Open Source Connect | Dec 2025 - Apr 2026",
    text: "Led campus open-source initiatives for Open Source Connect, organizing events and fostering a collaborative developer contribution culture.",
  },
  {
    headline: "QA & Marketing Intern | ByteNovators | Feb 2024 - Dec 2024",
    text: "Validated software quality and user experience through comprehensive testing methodologies. Managed client lead generation and advertising campaigns.",
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
    id: "synertech-2026-winner",
    title: (
      <>
        1<sup>st</sup> Position in SynerTech 2026 Hackathon
      </>
    ),
    org: "KCET",
    year: "2026",
    badge: "gold",
    body: "Won the hackathon at Kashmir College of Engineering and Technology. Developed a CRM-based Academic Management Portal with an AI-powered chatbot, integrated with a fully functional Android application.",
  },
  {
    id: "open-build-challenge-2025",
    title: (
      <>
        1<sup>st</sup> Position in Open Build Challenge
      </>
    ),
    org: "NIT Srinagar",
    year: "2025",
    badge: "gold",
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
        3<sup>rd</sup> Position in Coding Competition
      </>
    ),
    org: "Central University of Kashmir",
    year: "2025",
    badge: "bronze",
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
    id: "build-ai-agent-ibm",
    title: "Build an AI Agent",
    org: "IBM",
    year: "2026",
    badge: "cert",
    body: "Completed IBM's Build an AI Agent certification, gaining expertise in AI agent development and prompt engineering.",
  },
  {
    id: "oci-foundations-2025",
    title: "OCI 2025 Certified AI Foundations Associate",
    org: "Oracle",
    year: "2025",
    badge: "cert",
    href: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=20239024792714BF5CAC484CB35B78330060C9DC6F08F530A0FEE782FDECE86E",
    body: "Successfully passed the OCI AI Foundations Associate (1Z0 1122 25) certification with 95 percent.",
  },
  {
    id: "google-ml-apis-badge",
    title: "Prepare Data for ML APIs — Google Cloud Skill Badge",
    org: "Google",
    year: "2025",
    badge: "cert",
    href: "https://www.linkedin.com/in/m4milaad/",
    body: "Earned Google Cloud skill badge covering Cloud Natural Language API, Dataflow, and ML data preparation pipelines.",
  },
  {
    id: "ibm-ai-fundamentals-cert",
    title: "Artificial Intelligence Fundamentals",
    org: "IBM",
    year: "2025",
    badge: "cert",
    href: "https://www.linkedin.com/in/m4milaad/",
    body: "Completed IBM's AI Fundamentals certification covering AI applications, capabilities, and core concepts.",
  },
  {
    id: "swoc-mentorship-cert",
    title: "SWOC — Mentorship Certificate",
    org: "Social Winter of Code",
    year: "2026",
    body: "Received mentorship certification from Social Winter of Code for guiding open-source contributors.",
  },
  {
    id: "cursor-kashmir-hackathon-cert",
    title: "Cursor Kashmir Hackathon — Participation",
    org: "Cursor",
    year: "2026",
    body: "Participated in the Cursor Kashmir Hackathon, exploring AI-assisted development workflows.",
  },
  {
    id: "ecwoc-participant",
    title: "Participant — ECWOC",
    org: "Elite Coders",
    year: "2026",
    href: "https://www.linkedin.com/in/m4milaad/",
    body: "Participated in ECWOC organized by Elite Coders, competing in competitive programming challenges.",
  },
  {
    id: "viksit-bharat-2047-cert",
    title: "Certificate of Participation — Viksit Bharat @2047",
    year: "2026",
    body: "Participated in the Viksit Bharat — Startups & Innovation Mission initiative.",
  },
  {
    id: "iust-tech-summit-2025",
    title: "Coding Challenge (Participation)",
    org: "Tech Summit IUST",
    year: "2025",
    body: "Participated in the Coding Challenge during Tech Summit 2025, held as part of Foundation Week.",
  },
  {
    id: "gaming-coordinator-cuk-2025",
    title: "Coordinator of Gaming Competition",
    org: "Central University of Kashmir",
    year: "2025",
    body: "Recognized for leadership and coordination during Cyber Concave 2025, including the BGMI event.",
  },
  {
    id: "cyber-concave-achievement-cert",
    title: "Certificate of Achievement — Cyber Concave 2025",
    org: "CUK",
    year: "2025",
    body: "Recognized for exemplary leadership and dedication as Coordinator of Cyber Concave 2025.",
  },
] as const;

function parsePipeHeadline(raw: string): {
  role: string;
  org?: string;
  period?: string;
} {
  const parts = raw.split("|").map((s) => s.trim());
  if (parts.length >= 3) {
    return {
      role: parts[0]!,
      org: parts[1],
      period: parts.slice(2).join(" · "),
    };
  }
  if (parts.length === 2) {
    return { role: parts[0]!, period: parts[1] };
  }
  return { role: raw };
}

function parseDetailLine(detail: string): {
  label?: string;
  items: string[];
} {
  const idx = detail.indexOf(":");
  if (idx === -1) return { items: [detail] };
  const label = detail.slice(0, idx).trim();
  const rest = detail
    .slice(idx + 1)
    .replace(/\.$/, "")
    .trim();
  const items = rest
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { label, items };
}

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
  description,
  technology,
  year = 2025,
  className,
  style,
}: {
  href: string;
  title: string;
  titleDataValue: string;
  description: string;
  technology?: readonly string[];
  year?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`Project rp-project${className ? ` ${className}` : ""}`}
      style={style}
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
        <p data-value={String(year)}>{year}</p>
      </div>
      <div className="rp-project-desc">{description}</div>
      {technology && technology.length > 0 && (
        <div className="rp-project-tech-pills">
          {technology.map((tech) => (
            <span key={tech} className="rp-tech-pill">
              <span className="rp-tech-pill-dot" aria-hidden />
              {tech}
            </span>
          ))}
        </div>
      )}
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

  /* ── Scroll-reveal: IntersectionObserver adds .rp-visible with per-batch stagger ── */
  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visibleBatch = entries.filter((e) => e.isIntersecting);
        visibleBatch.forEach((e, batchIndex) => {
          const el = e.target as HTMLElement;
          el.style.setProperty("--rp-stagger", `${batchIndex * 50}ms`);
          el.classList.add("rp-visible");
          io.unobserve(el);
        });
      },
      { root: panel, threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    const targets = panel.querySelectorAll(".rp-animate, .rp-section > h2");
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <SiteThemeProvider>
      <canvas id="Canvas3D" />
      <div id="MainDiv">
        <div id="MouseGlow" />
        <div id="MouseGlowBlur" />
        <div id="RightPanel" ref={rightPanelRef}>
          <div id="Section1" className="Section">
            <TechStackSection />
          </div>

          {/* ── Projects ── */}
          <div id="Section2" className="Section rp-section">
            <h2>Projects</h2>
            <p className="rp-section-intro">
              Below are some of the projects I have developed. This is a
              selection of projects I&apos;ve worked on. I plan to revisit and
              polish these projects in the future, improving their code with my
              current level of expertise.
            </p>
            {PROJECT_ITEMS.map((project) => (
              <ProjectCard
                key={project.githubLink}
                href={project.githubLink}
                title={`${project.name} `}
                titleDataValue={`${project.name} `}
                description={project.description}
                technology={project.technology}
                year={project.year}
                className="rp-animate"
              />
            ))}
          </div>

          {/* ── Experience ── */}
          <div id="Section3" className="Section rp-section">
            <h2>Experience</h2>
            <div className="rp-timeline">
              {EXPERIENCE_ITEMS.map((item, idx) => {
                const { role, org, period } = parsePipeHeadline(item.headline);
                const isCurrent =
                  period?.toLowerCase().includes("present") ?? false;
                const isLast = idx === EXPERIENCE_ITEMS.length - 1;

                return (
                  <div
                    key={item.headline}
                    className={`rp-exp-block rp-animate${
                      isCurrent ? " rp-exp-current" : ""
                    }${isLast ? " rp-exp-last" : ""}`}
                  >
                    {/* Dedicated left timeline column: concentric node + segmented stem */}
                    <div className="rp-exp-rail" aria-hidden>
                      <div className="rp-exp-node">
                        <span className="rp-exp-node-core" />
                        {isCurrent && <span className="rp-exp-node-Ping" />}
                      </div>
                      {!isLast && <div className="rp-exp-stem" />}
                    </div>

                    {/* Right experience card with horizontal connector tick */}
                    <div className="rp-exp-card">
                      <span className="rp-exp-connector" aria-hidden />
                      <div className="rp-exp-header">
                        <div className="rp-exp-title-group">
                          <p className="rp-exp-headline">
                            {item.href ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="Experience rp-ext-link"
                              >
                                <span className="rp-inline-em">{role}</span>
                                <span className="rp-ext-arrow" aria-hidden>
                                  ↗
                                </span>
                              </a>
                            ) : (
                              <span className="rp-inline-em">{role}</span>
                            )}
                          </p>
                          {org && <span className="rp-org-pill">{org}</span>}
                        </div>
                        {period && (
                          <span
                            className={`rp-date-pill${
                              isCurrent ? " rp-date-pill-live" : ""
                            }`}
                          >
                            {isCurrent && (
                              <span className="rp-live-dot" aria-hidden />
                            )}
                            {period}
                          </span>
                        )}
                      </div>
                      <p className="rp-exp-text">{item.text}</p>
                      <span className="rp-card-index" aria-hidden>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Accolades ── */}
          <div id="Section4" className="Section rp-section">
            <h2>Accolades</h2>
            <div className="rp-accolade-list">
              {ACCOLADE_ITEMS.map((item) => {
                const isFeatured =
                  item.badge === "gold" || item.badge === "bronze";

                return (
                  <article
                    key={item.id}
                    className={`rp-accolade rp-animate${
                      item.badge ? ` rp-accolade-${item.badge}` : ""
                    }${isFeatured ? " rp-accolade-featured" : ""}`}
                  >
                    <div className="rp-accolade-top">
                      <div className="rp-accolade-heading-wrap">
                        {item.badge === "gold" && (
                          <span className="rp-award-badge rp-award-gold">
                            ★ Winner
                          </span>
                        )}
                        {item.badge === "bronze" && (
                          <span className="rp-award-badge rp-award-bronze">
                            ★ Podium
                          </span>
                        )}
                        {item.badge === "cert" && (
                          <span className="rp-award-badge rp-award-cert">
                            ✓ Certified
                          </span>
                        )}
                        <p className="rp-accolade-title">
                          {item.href ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="Experience rp-ext-link"
                            >
                              <span className="rp-inline-em">{item.title}</span>
                              <span className="rp-ext-arrow" aria-hidden>
                                ↗
                              </span>
                            </a>
                          ) : (
                            <span className="rp-inline-em">{item.title}</span>
                          )}
                        </p>
                      </div>

                      {(item.org || item.year) && (
                        <div className="rp-accolade-meta">
                          {item.org && (
                            <span className="rp-org-pill">{item.org}</span>
                          )}
                          {item.year && (
                            <span className="rp-date-pill">{item.year}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="rp-accolade-body">{item.body}</p>
                  </article>
                );
              })}
            </div>
          </div>

          {/* ── Education ── */}
          <div id="Section5" className="Section rp-section">
            <h2>Education</h2>
            <div className="rp-edu-grid">
              {EDUCATION_ITEMS.map((item) => {
                const { role: degreeTitle, period: gradPeriod } =
                  parsePipeHeadline(item.degree);

                return (
                  <div key={item.school} className="rp-edu-card rp-animate">
                    <div className="rp-edu-header">
                      <div>
                        <p className="rp-edu-school">
                          <span className="rp-inline-em">{item.school}</span>
                        </p>
                        <p className="rp-edu-degree">
                          <span className="rp-inline-em">{degreeTitle}</span>
                        </p>
                      </div>
                      {gradPeriod && (
                        <span className="rp-date-pill">{gradPeriod}</span>
                      )}
                    </div>

                    <div className="rp-edu-details-wrap">
                      {item.details.map((detail) => {
                        const { label, items } = parseDetailLine(detail);
                        return (
                          <div key={detail} className="rp-edu-detail-row">
                            {label && (
                              <span className="rp-edu-detail-label">
                                {label}
                              </span>
                            )}
                            <div className="rp-edu-detail-pills">
                              {items.map((chip) => (
                                <span key={chip} className="rp-tech-pill">
                                  <span
                                    className="rp-tech-pill-dot"
                                    aria-hidden
                                  />
                                  {chip}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="rp-footer-credit">
            Built by <span className="rp-inline-em">Milad Ajaz Bhat</span> with{" "}
            <span className="rp-inline-em">Next.js</span>,{" "}
            <span className="rp-inline-em">React</span>, and{" "}
            <span className="rp-inline-em">TypeScript</span>. The 3D desk and
            retro CLI run on raw <span className="rp-inline-em">WebGL2</span>{" "}
            with <span className="rp-inline-em">HTML</span>,{" "}
            <span className="rp-inline-em">CSS</span>, and{" "}
            <span className="rp-inline-em">JavaScript</span> — no game engine or
            UI framework on the scene. Edited in{" "}
            <span className="rp-inline-em">Visual Studio Code</span>.
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