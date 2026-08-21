# ohilovish — bio/portfolio site

Single-page, no-build, static site. Video + audio intro gate, custom cursor,
skills grid, Discord/social links. Everything content-related lives in
`js/config.js` — you shouldn't need to touch HTML/CSS to update text.

## File structure

```
index.html          structure
css/style.css        all styling (design tokens at top)
js/config.js         <-- EDIT THIS: name, tagline, discord, skills
js/main.js           logic (cursor, gate, audio, grain, scroll reveal)
assets/background.mp4  looping background video
assets/theme.mp3       background song
assets/avatar.mp4      (add this) your looping "live pfp" clip
```

## Customizing

Open `js/config.js`:

- `handle` — your display name
- `tagline` — subtitle line
- `discord.inviteUrl` — your invite link
- `discord.online` — set `true` if you want the status dot to show green
  (this is manual for now — see "Real Discord status" below)
- `socials.*` — your YouTube / Instagram / Discord profile links
- `skills[]` — array of `{ name, desc, level }`, `level` is 0–100 and drives
  the little progress bar

To swap assets, just replace the files in `/assets/` with the same filenames
(`background.mp4`, `theme.mp3`, `avatar.mp4`). No code changes needed.

### Avatar clip
Drop a short looping video as `assets/avatar.mp4`. If it's missing, the site
falls back to a plain gradient circle instead of a broken video icon.

### Real Discord live status (optional upgrade)
Right now the status card is static text. To make it live:
1. Enable **Widget** in your Discord server settings (Server Settings → Widget).
2. Copy your Server ID.
3. In `js/main.js`, replace the static status block with a fetch to:
   `https://discord.com/api/guilds/<SERVER_ID>/widget.json`
   This returns member presence data you can render dynamically.
   (I can wire this in for you once you send the server ID.)

## Local testing

Any static file server works, e.g.:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy — GitHub → Railway

1. Push this folder to a GitHub repo.
2. On [Railway](https://railway.app), **New Project → Deploy from GitHub repo**.
3. Since this is a static site (no server), add a minimal static server. Easiest:
   add this `package.json` at the project root so Railway detects Node and
   serves the files:

   ```json
   {
     "name": "ohilovish-site",
     "scripts": { "start": "npx serve -s . -l $PORT" }
   }
   ```

4. Railway will run `npm start` automatically. Set the port via `$PORT`
   (already handled above).
5. Once deployed, point your Cloudflare DNS (CNAME) at the Railway domain,
   or use Railway's custom domain settings.

## Deploy — Your own VPS + Cloudflare

1. `git clone` the repo on your VPS.
2. Serve the folder with nginx (recommended) — example server block:

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/ohilovish;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }

       # cache video/audio aggressively
       location ~* \.(mp4|mp3)$ {
           add_header Cache-Control "public, max-age=31536000, immutable";
       }
   }
   ```

3. Point your domain's A record at the VPS IP in Cloudflare, proxy enabled
   (orange cloud) for CDN + SSL.
4. Enable Cloudflare's **Auto Minify** and **Brotli** for faster loads — the
   video file is the heaviest asset, consider Cloudflare's caching rules or
   a CDN-fronted object bucket if traffic grows.

## Notes on file size

`background.mp4` is ~13MB for a 10s loop. That's fine for a personal site but
worth compressing further if load times matter on mobile/slow connections —
happy to re-encode it smaller (lower bitrate / shorter loop) if you want.
