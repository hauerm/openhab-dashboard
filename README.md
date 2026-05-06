# OpenHAB Air Quality Dashboard

A responsive dashboard for monitoring air quality metrics from openHAB with live updates and history charts.

## Features

- **Live updates**: WebSocket event handling with reconnect and listener unsubscribe support
- **Robust state handling**: Explicit `UNDEF`/`NULL`/non-numeric state parsing
- **Historical charts**: Per-item history merged into chart data
- **Semantic filtering**: Item selection by semantic property and location hierarchy
- **Command fallback**: Ventilation commands prefer WebSocket and fall back to REST
- **Responsive layout**: Mobile/tablet-friendly card grid

## Configuration

Create a `.env` file in the project root:

```env
# OpenHAB Configuration
VITE_OPENHAB_API_TOKEN=your_api_token_here
VITE_OPENHAB_HOST=192.168.1.15
VITE_OPENHAB_PORT=9443
VITE_OPENHAB_PROTOCOL=https
VITE_OPENHAB_INSECURE=true
```

### Configuration Options

- `VITE_OPENHAB_API_TOKEN`: Your OpenHAB API token for authentication
- `VITE_OPENHAB_HOST`: IP address or hostname of your OpenHAB server
- `VITE_OPENHAB_PORT`: Port number (9443 for HTTPS, 8080 for HTTP)
- `VITE_OPENHAB_PROTOCOL`: Protocol to use (`https` or `http`)
- `VITE_OPENHAB_INSECURE`: Development proxy TLS setting. Set to `true` to disable TLS certificate verification in the Vite proxy for self-signed certificates. Protocol/port remain as configured.
- `VITE_OPENHAB_USE_PROXY`: Same-origin proxy toggle for `/api` and `/ws`. Defaults to enabled. Set to `false` only when the browser should call openHAB directly and openHAB CORS is configured for the app origin.
- `VITE_LOGLEVEL` / `VITE_LOG_LEVEL`: Optional global log level (`trace`, `debug`, `info`, `warn`, `error`, `silent`).

### Notes

- REST requests include `Authorization: Bearer <token>` automatically when `VITE_OPENHAB_API_TOKEN` is set.
- WebSocket auth uses openHAB subprotocols (`org.openhab.ws.accessToken.base64.*`) when a token is present.
- After changing `.env` values, restart `npm run dev`.
- With `VITE_LOGLEVEL=debug` or `VITE_LOGLEVEL=trace`, semantic store initialization logs selected items and their history values.
- Avoid inline comments in log level values (prefer `VITE_LOGLEVEL=debug` on its own line).
- Example debug setup:

```env
VITE_LOGLEVEL=debug
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

For testing from an iPad or other tablet, prefer a production build over the Vite
development server. The dev server adds HMR/client overhead and serves assets in
a way that is useful for local development but not representative of kiosk/tablet
runtime performance.

## Build

```bash
npm run build
```

For tablet testing, build and serve the production output from the Mac:

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

The production preview server proxies `/api` and `/ws` to openHAB by default.
When testing from a tablet, open the preview URL via the Mac IP address, for
example `http://192.168.1.67:4173/`. Keep `VITE_OPENHAB_HOST` pointed at the
openHAB server address that the Mac can reach.

## Synology NAS Container Manager

The production container serves the built dashboard with Nginx and proxies the
same-origin `/api` and `/ws` endpoints to openHAB. The openHAB API token is not
built into the image. Enter the token in the dashboard login screen on each
browser/device that should use the dashboard.

### Private GHCR Image

The default deployment image is private and hosted in GitHub Container Registry:

```text
ghcr.io/hauerm/openhab-dashboard:latest
```

The GitHub Actions workflow in `.github/workflows/container.yml` builds and
pushes a `linux/amd64` image on pushes to `main`, version tags like `v1.0.0`, or
manual workflow runs.

Image tags are assigned from the Git ref:

