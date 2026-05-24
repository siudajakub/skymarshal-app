import { CRITICAL_INFRASTRUCTURE_ZONES } from '../data/criticalInfrastructure';

// Utility for operational distance checks in the route-planning prototype.
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

// --- POLYGON AVOIDANCE LOGIC ---

const lineSegmentsIntersect = (p1, p2, p3, p4) => {
  const ccw = (A, B, C) => (C[1]-A[1])*(B[0]-A[0]) > (B[1]-A[1])*(C[0]-A[0]);
  return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
};

const intersectionPoint = (p1, p2, p3, p4) => {
  const x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1];
  const x3 = p3[0], y3 = p3[1], x4 = p4[0], y4 = p4[1];
  const denom = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
  if (denom === 0) return null;
  const t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / denom;
  return [x1 + t*(x2-x1), y1 + t*(y2-y1)];
};

const getPolygonCentroid = (poly) => {
  let lat = 0, lng = 0;
  for (const p of poly) { lat += p[0]; lng += p[1]; }
  return [lat/poly.length, lng/poly.length];
};

const expandPolygon = (poly, bufferMeters) => {
  const centroid = getPolygonCentroid(poly);
  return poly.map(p => {
    const dist = getDistanceMeters(centroid, p);
    if (dist === 0) return p;
    const ratio = (dist + bufferMeters) / dist;
    return [
      centroid[0] + (p[0] - centroid[0]) * ratio,
      centroid[1] + (p[1] - centroid[1]) * ratio
    ];
  });
};

const pointInPolygon = (point, vs) => {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const calculatePolygonBypass = (start, end, polygon, bufferMeters = 50) => {
  const n = polygon.length;
  const intersects = [];

  for (let i = 0; i < n; i++) {
    const p3 = polygon[i];
    const p4 = polygon[(i + 1) % n];
    if (lineSegmentsIntersect(start, end, p3, p4)) {
      const pt = intersectionPoint(start, end, p3, p4);
      if (pt) intersects.push({ pt, edgeIndex: i, dist: getDistanceMeters(start, pt) });
    }
  }

  if (intersects.length < 2) return null;

  intersects.sort((a, b) => a.dist - b.dist);
  const pIn = intersects[0];
  const pOut = intersects[intersects.length - 1];

  const expandedPoly = expandPolygon(polygon, bufferMeters);
  const centroid = getPolygonCentroid(polygon);

  const projectOutward = (pt) => {
    const dist = getDistanceMeters(centroid, pt);
    if (dist === 0) return pt;
    const ratio = (dist + bufferMeters) / dist;
    return [
      centroid[0] + (pt[0] - centroid[0]) * ratio,
      centroid[1] + (pt[1] - centroid[1]) * ratio
    ];
  };

  const pInExp = projectOutward(pIn.pt);
  const pOutExp = projectOutward(pOut.pt);

  if (pIn.edgeIndex === pOut.edgeIndex) return [pInExp, pOutExp];

  const buildForward = () => {
    const path = [pInExp];
    let curr = (pIn.edgeIndex + 1) % n;
    let safeGuard = 0;
    while (true) {
      if (safeGuard++ > n * 2) break;
      path.push(expandedPoly[curr]);
      if (curr === pOut.edgeIndex) break;
      curr = (curr + 1) % n;
    }
    path.push(pOutExp);
    return path;
  };

  const buildBackward = () => {
    const path = [pInExp];
    let curr = pIn.edgeIndex;
    let safeGuard = 0;
    while (true) {
      if (safeGuard++ > n * 2) break;
      path.push(expandedPoly[curr]);
      if (curr === (pOut.edgeIndex + 1) % n) break;
      curr = (curr - 1 + n) % n;
    }
    path.push(pOutExp);
    return path;
  };

  const path1 = buildForward();
  const path2 = buildBackward();

  const pathDist = (path) => {
    let d = 0;
    for (let i=0; i<path.length-1; i++) d += getDistanceMeters(path[i], path[i+1]);
    return d;
  };

  return pathDist(path1) < pathDist(path2) ? path1 : path2;
};

// Demonstracyjny router wielostrefowy. Nie zastępuje produkcyjnego systemu UTM.
export const calculateRoute = (start, end, bypassP01Authorized) => {
  const activeZones = [
    ...CRITICAL_INFRASTRUCTURE_ZONES.map(zone => ({
      id: zone.id,
      center: zone.center,
      radius: zone.radius,
      buffer: Math.max(0, zone.advisoryRadius - zone.radius),
      name: zone.name,
      polygon: zone.polygon
    })),
    { id: 'EPST', center: [50.6264, 21.9989], radius: 2000, buffer: 300, name: 'ruch GA EPST Turbia' }
  ];

  let currentRoute = [start, end];
  let intersects = false;
  let intersectedZoneNames = [];

  for (const zone of activeZones) {
    if (bypassP01Authorized && zone.id === 'hsw_core') continue;

    let newRoute = [];
    let zoneIntersects = false;

    for (let i = 0; i < currentRoute.length - 1; i++) {
      const segStart = currentRoute[i];
      const segEnd = currentRoute[i+1];
      if (zone.polygon) {
        // Poligonalne omijanie
        const isStartInside = pointInPolygon(segStart, zone.polygon);
        const isEndInside = pointInPolygon(segEnd, zone.polygon);

        if (isStartInside || isEndInside) {
          newRoute.push(segStart);
          continue;
        }

        const wps = calculatePolygonBypass(segStart, segEnd, zone.polygon, zone.buffer || 50);
        if (wps) {
          newRoute.push(segStart, ...wps);
          zoneIntersects = true;
          intersects = true;
        } else {
          newRoute.push(segStart);
        }
      } else {
        // Tradycyjne kołowe omijanie
        const distToSeg = getDistanceToSegment(zone.center, segStart, segEnd);
        if (distToSeg <= zone.radius + zone.buffer) {
          const distStart = getDistanceMeters(segStart, zone.center);
          const distEnd = getDistanceMeters(segEnd, zone.center);

          if (distStart < zone.radius + zone.buffer || distEnd < zone.radius + zone.buffer) {
            newRoute.push(segStart);
            continue;
          }

          const wps = calculateSegmentBypass(segStart, segEnd, zone.center, zone.radius, zone.buffer);
          newRoute.push(segStart, ...wps);
          zoneIntersects = true;
          intersects = true;
        } else {
          newRoute.push(segStart);
        }
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
