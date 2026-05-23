// Utility for UTM distances
export const getDistanceMeters = (p1, p2) => {
  const R = 6371e3;
  const dLat = (p2[0]-p1[0]) * Math.PI/180;
  const dLng = (p2[1]-p1[1]) * Math.PI/180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1[0] * Math.PI/180) * Math.cos(p2[0] * Math.PI/180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Distance from point to line segment
export const getDistanceToSegment = (p, a, b) => {
  const R = 6371e3;
  const latScale = Math.PI / 180;
  const lngScale = Math.cos(p[0] * Math.PI / 180) * Math.PI / 180;
  const pCart = [0, 0];
  const aCart = [(a[0] - p[0]) * latScale * R, (a[1] - p[1]) * lngScale * R];
  const bCart = [(b[0] - p[0]) * latScale * R, (b[1] - p[1]) * lngScale * R];
  const l2 = (aCart[0] - bCart[0]) ** 2 + (aCart[1] - bCart[1]) ** 2;
  if (l2 === 0) return Math.sqrt(aCart[0]**2 + aCart[1]**2);
  let t = ((pCart[0] - aCart[0]) * (bCart[0] - aCart[0]) + (pCart[1] - aCart[1]) * (bCart[1] - aCart[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = [aCart[0] + t * (bCart[0] - aCart[0]), aCart[1] + t * (bCart[1] - aCart[1])];
  return Math.sqrt(proj[0]**2 + proj[1]**2);
};

// Helper for generating waypoints around a circle
const calculateSegmentBypass = (start, end, center, radius, buffer) => {
  const detourRadius = radius + buffer;
  const latScale = 111000;
  const lngScale = 111000 * Math.cos(start[0] * Math.PI / 180);

  const startM = [
    (start[0] - center[0]) * latScale,
    (start[1] - center[1]) * lngScale
  ];
  const endM = [
    (end[0] - center[0]) * latScale,
    (end[1] - center[1]) * lngScale
  ];

  const thetaA = Math.atan2(startM[1], startM[0]);
  const thetaB = Math.atan2(endM[1], endM[0]);

  let diff = thetaB - thetaA;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  while (diff > Math.PI) diff -= 2 * Math.PI;

  const wps = [];
  // Generate 3 waypoints forming a polygon bypass
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const angle = thetaA + t * diff;
    const wpX = detourRadius * Math.cos(angle);
    const wpY = detourRadius * Math.sin(angle);
    wps.push([
      center[0] + wpX / latScale,
      center[1] + wpY / lngScale
    ]);
  }
  return wps;
};

// Multi-Zone Pathfinding Router (fixes Point 2 in the Audit)
export const calculateRoute = (start, end, bypassP01Authorized) => {
  const activeZones = [
    { id: 'HSW', center: [50.5510, 22.0460], radius: 1500, buffer: 300, name: 'P-01 (HSW)' },
    { id: 'ECSW', center: [50.5841, 22.0523], radius: 800, buffer: 200, name: 'R-05 (ECSW)' },
    { id: 'EPST', center: [50.6264, 21.9989], radius: 2000, buffer: 300, name: 'EPST ATZ (Turbia)' }
  ];

  let currentRoute = [start, end];
  let intersects = false;
  let intersectedZoneNames = [];

  for (const zone of activeZones) {
    // If military authorization is active for HSW, bypass it
    if (zone.id === 'HSW' && bypassP01Authorized) continue;

    let newRoute = [];
    let zoneIntersects = false;

    for (let i = 0; i < currentRoute.length - 1; i++) {
      const segStart = currentRoute[i];
      const segEnd = currentRoute[i+1];
      const distToSeg = getDistanceToSegment(zone.center, segStart, segEnd);

      if (distToSeg <= zone.radius + zone.buffer) {
        const distStart = getDistanceMeters(segStart, zone.center);
        const distEnd = getDistanceMeters(segEnd, zone.center);

        // If starting or ending inside the zone, we fly direct (authorised/unavoidable)
        if (distStart < zone.radius + zone.buffer || distEnd < zone.radius + zone.buffer) {
          newRoute.push(segStart);
          continue;
        }

        // Bypass this segment around the circle
        const wps = calculateSegmentBypass(segStart, segEnd, zone.center, zone.radius, zone.buffer);
        newRoute.push(segStart, ...wps);
        zoneIntersects = true;
        intersects = true;
      } else {
        newRoute.push(segStart);
      }
    }
    newRoute.push(currentRoute[currentRoute.length - 1]);
    currentRoute = newRoute;

    if (zoneIntersects) {
      intersectedZoneNames.push(zone.name);
    }
  }

  if (intersects) {
    const finalWaypoints = currentRoute.slice(1, currentRoute.length - 1);
    return { waypoints: finalWaypoints, intersects: true, zones: intersectedZoneNames };
  } else {
    return { waypoints: null, intersects: false, zones: [] };
  }
};
