// All previous outputs from commands and such
let OutputsText = "";
// Lets user scroll through the past outputs
let ScrollOffset = 0;

// String to store the current text input
let InputText = "";
// Dictionary to store info about the text blinker
let Blinker = { Index: 0, Time: Date.now() * 0.001 };

// Command history for arrow key navigation
let CommandHistory = [];
let HistoryIndex = -1; // -1 means we're at the live input

// Current directory
let Directory = "C:/Users/guest";

// Stores weather to render plasma or normal terminal
let DisplayPlasma = false;

// Function to give text for rendering
function GetText() {
  // Text to be displayed
  let FinalText = "";

  if (InSnakeGame) {
    return SnakeRender();
  }
  if (InTetrisGame) {
    return TetrisRender();
  }
  if (InMinesweeperGame) {
    return MinesweeperRender();
  }
  if (InPongGame) {
    return PongRender();
  }
  if (InBreakoutGame) {
    return BreakoutRender();
  }
  if (In2048Game) {
    return Game2048Render();
  }
  if (InMazeGame) {
    return MazeRender();
  }
  if (InTypeTestGame) {
    return TypeTestRender();
  }

  if (Time < 5 || OutputsText.split("\n").length < 19) // If in boot sequence
  {
    BootSequence();
    FinalText = OutputsText;
  } else if (!DisplayPlasma) // If not in boot sequence
  {
    // Trim the previous output to be displayed
    let Lines = OutputsText.split("\n");
    FinalText += Lines.slice(
      ScrollOffset,
      Math.min(ScrollOffset + 30, Lines.length),
    ).join("\n");

    // Check if command input is on screen
    if (ScrollOffset + 30 >= Lines.length) {
      if ((Date.now() * 0.001 - Blinker.Time) % 1 < 0.5) // Show blinker
      {
        FinalText += `${Directory}> ${InputText.slice(0, Blinker.Index)}█${InputText.slice(Blinker.Index + 1, InputText.length)}`;
      } else // Dont show blinker
      {
        FinalText += `${Directory}> ${InputText}`;
      }
    }
  } else {
    return GetTextPlasma();
  }

  return FinalText;
}

// Function to handle key press and text input
function KeyPressed(key) {
  if (InSnakeGame) {
    if (key === "Escape") {
      InSnakeGame = false;
      if (SnakeGame.Interval) {
        clearInterval(SnakeGame.Interval);
      }
      OutputsText += "\n'Snake' exited\n\n";
    } else if (SnakeGame.GameOver && key === "Enter") {
      SnakeInit();
    } else if (!SnakeGame.GameOver) {
      const Dir = SnakeGame.Direction;
      if (key === "ArrowUp" && Dir !== "down") {
        SnakeGame.NextDirection = "up";
      } else if (key === "ArrowDown" && Dir !== "up") {
        SnakeGame.NextDirection = "down";
      } else if (key === "ArrowLeft" && Dir !== "right") {
        SnakeGame.NextDirection = "left";
      } else if (key === "ArrowRight" && Dir !== "left") {
        SnakeGame.NextDirection = "right";
      }
    }
    return;
  }

  if (InTetrisGame) {
    if (key === "Escape") {
      InTetrisGame = false;
      if (TetrisGame.Interval) {
        clearInterval(TetrisGame.Interval);
      }
      OutputsText += "\n'Tetris' exited\n\n";
    } else if (TetrisGame.GameOver && key === "Enter") {
      TetrisInit();
    } else if (!TetrisGame.GameOver) {
      if (key === "ArrowLeft") {
        TetrisMoveLeft();
      } else if (key === "ArrowRight") {
        TetrisMoveRight();
      } else if (key === "ArrowDown") {
        TetrisMoveDown();
      } else if (key === "ArrowUp") {
        TetrisRotate();
      }
    }
    return;
  }

  if (InMinesweeperGame) {
    if (key === "Escape") {
      InMinesweeperGame = false;
      OutputsText += "\n'Minesweeper' exited\n\n";
    } else if (MinesweeperGame.GameOver && key === "Enter") {
      MinesweeperInit();
    } else if (!MinesweeperGame.GameOver) {
      if (key === "ArrowUp") {
        MinesweeperGame.CursorY = Math.max(0, MinesweeperGame.CursorY - 1);
      } else if (key === "ArrowDown") {
        MinesweeperGame.CursorY = Math.min(
          MinesweeperGame.Height - 1,
          MinesweeperGame.CursorY + 1,
        );
      } else if (key === "ArrowLeft") {
        MinesweeperGame.CursorX = Math.max(0, MinesweeperGame.CursorX - 1);
      } else if (key === "ArrowRight") {
        MinesweeperGame.CursorX = Math.min(
          MinesweeperGame.Width - 1,
          MinesweeperGame.CursorX + 1,
        );
      } else if (key === "Enter") {
        MinesweeperReveal(MinesweeperGame.CursorX, MinesweeperGame.CursorY);
      } else if (key === "f") {
        MinesweeperFlag(MinesweeperGame.CursorX, MinesweeperGame.CursorY);
      }
    }
    return;
  }

  if (InPongGame) {
    if (key === "Escape") {
      InPongGame = false;
      if (PongGame.Interval) {
        clearInterval(PongGame.Interval);
      }
      OutputsText += "\n'Pong' exited\n\n";
    } else if (PongGame.GameOver && key === "Enter") {
      PongInit();
    } else {
      if (key === "ArrowUp") {
        PongGame.PaddleUp = true;
      } else if (key === "ArrowDown") {
        PongGame.PaddleDown = true;
      }
    }
    return;
  }

  if (InBreakoutGame) {
    if (key === "Escape") {
      InBreakoutGame = false;
      if (BreakoutGame.Interval) {
        clearInterval(BreakoutGame.Interval);
      }
      OutputsText += "\n'Breakout' exited\n\n";
    } else if (BreakoutGame.GameOver && key === "Enter") {
      BreakoutInit();
    } else {
      if (key === "ArrowLeft") {
        BreakoutGame.PaddleLeft = true;
      } else if (key === "ArrowRight") {
        BreakoutGame.PaddleRight = true;
      }
    }
    return;
  }

  if (In2048Game) {
    if (key === "Escape") {
      In2048Game = false;
      OutputsText += "\n'2048' exited\n\n";
    } else if (Game2048.GameOver && key === "Enter") {
      Game2048Init();
    } else if (!Game2048.GameOver) {
      if (key === "ArrowUp") {
        Game2048Move("up");
      } else if (key === "ArrowDown") {
        Game2048Move("down");
      } else if (key === "ArrowLeft") {
        Game2048Move("left");
      } else if (key === "ArrowRight") {
        Game2048Move("right");
      }
    }
    return;
  }

  if (InMazeGame) {
    if (key === "Escape") {
      InMazeGame = false;
      OutputsText += "\n'Maze' exited\n\n";
    } else if (MazeGame.Won && key === "Enter") {
      MazeInit();
    } else {
      if (key === "ArrowUp") {
        MazeMove(0, -1);
      } else if (key === "ArrowDown") {
        MazeMove(0, 1);
      } else if (key === "ArrowLeft") {
        MazeMove(-1, 0);
      } else if (key === "ArrowRight") {
        MazeMove(1, 0);
      }
    }
    return;
  }

  if (InTypeTestGame) {
    if (key === "Escape") {
      InTypeTestGame = false;
      OutputsText += "\n'Type Test' exited\n\n";
    } else if (TypeTestGame.Done && key === "Enter") {
      TypeTestInit();
    } else if (!TypeTestGame.Done) {
      TypeTestKeyPress(key);
    }
    return;
  }

  if (DisplayPlasma) {
    if (key === "Escape") {
      DisplayPlasma = false;
    }
  } else if (Time > 5) {
    let LinesCount = OutputsText.split("\n").length;

    if (
      key.length === 1 &&
      InputText.length + Directory.length + 3 < 55
    ) // Add character
    {
      InputText =
        InputText.slice(0, Blinker.Index) +
        key.toLowerCase() +
        InputText.slice(Blinker.Index, InputText.length);
      Blinker = { Index: Blinker.Index + 1, Time: Date.now() * 0.001 }; // Update blinker pos and reset its time
      if (ScrollOffset < LinesCount - 30) {
        ScrollOffset = Math.max(0, LinesCount - 30);
      } // Reset the scroll if off screen
    } else if (
      key === "Backspace" &&
      InputText &&
      Blinker.Index > 0
    ) // Remove character
    {
      InputText =
        InputText.slice(0, Blinker.Index - 1) +
        InputText.slice(Blinker.Index, InputText.length);
      Blinker = { Index: Blinker.Index - 1, Time: Date.now() * 0.001 }; // Update blinker pos and reset its time
      if (ScrollOffset < LinesCount - 30) {
        ScrollOffset = Math.max(0, LinesCount - 30);
      } // Reset the scroll if off screen
    } else if (key === "ArrowLeft") // Move blinker left
    {
      Blinker = {
        Index: Math.max(0, Blinker.Index - 1),
        Time: Date.now() * 0.001,
      };
    } else if (key === "ArrowRight") // Move blinker right
    {
      Blinker = {
        Index: Math.min(InputText.length, Blinker.Index + 1),
        Time: Date.now() * 0.001,
      };
    } else if (key === "ArrowUp") // Navigate to previous command in history
    {
      if (CommandHistory.length > 0) {
        HistoryIndex = Math.min(HistoryIndex + 1, CommandHistory.length - 1);
        InputText = CommandHistory[CommandHistory.length - 1 - HistoryIndex];
        Blinker = { Index: InputText.length, Time: Date.now() * 0.001 };
        if (ScrollOffset < LinesCount - 30) {
          ScrollOffset = Math.max(0, LinesCount - 30);
        }
      }
    } else if (key === "ArrowDown") // Navigate to next command in history
    {
      if (HistoryIndex > 0) {
        HistoryIndex -= 1;
        InputText = CommandHistory[CommandHistory.length - 1 - HistoryIndex];
      } else {
        HistoryIndex = -1;
        InputText = "";
      }
      Blinker = { Index: InputText.length, Time: Date.now() * 0.001 };
      if (ScrollOffset < LinesCount - 30) {
        ScrollOffset = Math.max(0, LinesCount - 30);
      }
    } else if (key === "PageUp") // Scroll terminal output up
    {
      ScrollOffset = Math.max(0, ScrollOffset - 5);
    } else if (key === "PageDown") // Scroll terminal output down
    {
      ScrollOffset = Math.min(Math.max(0, LinesCount - 1), ScrollOffset + 5);
    } else if (key === "Tab") // Auto complete
    {
      AutoComplete(); // Complete input text
      Blinker = { Index: InputText.length, Time: Date.now() * 0.001 }; // Update blinker pos and reset its time
      if (ScrollOffset < LinesCount - 30) {
        ScrollOffset = Math.max(0, LinesCount - 30);
      } // Reset the scroll if off screen
    } else if (key === "Enter") // Submit text
    {
      OutputsText += `${Directory}> ${InputText}\n`;

      // Save non-empty commands to history (avoid duplicates at top)
      if (InputText.trim() && (CommandHistory.length === 0 || CommandHistory[CommandHistory.length - 1] !== InputText)) {
        CommandHistory.push(InputText);
      }
      HistoryIndex = -1; // Reset history navigation

      ExecuteCommand();

      InputText = "";
      Blinker = { Index: 0, Time: Date.now() * 0.001 };

      LinesCount = OutputsText.split("\n").length;
      if (ScrollOffset < LinesCount - 30) {
        ScrollOffset = Math.max(0, LinesCount - 30);
      }
    }
  }
}

