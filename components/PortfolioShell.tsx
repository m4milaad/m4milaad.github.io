"use client";

/** Full-page shell: #MainDiv, #RightPanel (sections + legacy Main.js hooks), #LeftPanel, script loader. */
import "../styles/right-panel-sections.css";
import "../styles/windows-desktop.css";
import {
  Fragment,
  type ReactNode,
  useEffect,
} from "react";
import LeftPanelHero from "./LeftPanelHero";
import TechStackSection, { TECH_ITEMS } from "./tech-stack/TechStackSection";
import { SiteThemeProvider } from "./site-theme/SiteThemeProvider";

const SECTION_LABELS = {
  Section1: "Tech stack",
  Section2: "Selected work",
  Section3: "Experience",
  Section4: "Accolades",
  Section5: "Education",
};

const LEGACY_SCRIPTS = [
  "/Scripts/LegionChassis.js",
  "/Scripts/LegionKeyboard.js",
  "/Scripts/ModelFiles.js",
  "/Scripts/RenderingFunctions.js",
  "/Scripts/TerminalFunction.js",
  "/Scripts/WindowsDesktop.js",
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
  period: string;
  details: string[];
};

type AccoladeItem = {
  id: string;
  title: string;
  /** Podium finish, shown as a large ordinal (e.g. "1st"). */
  place?: string;
  org?: string;
  year?: string;
  badge?: "cert";
  href?: string;
  body: ReactNode;
};

const PROJECT_ITEMS: readonly ProjectItem[] = [
  {
    name: "CUK Acadex",
    description:
      "Campus software for searching course material, scheduling exams, and collaborating across web and Android.",
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
      "English-to-Kashmiri translation built with multilingual language models and fine-tuned on limited training data.",
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
      "A Redis-backed service that manages API traffic and tracks how rate limits perform under load.",
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
      "A multilingual product safety app with image analysis and offline access.",
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
      "Registration, payments, and media storage for the 2AI conference.",
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
      "A Python command-line tool that checks repositories and generates reports for continuous integration.",
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
    degree: "Bachelor of Technology (B.Tech), CSE",
    period: "Exp. Jul 2027",
    details: [
      "Activities: Coding Competition, Event Management.",
    ],
  },
  {
    school: "Sri Pratap Higher Secondary School, Srinagar",
    degree: "10+2",
    period: "2022",
    details: [
      "Relevant Coursework: Non-Medical.",
      "Activities: Badminton, Football, Table Tennis.",
    ],
  },
] as const;