- Push to `main`: publishes `latest` and `main`.
- Push to a version tag like `v1.0.0`: publishes `v1.0.0`.
- Pushes to branches other than `main`: do not run the container publish
  workflow.
- Generated `sha-*` image tags are intentionally disabled.
- Build provenance and SBOM attestations are disabled to avoid extra untagged
  GHCR package versions.
- Docker layer caching uses the GitHub Actions cache. The first build can still
  take longer; subsequent builds should reuse npm and image layers.

Use `latest` on Synology for automatic latest-main deployments, or pin
`DASHBOARD_IMAGE` to a version tag like `ghcr.io/hauerm/openhab-dashboard:v1.0.0`
for explicit releases.

When the package is created the first time, keep the GHCR package visibility set
to `Private`. Do not change it to `Public`; public package visibility cannot be
reverted to private.

### Synology Registry Login

Because the image is private, Container Manager must authenticate to `ghcr.io`
before it can pull the image.

1. Create a GitHub personal access token with `read:packages`.
2. In Synology Container Manager, add/log in to the registry `ghcr.io` using:
   - username: `hauerm`
   - password: the personal access token
3. Pull or deploy `ghcr.io/hauerm/openhab-dashboard:latest`.

The token is only for pulling the private container image from GitHub. It is not
the openHAB API token.

### Container Manager Project

1. Copy this repository to a folder on the Synology NAS.
2. In Container Manager, create a new Project from the repository folder and use
   `compose.yml`.
3. Start the project.
4. Open the dashboard at `http://<nas-ip>:8088/`.

Default runtime settings in `compose.yml`:

```yaml
DASHBOARD_PORT: 8088
OPENHAB_HOST: 192.168.1.15
OPENHAB_PORT: 9443
OPENHAB_PROTOCOL: https
OPENHAB_PROXY_SSL_VERIFY: off
```

`OPENHAB_PROXY_SSL_VERIFY=off` is intended for a self-signed openHAB HTTPS
certificate. If openHAB later uses a certificate trusted by the container, set it
to `on`.

To use a different NAS port or openHAB address, set project environment
variables before starting/recreating the project, for example:

```env
DASHBOARD_PORT=8090
OPENHAB_HOST=192.168.1.15
OPENHAB_PORT=9443
OPENHAB_PROTOCOL=https
OPENHAB_PROXY_SSL_VERIFY=off
```

The Docker build context excludes `.env`, `node_modules`, `dist`, and Git/local
files via `.dockerignore` so local development secrets are not sent into the
image build.

For a local image build instead of GHCR, run:

```bash
docker compose -f compose.yml -f compose.build.yml build
```

## openHAB Item Model

The dashboard reads item state, labels, semantic metadata, and automation metadata
live from openHAB via REST and WebSocket.

- Runtime model source: openHAB REST `/items?recursive=false&metadata=semantics,automation,dashboard-location,dashboard-layout`
- Live updates: openHAB WebSocket item events
- Direct item references: documented as constants in `src/domain/openhab-item-names.ts`

Keep direct item references in `openhab-item-names.ts` when a control cannot yet be
discovered semantically. No generated or vendored item package is used.

## Architecture

### View Shell

- `src/App.tsx` initializes WebSocket + `viewStore` once and keeps the active view control as `{ viewId, controlId }`.
- `src/views/ViewLayer.tsx` renders exactly one active semantic location view.
- `src/views/location/LocationView.tsx` renders all discovered controls for the current location.
- Bottom dock locations are discovered from openHAB location items and ordered by `dashboard-location` metadata.

### View Rules

- The view layer:
  - wires `useViewControlLayout`
  - renders discovered HUD controls
  - renders the optional left sidebar for location-backed semantic properties
  - renders the active overlay control
- Views do not parse raw openHAB state.
- Views do not send domain commands directly.
- Views do not initialize specialized domain stores.

### Theming and Color Scheme Sources