function BootSequence() {
  OutputsText = "";
  let LoadingChars = ["—", "\\", "|", "/"];
  // The font used below is ANSI shodow if you forget @Meeelaaad
  if (Time > 0.1) {
    OutputsText += "███╗   ███╗██╗██╗      █████╗ ██████╗     █████╗ ██╗ \n";
  }
  if (Time > 0.2) {
    OutputsText += "████╗ ████║██║██║     ██╔══██╗██╔══██╗   ██╔══██╗██║ \n";
  }
  if (Time > 0.3) {
    OutputsText += "██╔████╔██║██║██║     ███████║██║  ██║   ███████║██║ \n";
  }
  if (Time > 0.4) {
    OutputsText += "██║╚██╔╝██║██║██║     ██╔══██║██║  ██║   ██╔══██║██║ \n";
  }
  if (Time > 0.5) {
    OutputsText += "██║ ╚═╝ ██║██║███████╗██║  ██║██████╔╝██╗██║  ██║██║ \n";
  }
  if (Time > 0.6) {
    OutputsText +=
      "╚═╝     ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝ \n\n\n";
  }
  if (Time > 1.1) {
    OutputsText += "Welcome to Milad.AI 1.2.7 x86_64\n";
  }
  if (Time > 1.2) {
    OutputsText += "Type 'help' to list available commands\n\n\n";
  }
  if (Time > 1.7) {
    OutputsText += `Loading ${LoadingChars[Math.ceil((Math.min(3.7, Time) % 0.4) / 0.1) - 1]} ${Math.ceil(Math.min(100, (Time - 1.7) / 0.02))}%\n`;
  }
  if (Time > 3.7) {
    OutputsText += ".\n";
  }
  if (Time > 3.8) {
    OutputsText += ".\n";
  }
  if (Time > 3.9) {
    OutputsText += ".\n";
  }
  if (Time > 4.0) {
    OutputsText += "Complete!\n\n";
  }

  ScrollOffset = Math.min(OutputsText.split("\n").length - 1, ScrollOffset);
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

const FileSystem = {
  root: {
    type: "directory",
    contents: {
      projects: {
        type: "directory",
        contents: {
          "projects.txt": {
            type: "file",
            content:
              "FEATURED PROJECTS (2025 - 2026)\n==================================================\n\n[1] CUK Acadex (2025)\n    Full-stack academic platform with AI-powered\n    RAG, automated exam scheduling, real-time\n    collaboration, and native Android app.\n    Tech: React, TypeScript, Vite, Tailwind CSS,\n          Supabase, PostgreSQL, pgvector, RAG,\n          Python, Kotlin, Android.\n    Repo: github.com/m4milaad/schedule-savvy-schedules\n\n[2] KATHE English-to-Kashmiri Translation (2026)\n    Low-resource neural machine-translation\n    pipeline using NLLB-200, IndicTrans2, LoRA\n    fine-tuning, ensemble, and BLEU/chrF++ eval.\n    Tech: Python, PyTorch, Hugging Face, NLLB-200,\n          IndicTrans2, LoRA, PEFT, BLEU, chrF++.\n    Repo: github.com/m4milaad/bpccEngtoKash\n\n[3] SentinelFlow (2026)\n    Redis-backed distributed rate-limiting\n    service with multiple traffic algorithms,\n    REST APIs, observability, and Docker/K8s.\n    Tech: Java, Spring Boot, Redis, REST API,\n          Prometheus, Docker, Kubernetes, React, TS.\n    Repo: github.com/m4milaad/SentinelFlow\n\n[4] BIS AI (2026)\n    Offline-first multilingual product-safety app\n    with AI chat, image analysis, hybrid semantic\n    search, PWA, and low-bandwidth resilience.\n    Tech: React, TypeScript, Vite, Tailwind CSS,\n          PWA, Supabase, Postgres, pgvector, Gemini.\n    Repo: github.com/m4milaad/bis-ai\n\n[5] 2AI Conference (2026)\n    Production conference platform with attendee\n    registration, ICICI Eazypay payment processing,\n    and Cloudflare R2 media storage.\n    Tech: React, JavaScript, Vite, Tailwind CSS,\n          Supabase, Postgres, Edge Functions, R2.\n    Repo: github.com/m4milaad/2ai-Conference\n\n[6] repo-ready (2026)\n    Offline Python CLI evaluating repo readiness,\n    generating deterministic CI-compatible reports,\n    and scaffolding missing project files.\n    Tech: Python, Python CLI, Pytest, Docker,\n          GitHub Actions, JSON, Standard Library.\n    Repo: github.com/m4milaad/repo-ready\n\n--------------------------------------------------\nUse 'start <name.lnk>' or 'cat <name.lnk>'",
          },
          "01_cuk_acadex.lnk": {
            type: "link",
            content: "https://github.com/m4milaad/schedule-savvy-schedules",
            description:
              "CUK Acadex (2025)\nA full-stack academic management platform with AI-powered\nRAG search, automated exam scheduling, real-time\ncollaboration, role-based access, and a native Android app.\nTech: React, TypeScript, Vite, Tailwind, Supabase,\n      PostgreSQL, pgvector, RAG, Python, Kotlin, Android.",
          },
          "02_kathe_translation.lnk": {
            type: "link",
            content: "https://github.com/m4milaad/bpccEngtoKash",
            description:
              "KATHE English-to-Kashmiri Translation (2026)\nA low-resource neural machine-translation pipeline using\nNLLB-200, IndicTrans2, LoRA fine-tuning, back-translation,\nensemble inference, and BLEU/chrF++ evaluation.\nTech: Python, PyTorch, Hugging Face Transformers, NLLB-200,\n      IndicTrans2, LoRA, PEFT, BLEU, chrF++, Kaggle.",
          },
          "03_sentinelflow.lnk": {
            type: "link",
            content: "https://github.com/m4milaad/SentinelFlow",
            description:
              "SentinelFlow (2026)\nA Redis-backed distributed rate-limiting service with multiple\ntraffic-control algorithms, REST APIs, observability,\nload testing, and Docker/Kubernetes deployment.\nTech: Java, Spring Boot, Redis, REST API, Prometheus,\n      Docker, Kubernetes, React, TypeScript, JUnit.",
          },
          "04_bis_ai.lnk": {
            type: "link",
            content: "https://github.com/m4milaad/bis-ai",
            description:
              "BIS AI (2026)\nAn offline-first multilingual product-safety platform with\nAI chat, product-image analysis, hybrid semantic search,\nPWA support, and low-bandwidth features.\nTech: React, TypeScript, Vite, Tailwind CSS, PWA,\n      Supabase, PostgreSQL, pgvector, Gemini API, RAG, Deno.",
          },
          "05_2ai_conference.lnk": {
            type: "link",
            content: "https://github.com/m4milaad/2ai-Conference",
            description:
              "2AI Conference (2026)\nA production conference platform with event registration,\npayment processing, cloud media storage, Supabase backend\nservices, and a live public website.\nTech: React, JavaScript, Vite, Tailwind CSS, Supabase,\n      PostgreSQL, Edge Functions, ICICI Eazypay, Cloudflare R2.",
          },
          "06_repo_ready.lnk": {
            type: "link",
            content: "https://github.com/m4milaad/repo-ready",
            description:
              "repo-ready (2026)\nAn offline Python CLI that evaluates repository readiness,\ngenerates deterministic CI-compatible reports, and safely\nscaffolds missing project files.\nTech: Python, Python CLI, Pytest, Docker,\n      GitHub Actions, JSON, Standard Library.",
          },
        },
      },
      games: {
        type: "directory",
        contents: {
          "games.txt": {
            type: "file",
            content:
              "Welcome to the Games Directory!\nType the game name as a command to play.\n\nAvailable games:\n  snake        Classic Snake\n  tetris       Falling blocks\n  minesweeper  Find the mines\n  pong         Ball & paddle\n  breakout     Brick breaker\n  2048         Slide & merge tiles\n  maze         Navigate the dungeon\n  typetest     Typing speed test\n\nControls: Arrow keys to move, Escape to exit.",
          },
          "snake.exe": { type: "executable", content: "snake" },
          "tetris.exe": { type: "executable", content: "tetris" },
          "minesweeper.exe": { type: "executable", content: "minesweeper" },
          "pong.exe": { type: "executable", content: "pong" },
          "breakout.exe": { type: "executable", content: "breakout" },
          "2048.exe": { type: "executable", content: "2048" },
          "maze.exe": { type: "executable", content: "maze" },
          "typetest.exe": { type: "executable", content: "typetest" },
        },
      },
      "profile.txt": {
        type: "file",
        content:
          "MILAD AJAZ BHAT (@m4milaad)\n==================================================\nSoftware Engineer & Open Source Contributor\nSrinagar, Jammu & Kashmir, India\n\nSpecializing in full-stack engineering, distributed\nsystems, AI/ML pipelines (RAG, fine-tuning),\nand developer tooling.\n\n- Campus Ambassador @ Google\n- Mentor @ GirlScript Summer of Code (GSSoC)\n- Ex-Intern @ NIT Srinagar\n- B.Tech CSE @ Central University of Kashmir ('27)\n\nWebsite: https://m4milaad.github.io\nGitHub:  https://github.com/m4milaad",
      },
      "tech_stack.txt": {
        type: "file",
        content:
          "TECHNICAL SKILLS & TECH STACK\n==================================================\n\n* Languages:\n  Python, JavaScript, TypeScript, Java, C/C++,\n  Kotlin, SQL, HTML5, CSS3\n\n* Frontend & Web:\n  React, Vite, Next.js, Tailwind CSS, PWA,\n  Responsive Layouts, WebGL, Canvas API\n\n* Backend & Distributed Systems:\n  Node.js, Spring Boot, REST APIs, Redis,\n  Edge Functions, Deno\n\n* Databases & Cloud Storage:\n  PostgreSQL, pgvector, Supabase, MongoDB,\n  Cloudflare R2\n\n* AI & Machine Learning:\n  RAG Architectures, PyTorch, Hugging Face,\n  Transformers, IndicTrans2, NLLB-200, LoRA,\n  PEFT, Gemini API, Scikit-learn, Pandas, NumPy\n\n* DevOps, Cloud & Tools:\n  Docker, Kubernetes, Git, GitHub Actions,\n  Prometheus, Vercel, VS Code, Linux",
      },
      "experience.txt": {
        type: "file",
        content:
          "WORK & COMMUNITY EXPERIENCE\n==================================================\n\n[1] NIT Srinagar | Student Intern\n    Dec 2025 - Feb 2026\n    - Hybrid internship at Dept. of Training & Placement,\n      NIT Srinagar. Gained hands-on experience in\n      real-world software and institutional systems.\n\n[2] Yuva Global Enterprises | Web Developer\n    Dec 2024 - Jul 2025\n    - Developed and maintained company website (HTML, CSS, JS)\n      on-site. Supported key digital operations and client engagement.\n\n[3] Skillified | Mentor\n    Jun 2025 - Jul 2025\n    - Built a machine learning model for cancer diagnosis\n      achieving 95% accuracy, and analyzed Framingham dataset.\n    - Certificate: /Images/certificate.pdf\n\n[4] Google | Campus Ambassador\n    May 2026 - Present\n    - Serving as Campus Ambassador at Google, bridging\n      Google technologies and the student community\n      via events, workshops, and mentorship.\n\n[5] GirlScript Summer of Code (GSSoC) | Mentor\n    May 2026 - Present\n    - Mentoring open-source contributors at GSSoC,\n      guiding project contributions, code reviews,\n      and collaborative development practices.\n\n[6] Open Source Connect | Campus Lead\n    Dec 2025 - Apr 2026\n    - Led open-source campus initiatives, organizing\n      hack events and fostering contribution culture.\n\n[7] ByteNovators | QA & Marketing Intern\n    Feb 2024 - Dec 2024\n    - Validated software quality via QA testing.\n      Managed client lead generation and campaigns.",
      },
      "education.txt": {
        type: "file",
        content:
          "EDUCATION\n==================================================\n\nCentral University of Kashmir, Ganderbal\n- Bachelor of Technology (B.Tech), CSE\n- Expected Graduation: July 2027\n- Relevant Coursework: C, Java, Data Structures, OOP\n- Activities: Coding Competitions, Event Management\n\nSri Pratap Higher Secondary School, Srinagar\n- 10+2 (Higher Secondary) | Graduated: 2022\n- Stream: Non-Medical\n- Activities: Badminton, Football, Table Tennis",
      },
      "accolades.txt": {
        type: "file",
        content:
          "HONORS, AWARDS & CERTIFICATIONS\n==================================================\n\n* 1st Position | SynerTech 2026 Hackathon (KCET, 2026)\n  - Won hackathon at Kashmir College of Eng & Tech.\n    Built CRM-based Academic Management Portal with\n    AI-powered chatbot and companion Android app.\n\n* 1st Position | Open Build Challenge (NIT Srinagar, 2025)\n  - Organised by FOSS NIT Srinagar in collaboration\n    with FOSS United.\n\n* 3rd Position | Coding Competition (CUK, 2025)\n  - Hosted by Code Squad during Cyber Concave 2025.\n\n* Build an AI Agent Certification (IBM, 2026)\n  - Completed IBM certification in AI agent development\n    and prompt engineering workflows.\n\n* OCI 2025 Certified AI Foundations Associate (Oracle, 2025)\n  - Passed certification (1Z0-1122-25) with 95%.\n\n* Prepare Data for ML APIs (Google Cloud Skill Badge, 2025)\n  - Natural Language API, Dataflow, ML pipelines.\n\n* Artificial Intelligence Fundamentals (IBM, 2025)\n  - AI applications, capabilities, and core concepts.\n\n* SWOC Mentorship Certificate (Social Winter of Code, 2026)\n  - Mentoring global open-source contributors.\n\n* Cursor Kashmir Hackathon (Cursor, 2026)\n  - AI-assisted development workflows.\n\n* Participant - ECWOC (Elite Coders, 2026)\n  - Competitive programming contest.\n\n* Viksit Bharat @2047 (Startups & Innovation Mission, 2026)\n  - National startup and innovation mission initiative.\n\n* Coding Challenge Participant (Tech Summit IUST, 2025)\n  - Algorithmic competition during Foundation Week.\n\n* Coordinator of Gaming Competition (CUK, 2025)\n  - Leadership during Cyber Concave 2025 (BGMI event).\n\n* Certificate of Achievement (Cyber Concave CUK, 2025)\n  - Exemplary leadership & dedication as Coordinator.",
      },
      "contact.txt": {
        type: "file",
        content:
          "CONTACT & SOCIAL PROFILES\n==================================================\nEmail:    mb4milad.bhattt@gmail.com\nGitHub:   https://github.com/m4milaad\nLinkedIn: https://www.linkedin.com/in/m4milaad/\nX:        https://x.com/m4milaad\nResume:   /Images/Milad%20Ajaz%20Bhat%20Resume.pdf\nStatus:   Available for work / opportunities",
      },
      "resume.lnk": {
        type: "link",
        content: "/Images/Milad%20Ajaz%20Bhat%20Resume.pdf",
        description: "Milad Ajaz Bhat - Resume / CV (PDF)",
      },
      "github.lnk": {
        type: "link",
        content: "https://github.com/m4milaad",
        description: "Milad's GitHub Profile",
      },
      "linkedin.lnk": {
        type: "link",
        content: "https://www.linkedin.com/in/m4milaad/",
        description: "Milad's LinkedIn Profile",
      },
      "plasma.exe": { type: "executable", content: "plasma" },
    },
  },
};

function GetCurrentDirNode() {
  let DirectoryContents = FileSystem.root;
  for (let Dir of Directory.slice(15).split("/").filter(Boolean)) {
    if (DirectoryContents && DirectoryContents.contents && DirectoryContents.contents[Dir]) {
      DirectoryContents = DirectoryContents.contents[Dir];
    }
  }
  return DirectoryContents;
}

function ListFiles() {
  const DirectoryContents = GetCurrentDirNode();
  if (!DirectoryContents || !DirectoryContents.contents) {
    OutputsText += `\nError reading directory\n\n`;
    return;
  }

  // Print directory being listed
  const folderName = Directory.split("/").slice(-1)[0] || "guest";
  OutputsText += `\nC:/../${folderName}`;

  // Print each file
  const Files = Object.keys(DirectoryContents.contents);
  for (let [Index, File] of Files.entries()) {
    const item = DirectoryContents.contents[File];
    const isDir = item && item.type === "directory";
    const prefix = Index == Files.length - 1 ? "┗" : "┣";
    const marker = isDir ? "━━━━" : "━▷";
    OutputsText += `\n${prefix}${marker} ${File}${isDir ? "/" : ""}`;
  }

  OutputsText += "\n\n";
}

function ChangeDirectory(InputDirectory) {
  const cleanInput = (InputDirectory || "").trim().replace(/\/+$/, "");
  let CurrentDirectory = Directory.slice(15).split("/").filter(Boolean);

  // Return to root folder
  if (!cleanInput || cleanInput === "/" || cleanInput === "~") {
    CurrentDirectory = [];
  }
  // Go back a folder
  else if (cleanInput === "..") {
    CurrentDirectory.pop();
  }
  // Move to new folder
  else {
    let DirectoryContents = FileSystem.root;
    for (let Dir of CurrentDirectory) {
      DirectoryContents = DirectoryContents.contents[Dir];
    }

    if (
      DirectoryContents.contents[cleanInput] &&
      DirectoryContents.contents[cleanInput].type === "directory"
    ) {
      CurrentDirectory.push(cleanInput);
    } else {
      OutputsText += `\ncd: '${cleanInput}' No such directory\n\n`;
      return;
    }
  }

  Directory = `C:/Users/guest${CurrentDirectory.length ? "/" : ""}${CurrentDirectory.join("/")}`;
}

function ResolveFile(inputPath) {
  if (!inputPath) return null;
  const clean = inputPath.replace(/^C:\/Users\/guest\/?/i, "").trim();

  // 1. Direct match in current directory
  const currentDir = GetCurrentDirNode();
  if (currentDir && currentDir.contents && currentDir.contents[clean]) {
    return currentDir.contents[clean];
  }

  // 2. Direct match in root
  if (FileSystem.root.contents[clean]) {
    return FileSystem.root.contents[clean];
  }

  // 3. Subdirectory paths like projects/01_cuk_acadex.lnk
  if (clean.includes("/")) {
    const parts = clean.split("/").filter(Boolean);
    let target = clean.startsWith("/") ? FileSystem.root : currentDir;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part === "..") {
        target = FileSystem.root;
      } else if (target && target.contents && target.contents[part]) {
        target = target.contents[part];
      } else {
        target = null;
        break;
      }
    }
    const fileName = parts[parts.length - 1];
    if (target && target.contents && target.contents[fileName]) {
      return target.contents[fileName];
    }
  }

  // 4. Convenience search across subdirectories (projects, games)
  if (FileSystem.root.contents.projects && FileSystem.root.contents.projects.contents[clean]) {
    return FileSystem.root.contents.projects.contents[clean];
  }
  if (FileSystem.root.contents.games && FileSystem.root.contents.games.contents[clean]) {
    return FileSystem.root.contents.games.contents[clean];
  }

  return null;
}

