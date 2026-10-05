# Spotify Now Playing Widget (custom logo)

A "now playing" overlay for OBS. Shows the current Spotify song, artist and
progress, with a fixed logo (`assets/logo.png`) in place of the album cover.

Layout based on Nutty's open-source widget: https://github.com/nuttylmao/spotify-widget
(GPL-3.0, see LICENSE). Modified: album art replaced by a fixed logo; live data via
Spotify's Authorization Code + PKCE flow (no client secret).

- `PUBLISH-ON-GITHUB.md` - one-time hosting steps (for the person sharing it)
- `FRIEND-GUIDE.md` - setup steps for the streamer
- `index.html`, `style.css`, `script.js` - the widget
- `setup.html` - login page that generates the OBS URL
- `assets/logo.png` - the logo

Requires a Spotify Premium account to own the developer app.
