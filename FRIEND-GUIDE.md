# Spotify Now Playing for OBS (5 minutes, no coding)

You need: a Spotify Premium account and OBS. Replace `SETUP-LINK` below with the
link you were sent (it ends in `/setup.html`).

## 1. Create a Spotify app
1. Go to https://developer.spotify.com/dashboard and log in.
2. Click **Create app**. Name and description can be anything.
3. Open `SETUP-LINK` in another tab. It shows a **Redirect URI**. Click **Copy**
   and paste it into the **Redirect URIs** box in the Spotify app, then click **Add**.
4. Tick **Web API**, agree to the terms, and **Save**.
5. Open the app's **Settings** and copy the **Client ID**.

## 2. Get your widget URL
1. On the setup page, paste the Client ID and click **Connect Spotify**.
2. Click **Agree** on Spotify's page.
3. You come back to the setup page with a long URL. Click **Copy**.
   Don't share it; it gives access to what's playing on your account.

## 3. Add it to OBS
1. In OBS, **Sources** > **+** > **Browser**, name it `Now Playing`.
2. Paste the URL into the **URL** box (leave Local file unticked).
3. Width `560`, Height `160`. Click OK.
4. Drag it where you want it. The background is transparent.

Play a song on Spotify and the card fades in. It hides when paused or idle.

## Problems?
- **"Setup needed" in OBS:** the URL wasn't pasted fully. Copy it again from the setup page.
- **INVALID_CLIENT / redirect error:** the Redirect URI in Spotify must match the one on
  the setup page exactly. Edit it in the app's Settings.
- **Nothing shows:** make sure music is actively playing, then right-click the source >
  Properties > **Refresh cache of current page**.