function StartFile(InputFile) {
  const fileData = ResolveFile(InputFile);

  if (fileData) {
    if (fileData.type === "file") {
      OutputsText += `\n${fileData.content}\n\n`;
    } else if (fileData.type === "link") {
      OutputsText += `\nOpening link: ${fileData.content}\n`;
      if (fileData.description) {
        OutputsText += `Description: ${fileData.description}\n\n`;
      } else {
        OutputsText += `\n`;
      }
      window.open(fileData.content);
    } else if (fileData.type === "executable") {
      const gameMap = {
        snake: () => {
          OutputsText += `\n'${InputFile}' Started. Arrow keys to play. Escape to exit.\n\n`;
          InSnakeGame = true;
          SnakeInit();
        },
        tetris: () => {
          OutputsText += `\n'${InputFile}' Started. Arrow keys to play. Escape to exit.\n\n`;
          InTetrisGame = true;
          TetrisInit();
        },
        minesweeper: () => {
          OutputsText += `\n'${InputFile}' Started. Arrows: move, Enter: reveal, F: flag. Escape to exit.\n\n`;
          InMinesweeperGame = true;
          MinesweeperInit();
        },
        pong: () => {
          OutputsText += `\n'${InputFile}' Started. Arrow Up/Down to move. Escape to exit.\n\n`;
          InPongGame = true;
          PongInit();
        },
        breakout: () => {
          OutputsText += `\n'${InputFile}' Started. Arrow Left/Right to move. Escape to exit.\n\n`;
          InBreakoutGame = true;
          BreakoutInit();
        },
        2048: () => {
          OutputsText += `\n'${InputFile}' Started. Arrow keys to slide. Escape to exit.\n\n`;
          In2048Game = true;
          Game2048Init();
        },
        maze: () => {
          OutputsText += `\n'${InputFile}' Started. Arrow keys to move. Escape to exit.\n\n`;
          InMazeGame = true;
          MazeInit();
        },
        typetest: () => {
          OutputsText += `\n'${InputFile}' Started. Type the phrase! Escape to exit.\n\n`;
          InTypeTestGame = true;
          TypeTestInit();
        },
        plasma: () => {
          OutputsText += `\n'${InputFile}' Started successfully\n\n`;
          DisplayPlasma = true;
        },
      };
      const launcher = gameMap[fileData.content];
      if (launcher) launcher();
      else {
        OutputsText += `\n'${InputFile}' Started successfully\n\n`;
        DisplayPlasma = true;
      }
    } else if (fileData.type === "directory") {
      OutputsText += `\nstart: '${InputFile}' is a directory. Use 'cd ${InputFile}' or 'ls'.\n\n`;
    }
  } else {
    OutputsText += `\nstart: '${InputFile}' No such file\n\n`;
  }
}

