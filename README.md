# GameDNA 🎮

> **Note: This is currently a UI mockup / prototype.** The frontend is built with real code and a working recommendation engine, but all data is mocked. The full backend (ASP.NET Core + PostgreSQL) is under active development.
>
> ![GameDNA Dashboard](GameDev/GameDevPrototype.png)

GameDNA is a game recommendation platform that helps players discover new games based on the games they actually enjoy and complete. Rather than surfacing whatever is trending or sponsored, GameDNA analyzes your real play history — your completion patterns, playtime, achievements, favorite genres, and preferred developers — to build a personalized "Gaming DNA" profile and generate recommendations that actually fit you.

---

## Goals

- **Personalized discovery** — recommend games based on what you've played and finished, not just what's popular
- **Gaming DNA profile** — visualize your taste as a player: favorite genres, tags, developers, completion rate, average playtime
- **Steam integration** — connect your Steam account to sync your library automatically (planned)
- **Sales recommendations** — surface games on sale that match your profile, scored by both fit and discount value
- **Built to grow** — architecture designed to support additional platforms (Xbox, PSN, Epic) and an AI-powered recommendation engine in the future

---

## Current Status

This repository currently contains a **frontend prototype** built to validate the UI, user flows, and recommendation logic before the full backend is implemented.

| Feature | Status |
|---|---|
| Dashboard | ✅ Mockup complete |
| My Library (add/filter/update games) | ✅ Mockup complete |
| Recommendations engine | ✅ Working (mock data) |
| Sales recommendations | ✅ Working (mock data) |
| Gaming DNA radar profile | ✅ Working (mock data) |
| ASP.NET Core backend | 🔧 In progress |
| PostgreSQL database + EF Core | 🔧 In progress |
| Steam OAuth + sync | 📋 Planned |
| Real user authentication (JWT) | 📋 Planned |
| Live game metadata | 📋 Planned |

---

## Tech Stack

### Frontend (current prototype)
- [React](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) — build tool and dev server
- TypeScript — type safety

### Planned backend
- ASP.NET Core (.NET 9) — REST API
- C# — backend language
- PostgreSQL — database
- Entity Framework Core — ORM and migrations
- JWT — authentication
- Steam Web API — game library sync

---

## Recommendation Engine

The prototype includes a working scoring algorithm that weights:

| Factor | Weight |
|---|---|
| Genre match | 40% |
| Gameplay tag match | 30% |
| Developer match | 15% |
| Completion pattern match | 10% |
| Popularity score | 5% |

Sales recommendations blend **80% recommendation match** with **20% discount value**.

---

## Running the Prototype

```bash
# Clone the repo
git clone https://github.com/your-username/gamedna.git
cd gamedna

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open `http://localhost:5173` in your browser.

No backend or database required — everything runs on mock data in the browser.

---

## Project Structure (planned full build)

```
GameDNA/
├── src/
│   └── GameDNA.Api/          # ASP.NET Core Web API
│       ├── Models/           # EF Core entities
│       ├── Controllers/      # REST endpoints
│       ├── Services/         # Recommendation, Steam sync, Sales
│       ├── DTOs/             # Request/response shapes
│       └── Data/             # DbContext and migrations
├── frontend/                 # React + Vite frontend
├── docker-compose.yml        # Docker setup (planned)
└── README.md
```

---

## License

MIT
