import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  username: "NovaStar",
  displayName: "Nova",
  email: "nova@example.com",
  avatarUrl: null,
  connectedAccounts: [{ provider: "Steam", displayName: "NovaStar_77", synced: "2 days ago" }],
  stats: { totalGames: 47, completed: 18, hoursPlayed: 1240, avgAchievements: 62 },
};

const GENRES = ["RPG", "Action", "Roguelike", "Strategy", "Platformer", "Horror", "Simulation", "Adventure"];
const TAGS = ["Open World", "Souls-like", "Turn-Based", "Co-op", "Story Rich", "Pixel Art", "Procedural", "Stealth"];
const DEVELOPERS = ["FromSoftware", "CD Projekt Red", "Supergiant Games", "Larian Studios", "Naughty Dog", "Valve", "Remedy Entertainment"];
const PUBLISHERS = ["Bandai Namco", "CD Projekt", "Supergiant Games", "Larian Studios", "Sony", "Valve", "Epic Games"];

const ALL_GAMES = [
  { id: "1", title: "Elden Ring", developer: "FromSoftware", publisher: "Bandai Namco", genres: ["RPG", "Action"], tags: ["Open World", "Souls-like"], coverColor: "#1a0a2e", popularity: 98, releaseDate: "2022-02-25", description: "An action RPG set in the Lands Between." },
  { id: "2", title: "Hades", developer: "Supergiant Games", publisher: "Supergiant Games", genres: ["Action", "Roguelike"], tags: ["Procedural", "Story Rich"], coverColor: "#2a0a0a", popularity: 96, releaseDate: "2020-09-17", description: "A rogue-like dungeon crawler from the creators of Bastion." },
  { id: "3", title: "Baldur's Gate 3", developer: "Larian Studios", publisher: "Larian Studios", genres: ["RPG", "Strategy"], tags: ["Turn-Based", "Co-op", "Story Rich"], coverColor: "#0a1a0a", popularity: 99, releaseDate: "2023-08-03", description: "A legendary RPG set in the Forgotten Realms." },
  { id: "4", title: "Cyberpunk 2077", developer: "CD Projekt Red", publisher: "CD Projekt", genres: ["RPG", "Action"], tags: ["Open World", "Story Rich", "Stealth"], coverColor: "#0a1a2a", popularity: 87, releaseDate: "2020-12-10", description: "An open-world action-adventure set in Night City." },
  { id: "5", title: "Dead Cells", developer: "Motion Twin", publisher: "Motion Twin", genres: ["Action", "Roguelike"], tags: ["Procedural", "Pixel Art"], coverColor: "#1a1a0a", popularity: 90, releaseDate: "2018-08-07", description: "A rogue-lite, Metroidvania-inspired action platformer." },
  { id: "6", title: "The Last of Us Part I", developer: "Naughty Dog", publisher: "Sony", genres: ["Action", "Adventure"], tags: ["Story Rich", "Stealth"], coverColor: "#0a1a0a", popularity: 95, releaseDate: "2022-09-02", description: "A cinematic action-adventure survival game." },
  { id: "7", title: "Into the Breach", developer: "Subset Games", publisher: "Subset Games", genres: ["Strategy", "Roguelike"], tags: ["Turn-Based", "Procedural"], coverColor: "#0a0a1a", popularity: 88, releaseDate: "2018-02-27", description: "Control powerful mechs from the future to defeat an alien threat." },
  { id: "8", title: "Control", developer: "Remedy Entertainment", publisher: "Epic Games", genres: ["Action", "Adventure"], tags: ["Story Rich", "Open World"], coverColor: "#1a0a1a", popularity: 85, releaseDate: "2019-08-27", description: "A supernatural action-adventure set in a brutalist government building." },
  { id: "9", title: "Hollow Knight", developer: "Team Cherry", publisher: "Team Cherry", genres: ["Action", "Platformer"], tags: ["Souls-like", "Pixel Art", "Story Rich"], coverColor: "#050510", popularity: 94, releaseDate: "2017-02-24", description: "A challenging 2D adventure through a vast ruined kingdom of insects." },
  { id: "10", title: "Divinity: Original Sin 2", developer: "Larian Studios", publisher: "Larian Studios", genres: ["RPG", "Strategy"], tags: ["Turn-Based", "Co-op", "Story Rich"], coverColor: "#1a0800", popularity: 92, releaseDate: "2017-09-14", description: "A fantasy RPG with deep strategic combat and co-op." },
  { id: "11", title: "Alan Wake 2", developer: "Remedy Entertainment", publisher: "Epic Games", genres: ["Horror", "Adventure"], tags: ["Story Rich", "Stealth"], coverColor: "#0a0a0a", popularity: 89, releaseDate: "2023-10-27", description: "A psychological horror game and long-awaited sequel." },
  { id: "12", title: "Stardew Valley", developer: "ConcernedApe", publisher: "ConcernedApe", genres: ["Simulation", "RPG"], tags: ["Pixel Art", "Co-op"], coverColor: "#0a1500", popularity: 97, releaseDate: "2016-02-26", description: "A farming simulation RPG." },
];