function CatFile(InputFile) {
  const fileData = ResolveFile(InputFile);

  if (fileData) {
    if (fileData.type === "file") {
      OutputsText += `\n${fileData.content}\n\n`;
    } else if (fileData.type === "link") {
      OutputsText += `\nLink: ${fileData.content}\n`;
      if (fileData.description) {
        OutputsText += `${fileData.description}\n`;
      }
      OutputsText += `(Use 'start ${InputFile}' to open in browser)\n\n`;
    } else if (fileData.type === "executable") {
      OutputsText += `\n[Executable binary: '${InputFile}']\nType '${fileData.content}' or 'start ${InputFile}' to launch.\n\n`;
    } else if (fileData.type === "directory") {
      OutputsText += `\ncat: '${InputFile}': Is a directory. Use 'cd ${InputFile}' or 'ls'.\n\n`;
    }
  } else {
    OutputsText += `\ncat: '${InputFile}': No such file\n\n`;
  }
}

// Modified ExecuteCommand function
function ExecuteCommand() {
  const trimmed = InputText.trim();
  const [Command, ...Arguments] = trimmed.split(/\s+/);
  const cmd = (Command || "").toLowerCase();

  switch (cmd) {
    case "ls":
    case "dir":
      if (Arguments.length) {
        OutputsText += "\nError: 'ls' doesn't accept any arguments\n\n";
      } else {
        ListFiles();
      }
      break;

    case "cd":
      if (Arguments.length > 1) {
        OutputsText +=
          "\nError: 'cd' doesn't accept more than one argument\n\n";
      } else if (!Arguments.length) {
        ChangeDirectory("/");
      } else {
        ChangeDirectory(Arguments[0]);
      }
      break;

    case "start":
    case "open":
      if (Arguments.length > 1) {
        OutputsText +=
          `\nError: '${cmd}' doesn't accept more than one argument\n\n`;
      } else if (!Arguments.length) {
        OutputsText += `\nError: '${cmd}' requires a file argument\n\n`;
      } else {
        StartFile(Arguments[0]);
      }
      break;

    case "cat":
    case "view":
    case "type":
    case "read":
      if (Arguments.length > 1) {
        OutputsText +=
          `\nError: '${cmd}' doesn't accept more than one argument\n\n`;
      } else if (!Arguments.length) {
        OutputsText += `\nError: '${cmd}' requires a file argument\n\n`;
      } else {
        CatFile(Arguments[0]);
      }
      break;

    case "projects":
    case "project":
      OutputsText += `\n${FileSystem.root.contents.projects.contents["projects.txt"].content}\n\n`;
      break;

    case "experience":
    case "exp":
      OutputsText += `\n${FileSystem.root.contents["experience.txt"].content}\n\n`;
      break;

    case "accolades":
    case "awards":
    case "certs":
    case "certifications":
      OutputsText += `\n${FileSystem.root.contents["accolades.txt"].content}\n\n`;
      break;

    case "education":
    case "edu":
      OutputsText += `\n${FileSystem.root.contents["education.txt"].content}\n\n`;
      break;

    case "skills":
    case "tech":
    case "stack":
    case "techstack":
      OutputsText += `\n${FileSystem.root.contents["tech_stack.txt"].content}\n\n`;
      break;

    case "profile":
    case "whoami":
    case "bio":
    case "about":
      OutputsText += `\n${FileSystem.root.contents["profile.txt"].content}\n\n`;
      break;

    case "contact":
    case "social":
    case "socials":
      OutputsText += `\n${FileSystem.root.contents["contact.txt"].content}\n\n`;
      break;

    case "resume":
    case "cv":
      OutputsText += "\nOpening Resume: /Images/Milad%20Ajaz%20Bhat%20Resume.pdf\n\n";
      window.open("/Images/Milad%20Ajaz%20Bhat%20Resume.pdf");
      break;

    case "github":
      OutputsText += "\nOpening GitHub: https://github.com/m4milaad\n\n";
      window.open("https://github.com/m4milaad");
      break;

    case "linkedin":
      OutputsText += "\nOpening LinkedIn: https://www.linkedin.com/in/m4milaad/\n\n";
      window.open("https://www.linkedin.com/in/m4milaad/");
      break;

    case "date":
    case "time":
      OutputsText += `\n${new Date().toString()}\n\n`;
      break;

    case "echo":
      OutputsText += `\n${Arguments.join(" ")}\n\n`;
      break;

    case "snake":
      if (InSnakeGame) {
        OutputsText += "\nError: Snake game is already running\n\n";
      } else if (Arguments.length) {
        OutputsText += "\nError: 'snake' doesn't accept any arguments\n\n";
      } else {
        OutputsText +=
          "\n'Snake' Started. Use arrow keys to play.\nPress 'Escape' to exit.\n\n";
        InSnakeGame = true;
        SnakeInit();
      }
      break;

    case "tetris":
      if (InTetrisGame) {
        OutputsText += "\nError: Tetris is already running\n\n";
      } else if (Arguments.length) {
        OutputsText += "\nError: 'tetris' doesn't accept any arguments\n\n";
      } else {
        OutputsText +=
          "\n'Tetris' Started. Arrow keys: move/rotate.\nPress 'Escape' to exit.\n\n";
        InTetrisGame = true;
        TetrisInit();
      }
      break;

    case "minesweeper":
      if (InMinesweeperGame) {
        OutputsText += "\nError: Minesweeper is already running\n\n";
      } else if (Arguments.length) {
        OutputsText +=
          "\nError: 'minesweeper' doesn't accept any arguments\n\n";
      } else {
        OutputsText +=
          "\n'Minesweeper' Started. Arrow keys: move cursor.\nEnter: reveal. F: flag. Escape: exit.\n\n";
        InMinesweeperGame = true;
        MinesweeperInit();
      }
      break;

    case "pong":
      if (InPongGame) {
        OutputsText += "\nError: Pong is already running\n\n";
      } else if (Arguments.length) {
        OutputsText += "\nError: 'pong' doesn't accept any arguments\n\n";
      } else {
        OutputsText +=
          "\n'Pong' Started. Arrow Up/Down to move paddle.\nPress 'Escape' to exit.\n\n";
        InPongGame = true;
        PongInit();
      }
      break;

    case "breakout":
      if (InBreakoutGame) {
        OutputsText += "\nError: Breakout is already running\n\n";
      } else if (Arguments.length) {
        OutputsText += "\nError: 'breakout' doesn't accept any arguments\n\n";
      } else {
        OutputsText +=
          "\n'Breakout' Started. Arrow Left/Right to move.\nPress 'Escape' to exit.\n\n";
        InBreakoutGame = true;
        BreakoutInit();
      }
      break;

    case "2048":
      if (In2048Game) {
        OutputsText += "\nError: 2048 is already running\n\n";
      } else if (Arguments.length) {
        OutputsText += "\nError: '2048' doesn't accept any arguments\n\n";
      } else {
        OutputsText +=
          "\n'2048' Started. Arrow keys to slide tiles.\nPress 'Escape' to exit.\n\n";
        In2048Game = true;
        Game2048Init();
      }
      break;

    case "maze":
      if (InMazeGame) {
        OutputsText += "\nError: Maze is already running\n\n";
      } else if (Arguments.length) {
        OutputsText += "\nError: 'maze' doesn't accept any arguments\n\n";
      } else {
        OutputsText +=
          "\n'Maze' Started. Arrow keys to move.\nReach the exit [E]. Escape to quit.\n\n";
        InMazeGame = true;
        MazeInit();
      }
      break;

    case "typetest":
      if (InTypeTestGame) {
        OutputsText += "\nError: Type Test is already running\n\n";
      } else if (Arguments.length) {
        OutputsText += "\nError: 'typetest' doesn't accept any arguments\n\n";
      } else {
        OutputsText +=
          "\n'Type Test' Started. Type the shown phrase!\nPress 'Escape' to exit.\n\n";
        InTypeTestGame = true;
        TypeTestInit();
      }
      break;

    case "clear":
    case "cls":
      if (Arguments.length) {
        OutputsText += "\nError: 'clear' doesn't accept any arguments\n\n";
      } else {
        BootSequence();
      }
      break;

    case "help":
      if (Arguments.length) {
        OutputsText += "\nError: 'help' doesn't accept any arguments\n\n";
      } else {
        OutputsText +=
          "\nPress 'tab' for auto complete, 'pgup/pgdn' to scroll,\nand 'esc' to exit a program (.exe game)\n\n" +
          "NAVIGATION & FILES:\n" +
          "  ls           List directory contents\n" +
          "  cd <dir>     Change directory ('..' back, '/' root)\n" +
          "  cat <file>   View contents of a text file\n" +
          "  start <file> Open file, link, or executable\n" +
          "  clear        Clear previous terminal outputs\n\n" +
          "PORTFOLIO SHORTCUTS:\n" +
          "  projects     View all featured engineering projects\n" +
          "  experience   View work history and leadership roles\n" +
          "  accolades    View awards, hackathons, certifications\n" +
          "  education    View degrees and academic details\n" +
          "  skills       View technical skills and stack\n" +
          "  profile      View Milad's background profile\n" +
          "  contact      View email and social profile links\n" +
          "  resume       Open Milad's Resume / CV (PDF)\n" +
          "  github       Open Milad's GitHub profile\n" +
          "  linkedin     Open Milad's LinkedIn profile\n\n" +
          "RETRO GAMES (.exe):\n" +
          "  snake        Classic Snake\n" +
          "  tetris       Falling blocks\n" +
          "  minesweeper  Find the mines\n" +
          "  pong         Ball & paddle\n" +
          "  breakout     Brick breaker\n" +
          "  2048         Slide & merge tiles\n" +
          "  maze         Dungeon maze explorer\n" +
          "  typetest     Typing speed test\n\n";
      }
      break;

    case "":
      break;

    default:
      OutputsText += `\nCommand not found '${Command}'. Type 'help' for commands.\n\n`;
  }
}

