# SkyMarshal C2 TAC-NET: Prototype Status & Pilot Architecture

This document outlines how the **SkyMarshal** hackathon prototype can transition into a production-ready coordination system for Stalowa Wola, Poland.

Current prototype status: Geoportal/GUGiK WMS and public reference links are active. PAŻP/DroneTower, SWD-ST, MON, DJI Cloud, MAVLink telemetry, and private databases are not connected. They are represented as planned pilot integrations and simulated workflows.

---

## 🏗️ 1. Production Architecture Overview

In a pilot deployment, SkyMarshal would act as an **integrator layer** connecting field hardware, national airspace systems, and emergency dispatch services after formal access, agreements, and security review.

```mermaid
graph TD
    subgraph "Służby i Zgłoszenia (Incident Input)"
        SWD[Systemy SWD-ST / Policji] -.->|planned REST API / Webhooks| C2[SkyMarshal Core Backend]
    end

    subgraph "SkyMarshal C2 Engine"
        C2 -->|Real-time Telemetry| UI[React Tactical Dashboard]
        C2 -->|Dynamic Geodesic Routing| Route[Routing & Avoidance Engine]
        C2 -->|Database storage| DB[(PostgreSQL + PostGIS)]
    end

    subgraph "Krajowy System Kontroli Powietrznej"
        C2 <-.->|planned API / WebSockets| PANSA[PansaUTM / PAŻP CIS]
    end

    subgraph "Flota Bezpilotowa (UAS Flight Hardware)"
        DJI[DJI FlightHub 2 API] <-.->|planned LTE / 5G| C2
        MAV[MAVLink / QGroundControl] <-.->|planned LTE / ROS2 / MAVSDK| C2
        Stream[WebRTC / RTSP Media Server] -.->|planned live video| UI
    end
    
    style C2 fill:#00F0FF,stroke:#333,stroke-width:2px,color:#000
    style PANSA fill:#FFB800,stroke:#333,stroke-width:2px,color:#000
```

---

## 🔗 2. Key Integration Points with Existing Systems

To ensure maximum **Correctness (Poprawność)** and **Impact (Wpływ)** in the eyes of the jury, SkyMarshal is designed around four standard integration interfaces:

### A. National Airspace System: PAŻP / DroneTower
*   **How it works:** Under Polish and EU U-Space regulations, all commercial/state drone flights must register with the Polish Air Navigation Services Agency (PAŻP).
*   **Prototype status:** SkyMarshal simulates the UTM submission workflow and generates a working XPNDR code for demonstration only.
*   **Pilot integration path:** After PAŻP/DroneTower access is granted, SkyMarshal would exchange flight plans, clearance status, and telemetry using the approved interface available to the pilot.
*   **Real-world Value:** Reduces duplicate manual work for operators while preserving external authorization as the source of truth.

### B. Hardware Integration: DJI FlightHub 2 & MAVLink
The prototype uses demonstration fleet data or locally imported JSON scenarios. In a pilot:
1.  **DJI Enterprise Drones:** SkyMarshal would integrate with **DJI FlightHub 2 Cloud API** only after account/API access is approved.
2.  **Custom/Open-Source Drones (MAVLink):** Companion computers running **MAVSDK** or **ROS2** could send telemetry to SkyMarshal's **MQTT broker** over a secured network.

### C. Emergency Services: SWD-ST / SWD-Policja
*   **How it works:** When a citizen reports a fire or accident, it enters the **System Wspomagania Dowodzenia (SWD)**.
*   **Prototype status:** incidents are demonstrational or imported from local JSON files.
*   **Pilot integration path:** SkyMarshal could listen to approved SWD message queues (RabbitMQ/Kafka) or REST webhooks. Upon receiving a dispatch event with GPS coordinates:
    1.  The system automatically selects the nearest standby drone based on battery, speed, and sensor capabilities.
    2.  An optimized, legally-compliant trajectory is pre-calculated.
    3.  The human dispatcher only needs to click **"Approve & Launch"**.

### D. Geoportal & GIS Data Integration
*   **Integration:** Map layers in production use standard Open Geospatial Consortium (OGC) protocols like **WMS (Web Map Service)** and **WFS (Web Feature Service)**.
*   **Data Sources:** Integrates directly with **Geoportal.gov.pl** and municipal GIS systems to fetch:
    *   Precise digital terrain models (DTM) for obstacle and terrain-hugging flights.
    *   Real-time flood maps or critical infrastructure locations.

---

## ⚙️ 3. Production Technology Stack

To scale this MVP into a mission-critical municipal system, the recommended production stack is:

*   **Frontend:** React (Vite) + TailwindCSS + Leaflet/Mapbox GL JS (Web hardware acceleration).
*   **Backend:** Go (Golang) or Node.js (NestJS) – chosen for high concurrency, low latency, and robust WebSocket handling.
*   **Database:** **PostgreSQL with PostGIS extension** (enabling millisecond-level spatial indexing, polygon containment checks, and geofence intersections).
*   **Message Broker:** **Mosquitto (MQTT)** for lightweight, low-bandwidth drone telemetry streams; **RabbitMQ** for reliable enterprise event queuing.
*   **Streaming Server:** **Mediasoup / LiveKit (WebRTC)** to stream sub-100ms thermal and HD video feeds directly from drone payloads to the browser.

---

## 💡 4. Real-world Deployment Scenario: Stalowa Wola

1.  **Deployment:** Installed on local secure servers within the **Municipal Crisis Management Center (CZP)**.
2.  **Autonomous Docks:** Heavy drones (like the DJI Matrice 3D) are placed in autonomous weatherproof charging docks (e.g., DJI Dock 2) at key tactical points (HSW, I LO im. KEN, City Hall).
3.  **Operation:** Upon a critical alert (e.g., thermal alert at HSW), the system wakes the drone, opens the dock roof, uploads the *Geodesic Arc* routing, launches the mission completely autonomously, and streams live feeds to all integrated command posts.