const INITIAL_USER_GAMES = [
  { gameId: "1", status: "Completed", playtimeMinutes: 9600, achievementPct: 78, source: "SteamSync" },
  { gameId: "2", status: "Completed", playtimeMinutes: 4800, achievementPct: 95, source: "SteamSync" },
  { gameId: "3", status: "Playing", playtimeMinutes: 3600, achievementPct: 32, source: "SteamSync" },
  { gameId: "4", status: "Dropped", playtimeMinutes: 1200, achievementPct: 15, source: "Manual" },
  { gameId: "9", status: "Completed", playtimeMinutes: 3000, achievementPct: 88, source: "SteamSync" },
  { gameId: "10", status: "Completed", playtimeMinutes: 7200, achievementPct: 60, source: "Manual" },
  { gameId: "12", status: "Playing", playtimeMinutes: 5400, achievementPct: 44, source: "Manual" },
];

// ─── RECOMMENDATION ENGINE ────────────────────────────────────────────────────

function computeGamingDNA(userGames) {
  const completed = userGames.filter(ug => ug.status === "Completed" || ug.status === "Playing");
  const genreCount = {}, tagCount = {}, devCount = {};
  let totalAch = 0, achCount = 0, totalTime = 0;

  completed.forEach(ug => {
    const game = ALL_GAMES.find(g => g.id === ug.gameId);
    if (!game) return;
    game.genres.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; });
    game.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
    devCount[game.developer] = (devCount[game.developer] || 0) + 1;
    if (ug.achievementPct != null) { totalAch += ug.achievementPct; achCount++; }
    totalTime += ug.playtimeMinutes;
  });

  const top = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);

  return {
    favoriteGenres: top(genreCount, 4),
    favoriteTags: top(tagCount, 5),
    favoriteDevelopers: top(devCount, 3),
    avgAchievementPct: achCount > 0 ? Math.round(totalAch / achCount) : 0,
    avgPlaytimeHours: Math.round(totalTime / 60 / Math.max(completed.length, 1)),
    completionRate: Math.round((userGames.filter(u => u.status === "Completed").length / Math.max(userGames.length, 1)) * 100),
    totalHours: Math.round(totalTime / 60),
  };
}