// Autocomplete function
function AutoComplete() {
  const [Command, Argument1] = InputText.split(" ");
  const CommandsList = [
    "ls",
    "cd",
    "start",
    "open",
    "cat",
    "view",
    "type",
    "projects",
    "experience",
    "accolades",
    "education",
    "skills",
    "tech",
    "profile",
    "contact",
    "resume",
    "cv",
    "github",
    "linkedin",
    "whoami",
    "date",
    "echo",
    "snake",
    "tetris",
    "minesweeper",
    "pong",
    "breakout",
    "2048",
    "maze",
    "typetest",
    "clear",
    "help",
  ];

  // Auto completing a command
  if (InputText.split(" ").length === 1) {
    const CompletedCommand = CommandsList.filter((Element) =>
      Element.startsWith(Command.toLowerCase()),
    );
    if (CompletedCommand.length === 1) {
      InputText = CompletedCommand[0] + " ";
    } else if (CompletedCommand.length > 1) {
      OutputsText += `\n${Directory}> ${InputText}\n`;
      OutputsText += CompletedCommand.join("  ") + "\n";
    }
  }

  // Auto completing a file name for commands taking file/dir argument
  else if (
    ["cd", "start", "open", "cat", "view", "type"].includes(Command.toLowerCase()) &&
    InputText.split(" ").length === 2
  ) {
    let DirectoryContents = GetCurrentDirNode();
    const arg = Argument1 || "";
    const PossibleCompletions = Object.keys(DirectoryContents.contents).filter(
      (Item) => Item.startsWith(arg),
    );

    if (PossibleCompletions.length === 1) {
      InputText = `${Command} ${PossibleCompletions[0]}`;
    } else if (PossibleCompletions.length > 1) {
      OutputsText += `\n${Directory}> ${InputText}\n`;
      OutputsText += PossibleCompletions.join("  ") + "\n";
    }
  }
  Blinker.Index = InputText.length;
}

