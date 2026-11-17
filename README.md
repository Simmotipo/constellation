# ✦ CONSTELLATION // Deep-Space Cloud Service Launcher

**Constellation** is an interactive, universe-themed launcher and star chart for cloud services exposed via **Cloudflare Tunnels**. Designed for services named after stars (`draconis`, `orionis`, `centauri`, etc.), it automatically resolves both **Primary (`STARNAME-a.domain.com`)** and **Secondary (`SAMESTARNAME-b.domain.com`)** endpoints and renders them as interactive binary star systems grouped into constellations by tag.

Built with **Vite + React + TypeScript + Tailwind CSS** and a lightweight **Cloudflare Pages Function** (`functions/api/health.ts`), it deploys 100% free on **Cloudflare Pages**.

---

## ✨ Features

- **Interactive Pan & Zoom Universe Canvas:**
  - Deep-space parallax starfield with glowing nebulae and constellation lines connecting services that share a primary sector tag.
  - **6 Astral Body Classes:** `blue-giant`, `golden-star`, `red-dwarf`, `ringed-planet`, `pulsar`, and `nebula-core`.
  - **Binary Star System UX:** Click the main astral body or `-a` button to launch the **Primary (`STARNAME-a.domain.com`)** endpoint; click the orbiting companion star or `-b` button to launch the **Secondary (`SAMESTARNAME-b.domain.com`)** endpoint.
  - **Interactive Star Arranging:** Click **Arrange Stars** in the bottom-right HUD to drag stars to custom coordinates and export the updated layout.
  - **Tactical Sector Radar (Mini-Map):** Click anywhere on the bottom-left radar to jump the camera.
- **Command Palette (`Cmd/Ctrl + K`):**
  - Instant search by service name, star designation, slug, or `#tag`.
  - Press `Enter` to launch Primary (`-a`), `Shift + Enter` to launch Secondary (`-b`), or click **Locate** to center the camera on that star.
- **Star Chart Grid View:**
  - Switch between the interactive **Universe** map and a responsive **Star Chart** card grid (ideal for mobile devices or high-density scanning).
- **Server-Side Health Probe (`/api/health`):**
  - Powered by a Cloudflare Pages Function (`functions/api/health.ts`) so reachability checks never hit browser CORS errors.
  - Recognizes **Cloudflare Access** redirects (`*.cloudflareaccess.com` / `401` / `403`) as online & protected tunnels.
- **Easy URL & Star Management:**
  - Edit `src/config/constellation.json` directly in Git **or** use the in-app **Add Star / Manage JSON** modal to add/edit services, preview live, and copy/download `constellation.json`.

---

## 🚀 Local Development

```bash
npm install
npm run dev
```

*(Note: `vite.config.ts` includes a built-in local middleware for `/api/health` so tunnel health probes work out of the box during `npm run dev`.)*

---

## 🛠️ Updating Services (`src/config/constellation.json`)

All stars and global settings live in [`src/config/constellation.json`](src/config/constellation.json):

```json
{
  "title": "CONSTELLATION",
  "subtitle": "Deep-Space Cloud Service Telemetry & Tunnel Gateway",
  "defaultDomain": "yourdomain.com",
  "protocol": "https",
  "openInNewTab": true,
  "services": [
    {
      "id": "draconis",
      "name": "Nexus Core / Hypervisor",
      "starName": "Alpha Draconis (Thuban)",
      "starSlug": "draconis",
      "tags": ["Core Systems", "Infrastructure", "Critical"],
      "description": "Primary virtualization cluster via Cloudflare Tunnel.",
      "astralType": "blue-giant",
      "hasSecondary": true,
      "primaryLabel": "Node A (draconis-a)",
      "secondaryLabel": "Failover B (draconis-b)",
      "position": { "x": -480, "y": -260 }
    }
  ]
}
```

- **`defaultDomain` + `starSlug`:** Setting `"defaultDomain": "yourdomain.com"` and `"starSlug": "draconis"` automatically generates:
  - Primary: `https://draconis-a.yourdomain.com`
  - Secondary: `https://draconis-b.yourdomain.com` (when `"hasSecondary": true`)
- **Custom URL Overrides:** You can optionally set `"primaryUrl"` and/or `"secondaryUrl"` on any service if it uses a custom domain or path.
- **Tags & Constellations:** The **first tag** in `"tags"` determines which Constellation cluster the star belongs to on the map; all tags appear in the top filter bar.

---

## ☁️ Free Deployment to Cloudflare Pages

### Option 1: Git Integration (Recommended)
1. Push this repository to GitHub or GitLab.
2. In the **Cloudflare Dashboard**, go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Configure the build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**. Cloudflare Pages will automatically build the static site and deploy `functions/api/health.ts` as a Pages Function on the free tier.

### Option 2: Direct CLI Deploy via Wrangler
```bash
npm run build
npx wrangler pages deploy dist --project-name constellation
```
