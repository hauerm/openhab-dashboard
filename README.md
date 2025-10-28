# OpenHAB Air Quality Dashboard

A modern, responsive dashboard for monitoring air quality metrics from OpenHAB using real-time WebSocket updates and historical data visualization.

## Features

- **Real-time Updates**: WebSocket connection for live data from OpenHAB sensors
- **Historical Charts**: 2-hour historical data visualization with line charts
- **Glass-morphism UI**: Modern design with backdrop blur effects
- **Responsive Grid**: 2x3 card layout that adapts to different screen sizes
- **Air Quality Metrics**: Temperature, Humidity, CO2, and AQI monitoring
- **German Localization**: Dashboard header in German ("Luftqualität EG")

## Configuration

Create a `.env` file in the root directory with the following variables:

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
- `VITE_OPENHAB_PORT`: Port number (9443 for HTTPS, 8080 for HTTP). When `VITE_OPENHAB_INSECURE=true`, the system automatically uses port 8080 if the configured port is 9443
- `VITE_OPENHAB_PROTOCOL`: Protocol to use (`https` or `http`)
- `VITE_OPENHAB_INSECURE`: Set to `true` to use WS instead of WSS and HTTP instead of HTTPS (bypasses certificate validation for self-signed certificates)

### Certificate Issues

If you encounter certificate validation errors when connecting to OpenHAB:

**Development (with Vite proxy):**

- Set `VITE_OPENHAB_INSECURE=true` to enable the Vite proxy that bypasses SSL certificate validation
- The proxy automatically handles both REST API and WebSocket connections
- Your browser connects to the local development server (trusted), which proxies requests to OpenHAB

**Production:**

- Install a proper SSL certificate on your OpenHAB server
- Or use a reverse proxy (like nginx) that handles SSL termination
- Remove the proxy configuration from `vite.config.ts` for production builds

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

## Architecture

The application follows a modular service architecture:

### Services

- **`config.ts`** - Shared configuration constants and OpenHAB connection settings
- **`item-service.ts`** - REST API operations for OpenHAB items (fetching, commands, history)
- **`websocket-service.ts`** - WebSocket connection management and real-time updates
- **`openhab-service.ts`** - Legacy compatibility layer that re-exports all services

### Service Usage

```typescript
import { ItemService, WebSocketService } from "./services";

// Fetch items
const items = await ItemService.fetchItems();

// Initialize WebSocket connection
await WebSocketService.initialize();

// Register for real-time updates
WebSocketService.registerListener((itemName, value) => {
  console.log(`${itemName}: ${value}`);
});
```
