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

## openHAB Item Model

The dashboard reads item state, labels, semantic metadata, and automation metadata
live from openHAB via REST and WebSocket.

- Runtime model source: openHAB REST `/items?recursive=false&metadata=semantics,automation`
- Live updates: openHAB WebSocket item events
- Direct item references: documented as constants in `src/domain/openhab-item-names.ts`

Keep direct item references in `openhab-item-names.ts` when a control cannot yet be
discovered semantically. The static view descriptors consume those constants; no
generated or vendored item package is used.

## Architecture

### View Shell

- `src/App.tsx` initializes WebSocket + `viewStore` once and keeps the active view control as `{ viewId, controlId }`.
- `src/views/ViewLayer.tsx` renders exactly one active view.
- Each view has exactly one orchestration file:
  - `src/views/house/House.tsx`
  - `src/views/house/eg/Eg.tsx`
  - `src/views/house/eg/living/Living.tsx`
- The current in-scope view hierarchy is:
  - `house`: Start-/Index-Ansicht
  - `eg`: Erdgeschoss-Übersicht
  - `living`: Wohnzimmer
  - `kg`: aktuell noch nicht im View-Refactor ausgebaut

### View Rules

- Views orchestrate only:
  - load their control registry
  - wire `useViewControlLayout`
  - render HUD controls
  - render the optional left sidebar for location-backed semantic properties
  - render the active overlay control
- Views do not parse raw openHAB state.
- Views do not send domain commands directly.
- Views do not initialize specialized domain stores.

### Control Registries

- Every view has a descriptor file with static control definitions:
  - `src/views/house/houseView.descriptor.ts`
  - `src/views/house/eg/egView.descriptor.ts`
  - `src/views/house/eg/living/livingView.descriptor.ts`
- A control definition contains:
  - `controlId`
  - `controlType`
  - `label`
  - `itemRefs`
  - `layoutMetadataItemNames`
  - `defaultPosition`
- `viewStore` tracked item names are derived from control definitions where controls use view-backed item refs.

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
- `src/stores/ventilationStore.ts`
  - Helios manual/actual level store
  - initialized lazily inside `ventilation/model.ts`

### Supporting Modules

- `src/services/config.ts`: openHAB host/protocol/port/auth helpers
- `src/services/state-parser.ts`: normalized parsing of openHAB states (`numeric`, `undef`, `null`, `unknown`)
- `src/services/openhab-service.ts`: REST API wrapper for metadata, history, and commands
- `src/services/websocket-service.ts`: connection lifecycle, typed updates, reconnect/backoff, listener subscription
- `src/views/useViewControlLayout.ts`: draggable HUD positioning persisted via item metadata

## View Images (Haus + EG, Base + HUD)

All view images are loaded from `public/views`.

Required file layout:

```text
public/
  views/
    missing.jpg
    house/
      base.webp
      eg/
        base.webp
        living/
          base.webp
      kg/
        buero/
          buero_cellar.webp
```

How `base.webp` is used:

- `base.webp` is the only background image per view.
- Dynamic information is rendered through HUD overlays above the base image.

Global missing-image fallback:

- If any requested view image cannot be loaded, the app uses `public/views/missing.jpg`.
- A debug badge (`Missing view asset`) is shown in the top-right corner while fallback is active.

View mapping in V1:

- `house` -> `public/views/house/*`
- `eg` -> `public/views/house/eg/*`
- `living` -> `public/views/house/eg/living/*`

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
npm run test:contracts
```
