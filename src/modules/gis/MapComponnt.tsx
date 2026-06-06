"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Lead } from "../../types/crm.types";
import { Branch } from "../../types/branch.types";
import { LEAD_STATUS_COLORS } from "../../utils/constants";

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Props {
  leads: Lead[];
  branches: Branch[];
  layers: { branches: boolean; leads: boolean; heatmap: boolean };
}

export default function MapComponent({ leads, branches, layers }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView([23.8103, 90.4125], 7);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© CartoDB",
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Branch markers
    if (layers.branches) {
      branches.forEach((branch) => {
        const { lat, lng } = branch.location;
        if (!lat || !lng) return;

        const icon = L.divIcon({
          html: `<div style="
            width:32px; height:32px; border-radius:8px;
            background:#6366F1; display:flex; align-items:center;
            justify-content:center; color:white; font-size:14px;
            box-shadow:0 2px 8px rgba(99,102,241,0.6);
          ">🏢</div>`,
          className: "",
          iconSize: [32, 32],
        });

        L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif; padding:8px;">
              <strong style="color:#6366F1">${branch.name}</strong><br/>
              <small>${branch.location.address}</small><br/>
              <span>Revenue: ৳${branch.metrics.revenue.toLocaleString()}</span><br/>
              <span>Leads: ${branch.metrics.totalLeads}</span>
            </div>
          `);
      });
    }

    // Lead markers
    if (layers.leads) {
      leads.forEach((lead) => {
        if (!lead.location?.lat || !lead.location?.lng) return;
        const color = LEAD_STATUS_COLORS[lead.status];

        L.circleMarker([lead.location.lat, lead.location.lng], {
          radius: 8,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6,
        })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif; padding:8px;">
              <strong>${lead.name}</strong><br/>
              <span style="color:${color}">${lead.status.toUpperCase()}</span><br/>
              <span>${lead.email}</span><br/>
              <span>Value: ৳${lead.value.toLocaleString()}</span>
            </div>
          `);
      });
    }
  }, [leads, branches, layers]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}






// // Add this function inside MapComponent after map init:

// // Inside the useEffect where map is created, add:
// const drawnLayers: L.Layer[] = [];

// map.on("click", (e: L.LeafletMouseEvent) => {
//   // Polygon draw logic - simple point collection
//   if ((window as unknown as Record<string, unknown>).__mapDrawMode === "polygon") {
//     const points = ((window as unknown as Record<string, unknown>).__drawPoints || []) as [number, number][];
//     points.push([e.latlng.lat, e.latlng.lng]);
//     (window as unknown as Record<string, unknown>).__drawPoints = points;

//     L.circleMarker(e.latlng, { radius: 5, color: "#6366F1", fillColor: "#6366F1", fillOpacity: 1 })
//       .addTo(map);

//     if (points.length >= 3) {
//       const poly = L.polygon(points, {
//         color: "#6366F1",
//         fillColor: "#6366F1",
//         fillOpacity: 0.15,
//         weight: 2,
//         dashArray: "5,5",
//       }).addTo(map);
//       drawnLayers.push(poly);
//     }
//   }
// });