function generateRecommendations(userGames, dna) {
  const ownedIds = new Set(userGames.map(ug => ug.gameId));
  const completionRate = dna.completionRate / 100;

  return ALL_GAMES
    .filter(g => !ownedIds.has(g.id))
    .map(game => {
      const genreOverlap = game.genres.filter(g => dna.favoriteGenres.includes(g)).length;
      const genreScore = Math.min(genreOverlap / Math.max(dna.favoriteGenres.length, 1), 1) * 40;
      const tagOverlap = game.tags.filter(t => dna.favoriteTags.includes(t)).length;
      const tagScore = Math.min(tagOverlap / Math.max(game.tags.length, 1), 1) * 30;
      const devScore = dna.favoriteDevelopers.includes(game.developer) ? 15 : 0;
      const completionScore = completionRate * 10;
      const popularityScore = (game.popularity / 100) * 5;
      const total = genreScore + tagScore + devScore + completionScore + popularityScore;

      const reasons = [];
      if (genreOverlap > 0) reasons.push(`matches your love of ${game.genres.filter(g => dna.favoriteGenres.includes(g)).join(" & ")}`);
      if (tagOverlap > 0) reasons.push(`shares ${game.tags.filter(t => dna.favoriteTags.includes(t)).join(", ")} gameplay`);
      if (devScore > 0) reasons.push(`made by ${game.developer}, one of your favorites`);

      return {
        game,
        score: Math.round(total),
        breakdown: { genreScore: Math.round(genreScore), tagScore: Math.round(tagScore), devScore, completionScore: Math.round(completionScore), popularityScore: Math.round(popularityScore) },
        explanation: reasons.length > 0 ? `Recommended because it ${reasons.join(" and ")}.` : "Highly popular game matching your profile.",
      };
    })
    .sort((a, b) => b.score - a.score);
}

const MOCK_SALES = [
  { gameId: "5", originalPrice: 24.99, salePrice: 9.99 },
  { gameId: "7", originalPrice: 14.99, salePrice: 4.99 },
  { gameId: "8", originalPrice: 39.99, salePrice: 15.99 },
  { gameId: "11", originalPrice: 59.99, salePrice: 35.99 },
];

function generateSalesRecs(recommendations) {
  return MOCK_SALES.map(sale => {
    const rec = recommendations.find(r => r.game.id === sale.gameId);
    const recMatchScore = rec ? rec.score : 20;
    const discountPct = Math.round(((sale.originalPrice - sale.salePrice) / sale.originalPrice) * 100);
    const discountValueScore = (discountPct / 100) * 100;
    const matchScore = Math.round(recMatchScore * 0.8 + discountValueScore * 0.2);
    return { ...sale, game: ALL_GAMES.find(g => g.id === sale.gameId), discountPct, matchScore, recMatchScore: Math.round(recMatchScore), explanation: rec?.explanation || "Popular title currently on sale." };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

const STATUS_COLORS = { Completed: "#10b981", Playing: "#7C3AED", Dropped: "#ef4444", Wishlist: "#64748b" };
const STATUS_BG = { Completed: "#052e16", Playing: "#1e1040", Dropped: "#2d0a0a", Wishlist: "#0f172a" };

function ScoreBadge({ score }) {
  const color = score >= 70 ? "#F59E0B" : score >= 50 ? "#7C3AED" : "#64748b";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 13, fontWeight: 700, color }}>
      {score}<span style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>/100</span>
    </div>
  );
}

