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

## Build

```bash
npm run build
```

## Vendored Items Package

This dashboard consumes `openhab-hauer-items` as a vendored `file:` dependency:

- Source of truth: `openhab-automation/packages/openhab-hauer-items`
- Vendored target: `vendor/openhab-hauer-items`
- Adapter module: `src/domain/hauer-items.ts` (exports `ITEMS`, `ITEM_META`)

Update workflow:

```bash
cd ../openhab-automation
npm run sync:hauer-items:dashboard

cd ../openhab-dashboard
npm install
```

`sync:hauer-items:dashboard` runs generation + build + export and therefore needs
the OpenHAB generator environment configured in `openhab-automation`.

## Architecture

The app follows a service/store/component split:

- **`src/services/config.ts`**: openHAB host/protocol/port/auth helpers
- **`src/services/state-parser.ts`**: normalized parsing of openHAB states (`numeric`, `undef`, `null`, `unknown`)
- **`src/services/item-service.ts`**: REST API wrapper with in-flight metadata caching
- **`src/services/websocket-service.ts`**: connection lifecycle, typed updates, reconnect/backoff, listener subscription
- **`src/stores/semanticStore.ts`**: scoped semantic stores (property + scope key), history + current aggregate values
- **`src/stores/ventilationStore.ts`**: Helios manual/actual level tracking and live updates
- **`src/components/SemanticCard.tsx`**: generic metric card with optional history chart
- **`src/components/HeliosManualModeToggle.tsx`**: ventilation mode controls with WS/REST fallback

## Scene Images (V1: Haus + EG)

All scene images are loaded from `public/scenes`.

Required file layout:

```text
public/
  scenes/
    missing.jpg
    house/
      base.jpg
      light-off.jpg
      light-on.jpg
    eg/
      base.jpg
      light-off.jpg
      light-on.jpg
```

Supported V1 scene states:

- `light:off` -> `<view>/light-off.jpg`
- `light:on` -> `<view>/light-on.jpg`

How `base.jpg` is used:

- `base.jpg` is the neutral view baseline and must exist for each view.
- It is not an extra scene state key; state switching in V1 is only `light:on|off`.

Global missing-image fallback:

- If any requested scene image cannot be loaded, the app uses `public/scenes/missing.jpg`.
- A debug badge (`Missing scene asset`) is shown in the top-right corner while fallback is active.

View mapping in V1:

- `house` -> `public/scenes/house/*`
- `eg` -> `public/scenes/eg/*`

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
npm run lint
npm run build
npm run test:contracts
```
