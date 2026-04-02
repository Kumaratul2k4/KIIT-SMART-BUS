import { useEffect, useRef } from "react";
import L from "leaflet";
import { CAMPUSES, STATUS_CONFIG } from "../data/constants";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Improved location-pin style campus marker (like image provided)
function makeCampusIcon(name) {
  const short = name.replace("Campus ","C");
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:default;">
      <div style="
        background:#fff;
        border:2.5px solid #1a7a1a;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        width:32px;height:32px;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 3px 10px rgba(26,122,26,0.35);
      ">
        <div style="transform:rotate(45deg);font-size:9px;font-weight:800;color:#1a7a1a;font-family:monospace;letter-spacing:-0.5px;line-height:1;">${short}</div>
      </div>
      <div style="
        width:6px;height:6px;border-radius:50%;
        background:rgba(26,122,26,0.25);
        margin-top:1px;
      "></div>
      <div style="
        background:rgba(255,255,255,0.95);
        border:1.5px solid rgba(26,122,26,0.4);
        border-radius:6px;
        padding:2px 7px;
        font-size:10px;font-weight:700;
        color:#1a7a1a;
        font-family:monospace;
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(26,122,26,0.2);
        margin-top:2px;
      ">${name}</div>
    </div>`;
  return L.divIcon({ html, className:"", iconSize:[80,70], iconAnchor:[16,48] });
}

function makeBusIcon(color, vehicleId, isSelected) {
  const border = isSelected ? "#1a7a1a" : color;
  const html = `
    <div style="position:relative;cursor:pointer;">
      <div style="background:${color}22;border:2.5px solid ${border};border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px ${color}55;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20">
          <rect x="2" y="5" width="16" height="10" rx="2" fill="${color}"/>
          <rect x="3" y="6" width="5" height="4" rx="0.5" fill="#fff"/>
          <rect x="12" y="6" width="5" height="4" rx="0.5" fill="#fff"/>
          <circle cx="5" cy="16" r="2" fill="${color}"/>
          <circle cx="15" cy="16" r="2" fill="${color}"/>
        </svg>
      </div>
      <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#fff;border:1.5px solid ${color}99;border-radius:6px;padding:2px 7px;font-size:10px;font-family:monospace;font-weight:700;color:${color};white-space:nowrap;box-shadow:0 1px 4px ${color}33;">${vehicleId}</div>
      <div style="position:absolute;top:3px;right:3px;width:8px;height:8px;border-radius:50%;background:${color};animation:buspulse 1.5s infinite;"></div>
    </div>`;
  return L.divIcon({ html, className:"", iconSize:[38,38], iconAnchor:[19,19], popupAnchor:[0,-22] });
}

function makeStudentIcon() {
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:30px;height:30px;border-radius:50%;background:rgba(179,136,255,0.15);border:2.5px solid #7b1fa2;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(123,31,162,0.35);">
        <div style="width:10px;height:10px;border-radius:50%;background:#7b1fa2;"></div>
      </div>
      <div style="background:#fff;border:1.5px solid rgba(123,31,162,0.4);border-radius:5px;padding:1px 6px;font-size:9px;font-weight:700;color:#7b1fa2;font-family:monospace;margin-top:2px;box-shadow:0 1px 4px rgba(123,31,162,0.2);">YOU</div>
    </div>`;
  return L.divIcon({ html, className:"", iconSize:[30,46], iconAnchor:[15,16] });
}

export default function CampusMap({ buses, gpsData, studentLoc, onBusClick, selectedBusId }) {
  const mapRef           = useRef(null);
  const leafletRef       = useRef(null);
  const busMarkersRef    = useRef({});
  const campusMarkersRef = useRef([]);
  const studentMarkerRef = useRef(null);

  useEffect(() => {
    if (leafletRef.current) return;
    leafletRef.current = L.map(mapRef.current, { center:[20.3537,85.8185], zoom:15, zoomControl:true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a>', maxZoom:19,
    }).addTo(leafletRef.current);
    CAMPUSES.forEach(c => {
      campusMarkersRef.current.push(
        L.marker([c.lat,c.lng],{icon:makeCampusIcon(c.name),zIndexOffset:-100}).addTo(leafletRef.current)
      );
    });
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!leafletRef.current) return;
    Object.keys(busMarkersRef.current).forEach(id => {
      if (!buses.find(b=>b.id===id&&b.active&&b.approved)) {
        busMarkersRef.current[id].remove(); delete busMarkersRef.current[id];
      }
    });
    buses.filter(b=>b.active&&b.approved).forEach(b => {
      const gps=gpsData[b.id], lat=gps?.lat??b.lat, lng=gps?.lng??b.lng;
      const col=STATUS_CONFIG[b.status]?.color||"#2e7d32", isSel=b.id===selectedBusId;
      const destName=CAMPUSES.find(c=>c.id===b.destination)?.name||"";
      const popup=`<div style="background:#fff;color:#1a2e1a;padding:12px 16px;border-radius:10px;font-family:sans-serif;min-width:180px;border:1.5px solid ${col}44;box-shadow:0 4px 16px rgba(0,0,0,0.12);">
        <div style="font-weight:700;font-size:14px;color:${col};margin-bottom:4px">${b.id}</div>
        <div style="font-size:12px;color:#666;margin-bottom:8px">→ ${destName}</div>
        <div style="font-size:11px;background:${col}18;color:${col};padding:3px 10px;border-radius:12px;display:inline-block;border:1px solid ${col}44">${b.status}</div>
        <div style="font-size:11px;color:#999;margin-top:8px">Driver: ${b.driverName}</div>
      </div>`;
      if (busMarkersRef.current[b.id]) {
        busMarkersRef.current[b.id].setLatLng([lat,lng]);
        busMarkersRef.current[b.id].setIcon(makeBusIcon(col,b.id,isSel));
      } else {
        const m=L.marker([lat,lng],{icon:makeBusIcon(col,b.id,isSel),zIndexOffset:100}).addTo(leafletRef.current).bindPopup(popup,{className:"kiit-popup",maxWidth:220});
        m.on("click",()=>{onBusClick(b);m.openPopup()});
        busMarkersRef.current[b.id]=m;
      }
    });
  }, [buses,gpsData,selectedBusId]);

  useEffect(() => {
    if (!leafletRef.current||!studentLoc) return;
    const pos=[studentLoc.lat,studentLoc.lng];
    if (studentMarkerRef.current) studentMarkerRef.current.setLatLng(pos);
    else studentMarkerRef.current=L.marker(pos,{icon:makeStudentIcon(),zIndexOffset:200}).addTo(leafletRef.current).bindPopup("<b style='color:#7b1fa2'>Your Location</b>");
  }, [studentLoc]);

  return (
    <>
      <style>{`
        @keyframes buspulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.8)} }
        .kiit-popup .leaflet-popup-content-wrapper { background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important; }
        .kiit-popup .leaflet-popup-content { margin:0!important; }
        .kiit-popup .leaflet-popup-tip-container { display:none; }
        .leaflet-control-zoom a { background:#fff!important;color:#1a7a1a!important;border-color:rgba(26,122,26,0.3)!important;font-weight:700; }
        .leaflet-control-zoom a:hover { background:#f0f4f0!important; }
        .leaflet-control-attribution { background:rgba(255,255,255,0.8)!important;color:rgba(26,46,26,0.4)!important;font-size:9px!important; }
      `}</style>
      <div ref={mapRef} style={{ width:"100%", height:"100%", minHeight:360 }}/>
    </>
  );
}