function GameCard({ game, userGame, onClick }) {
  return (
    <div onClick={onClick} style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "transform 0.15s, border-color 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#7C3AED66"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#2a3050"; }}>
      <div style={{ height: 80, background: `linear-gradient(135deg, ${game.coverColor} 0%, #1E2440 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
        🎮
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{game.title}</div>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>{game.developer}</div>
        {userGame && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: STATUS_BG[userGame.status], color: STATUS_COLORS[userGame.status], fontWeight: 600 }}>{userGame.status}</span>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>{Math.round(userGame.playtimeMinutes / 60)}h</span>
          </div>
        )}
        {!userGame && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {game.genres.slice(0, 2).map(g => <span key={g} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#0f172a", color: "#94A3B8", border: "1px solid #1e293b" }}>{g}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

function RadarChart({ dna }) {
  const canvasRef = useRef(null);
  const categories = [
    { label: "Genres", value: Math.min(dna.favoriteGenres.length / 4, 1) },
    { label: "Completion", value: dna.completionRate / 100 },
    { label: "Achievements", value: dna.avgAchievementPct / 100 },
    { label: "Playtime", value: Math.min(dna.avgPlaytimeHours / 80, 1) },
    { label: "Variety", value: Math.min(dna.favoriteTags.length / 5, 1) },
    { label: "Loyalty", value: Math.min(dna.favoriteDevelopers.length / 3, 1) },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 36;
    const n = categories.length;
    const angle = i => (Math.PI * 2 * i / n) - Math.PI / 2;

    ctx.clearRect(0, 0, W, H);

    // Grid rings
    [0.25, 0.5, 0.75, 1].forEach(r => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = angle(i);
        const x = cx + Math.cos(a) * R * r;
        const y = cy + Math.sin(a) * R * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = r === 1 ? "#2a3050" : "#1a2035";
      ctx.lineWidth = r === 1 ? 1.5 : 1;
      ctx.stroke();
    });

    // Spokes
    for (let i = 0; i < n; i++) {
      const a = angle(i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.strokeStyle = "#1e2a45";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Data fill
    ctx.beginPath();
    categories.forEach((cat, i) => {
      const a = angle(i);
      const x = cx + Math.cos(a) * R * cat.value;
      const y = cy + Math.sin(a) * R * cat.value;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, "#7C3AED66");
    grad.addColorStop(1, "#7C3AED22");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#7C3AED";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    categories.forEach((cat, i) => {
      const a = angle(i);
      const x = cx + Math.cos(a) * R * cat.value;
      const y = cy + Math.sin(a) * R * cat.value;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#F59E0B";
      ctx.fill();
      ctx.strokeStyle = "#0B0F1A";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Labels
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.textAlign = "center";
    categories.forEach((cat, i) => {
      const a = angle(i);
      const x = cx + Math.cos(a) * (R + 24);
      const y = cy + Math.sin(a) * (R + 24) + 4;
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(cat.label, x, y);
    });
  }, [dna]);

  return <canvas ref={canvasRef} width={260} height={260} style={{ display: "block" }} />;
}

function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#00000088", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 16, padding: 28, maxWidth: 520, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function AddGameModal({ onAdd, onClose, existingIds }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Playing");
  const [playtime, setPlaytime] = useState("");
  const [selected, setSelected] = useState(null);
  const available = ALL_GAMES.filter(g => !existingIds.has(g.id) && g.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: "#e2e8f0", marginBottom: 20 }}>Add Game to Library</h2>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search games…"
        style={{ width: "100%", background: "#0B0F1A", border: "1px solid #2a3050", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }} />
      <div style={{ display: "grid", gap: 8, marginBottom: 16, maxHeight: 200, overflowY: "auto" }}>
        {available.slice(0, 8).map(g => (
          <div key={g.id} onClick={() => setSelected(g)}
            style={{ padding: "10px 14px", borderRadius: 8, cursor: "pointer", border: `1px solid ${selected?.id === g.id ? "#7C3AED" : "#2a3050"}`, background: selected?.id === g.id ? "#7C3AED22" : "#0B0F1A" }}>
            <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{g.title}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{g.developer} · {g.genres.join(", ")}</div>
          </div>
        ))}
        {available.length === 0 && <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 16 }}>No games found</div>}
      </div>
      {selected && <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ width: "100%", background: "#0B0F1A", border: "1px solid #2a3050", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 14 }}>
              {["Playing", "Completed", "Dropped", "Wishlist"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>Playtime (hours)</label>
            <input type="number" value={playtime} onChange={e => setPlaytime(e.target.value)} placeholder="0"
              style={{ width: "100%", background: "#0B0F1A", border: "1px solid #2a3050", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
          </div>
        </div>
        <button onClick={() => { onAdd(selected, status, parseInt(playtime || "0")); onClose(); }}
          style={{ width: "100%", background: "#7C3AED", border: "none", borderRadius: 8, padding: "12px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>
          Add to Library
        </button>
      </>}
    </Modal>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function Dashboard({ userGames, dna, recommendations }) {
  const recentGames = userGames.slice(-4).reverse();
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 600, color: "#7C3AED", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Welcome back</div>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 36, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
          {MOCK_USER.displayName}'s Dashboard
        </h1>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Games", value: userGames.length },
          { label: "Completed", value: userGames.filter(g => g.status === "Completed").length },
          { label: "Hours Played", value: `${Math.round(userGames.reduce((s, g) => s + g.playtimeMinutes, 0) / 60)}h` },
          { label: "Avg Achievements", value: `${dna.avgAchievementPct}%` },
        ].map(s => (
          <div key={s.label} style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 28, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: "#F59E0B" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent games */}
        <div style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>Recent Activity</div>
          <div style={{ display: "grid", gap: 10 }}>
            {recentGames.map(ug => {
              const game = ALL_GAMES.find(g => g.id === ug.gameId);
              if (!game) return null;
              return (
                <div key={ug.gameId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg, ${game.coverColor}, #1E2440)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎮</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{game.title}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{Math.round(ug.playtimeMinutes / 60)}h played</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: STATUS_BG[ug.status], color: STATUS_COLORS[ug.status], fontWeight: 600, flexShrink: 0 }}>{ug.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DNA snapshot */}
        <div style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>Gaming DNA Snapshot</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {dna.favoriteGenres.map(g => <span key={g} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "#7C3AED22", color: "#a78bfa", border: "1px solid #7C3AED44" }}>{g}</span>)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {dna.favoriteTags.slice(0, 4).map(t => <span key={t} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "#F59E0B11", color: "#fbbf24", border: "1px solid #F59E0B33" }}>{t}</span>)}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #2a3050", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", color: "#F59E0B" }}>{dna.completionRate}%</div><div style={{ fontSize: 11, color: "#64748b" }}>Completion rate</div></div>
            <div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", color: "#F59E0B" }}>{dna.avgPlaytimeHours}h</div><div style={{ fontSize: 11, color: "#64748b" }}>Avg per game</div></div>
          </div>
        </div>
      </div>

      {/* Top recommendations preview */}
      <div style={{ marginTop: 24, background: "#1E2440", border: "1px solid #2a3050", borderRadius: 16, padding: "20px 24px" }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>Top Picks For You</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {recommendations.slice(0, 3).map(r => (
            <div key={r.game.id} style={{ background: "#0B0F1A", borderRadius: 10, padding: "14px 16px", border: "1px solid #2a3050" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", flex: 1, marginRight: 8 }}>{r.game.title}</div>
                <ScoreBadge score={r.score} />
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{r.game.developer}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8, lineHeight: 1.5 }}>{r.explanation}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Library({ userGames, setUserGames }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  const existingIds = new Set(userGames.map(ug => ug.gameId));

  const filtered = userGames.filter(ug => {
    const game = ALL_GAMES.find(g => g.id === ug.gameId);
    if (!game) return false;
    const matchSearch = game.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || ug.status === filter;
    return matchSearch && matchFilter;
  });

  const handleAdd = (game, status, playtimeHours) => {
    setUserGames(prev => [...prev, {
      gameId: game.id, status, playtimeMinutes: playtimeHours * 60,
      achievementPct: null, source: "Manual",
    }]);
  };

  const handleStatusChange = (gameId, newStatus) => {
    setUserGames(prev => prev.map(ug => ug.gameId === gameId ? { ...ug, status: newStatus } : ug));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 600, color: "#7C3AED", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Collection</div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>My Library</h1>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "#7C3AED", border: "none", borderRadius: 8, padding: "10px 20px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>
          + Add Game
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search library…"
          style={{ flex: 1, minWidth: 200, background: "#1E2440", border: "1px solid #2a3050", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14 }} />
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Playing", "Completed", "Dropped", "Wishlist"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${filter === s ? "#7C3AED" : "#2a3050"}`, background: filter === s ? "#7C3AED22" : "#1E2440", color: filter === s ? "#a78bfa" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎮</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#94A3B8", marginBottom: 8 }}>No games found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your search or filters</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map(ug => {
            const game = ALL_GAMES.find(g => g.id === ug.gameId);
            if (!game) return null;
            return (
              <div key={ug.gameId} style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: `linear-gradient(135deg, ${game.coverColor}, #1E2440)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎮</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0", fontFamily: "'Rajdhani', sans-serif" }}>{game.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{game.developer} · {game.genres.join(", ")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  {ug.achievementPct != null && <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#F59E0B", fontFamily: "'Rajdhani', sans-serif" }}>{ug.achievementPct}%</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Achievements</div>
                  </div>}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Rajdhani', sans-serif" }}>{Math.round(ug.playtimeMinutes / 60)}h</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Playtime</div>
                  </div>
                  <select value={ug.status} onChange={e => handleStatusChange(ug.gameId, e.target.value)}
                    style={{ background: STATUS_BG[ug.status], border: `1px solid ${STATUS_COLORS[ug.status]}44`, borderRadius: 8, padding: "6px 10px", color: STATUS_COLORS[ug.status], fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {["Playing", "Completed", "Dropped", "Wishlist"].map(s => <option key={s}>{s}</option>)}
                  </select>
                  {ug.source === "SteamSync" && <span style={{ fontSize: 10, color: "#64748b", background: "#0B0F1A", padding: "3px 7px", borderRadius: 4, border: "1px solid #2a3050" }}>Steam</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showAdd && <AddGameModal onAdd={handleAdd} onClose={() => setShowAdd(false)} existingIds={existingIds} />}
    </div>
  );
}

function Recommendations({ recommendations }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 600, color: "#7C3AED", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Personalized</div>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Recommendations</h1>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        {recommendations.map((r, i) => (
          <div key={r.game.id} style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: `linear-gradient(135deg, ${r.game.coverColor}, #1E2440)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🎮</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>#{i + 1} {r.game.title}</span>
                  <ScoreBadge score={r.score} />
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{r.game.developer} · {r.game.publisher}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {r.game.genres.map(g => <span key={g} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#7C3AED22", color: "#a78bfa", border: "1px solid #7C3AED33" }}>{g}</span>)}
                  {r.game.tags.map(t => <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#0B0F1A", color: "#94A3B8", border: "1px solid #2a3050" }}>{t}</span>)}
                </div>
                <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>{r.explanation}</div>
              </div>
              <div style={{ flexShrink: 0, display: "grid", gap: 8, minWidth: 120 }}>
                {[
                  { label: "Genre", value: r.breakdown.genreScore, max: 40 },
                  { label: "Tags", value: r.breakdown.tagScore, max: 30 },
                  { label: "Developer", value: r.breakdown.devScore, max: 15 },
                ].map(b => (
                  <div key={b.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
                      <span>{b.label}</span><span style={{ color: "#F59E0B" }}>{b.value}/{b.max}</span>
                    </div>
                    <div style={{ height: 4, background: "#0B0F1A", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(b.value / b.max) * 100}%`, background: "linear-gradient(90deg, #7C3AED, #F59E0B)", borderRadius: 2, transition: "width 0.5s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sales({ salesRecs }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 600, color: "#7C3AED", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Limited Time</div>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Sales For You</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
        {salesRecs.map(s => (
          <div key={s.gameId} style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ height: 80, background: `linear-gradient(135deg, ${s.game.coverColor}, #1E2440)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, position: "relative" }}>
              🎮
              <div style={{ position: "absolute", top: 12, right: 12, background: "#ef4444", borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 800, color: "#fff" }}>-{s.discountPct}%</div>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{s.game.title}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{s.game.developer}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981", fontFamily: "'Rajdhani', sans-serif" }}>${s.salePrice.toFixed(2)}</div>
                <div style={{ fontSize: 14, color: "#64748b", textDecoration: "line-through" }}>${s.originalPrice.toFixed(2)}</div>
                <div style={{ marginLeft: "auto" }}><ScoreBadge score={s.matchScore} /></div>
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{s.explanation}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ dna, userGames }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 600, color: "#7C3AED", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Identity</div>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Gaming DNA</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start", marginBottom: 24 }}>
        {/* Radar */}
        <div style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: "#94A3B8", marginBottom: 12, letterSpacing: "0.08em" }}>PLAYER PROFILE</div>
          <RadarChart dna={dna} />
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 14 }}>Favorite Genres</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dna.favoriteGenres.map((g, i) => (
                <div key={g} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0B0F1A", borderRadius: 8, padding: "8px 14px", border: "1px solid #7C3AED33" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#7C3AED", fontFamily: "'Rajdhani', sans-serif" }}>#{i + 1}</span>
                  <span style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 14 }}>Gameplay Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dna.favoriteTags.map(t => (
                <span key={t} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 20, background: "#F59E0B11", color: "#fbbf24", border: "1px solid #F59E0B33", fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 14 }}>Favorite Developers</div>
            <div style={{ display: "grid", gap: 8 }}>
              {dna.favoriteDevelopers.map((d, i) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < dna.favoriteDevelopers.length - 1 ? "1px solid #2a3050" : "none" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B", fontFamily: "'Rajdhani', sans-serif", width: 28 }}>#{i + 1}</span>
                  <span style={{ fontSize: 15, color: "#e2e8f0", fontWeight: 600 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Connected accounts */}
      <div style={{ background: "#1E2440", border: "1px solid #2a3050", borderRadius: 16, padding: "20px 24px" }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 14 }}>Connected Accounts</div>
        {MOCK_USER.connectedAccounts.map(acc => (
          <div key={acc.provider} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#0B0F1A", borderRadius: 10, border: "1px solid #2a3050" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1b2838", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎮</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{acc.provider}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{acc.displayName} · Synced {acc.synced}</div>
            </div>
            <div style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "#05200d", color: "#10b981", border: "1px solid #10b98133", fontWeight: 600 }}>Connected</div>
          </div>
        ))}
        <button style={{ marginTop: 12, width: "100%", background: "transparent", border: "1px dashed #2a3050", borderRadius: 10, padding: "12px", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          + Connect Another Account
        </button>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "library", label: "My Library", icon: "📚" },
  { id: "recommendations", label: "Recommendations", icon: "✦" },
  { id: "sales", label: "Sales", icon: "🏷" },
  { id: "profile", label: "Gaming DNA", icon: "◈" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [userGames, setUserGames] = useState(INITIAL_USER_GAMES);

  const dna = computeGamingDNA(userGames);
  const recommendations = generateRecommendations(userGames, dna);
  const salesRecs = generateSalesRecs(recommendations);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0B0F1A; font-family: 'Inter', sans-serif; }
        input, select, button { font-family: 'Inter', sans-serif; outline: none; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0B0F1A; } ::-webkit-scrollbar-thumb { background: #2a3050; border-radius: 3px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#0B0F1A" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#0d1120", borderRight: "1px solid #1a2035", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
          {/* Logo */}
          <div style={{ padding: "28px 24px 24px" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
              <span style={{ color: "#7C3AED" }}>Game</span><span style={{ color: "#F59E0B" }}>DNA</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Discover your next game</div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "0 12px" }}>
            {NAV.map(item => {
              const active = page === item.id;
              return (
                <button key={item.id} onClick={() => setPage(item.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: active ? "#7C3AED22" : "transparent", color: active ? "#a78bfa" : "#64748b", cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400, marginBottom: 2, textAlign: "left", transition: "all 0.15s", borderLeft: active ? "2px solid #7C3AED" : "2px solid transparent" }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid #1a2035" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>N</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{MOCK_USER.displayName}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Pro · Steam linked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto", maxWidth: 960 }}>
          {page === "dashboard" && <Dashboard userGames={userGames} dna={dna} recommendations={recommendations} />}
          {page === "library" && <Library userGames={userGames} setUserGames={setUserGames} />}
          {page === "recommendations" && <Recommendations recommendations={recommendations} />}
          {page === "sales" && <Sales salesRecs={salesRecs} />}
          {page === "profile" && <ProfilePage dna={dna} userGames={userGames} />}
        </main>
      </div>
    </>
  );
}
