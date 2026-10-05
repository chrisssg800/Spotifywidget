// Live Spotify "now playing" widget.
// Layout based on Nutty's open-source spotify-widget (GPL-3.0):
// https://github.com/nuttylmao/spotify-widget
// Modified: album art replaced by a fixed logo, live data via Spotify Web API
// using the Authorization Code + PKCE flow (no client secret needed).

// Settings come from the widget URL: index.html?client_id=...&refresh_token=...
const params = new URLSearchParams(location.search);
const cfg = {
  clientId: params.get("client_id") || "",
  refreshToken: params.get("refresh_token") || ""
};
const POLL_MS = 3000;

const main = document.getElementById("mainContainer");
const song = document.getElementById("songLabel");
const artist = document.getElementById("artistLabel");
const progressBar = document.getElementById("progressBar");
const progressTime = document.getElementById("progressTime");
const timeRemaining = document.getElementById("timeRemaining");

let accessToken = null;
let expiresAt = 0;
let state = null; // { id, duration, progress, at, playing }

function formatTime(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function show() { main.classList.add("visible"); }
function hide() { main.classList.remove("visible"); }

function setText(name, by) {
  song.classList.add("fade");
  artist.classList.add("fade");
  setTimeout(() => {
    song.textContent = name;
    artist.textContent = by;
    song.classList.remove("fade");
    artist.classList.remove("fade");
  }, 250);
}

// ---- token handling -------------------------------------------------------

function currentRefreshToken() {
  try {
    const saved = JSON.parse(localStorage.getItem("sp_rt") || "null");
    // Use a rotated token only if it came from the token currently in the URL
    if (saved && saved.from === cfg.refreshToken && saved.token) return saved.token;
  } catch (e) {}
  return cfg.refreshToken;
}

async function getToken() {
  if (accessToken && Date.now() < expiresAt - 30000) return accessToken;

  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: currentRefreshToken(),
      client_id: cfg.clientId
    })
  });
  if (!r.ok) throw new Error("Token refresh failed: " + r.status);
  const d = await r.json();
  accessToken = d.access_token;
  expiresAt = Date.now() + d.expires_in * 1000;
  if (d.refresh_token) {
    try {
      localStorage.setItem("sp_rt", JSON.stringify({ from: cfg.refreshToken, token: d.refresh_token }));
    } catch (e) {}
  }
  return accessToken;
}

// ---- polling --------------------------------------------------------------

function handle(d) {
  if (!d || !d.item || !d.is_playing) {
    state = null;
    hide();
    return;
  }
  const item = d.item;
  const by = item.artists
    ? item.artists.map(a => a.name).join(", ")
    : (item.show ? item.show.name : "");

  const changed = !state || state.id !== item.id;
  state = {
    id: item.id,
    duration: item.duration_ms,
    progress: d.progress_ms || 0,
    at: Date.now()
  };
  if (changed) setText(item.name, by);
  show();
}

async function poll() {
  let delay = POLL_MS;
  try {
    const token = await getToken();
    const r = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode",
      { headers: { Authorization: "Bearer " + token } }
    );
    if (r.status === 204) {
      state = null;
      hide();
    } else if (r.status === 401) {
      accessToken = null;
      delay = 500;
    } else if (r.status === 429) {
      delay = (parseInt(r.headers.get("Retry-After"), 10) || 5) * 1000;
    } else if (r.ok) {
      handle(await r.json());
    } else {
      console.warn("Spotify API status", r.status);
      delay = 5000;
    }
  } catch (e) {
    console.error(e);
    delay = 5000;
  }
  setTimeout(poll, delay);
}

// ---- smooth progress bar --------------------------------------------------

setInterval(() => {
  if (!state) return;
  const p = Math.min(state.duration, state.progress + (Date.now() - state.at));
  progressBar.style.width = `${(p / state.duration) * 100}%`;
  progressTime.textContent = formatTime(p);
  timeRemaining.textContent = `-${formatTime(state.duration - p)}`;
}, 250);

// ---- start ----------------------------------------------------------------

if (!cfg.clientId || !cfg.refreshToken) {
  song.textContent = "Setup needed";
  artist.textContent = "Use the setup page to get your widget URL";
  show();
} else {
  poll();
}
