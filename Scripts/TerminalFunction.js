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
              "This section contains links to various projects I \nhave worked on.Use 'start <project_name.lnk>' to \nopen a project link in your browser.",
          },
          "01_date_sheet_mgmt.lnk": {
            type: "link",
            content: "https://ds-cuk.vercel.app/",
            description:
              "Web App: Date Sheet Management (TypeScript, React, TailwindCSS, PostgreSQL, Vercel)",
          },
          "02_cancer_diagnosis.lnk": {
            type: "link",
            content:
              "https://github.com/m4milaad/Pyhton-Projects/tree/main/Coffee%20Machine",
            description:
              "Cancer Diagnosis Model (Python, Scikit-learn, Pandas, NumPy) - Note: Link is to Coffee Machine repo as per index.html",
          },
          "03_yge_website.lnk": {
            type: "link",
            content: "https://yge.ct.ws/",
            description:
              "Website: Yuva Global Enterprises (HTML, CSS, JS, DNS)",
          },
          "04_states_game.lnk": {
            type: "link",
            content:
              "https://github.com/m4milaad/Pyhton-Projects/tree/main/States%20Guessing%20Game",
            description: "States Guessing Game (Python, Pandas, Turtle Game)",
          },
          "05_banking_system.lnk": {
            type: "link",
            content: "https://github.com/m4milaad/Banking-System-",
            description: "Banking System (Java, OOP, CLI Application)",
          },
          "06_peek_hour.lnk": {
            type: "link",
            content:
              "https://github.com/m4milaad/Pyhton-Projects/tree/main/Peek%20Hour",
            description: "Peek Hour Game (Python, Turtle Game)",
          },
        },
      },
      games: {
        type: "directory",
        contents: {
          "games.txt": {
            type: "file",
            content:
              "Welcome to the Games Directory!\nType the game name as a command to play.\n\nAvailable games:\n  snake      Classic Snake\n  tetris     Falling blocks\n  minesweeper  Find the mines\n  pong       Ball & paddle\n  breakout   Brick breaker\n  2048       Slide & merge tiles\n  maze       Navigate the dungeon\n  typetest   Typing speed test\n\nControls: Arrow keys to move, Escape to exit.",
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
          "Technologist skilled in Python (Django, Flask, \nPandas, NumPy, Matplotlib, Scikit-learn), C, \nJava (Collections Framework), HTML, CSS, \nJavaScript (React, Vue.js, TypeScript, Bootstrap, \nTailwind CSS, Express.js, Node.js), and C++. \nExperienced with MongoDB, MySQL, PostgreSQL, \nAWS, Heroku, Netlify, Vercel, and Git. \nProficient with CLion, IntelliJ, Pycharm, and \nArduino integration.",
      },
      "experience.txt": {
        type: "file",
        content:
          "Skillified Mentor | June 2025\n- Built a machine learning model for cancer \n  diagnosis and analyzed the Framingham dataset.\n- (Certificate: ./Images/certificate.pdf)\n\nYuva Global Enterprises | Dec 2024 - Present\n- Led the development and maintenance of the \n  Yuva Global Enterprises website (HTML, CSS, JS).\n- Managed key digital operations.\n\nByteNovators | Feb 2024 - Dec 2024\n- Validated software quality and user experience \n  through comprehensive testing methodologies.\n- Managed Facebook leads and ads for clients.\n\nCurrent Projects | 2023 - Present\n- Engineered an interactive online resume website.\n- Key Python projects: Peek Hour, States Guessing Game.\n- Developed a Java-based banking system (OOP).",
      },
      "education.txt": {
        type: "file",
        content:
          "Central University of Kashmir, Gaderbal\n- Bachelor of Technology (B.Tech), CSE\n- Expected Graduation: July 2027\n- Relevant Coursework: C, Java.\n- Activities: Coding Competition, Event Management.\n\nSri Pratap Higher Secondary School, Srinagar\n- 10+2 | Graduated: 2022\n- Relevant Coursework: Non-Medical.\n- Activities: Badminton, Football, Table Tennis.",
      },
      "accolades.txt": {
        type: "file",
        content:
          "1st Position, Open Build Challenge | NIT Srinagar | 2025\n- Organised by FOSS NIT Srinagar in collabration with \n  FOSS United.\n\n3rd Position in Coding Competition | CUK | 2025\n- Hosted by Code Squad during Cyber Concave 2025.\n\nCoding Challenge (Participation) | Tech Summit IUST | 2025\n- Participated during Foundation Week at IUST.\n\nOCI 2025 Certified AI Foundations Associate | Oracle | 2025\n- Passed with 95%. Certified in AI concepts, OCI AI\n  services, model lifecycle, and cloud-based AI workflows.\n\n5-Day AI/ML Workshop | NIT Srinagar | 2025\n- Hands-on training in machine learning concepts and\n  practical implementation.\n\nCoordinator of Gaming Competition | CUK | 2025\n- Recognized for leadership during Cyber Concave 2025,\n  including the BGMI event.",
      },
      "plasma.exe": { type: "executable", content: "plasma" },
      games: {
        type: "directory",
        contents: {
          "games.txt": {
            type: "file",
            content:
              "Welcome to the Games Directory!\nType the game name as a command to play.\n\nAvailable games:\n  snake      Classic Snake\n  tetris     Falling blocks\n  minesweeper  Find the mines\n  pong       Ball & paddle\n  breakout   Brick breaker\n  2048       Slide & merge tiles\n  maze       Navigate the dungeon\n  typetest   Typing speed test\n\nControls: Arrow keys to move, Escape to exit.",
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
    },
  },
};

function ListFiles() {
  // Move to current folder
  let DirectoryContents = FileSystem.root;
  for (let Dir of Directory.slice(15).split("/").filter(Boolean)) {
    DirectoryContents = DirectoryContents.contents[Dir];
  }

  // Print directory being listed
  OutputsText += `\nC:/../${Directory.split("/").slice(-1)}`;

  // Print each file
  const Files = Object.keys(DirectoryContents.contents);
  for (let [Index, File] of Files.entries()) {
    OutputsText += `\n${Index == Files.length - 1 ? "┗" : "┣"}${File.includes(".") ? "━▷" : "━━━━"} ${File}`;
  }

  OutputsText += "\n\n";
}

function ChangeDirectory(InputDirectory) {
  let CurrentDirectory = Directory.slice(15).split("/").filter(Boolean);

  // Go back a folder
  if (InputDirectory === "..") {
    CurrentDirectory.pop();
  }

  // Return to root folder
  else if (InputDirectory === "/") {
    CurrentDirectory = [];
  }

  // Move to new folder
  else {
    // Move to current folder
    let DirectoryContents = FileSystem.root;
    for (let Dir of CurrentDirectory) {
      DirectoryContents = DirectoryContents.contents[Dir];
    }

    // Add new folder to path
    if (
      DirectoryContents.contents[InputDirectory] &&
      DirectoryContents.contents[InputDirectory].type === "directory"
    ) {
      CurrentDirectory.push(InputDirectory);
    }

    // Desired path dousnt exist
    else {
      OutputsText += `\ncd: '${InputDirectory}' No such directory\n\n`;
      return;
    }
  }

  Directory = `C:/Users/guest${CurrentDirectory.length ? "/" : ""}${CurrentDirectory.join("/")}`;
}

function StartFile(InputFile) {
  // Move to current folder
  let DirectoryContents = FileSystem.root;
  for (let Dir of Directory.slice(15).split("/").filter(Boolean)) {
    DirectoryContents = DirectoryContents.contents[Dir];
  }

  const fileData = DirectoryContents.contents[InputFile];

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
    }
  }
  // Selected file dousnt exist
  else {
    OutputsText += `\nstart: '${InputFile}' No such file\n\n`;
  }
}