function scrollTerminal(deltaY) {
  const end = Math.max(0, OutputsText.split("\n").length - 15);
  ScrollOffset = Math.max(0, Math.min(end, ScrollOffset + 3 * Math.sign(deltaY)));
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

function GetTextPlasma() {
  const Letters = [
    " ",
    "_",
    "a",
    "b",
    "c",
    "ö",
    "õ",
    "ö",
    "#",
    "$",
    "%",
    "1",
    "2",
    "3",
    "A",
    "B",
    "C",
  ];
  let Text = "";

  for (let Row = 1; Row < 31; Row++) {
    for (let Col = 1; Col < 56; Col++) {
      const Intensity = GetIntensityPlasma(Row / 30, Col / 55);
      Text +=
        Letters[
          Math.max(Math.min(Math.floor(Intensity) - 1, Letters.length - 1), 0)
        ];
    }

    Text += "\n";
  }

  return Text;
}

function GetIntensityPlasma(Row, Col) {
  let Intensity = 0.0;
  // Assuming 'Time' is a global variable updated elsewhere (e.g., in a main loop)
  Intensity += 0.7 * Math.sin(0.5 * Row + Time / 5);
  Intensity += 3 * Math.sin(1.6 * Col + Time / 5);
  Intensity +=
    1 *
    Math.sin(
      10 * (Col * Math.sin(Time / 2) + Row * Math.cos(Time / 5)) + Time / 2,
    );

  const CyclicX = Row + 0.5 * Math.sin(Time / 2);
  const CyclicY = Col + 0.5 * Math.cos(Time / 4);

  Intensity +=
    0.4 *
    Math.sin(Math.sqrt(100 * CyclicX ** 2 + 100 * CyclicY ** 2 + 1) + Time);
  Intensity +=
    0.9 * Math.sin(Math.sqrt(75 * CyclicX ** 2 + 25 * CyclicY ** 2 + 1) + Time);
  Intensity +=
    -1.4 *
    Math.sin(Math.sqrt(256 * CyclicX ** 2 + 25 * CyclicY ** 2 + 1) + Time);
  Intensity += 0.3 * Math.sin(0.5 * Col + Row + Math.sin(Time));

  return (
    17 * (0.5 + 0.499 * Math.sin(Intensity)) * (0.7 + Math.sin(Time) * 0.3)
  );
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// Snake Game

let InSnakeGame = false;
let SnakeGame = {};

function SnakeInit() {
  const Width = 30;
  const Height = 20;
  const StartX = Math.floor(Width / 2);
  const StartY = Math.floor(Height / 2);

  SnakeGame = {
    Width: Width,
    Height: Height,
    Snake: [
      { x: StartX, y: StartY },
      { x: StartX - 1, y: StartY },
      { x: StartX - 2, y: StartY },
    ],
    Direction: "right",
    NextDirection: "right",
    Food: null,
    Score: 0,
    GameOver: false,
    Speed: 150,
    LastMove: Date.now(),
  };

  SnakeSpawnFood();

  // Start game loop
  if (SnakeGame.Interval) {
    clearInterval(SnakeGame.Interval);
  }
  SnakeGame.Interval = setInterval(() => {
    if (InSnakeGame) SnakeUpdate();
  }, SnakeGame.Speed);
}

function SnakeSpawnFood() {
  const { Width, Height, Snake } = SnakeGame;
  let FoodX, FoodY;
  do {
    FoodX = Math.floor(Math.random() * (Width - 2)) + 1;
    FoodY = Math.floor(Math.random() * (Height - 2)) + 1;
  } while (Snake.some((seg) => seg.x === FoodX && seg.y === FoodY));
  SnakeGame.Food = { x: FoodX, y: FoodY };
}

function SnakeUpdate() {
  if (SnakeGame.GameOver) return;

  SnakeGame.Direction = SnakeGame.NextDirection;

  const Head = SnakeGame.Snake[0];
  let NewX = Head.x;
  let NewY = Head.y;

  switch (SnakeGame.Direction) {
    case "up":
      NewY--;
      break;
    case "down":
      NewY++;
      break;
    case "left":
      NewX--;
      break;
    case "right":
      NewX++;
      break;
  }

  // Check wall collision
  if (
    NewX <= 0 ||
    NewX >= SnakeGame.Width - 1 ||
    NewY <= 0 ||
    NewY >= SnakeGame.Height - 1
  ) {
    SnakeGame.GameOver = true;
    return;
  }

  // Check self collision
  if (SnakeGame.Snake.some((seg) => seg.x === NewX && seg.y === NewY)) {
    SnakeGame.GameOver = true;
    return;
  }

  const NewHead = { x: NewX, y: NewY };

  // Check food collision
  if (NewX === SnakeGame.Food.x && NewY === SnakeGame.Food.y) {
    SnakeGame.Score += 10;
    SnakeGame.Snake.unshift(NewHead);
    SnakeSpawnFood();
  } else {
    SnakeGame.Snake.unshift(NewHead);
    SnakeGame.Snake.pop();
  }
}

function SnakeRender() {
  let Text = "";

  // Title bar
  const Title = " SNAKE ";
  const ScoreStr = ` Score: ${SnakeGame.Score} `;
  const Pad = SnakeGame.Width - Title.length - ScoreStr.length - 2;
  Text += `\n ${Title}" ".repeat(Math.max(0, Pad))${ScoreStr}\n`;

  for (let Y = 0; Y < SnakeGame.Height; Y++) {
    Text += " ";
    for (let X = 0; X < SnakeGame.Width; X++) {
      if (Y === 0 || Y === SnakeGame.Height - 1) {
        Text +=
          X === 0 ? "\u250C" : X === SnakeGame.Width - 1 ? "\u2510" : "\u2500";
      } else if (X === 0 || X === SnakeGame.Width - 1) {
        Text += "\u2502";
      } else if (
        SnakeGame.Snake[0] &&
        SnakeGame.Snake[0].x === X &&
        SnakeGame.Snake[0].y === Y
      ) {
        Text += "O";
      } else if (
        SnakeGame.Snake.some((seg, i) => i > 0 && seg.x === X && seg.y === Y)
      ) {
        Text += "o";
      } else if (
        SnakeGame.Food &&
        SnakeGame.Food.x === X &&
        SnakeGame.Food.y === Y
      ) {
        Text += "*";
      } else {
        Text += " ";
      }
    }
    Text += "\n";
  }

  if (SnakeGame.GameOver) {
    Text += "\n  GAME OVER! Final Score: " + SnakeGame.Score + "\n";
    Text += "  Press Enter to restart or Escape to exit\n";
  }

  return Text + "\n";
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// TETRIS

let InTetrisGame = false;
let TetrisGame = {};

const TETRIS_PIECES = [
  { shape: [[1, 1, 1, 1]], color: "I" },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "O",
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "T",
  },
  {
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: "L",
  },
  {
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: "J",
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "S",
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "Z",
  },
];

function TetrisInit() {
  const W = 12,
    H = 22;
  TetrisGame = {
    Width: W,
    Height: H,
    Board: Array.from({ length: H }, () => Array(W).fill(0)),
    Current: null,
    CurrentX: 0,
    CurrentY: 0,
    Score: 0,
    GameOver: false,
    Interval: null,
  };
  TetrisSpawn();
  if (TetrisGame.Interval) clearInterval(TetrisGame.Interval);
  TetrisGame.Interval = setInterval(() => {
    if (InTetrisGame) TetrisMoveDown();
  }, 400);
}

function TetrisSpawn() {
  const piece = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
  TetrisGame.Current = piece.shape.map((r) => [...r]);
  TetrisGame.CurrentX = Math.floor(
    (TetrisGame.Width - TetrisGame.Current[0].length) / 2,
  );
  TetrisGame.CurrentY = 0;
  if (
    TetrisCollides(TetrisGame.Current, TetrisGame.CurrentX, TetrisGame.CurrentY)
  ) {
    TetrisGame.GameOver = true;
    clearInterval(TetrisGame.Interval);
  }
}

function TetrisCollides(piece, px, py) {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      if (!piece[r][c]) continue;
      const nx = px + c,
        ny = py + r;
      if (nx < 0 || nx >= TetrisGame.Width || ny >= TetrisGame.Height)
        return true;
      if (ny >= 0 && TetrisGame.Board[ny][nx]) return true;
    }
  }
  return false;
}

function TetrisPlace() {
  const { Current, CurrentX, CurrentY, Board, Width } = TetrisGame;
  for (let r = 0; r < Current.length; r++)
    for (let c = 0; c < Current[r].length; c++)
      if (Current[r][c] && CurrentY + r >= 0)
        Board[CurrentY + r][CurrentX + c] = 1;
  // Clear full rows
  let cleared = 0;
  for (let r = TetrisGame.Height - 1; r >= 0; r--) {
    if (Board[r].every((v) => v)) {
      Board.splice(r, 1);
      Board.unshift(Array(Width).fill(0));
      cleared++;
      r++;
    }
  }
  TetrisGame.Score += [0, 100, 300, 500, 800][Math.min(cleared, 4)];
  TetrisSpawn();
}

function TetrisMoveLeft() {
  if (
    !TetrisCollides(
      TetrisGame.Current,
      TetrisGame.CurrentX - 1,
      TetrisGame.CurrentY,
    )
  )
    TetrisGame.CurrentX--;
}
function TetrisMoveRight() {
  if (
    !TetrisCollides(
      TetrisGame.Current,
      TetrisGame.CurrentX + 1,
      TetrisGame.CurrentY,
    )
  )
    TetrisGame.CurrentX++;
}
function TetrisMoveDown() {
  if (
    !TetrisCollides(
      TetrisGame.Current,
      TetrisGame.CurrentX,
      TetrisGame.CurrentY + 1,
    )
  )
    TetrisGame.CurrentY++;
  else TetrisPlace();
}
function TetrisRotate() {
  const rotated = TetrisGame.Current[0].map((_, i) =>
    TetrisGame.Current.map((r) => r[i]).reverse(),
  );
  if (!TetrisCollides(rotated, TetrisGame.CurrentX, TetrisGame.CurrentY))
    TetrisGame.Current = rotated;
}

function TetrisRender() {
  const { Width, Height, Board, Current, CurrentX, CurrentY, Score, GameOver } =
    TetrisGame;
  const display = Board.map((r) => [...r]);
  for (let r = 0; r < Current.length; r++)
    for (let c = 0; c < Current[r].length; c++)
      if (Current[r][c] && CurrentY + r >= 0 && CurrentY + r < Height)
        display[CurrentY + r][CurrentX + c] = 2;

  let text = `\n TETRIS          Score: ${Score}\n`;
  text += " \u250C" + "\u2500".repeat(Width) + "\u2510\n";
  for (let r = 2; r < Height; r++) {
    text += " \u2502";
    for (let c = 0; c < Width; c++) {
      text += display[r][c] === 2 ? "#" : display[r][c] ? "\u2588" : " ";
    }
    text += "\u2502\n";
  }
  text += " \u2514" + "\u2500".repeat(Width) + "\u2518\n";
  if (GameOver) {
    text += "\n  GAME OVER! Score: " + Score + "\n";
    text += "  Enter to restart, Escape to exit\n";
  }
  return text;
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// MINESWEEPER

let InMinesweeperGame = false;
let MinesweeperGame = {};

function MinesweeperInit() {
  const W = 16,
    H = 14,
    Mines = 25;
  const board = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adj: 0,
    })),
  );
  // Place mines
  let placed = 0;
  while (placed < Mines) {
    const x = Math.floor(Math.random() * W),
      y = Math.floor(Math.random() * H);
    if (!board[y][x].mine) {
      board[y][x].mine = true;
      placed++;
    }
  }
  // Calc adjacency
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (board[y][x].mine) continue;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy,
            nx = x + dx;
          if (ny >= 0 && ny < H && nx >= 0 && nx < W && board[ny][nx].mine)
            count++;
        }
      board[y][x].adj = count;
    }
  MinesweeperGame = {
    Width: W,
    Height: H,
    Board: board,
    CursorX: Math.floor(W / 2),
    CursorY: Math.floor(H / 2),
    Mines,
    GameOver: false,
    Won: false,
    FlagsLeft: Mines,
  };
}

