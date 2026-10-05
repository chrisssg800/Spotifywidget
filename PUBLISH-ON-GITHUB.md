# Publish the widget once (for you, not your friend)

This puts the widget on a free web address so your friend never has to run
anything. About 5 minutes.

1. Log in at https://github.com and click **New repository**. Name it
   `spotify-widget`, set it to **Public**, and create it.
2. Unzip `spotify-widget.zip`. On the new repo page click **uploading an existing file**,
   drag in everything from inside the unzipped folder (including the `assets` folder),
   and click **Commit changes**.
3. Go to **Settings** > **Pages**. Under **Build and deployment** choose
   **Deploy from a branch**, branch `main`, folder `/ (root)`, and **Save**.
4. Wait about a minute. Your address will be:
   `https://YOUR-USERNAME.github.io/spotify-widget/`
5. Send your friend:
   - `FRIEND-GUIDE.md`
   - the setup link: `https://YOUR-USERNAME.github.io/spotify-widget/setup.html`

To change the logo later, replace `assets/logo.png` in the repo (Add file > Upload files).

Nothing private is stored in the repo: each person's login lives only in the URL they
paste into OBS.