// Modified ExecuteCommand function
function ExecuteCommand() {
  const [Command, ...Arguments] = InputText.split(" ");

  if (Command) {
    // Assuming ComputerBeep is defined elsewhere, if not, this will cause an error.
    // ComputerBeep.play();
    // ComputerBeep.currentTime = 0;
  }

  switch (Command) {
    case "ls":
      if (Arguments.length) {
        OutputsText += "\nError: 'ls' doesn't accept any arguments\n\n";
      } else {
        ListFiles();
      }
      break;

    case "cd":
      if (Arguments.length > 1) {
        OutputsText +=
          "\nError: 'cd' doesn't accept more that one argument\n\n";
      } else if (!Arguments.length) {
        OutputsText += "\nError: 'cd' requires a directory argument\n\n";
      } else {
        ChangeDirectory(Arguments[0]);
      }
      break;

    case "start":
      if (Arguments.length > 1) {
        OutputsText +=
          "\nError: 'start' doesn't accept more that one argument\n\n";
      } else if (!Arguments.length) {
        OutputsText += "\nError: 'start' requires a file argument\n\n";
      } else {
        StartFile(Arguments[0]);
      }
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
          "\nPress 'tab' for auto complete and 'esc' to exit\na program (.exe file)\n\nLS           Lists current directory contents\nCD           Change directory, '..' back, '/' root\nSTART        Opens specified file or link\nSNAKE        Classic Snake game\nTETRIS       Falling blocks game\nMINESWEEPER  Find the mines\nPONG         Ball & paddle game\n2048         Slide & merge tiles\nMAZE         Navigate the dungeon\nTYPETEST     Typing speed test\nCLEAR        Clears all previous terminal outputs\n\n";
      }
      break;

    case "":
      break;

    default:
      OutputsText += `\nCommand not found '${Command}'\n\n`;
  }
}

// Autocomplete function
function AutoComplete() {
  const [Command, Argument1] = InputText.split(" "); // Use Argument1 to avoid redeclaring Arguments
  const CommandsList = [
    "ls",
    "cd",
    "start",
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
      Element.startsWith(Command),
    );
    if (CompletedCommand.length === 1) {
      InputText = CompletedCommand[0] + " ";
    } else if (CompletedCommand.length > 1) {
      OutputsText += `\n${Directory}> ${InputText}\n`;
      OutputsText += CompletedCommand.join("  ") + "\n";
    }
  }

  // Auto comepleting a file name for 'cd' or 'start'
  else if (
    ["cd", "start"].includes(Command) &&
    InputText.split(" ").length === 2
  ) {
    let DirectoryContents = FileSystem.root;
    for (let Dir of Directory.slice(15).split("/").filter(Boolean)) {
      DirectoryContents = DirectoryContents.contents[Dir];
    }

    const PossibleCompletions = Object.keys(DirectoryContents.contents).filter(
      (Item) => Item.startsWith(Argument1),
    );

    if (PossibleCompletions.length === 1) {
      InputText = `${Command} ${PossibleCompletions[0]}`;
    } else if (PossibleCompletions.length > 1) {
      OutputsText += `\n${Directory}> ${InputText}\n`;
      OutputsText += PossibleCompletions.join("  ") + "\n";
    }
  }
  Blinker.Index = InputText.length; // Ensure blinker is at the end after autocomplete
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