function MinesweeperReveal(x, y) {
  const { Board, Width, Height } = MinesweeperGame;
  const cell = Board[y][x];
  if (cell.flagged || cell.revealed) return;
  cell.revealed = true;
  if (cell.mine) {
    MinesweeperGame.GameOver = true;
    return;
  }
  if (cell.adj === 0) {
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx,
          ny = y + dy;
        if (
          nx >= 0 &&
          nx < Width &&
          ny >= 0 &&
          ny < Height &&
          !Board[ny][nx].revealed
        )
          MinesweeperReveal(nx, ny);
      }
  }
  // Win check
  const totalSafe = Width * Height - MinesweeperGame.Mines;
  const revealed = MinesweeperGame.Board.flat().filter(
    (c) => c.revealed,
  ).length;
  if (revealed === totalSafe) {
    MinesweeperGame.Won = true;
    MinesweeperGame.GameOver = true;
  }
}

function MinesweeperFlag(x, y) {
  const cell = MinesweeperGame.Board[y][x];
  if (cell.revealed) return;
  if (cell.flagged) {
    cell.flagged = false;
    MinesweeperGame.FlagsLeft++;
  } else if (MinesweeperGame.FlagsLeft > 0) {
    cell.flagged = true;
    MinesweeperGame.FlagsLeft--;
  }
}

function MinesweeperRender() {
  const { Width, Height, Board, CursorX, CursorY, FlagsLeft, GameOver, Won } =
    MinesweeperGame;
  let text = `\n MINESWEEPER  Flags: ${FlagsLeft}\n`;
  text += " \u250C" + "\u2500".repeat(Width * 2 + 1) + "\u2510\n";
  for (let y = 0; y < Height; y++) {
    text += " \u2502 ";
    for (let x = 0; x < Width; x++) {
      const cell = Board[y][x];
      const cursor = x === CursorX && y === CursorY;
      let ch;
      if (cell.flagged) ch = "F";
      else if (!cell.revealed) ch = cursor ? "[" : ".";
      else if (cell.mine) ch = "*";
      else ch = cell.adj > 0 ? String(cell.adj) : " ";
      text += cursor && cell.revealed ? "[" : ch;
      text +=
        cursor && cell.revealed ? "]" : cursor && !cell.revealed ? "]" : " ";
    }
    text += "\u2502\n";
  }
  text += " \u2514" + "\u2500".repeat(Width * 2 + 1) + "\u2518\n";
  if (GameOver) {
    text += Won
      ? "\n  YOU WIN! Enter: new game, Escape: exit\n"
      : "\n  BOOM! Game Over. Enter: new game, Escape: exit\n";
  } else {
    text += "\n  Arrows: move  Enter: reveal  F: flag\n";
  }
  return text;
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// PONG

let InPongGame = false;
let PongGame = {};

function PongInit() {
  const W = 40,
    H = 20;
  PongGame = {
    Width: W,
    Height: H,
    BallX: W / 2,
    BallY: H / 2,
    BallDX: 1,
    BallDY: 0.7,
    PaddleY: H / 2 - 2,
    PaddleH: 4,
    AiY: H / 2 - 2,
    Score: 0,
    AiScore: 0,
    GameOver: false,
    PaddleUp: false,
    PaddleDown: false,
    Interval: null,
  };
  if (PongGame.Interval) clearInterval(PongGame.Interval);
  PongGame.Interval = setInterval(() => {
    if (InPongGame) PongUpdate();
  }, 80);
}

function PongUpdate() {
  const G = PongGame;
  if (G.GameOver) return;

  // Move ball
  G.BallX += G.BallDX;
  G.BallY += G.BallDY;

  // Top/bottom bounce
  if (G.BallY <= 0) {
    G.BallY = 0;
    G.BallDY = Math.abs(G.BallDY);
  }
  if (G.BallY >= G.Height - 1) {
    G.BallY = G.Height - 1;
    G.BallDY = -Math.abs(G.BallDY);
  }

  // Player paddle
  if (G.PaddleUp) {
    G.PaddleY = Math.max(0, G.PaddleY - 1);
    G.PaddleUp = false;
  }
  if (G.PaddleDown) {
    G.PaddleY = Math.min(G.Height - G.PaddleH, G.PaddleY + 1);
    G.PaddleDown = false;
  }

  // AI paddle (simple tracking)
  if (G.AiY + G.PaddleH / 2 < G.BallY)
    G.AiY = Math.min(G.Height - G.PaddleH, G.AiY + 1);
  else if (G.AiY + G.PaddleH / 2 > G.BallY) G.AiY = Math.max(0, G.AiY - 1);

  // Player paddle collision (left side, x=1)
  if (
    G.BallX <= 2 &&
    G.BallY >= G.PaddleY &&
    G.BallY <= G.PaddleY + G.PaddleH
  ) {
    G.BallDX = Math.abs(G.BallDX);
    G.BallDY += (G.BallY - (G.PaddleY + G.PaddleH / 2)) * 0.15;
  }

  // AI paddle collision (right side)
  if (
    G.BallX >= G.Width - 3 &&
    G.BallY >= G.AiY &&
    G.BallY <= G.AiY + G.PaddleH
  ) {
    G.BallDX = -Math.abs(G.BallDX);
  }

  // Scoring
  if (G.BallX < 0) {
    G.AiScore++;
    G.BallX = G.Width / 2;
    G.BallY = G.Height / 2;
    G.BallDX = 1;
  }
  if (G.BallX >= G.Width) {
    G.Score++;
    G.BallX = G.Width / 2;
    G.BallY = G.Height / 2;
    G.BallDX = -1;
  }
  if (G.Score >= 7 || G.AiScore >= 7) {
    G.GameOver = true;
    clearInterval(G.Interval);
  }
}

function PongRender() {
  const G = PongGame;
  let text = `\n PONG   You: ${G.Score}  AI: ${G.AiScore}\n`;
  text += " \u250C" + "\u2500".repeat(G.Width) + "\u2510\n";
  for (let y = 0; y < G.Height; y++) {
    text += " \u2502";
    for (let x = 0; x < G.Width; x++) {
      const bx = Math.round(G.BallX),
        by = Math.round(G.BallY);
      if (x === 1 && y >= G.PaddleY && y < G.PaddleY + G.PaddleH)
        text += "\u2588";
      else if (x === G.Width - 2 && y >= G.AiY && y < G.AiY + G.PaddleH)
        text += "\u2588";
      else if (x === bx && y === by) text += "O";
      else text += " ";
    }
    text += "\u2502\n";
  }
  text += " \u2514" + "\u2500".repeat(G.Width) + "\u2518\n";
  if (G.GameOver)
    text += `\n  ${G.Score >= 7 ? "YOU WIN!" : "AI WINS!"}  Enter: rematch  Escape: exit\n`;
  else text += "\n  Arrows Up/Down to move your paddle (left)\n";
  return text;
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// BREAKOUT

let InBreakoutGame = false;
let BreakoutGame = {};

function BreakoutInit() {
  const W = 36,
    H = 22;
  const bricks = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 11; c++)
      bricks.push({ x: c * 3 + 2, y: r + 2, alive: true });
  BreakoutGame = {
    Width: W,
    Height: H,
    BallX: W / 2,
    BallY: H - 4,
    BallDX: 0.8,
    BallDY: -0.9,
    PaddleX: W / 2 - 3,
    PaddleW: 7,
    Bricks: bricks,
    Score: 0,
    GameOver: false,
    Won: false,
    PaddleLeft: false,
    PaddleRight: false,
    Interval: null,
  };
  if (BreakoutGame.Interval) clearInterval(BreakoutGame.Interval);
  BreakoutGame.Interval = setInterval(() => {
    if (InBreakoutGame) BreakoutUpdate();
  }, 60);
}

function BreakoutUpdate() {
  const G = BreakoutGame;
  if (G.GameOver) return;

  if (G.PaddleLeft) {
    G.PaddleX = Math.max(1, G.PaddleX - 2);
    G.PaddleLeft = false;
  }
  if (G.PaddleRight) {
    G.PaddleX = Math.min(G.Width - G.PaddleW - 1, G.PaddleX + 2);
    G.PaddleRight = false;
  }

  G.BallX += G.BallDX;
  G.BallY += G.BallDY;

  if (G.BallX <= 1) {
    G.BallX = 1;
    G.BallDX = Math.abs(G.BallDX);
  }
  if (G.BallX >= G.Width - 2) {
    G.BallX = G.Width - 2;
    G.BallDX = -Math.abs(G.BallDX);
  }
  if (G.BallY <= 1) {
    G.BallY = 1;
    G.BallDY = Math.abs(G.BallDY);
  }
  if (G.BallY >= G.Height) {
    G.GameOver = true;
    clearInterval(G.Interval);
    return;
  }

  // Paddle collision
  const bx = Math.round(G.BallX),
    by = Math.round(G.BallY);
  if (by === G.Height - 2 && bx >= G.PaddleX && bx < G.PaddleX + G.PaddleW) {
    G.BallDY = -Math.abs(G.BallDY);
    G.BallDX += (bx - (G.PaddleX + G.PaddleW / 2)) * 0.05;
  }

  // Brick collision
  for (const brick of G.Bricks) {
    if (!brick.alive) continue;
    if (Math.abs(bx - brick.x) <= 1 && Math.round(G.BallY) === brick.y) {
      brick.alive = false;
      G.Score += 10;
      G.BallDY *= -1;
      break;
    }
  }
  if (G.Bricks.every((b) => !b.alive)) {
    G.Won = true;
    G.GameOver = true;
    clearInterval(G.Interval);
  }
}

function BreakoutRender() {
  const G = BreakoutGame;
  const grid = Array.from({ length: G.Height }, () => Array(G.Width).fill(" "));
  // Bricks
  for (const b of G.Bricks)
    if (b.alive) {
      grid[b.y][b.x - 1] = "[";
      grid[b.y][b.x] = "=";
      grid[b.y][b.x + 1] = "]";
    }
  // Ball
  const bx = Math.max(1, Math.min(G.Width - 2, Math.round(G.BallX)));
  const by = Math.max(1, Math.min(G.Height - 1, Math.round(G.BallY)));
  grid[by][bx] = "O";
  // Paddle
  for (let i = 0; i < G.PaddleW; i++) grid[G.Height - 2][G.PaddleX + i] = "=";

  let text = `\n BREAKOUT       Score: ${G.Score}\n`;
  text += " \u250C" + "\u2500".repeat(G.Width) + "\u2510\n";
  for (const row of grid) text += " \u2502" + row.join("") + "\u2502\n";
  text += " \u2514" + "\u2500".repeat(G.Width) + "\u2518\n";
  if (G.GameOver)
    text += G.Won
      ? "\n  YOU WIN! Enter: new game  Escape: exit\n"
      : "\n  GAME OVER! Enter: new game  Escape: exit\n";
  else text += "\n  Arrow Left/Right to move paddle\n";
  return text;
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// 2048

let In2048Game = false;
let Game2048 = {};

function Game2048Init() {
  Game2048 = {
    Board: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    Score: 0,
    GameOver: false,
  };
  Game2048AddTile();
  Game2048AddTile();
}

function Game2048AddTile() {
  const empty = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) if (!Game2048.Board[r][c]) empty.push([r, c]);
  if (!empty.length) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  Game2048.Board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function Game2048Slide(row) {
  let arr = row.filter((v) => v);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      Game2048.Score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < 4) arr.push(0);
  return arr;
}

function Game2048Move(dir) {
  const B = Game2048.Board;
  let moved = false;
  const orig = B.map((r) => [...r]);

  if (dir === "left") {
    for (let r = 0; r < 4; r++) B[r] = Game2048Slide(B[r]);
  }
  if (dir === "right") {
    for (let r = 0; r < 4; r++)
      B[r] = Game2048Slide([...B[r]].reverse()).reverse();
  }
  if (dir === "up") {
    for (let c = 0; c < 4; c++) {
      const col = Game2048Slide([B[0][c], B[1][c], B[2][c], B[3][c]]);
      for (let r = 0; r < 4; r++) B[r][c] = col[r];
    }
  }
  if (dir === "down") {
    for (let c = 0; c < 4; c++) {
      const col = Game2048Slide([B[3][c], B[2][c], B[1][c], B[0][c]]);
      for (let r = 0; r < 4; r++) B[3 - r][c] = col[r];
    }
  }

  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) if (B[r][c] !== orig[r][c]) moved = true;
  if (moved) Game2048AddTile();

  // Check game over
  let canMove = false;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (!B[r][c]) {
        canMove = true;
        break;
      }
      if (c < 3 && B[r][c] === B[r][c + 1]) {
        canMove = true;
        break;
      }
      if (r < 3 && B[r][c] === B[r + 1][c]) {
        canMove = true;
        break;
      }
    }
  if (!canMove) Game2048.GameOver = true;
}