- Tailwind v4 is configured CSS-first in `src/index.css`.
- Use `@theme` for design tokens and `@utility` for composed patterns such as
  gradients, glows, and reusable visual scales.
- Use these Tailwind references when changing theme structure:
  - [Tailwind theme variables](https://tailwindcss.com/docs/theme)
  - [Tailwind functions and directives](https://tailwindcss.com/docs/functions-and-directives)
- Classify data color schemes before choosing colors:
  - sequential for ordered low-to-high values
  - diverging when both extremes matter around a meaningful midpoint
  - qualitative for nominal categories without magnitude
- Use these color-scheme references first:
  - [ColorBrewer scheme types](https://colorbrewer2.org/learnmore/schemes_full.html)
  - [D3 scale-chromatic](https://d3js.org/d3-scale-chromatic)
- Prefer colorblind-safe categorical palettes, especially Okabe-Ito/Wong or
  D3/Tableau-compatible qualitative palettes.
- Do not define local color scales, hex palettes, or gradient strings inside
  React controls. If a palette or gradient is needed, add theme tokens/utilities
  and reference them from components.
- Document intentional deviations here or with a short code comment near the
  token definition.

### Semantic Model

- `src/domain/openhab-model.ts` builds a semantic model from `tags`, `groupNames`, and item metadata.
- Locations are discovered from location-tagged group items.
- Supported controls are derived from semantic equipments and points.
- `viewStore` tracked item names are derived from discovered control item refs.

### Controls

- Controls live under `src/views/controls/<control>/`.
- Folder convention:
  - `index.tsx`: HUD + Overlay presentation exports
  - `model.ts`: state derivation, commands, lazy store initialization
  - `shared.ts`: optional parsing/helpers
  - local tests next to the control
- Current view controls:
  - `location-property-history`
  - `ventilation`
  - `light`
  - `raffstore`
  - `tv`
- Controls receive only static config plus the relevant item refs for that control. They resolve live values internally.

### Stores

- `src/stores/viewStore.ts`
  - global, eager, initialized once in `App.tsx`
  - holds current view item states for view-backed controls
  - subscribes to view WebSocket updates
- `src/stores/locationPropertyHistoryStore.ts`
  - scoped/cached history stores
  - initialized lazily inside `location-property-history/model.ts`
### Supporting Modules

- `src/services/config.ts`: openHAB host/protocol/port/auth helpers
- `src/services/state-parser.ts`: normalized parsing of openHAB states (`numeric`, `undef`, `null`, `unknown`)
- `src/services/openhab-service.ts`: REST API wrapper for metadata, history, and commands
- `src/services/websocket-service.ts`: connection lifecycle, typed updates, reconnect/backoff, listener subscription
- `src/views/useViewControlLayout.ts`: draggable HUD positioning persisted via item metadata

## View Images

All view images are loaded from `public/views`.

Required file layout:

```text
public/
  views/
    missing.jpg
    Hauer.webp
    EG.webp
    Wohnzimmer.webp
    Buero.webp
    ...
```

How image lookup works:

- Each location reads `dashboard-location.config.baseImage` from openHAB.
- The current convention is a flat path: `/views/<LocationItemName>.webp`
- Dynamic information is rendered through HUD overlays above the base image.

Global missing-image fallback:

- If any requested view image cannot be loaded, the app uses `public/views/missing.jpg`.
- A debug badge (`Missing view asset`) is shown in the top-right corner while fallback is active.

## WebSocket Usage

Use typed subscriptions:

```typescript
import {
  initializeWebSocket,
  subscribeWebSocketListener,
} from "./services/websocket-service";

await initializeWebSocket();

const unsubscribe = subscribeWebSocketListener((update) => {
  // update.itemName
  // update.rawState
  // update.numericValue
  // update.stateKind (numeric | undef | null | unknown)
});

// call unsubscribe() on cleanup
```

## Quality Checks

```bash
npm test
npm run lint
npm run build
```
