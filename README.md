# ⚡ NEON ARCADE — Cyberpunk Gaming Hub

<div align="center">

![Status](https://img.shields.io/badge/STATUS-IN_DEVELOPMENT-ff2d95?style=for-the-badge&labelColor=0a0a0f)
![Tech](https://img.shields.io/badge/STACK-HTML%20%7C%20CSS%20%7C%20JS-00f0ff?style=for-the-badge&labelColor=0a0a0f)
![Games](https://img.shields.io/badge/GAMES-5_MINI_GAMES-39ff14?style=for-the-badge&labelColor=0a0a0f)
![Dependencies](https://img.shields.io/badge/DEPENDENCIES-ZERO-bf00ff?style=for-the-badge&labelColor=0a0a0f)

### *A retro-futuristic cyberpunk web arcade — 5 games, zero dependencies, pure browser mayhem.*

</div>

---

## 🌆 What is Neon Arcade?

**Neon Arcade** is a fully interactive, browser-based gaming hub styled after the neon-drenched streets of a cyberpunk megacity. It houses **5 handcrafted mini-games** across different genres — all built from scratch with vanilla HTML, CSS, and JavaScript.

No frameworks. No npm. No build tools. Just open `index.html` and play.

---

## 🎮 The Games

| # | Game | Genre | Controls | Description |
|---|------|-------|----------|-------------|
| 1 | **🐍 Snake Neon** | Arcade | Arrow Keys / WASD | Classic snake reimagined with neon trails, power-ups, and an ever-increasing challenge |
| 2 | **🧠 Memory Matrix** | Puzzle | Mouse | A cyberpunk pattern-memory challenge — watch the grid flash, replicate the sequence |
| 3 | **🧩 Trivia Blitz** | Knowledge | Mouse / Keys 1-4 | 15-second lightning rounds across Science, Tech, Gaming, History & Pop Culture |
| 4 | **⚡ Reflex Rush** | Reaction | Mouse / Space | Three reflex modes — Color Shift, Whack-a-Mole, and Target Shoot. Milliseconds matter. |
| 5 | **⌨️ Type Racer** | Typing | Keyboard | Race against the clock typing words and famous quotes. Track your WPM in real-time. |

---

## ✨ Features

- 🎨 **Cyberpunk UI** — Glitch effects, scanlines, neon glows, rain particles, and dark futuristic panels
- 🏆 **Persistent Leaderboards** — High scores saved to LocalStorage across sessions
- 🎖️ **Achievement System** — 12+ unlockable badges with toast notifications
- 🔊 **Procedural Audio** — All sound effects generated via Web Audio API (no external files)
- 📱 **Responsive** — Plays on desktop, tablet, and mobile
- ⚡ **Instant Load** — Zero dependencies, no build step, no network requests needed

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/SKYLINE217/hackathon.git

# Open in browser — that's it!
open index.html
```

Or simply double-click `index.html`. No server required.

For development with live reload:
```bash
# Any simple HTTP server works
npx -y serve .
```

---

## 🏗️ Project Structure

```
hackathon/
├── index.html                  # Single entry point
├── README.md                   # You are here
├── css/
│   ├── main.css                # Global design system & cyberpunk theme
│   ├── hub.css                 # Hub/lobby screen
│   └── games/
│       ├── snake.css           # Snake Neon
│       ├── memory.css          # Memory Matrix
│       ├── trivia.css          # Trivia Blitz
│       ├── reflex.css          # Reflex Rush
│       └── typeracer.css       # Type Racer
├── js/
│   ├── app.js                  # Main controller & screen router
│   ├── engine/
│   │   ├── GameEngine.js       # Base game loop (requestAnimationFrame)
│   │   ├── StorageManager.js   # LocalStorage persistence
│   │   ├── AudioManager.js     # Web Audio API sound generator
│   │   ├── ParticleSystem.js   # Reusable particle effects
│   │   └── AchievementSystem.js# Achievement tracking & notifications
│   └── games/
│       ├── SnakeGame.js        # Snake Neon logic
│       ├── MemoryGame.js       # Memory Matrix logic
│       ├── TriviaGame.js       # Trivia Blitz logic
│       ├── ReflexGame.js       # Reflex Rush logic
│       └── TypeRacerGame.js    # Type Racer logic
└── data/
    └── trivia-questions.json   # 50+ trivia questions
```

---

## 🎨 Design Philosophy

The UI draws from cyberpunk aesthetics:

- **Color Palette:** Hot pink (`#ff2d95`), electric cyan (`#00f0ff`), toxic green (`#39ff14`), deep purple (`#bf00ff`) against near-black backgrounds
- **Typography:** Orbitron (headings) + Rajdhani (body) + Fira Code (monospace)
- **Effects:** CSS-driven scanlines, glitch text animations, neon box-shadows, rain particle overlay
- **Panels:** Frosted glass with colored borders, mimicking holographic displays

---

## 🏆 Achievements

| Badge | Name | Unlock Condition |
|-------|------|-----------------|
| 🎮 | First Blood | Complete any game |
| 🐍 | Snake Charmer | Score 500+ in Snake Neon |
| 🧠 | Perfect Memory | Clear Memory Matrix level 10+ |
| 🧩 | Trivia Master | 10/10 correct in Trivia Blitz |
| ⚡ | Lightning Reflexes | Sub-200ms average in Reflex Rush |
| ⌨️ | Speed Demon | 80+ WPM in Type Racer |
| 🕹️ | Arcade Veteran | Play all 5 games |
| 💰 | High Roller | 10,000 total accumulated points |
| 🎯 | Perfectionist | 100% accuracy in Type Racer |
| 🔥 | Streak Master | 5+ correct streak in Trivia |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 (semantic, accessible) |
| Styling | Vanilla CSS3 (custom properties, animations, grid, flexbox) |
| Logic | Vanilla ES6+ JavaScript (classes, modules, async/await) |
| Graphics | HTML5 Canvas API (Snake game) |
| Audio | Web Audio API (procedural sound generation) |
| Storage | LocalStorage API (scores, achievements, settings) |
| Timing | `performance.now()` (sub-millisecond precision) |

---

## 👨‍💻 Author

**SKYLINE217**

---

<div align="center">

*Built for the Hackathon — Theme: Games*

**[ N E O N &nbsp; A R C A D E ]**

</div>
