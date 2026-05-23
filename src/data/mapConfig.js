import L from 'leaflet';

export const commandCenterIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #6366f1; background: rgba(9, 9, 11, 0.9); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(99,102,241,0.5);">
    <span class="material-symbols-outlined text-[#6366f1]" style="font-size: 18px;">business</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export const waterStationIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #10b981; background: rgba(9, 9, 11, 0.9); display: flex; align-items: center; justify-content: center;">
    <span class="material-symbols-outlined text-[#10b981]" style="font-size: 14px;">water_drop</span>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

export const turbiaAirportIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #ec4899; background: rgba(9, 9, 11, 0.9); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(236,72,153,0.5);">
    <span class="material-symbols-outlined text-[#ec4899]" style="font-size: 18px;">flight_takeoff</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export const getDroneIcon = (department, isLinkLost = false) => {
  let color = isLinkLost ? '#ef4444' : '#6366f1';
  if (!isLinkLost) {
    if (department.includes('Straż') || department.includes('OSP')) color = '#f59e0b';
    if (department.includes('Kryzysowe')) color = '#10b981';
    if (department.includes('Aeroklub')) color = '#ec4899';
  }

  let iconHtml = `<div style="width: 10px; height: 10px; border-radius: 50%; background: ${color};" class="${isLinkLost ? 'animate-ping' : 'alert-indicator'}"></div>`;
  if (department.includes('Aeroklub')) {
    iconHtml = `<span class="material-symbols-outlined text-[#ec4899]" style="font-size: 16px; font-weight: bold; transform: rotate(45deg); display: block;">flight</span>`;
  }

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="width: 28px; height: 28px; border-radius: 50%; border: ${isLinkLost ? '2px' : '1px'} solid ${color}; background: ${isLinkLost ? 'rgba(239, 68, 68, 0.2)' : 'rgba(9, 9, 11, 0.9)'}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color};">
      ${iconHtml}
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};