const ACCOLADE_ITEMS: AccoladeItem[] = [
  {
    id: "synertech-2026-winner",
    title: "SynerTech 2026 Hackathon",
    place: "1st",
    org: "KCET",
    year: "2026",
    body: "Won the hackathon at Kashmir College of Engineering and Technology. Developed a CRM-based Academic Management Portal with an AI-powered chatbot, integrated with a fully functional Android application.",
  },
  {
    id: "open-build-challenge-2025",
    title: "Open Build Challenge",
    place: "1st",
    org: "NIT Srinagar",
    year: "2025",
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
    title: "Coding Competition",
    place: "3rd",
    org: "Central University of Kashmir",
    year: "2025",
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

/** Structured data for search and answer engines, built from the same lists the page renders. */
const SITE = "https://m4milaad.tech/";
const PERSON_ID = `${SITE}#person`;
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}#website`,
      url: SITE,
      name: "Milad Ajaz Bhat",
      inLanguage: "en",
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE}#profile`,
      url: SITE,
      name: "Milad Ajaz Bhat | Portfolio",
      isPartOf: { "@id": `${SITE}#website` },
      mainEntity: { "@id": PERSON_ID },
      hasPart: { "@id": `${SITE}#work` },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Milad Ajaz Bhat",
      alternateName: "m4milaad",
      url: SITE,
      image: `${SITE}Images/dev-head.png`,
      email: "mailto:mb4milad.bhattt@gmail.com",
      jobTitle: "Software Developer and Machine Learning Engineer",
      description:
        "Builds software, web apps, and machine learning models. Studies computer science at the Central University of Kashmir.",
      homeLocation: { "@type": "Place", name: "Kashmir, India" },
      seeks: { "@type": "Demand", description: "Open to software and machine learning work" },
      sameAs: [
        "https://github.com/m4milaad",
        "https://www.linkedin.com/in/m4milaad/",
        "https://x.com/m4milaad",
      ],
      alumniOf: EDUCATION_ITEMS.map((e) => ({
        "@type": "EducationalOrganization",
        name: e.school,
      })),
      knowsAbout: [
        ...TECH_ITEMS.map((t) => t.name),
        "Machine learning",
        "Natural language processing",
        "Retrieval-augmented generation",
      ],
      award: ACCOLADE_ITEMS.filter((a) => a.place).map(
        (a) => `${a.place} place, ${a.title}${a.org ? `, ${a.org}` : ""}`,
      ),
      hasCredential: ACCOLADE_ITEMS.filter((a) => a.badge === "cert").map(
        (a) => ({
          "@type": "EducationalOccupationalCredential",
          name: a.title,
          ...(a.org && { recognizedBy: { "@type": "Organization", name: a.org } }),
          ...(a.href && { url: a.href }),
        }),
      ),
      hasOccupation: EXPERIENCE_ITEMS.map((item) => {
        const { role, org, period } = parsePipeHeadline(item.headline);
        return {
          "@type": "Occupation",
          name: org ? `${role}, ${org}` : role,
          ...(period && { description: period.replace(" - ", " to ") }),
        };
      }),
    },
    {
      "@type": "ItemList",
      "@id": `${SITE}#work`,
      name: "Selected work",
      itemListElement: PROJECT_ITEMS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: p.name,
          description: p.description,
          codeRepository: p.githubLink,
          url: p.githubLink,
          dateCreated: String(p.year),
          keywords: p.technology.join(", "),
          author: { "@id": PERSON_ID },
        },
      })),
    },
  ],
};

function SectionHead({ id }: { id: keyof typeof SECTION_LABELS }) {
  return <h2 className="section-heading">{SECTION_LABELS[id]}</h2>;
}

/** "1st" set large, its suffix raised. */
function Place({ value }: { value: string }) {
  const m = /^(\d+)(\D*)$/.exec(value);
  return (
    <span className="rp-place">
      {m ? (
        <>
          {m[1]}
          <span className="rp-place-suffix">{m[2]}</span>
        </>
      ) : (
        value
      )}
    </span>
  );
}

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

function ProjectRow({ project }: { project: ProjectItem }) {
  return (
    <article className="work-row">
      <span className="work-year">{project.year}</span>
      <div>
        <h3><a href={project.githubLink} target="_blank" rel="noopener noreferrer">{project.name}<span className="work-arrow" aria-hidden>↗</span></a></h3>
        <p>{project.description}</p>
        <details className="project-tools">
          <summary>Technologies</summary>
          <p>{project.technology.join(" · ")}</p>
        </details>
      </div>
    </article>
  );
}

function RowTitle({
  title,
  org,
  href,
}: {
  title: string;
  org?: string;
  href?: string;
}) {
  const label = (
    <>
      {title}
      {org && <span className="rp-row-org">, {org}</span>}
    </>
  );
  return (
    <p className="rp-row-title">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="rp-title-link"
        >
          {label}
          <span className="rp-arrow" aria-hidden>
            ↗
          </span>
        </a>
      ) : (
        label
      )}
    </p>
  );
}

