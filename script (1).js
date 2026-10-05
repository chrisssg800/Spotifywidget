// Spotify "now playing" widget with a fixed logo instead of album art.
// Visual behaviour (animations, show/hide, resizing) follows Nutty's open-source
// widget (GPL-3.0): https://github.com/nuttylmao/spotify-widget
// Modified: logo replaces album art; Spotify auth via PKCE (no client secret).

const urlParams = new URLSearchParams(window.location.search);
const client_id = urlParams.get("client_id") || "";
const refresh_token_param = urlParams.get("refresh_token") || "";
const visibilityDuration = urlParams.get("duration") || 0;

let access_token = "";
let currentState = false;
let currentSongUri = "";

/////////////////
// SPOTIFY API //
/////////////////

function activeRefreshToken() {
	try {
		const saved = JSON.parse(localStorage.getItem("sp_rt") || "null");
		if (saved && saved.from === refresh_token_param && saved.token) return saved.token;
	} catch (e) {}
	return refresh_token_param;
}

async function RefreshAccessToken() {
	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: activeRefreshToken(),
			client_id: client_id
		})
	});
	if (response.ok) {
		const data = await response.json();
		access_token = data.access_token;
		if (data.refresh_token) {
			try {
				localStorage.setItem("sp_rt", JSON.stringify({ from: refresh_token_param, token: data.refresh_token }));
			} catch (e) {}
		}
	} else {
		console.error(`Token refresh failed: ${response.status}`);
	}
}

async function GetCurrentlyPlaying() {
	let delay = 1000;
	try {
		const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode", {
			method: "GET",
			headers: { "Authorization": `Bearer ${access_token}` }
		});

		if (response.status === 200) {
			const data = await response.json();
			if (data && data.item) UpdatePlayer(data);
		} else if (response.status === 204) {
			SetVisibility(false);
		} else if (response.status === 401) {
			await RefreshAccessToken();
		} else if (response.status === 429) {
			delay = (parseInt(response.headers.get("Retry-After"), 10) || 5) * 1000;
		} else {
			console.error(`${response.status}`);
			delay = 3000;
		}
	} catch (error) {
		console.debug(error);
		SetVisibility(false);
		delay = 2000;
	}
	setTimeout(GetCurrentlyPlaying, delay);
}

function UpdatePlayer(data) {
	const isPlaying = data.is_playing;
	const songUri = data.item.uri;
	const artist = data.item.artists
		? data.item.artists[0].name
		: (data.item.show ? data.item.show.name : "");
	const name = `${data.item.name}`;
	const duration = data.item.duration_ms / 1000;
	const progress = data.progress_ms / 1000;

	// Show/hide only when the play state changes
	if (isPlaying != currentState) {
		if (!isPlaying) {
			SetVisibility(false);
		} else {
			setTimeout(() => {
				SetVisibility(true);
				if (visibilityDuration > 0) {
					setTimeout(() => { SetVisibility(false, false); }, visibilityDuration * 1000);
				}
			}, 500);
		}
	}

	// Re-show when the song changes
	if (songUri != currentSongUri) {
		if (isPlaying) {
			setTimeout(() => {
				SetVisibility(true);
				if (visibilityDuration > 0) {
					setTimeout(() => { SetVisibility(false, false); }, visibilityDuration * 1000);
				}
			}, 500);
			currentSongUri = songUri;
		}
	}

	// Song info
	UpdateTextLabel(document.getElementById("artistLabel"), artist);
	UpdateTextLabel(document.getElementById("songLabel"), name);

	// Progress bar
	const progressPerc = (progress / duration) * 100;
	document.getElementById("progressBar").style.width = `${progressPerc}%`;
	document.getElementById("progressTime").innerHTML = FormatTime(progress);
	document.getElementById("timeRemaining").innerHTML = `-${FormatTime(duration - progress)}`;
}

function UpdateTextLabel(div, text) {
	if (div.innerText != text) {
		div.setAttribute("class", "text-fade");
		setTimeout(() => {
			div.innerText = text;
			div.setAttribute("class", "text-show");
		}, 500);
	}
}

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

function FormatTime(time) {
	const minutes = Math.floor(time / 60);
	const seconds = Math.trunc(time - minutes * 60);
	return `${minutes}:${('0' + seconds).slice(-2)}`;
}

function SetVisibility(isVisible, updateCurrentState = true) {
	const mainContainer = document.getElementById("mainContainer");
	if (isVisible) {
		mainContainer.style.opacity = 1;
		mainContainer.style.bottom = "50%";
	} else {
		mainContainer.style.opacity = 0;
		mainContainer.style.bottom = "calc(50% - 20px)";
	}
	if (updateCurrentState) currentState = isVisible;
}

/////////////////////
// RESIZE TO FIT   //
/////////////////////

let outer = document.getElementById('mainContainer'),
	maxWidth = outer.clientWidth + 50;

window.addEventListener("resize", resize);
resize();
function resize() {
	const scale = window.innerWidth / maxWidth;
	outer.style.transform = 'translate(-50%, 50%) scale(' + scale + ')';
}

/////////////
// START   //
/////////////

if (!client_id || !refresh_token_param) {
	document.getElementById("songLabel").innerText = "Setup needed";
	document.getElementById("artistLabel").innerText = "Use the setup page to get your widget URL";
	SetVisibility(true);
} else {
	(async () => {
		await RefreshAccessToken();
		GetCurrentlyPlaying();
	})();
}
