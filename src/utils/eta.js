import { BUS_SPEED_KMH } from "../data/constants";

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcETA(busLat, busLng, studentLat, studentLng) {
  const dist = haversineKm(busLat, busLng, studentLat, studentLng);
  const etaSeconds = Math.round((dist / BUS_SPEED_KMH) * 3600);
  let etaLabel;
  if (etaSeconds < 60)        etaLabel = "Arriving now";
  else if (etaSeconds < 120)  etaLabel = "~1 min";
  else if (etaSeconds < 3600) etaLabel = `~${Math.round(etaSeconds / 60)} mins`;
  else                         etaLabel = `~${(etaSeconds / 3600).toFixed(1)} hrs`;
  return { etaSeconds, distanceKm: dist, etaLabel };
}

export function etaColor(etaSeconds) {
  if (etaSeconds <= 120) return "#ff1744";
  if (etaSeconds <= 300) return "#ffb300";
  return "#00e676";
}