export default function PortfolioShell() {
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

  return (
    <SiteThemeProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <canvas id="Canvas3D" tabIndex={0} aria-label="Lenovo Legion 3D viewer. Drag or use the arrow keys to rotate. Scroll, pinch, or use plus and minus to zoom. Type to use the terminal." />
      <div id="WindowsDesktop" role="region" aria-label="Windows desktop" tabIndex={-1} hidden />
      <pre id="TerminalFallback" tabIndex={0} aria-label="Portfolio terminal" hidden />
      <div id="MainDiv">
        <LeftPanelHero />
        <main id="RightPanel">
          {/* ── Projects ── */}
          <div id="Section2" className="Section rp-section">
            <SectionHead id="Section2" />
            <div className="rp-list">
              {PROJECT_ITEMS.map((project) => (
                <ProjectRow key={project.githubLink} project={project} />
              ))}
            </div>
          </div>

          {/* ── Experience ── */}
          <div id="Section3" className="Section rp-section">
            <SectionHead id="Section3" />
            <div className="rp-list">
              {EXPERIENCE_ITEMS.map((item) => {
                const { role, org, period } = parsePipeHeadline(item.headline);
                const [start, end] = (period ?? "").split(/\s+-\s+/);
                const isCurrent = end?.toLowerCase() === "present";

                return (
                  <div key={item.headline} className="rp-row">
                    <div className="rp-row-meta">
                      <span>{start}</span>
                      {end &&
                        (isCurrent ? (
                          <span className="rp-now">Now</span>
                        ) : (
                          <span>{end}</span>
                        ))}
                    </div>
                    <div>
                      <RowTitle title={role} org={org} href={item.href} />
                      <p className="rp-row-text">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Accolades ── */}
          <div id="Section4" className="Section rp-section">
            <SectionHead id="Section4" />
            {(
              [
                ["Podium finishes", ACCOLADE_ITEMS.filter((a) => a.place)],
                [
                  "Certifications",
                  ACCOLADE_ITEMS.filter((a) => a.badge === "cert"),
                ],
                [
                  "Participation & roles",
                  ACCOLADE_ITEMS.filter((a) => !a.place && !a.badge),
                ],
              ] as const
            ).map(([label, items]) => (
              <div key={label}>
                <p className="rp-group-label">
                  <span>{label}</span>
                </p>
                <div className="rp-list">
                  {items.map((item) => (
                    <article key={item.id} className="rp-row">
                      <div className="rp-row-meta">
                        {item.place && <Place value={item.place} />}
                        {item.year && <span>{item.year}</span>}
                      </div>
                      <div>
                        <RowTitle
                          title={item.title}
                          org={item.org}
                          href={item.href}
                        />
                        <p className="rp-row-text">{item.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <section id="Section1" className="rp-section">
            <SectionHead id="Section1" />
            <TechStackSection />
          </section>

          {/* ── Education ── */}
          <div id="Section5" className="Section rp-section">
            <SectionHead id="Section5" />
            <div className="rp-list">
              {EDUCATION_ITEMS.map((item) => (
                <div key={item.school} className="rp-row">
                  <div className="rp-row-meta">
                    <span>{item.period}</span>
                  </div>
                  <div>
                    <RowTitle title={item.degree} org={item.school} />
                    <dl className="rp-edu-details">
                      {item.details.map((detail) => {
                        const { label, items } = parseDetailLine(detail);
                        return (
                          <Fragment key={detail}>
                            <dt>{label}</dt>
                            <dd>{items.join(", ")}</dd>
                          </Fragment>
                        );
                      })}
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
        <footer><span>Milad Ajaz Bhat</span><a href="#MainDiv">Back to top <span aria-hidden="true">↑</span></a></footer>
      </div>
      <div id="LaptopControls" role="group" aria-label="Laptop controls">
        <span id="OrbitHint">Drag to rotate</span>
        <button id="LidToggle" type="button">Close lid</button>
        <button id="DesktopExpand" type="button">Use desktop</button>
        <button id="ScreenToggle" type="button">Open PowerShell</button>
        <button id="MainButton" type="button">Back to portfolio</button>
      </div>

      <audio id="ComputerBoot" src="/Sounds/ComputerBoot.mp3" />
      <audio id="ComputerAmbient" src="/Sounds/ComputerAmbient.mp3" />
      <audio id="ComputerBeep" src="/Sounds/ComputerBeep.mp3" />
      <audio id="KeyboardPressed" src="/Sounds/KeyboardPressed.mp3" />
    </SiteThemeProvider>
  );
}
