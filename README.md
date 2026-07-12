# SkyMarshal C2 — SpaceShield Hack 2026 Winner

SkyMarshal C2 is a command-and-control dispatcher for coordinated, multi-agency drone operations. It combines live orthophotomaps, airspace-conflict avoidance and restricted-zone routing for emergency and municipal services operating in shared airspace.

Built by [Jakub Siuda](https://www.siuda.dev/about/), Andrea Kraśko and Bahdan Dubovik as team 404 during SpaceShield Hack 2026. The project was awarded **1st place in the Dual-Use track**.

[Full case study](https://www.siuda.dev/projects/skymarshal/) · [Video demo](https://vimeo.com/1195096071?share=copy&fl=sv&fe=ci) · [Polska wersja](README.pl.md)

![Jakub Siuda, Andrea Kraśko and Bahdan Dubovik after winning the SpaceShield Hack 2026 Dual-Use track](assets/spaceshield-hack-2026-win.jpg)

> SkyMarshal C2 is a demonstration prototype. It is not connected to real government, military, emergency-response or commercial aviation systems.

## The problem

Several agencies may need to operate drones above the same area during an emergency. Without a shared operational picture, routes can conflict, restricted zones can be crossed and teams may duplicate work. SkyMarshal C2 explores how a dispatcher could coordinate these missions from one interface.

## What the prototype does

### Live geospatial context

- Loads live orthophotomaps from Poland's national Geoportal WMS services.
- Supports a dark tactical map and satellite imagery.
- Keeps missions, aircraft and operational zones visible in one shared view.

### Multi-agency mission coordination

- Creates shared missions for police, fire and crisis-management teams.
- Assigns several drones to one incident with separated operating altitudes.
- Gives operators a common view of roles, routes and mission status.

### Restricted-zone routing

- Detects when a route crosses the protected Huta Stalowa Wola area.
- Generates a bypass trajectory around the restricted polygon with a safety buffer.
- Shows the adjusted route directly on the map.

### UTM and safety simulation

- Blocks mission planning above 120 metres AGL in the open-category scenario.
- Simulates flight-plan submission and transponder assignment.
- Warns operators about simulated electromagnetic interference near the Stalowa Wola power plant.

### Mission builder

- Uses a side-by-side form and map so the operational view remains visible.
- Allows mission targets to be selected directly on the map.
- Presents alerts and mission parameters in a focused dispatcher interface.

## Technology

- **Frontend:** React 19 and Vite
- **Maps:** React Leaflet and Leaflet.js
- **Charts:** Recharts
- **Interface:** Vanilla CSS and Tailwind CSS
- **Audio:** Web Audio API
- **Map data:** GUGiK Geoportal WMS

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — technical architecture and proposed integrations.
- [`SOURCES.md`](SOURCES.md) — geographic and regulatory sources used by the prototype.
- [`README.pl.md`](README.pl.md) — complete Polish documentation.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/).

Build the production bundle with:

```bash
npm run build
```

## Team 404

- [Jakub Siuda](https://www.siuda.dev/about/)
- Andrea Kraśko
- Bahdan Dubovik

Jakub is a 42 Warsaw student building AI products, internal tools and rapid prototypes in Warsaw.

[Portfolio](https://www.siuda.dev/) · [LinkedIn](https://www.linkedin.com/in/jksiuda/) · [Project case study](https://www.siuda.dev/projects/skymarshal/)