function Game2048Render() {
  const B = Game2048.Board;
  const line = " +" + "-----+".repeat(4);
  let text = `\n 2048              Score: ${Game2048.Score}\n`;
  text += line + "\n";
  for (let r = 0; r < 4; r++) {
    text += " |";
    for (let c = 0; c < 4; c++) {
      const val = B[r][c] ? String(B[r][c]).padStart(4) : "    ";
      text += val + " |";
    }
    text += "\n" + line + "\n";
  }
  if (Game2048.GameOver)
    text +=
      "\n  GAME OVER! Score: " +
      Game2048.Score +
      "\n  Enter: new game  Escape: exit\n";
  else text += "\n  Arrow keys to slide tiles\n";
  return text;
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// MAZE

let InMazeGame = false;
let MazeGame = {};

function MazeInit() {
  const W = 27,
    H = 19;
  // Generate maze using recursive backtracker on odd cells
  const grid = Array.from({ length: H }, () => Array(W).fill(1)); // 1 = wall
  function carve(x, y) {
    const dirs = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = x + dx,
        ny = y + dy;
      if (nx > 0 && nx < W - 1 && ny > 0 && ny < H - 1 && grid[ny][nx] === 1) {
        grid[ny - dy / 2][nx - dx / 2] = 0;
        grid[ny][nx] = 0;
        carve(nx, ny);
      }
    }
  }
  grid[1][1] = 0;
  carve(1, 1);
  // Place exit
  grid[H - 2][W - 2] = 0;

  MazeGame = {
    Width: W,
    Height: H,
    Grid: grid,
    PlayerX: 1,
    PlayerY: 1,
    Won: false,
  };
}

function MazeMove(dx, dy) {
  const { Grid, Width, Height } = MazeGame;
  const nx = MazeGame.PlayerX + dx,
    ny = MazeGame.PlayerY + dy;
  if (nx >= 0 && nx < Width && ny >= 0 && ny < Height && Grid[ny][nx] === 0) {
    MazeGame.PlayerX = nx;
    MazeGame.PlayerY = ny;
    if (nx === Width - 2 && ny === Height - 2) MazeGame.Won = true;
  }
}

function MazeRender() {
  const { Width, Height, Grid, PlayerX, PlayerY, Won } = MazeGame;
  let text = "\n MAZE  Find the exit [E]\n\n";
  for (let y = 0; y < Height; y++) {
    text += " ";
    for (let x = 0; x < Width; x++) {
      if (x === PlayerX && y === PlayerY) text += "@";
      else if (x === Width - 2 && y === Height - 2) text += "E";
      else text += Grid[y][x] ? "\u2588" : " ";
    }
    text += "\n";
  }
  if (Won) text += "\n  YOU ESCAPED! Enter: new maze  Escape: exit\n";
  else text += "\n  Arrow keys to move\n";
  return text;
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// TYPING SPEED TEST

let InTypeTestGame = false;
let TypeTestGame = {};

const TYPETEST_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way"
];

function TypeTestInit() {
  let words = [];
  for (let i = 0; i < 15; i++) {
    words.push(TYPETEST_WORDS[Math.floor(Math.random() * TYPETEST_WORDS.length)]);
  }
  TypeTestGame = {
    Phrase: words.join(" "),
    Typed: "",
    Start: null,
    Done: false,
    WPM: 0,
    Errors: 0,
  };
}

function TypeTestKeyPress(key) {
  const G = TypeTestGame;
  if (G.Done) return;
  if (key === "Backspace") {
    G.Typed = G.Typed.slice(0, -1);
    return;
  }
  if (key.length !== 1) return;
  if (!G.Start) G.Start = Date.now();

  const expected = G.Phrase[G.Typed.length];
  if (key !== expected) G.Errors++;
  G.Typed += key;

  if (G.Typed.length >= G.Phrase.length) {
    const elapsed = (Date.now() - G.Start) / 1000 / 60;
    G.WPM = Math.round((G.Typed.length / 5) / elapsed);
    G.Done = true;
  }
}

function TypeTestRender() {
  const G = TypeTestGame;
  const W = 50;
  let text = "\n TYPING SPEED TEST\n";
  text += " \u250C" + "\u2500".repeat(W) + "\u2510\n";

  // Show phrase with typed chars marked
  const words = G.Phrase.split(" ");
  let charIndex = 0;
  let line = "";
  const lines = [];
  for (const word of words) {
    if (line.length + word.length + 1 > W - 2) {
      lines.push(line);
      line = "";
    }
    line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);

  let globalIdx = 0;
  for (const l of lines) {
    let rendered = " \u2502 ";
    for (const ch of l) {
      if (globalIdx < G.Typed.length) {
        rendered += G.Typed[globalIdx] === ch ? ch : "_";
      } else if (globalIdx === G.Typed.length) {
        rendered += "[" + ch;
      } else {
        rendered += ch;
      }
      globalIdx++;
    }
    // pad
    const hasBracket = rendered.includes("[");
    const spacesNeeded = W - l.length - (hasBracket ? 1 : 0);
    rendered += " ".repeat(Math.max(0, spacesNeeded));
    text += rendered + " \u2502\n";
  }

  text += " \u2514" + "\u2500".repeat(W) + "\u2518\n";

  if (G.Done) {
    text += `\n  Done! WPM: ${G.WPM}  Errors: ${G.Errors}\n`;
    text += "  Enter: new test  Escape: exit\n";
  } else if (!G.Start) {
    text += "\n  Start typing to begin the timer!\n";
  } else {
    const elapsed = (Date.now() - G.Start) / 1000 / 60;
    const liveWpm = elapsed > 0 ? Math.round((G.Typed.length / 5) / elapsed) : 0;
    text += `\n  Live WPM: ${liveWpm}  |  ${G.Typed.length}/${G.Phrase.length} chars  |  Errors: ${G.Errors}\n`;
  }
  return text;
}
