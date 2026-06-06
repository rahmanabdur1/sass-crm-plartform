"use client";
import { useState, useCallback } from "react";
import { Lead } from "@/types/crm.types";
import { Branch } from "@/types/branch.types";
import { MapMarker, GeoLocation } from "@/types/gis.types";
import { LEAD_STATUS_COLORS } from "@/utils/constants";
import html2canvas from "html2canvas";

export type MapLayerKeys = "branches" | "leads" | "heatmap" | "routes";

export interface MapLayers {
  branches: boolean;
  leads: boolean;
  heatmap: boolean;
  routes: boolean;
}

export function useGIS(leads: Lead[], branches: Branch[]) {
  const [layers, setLayers] = useState<MapLayers>({
    branches: true,
    leads: true,
    heatmap: false,
    routes: false,
  });
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [drawMode, setDrawMode] = useState<"none" | "polygon">("none");
  const [drawnPolygon, setDrawnPolygon] = useState<GeoLocation[]>([]);
  const [filteredLeadIds, setFilteredLeadIds] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleLayer = useCallback((key: keyof MapLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const buildMarkers = useCallback((): MapMarker[] => {
    const markers: MapMarker[] = [];

    if (layers.branches) {
      branches.forEach((b) => {
        if (!b.location.lat || !b.location.lng) return;
        markers.push({
          id: b.id,
          type: "branch",
          position: { lat: b.location.lat, lng: b.location.lng },
          title: b.name,
          status: b.status,
          color: b.status === "active" ? "#22C55E" : b.status === "pending" ? "#F59E0B" : "#EF4444",
          data: b as unknown as Record<string, unknown>,
        });
      });
    }

    if (layers.leads) {
      leads.forEach((l) => {
        if (!l.location?.lat || !l.location?.lng) return;
        markers.push({
          id: l.id,
          type: "lead",
          position: { lat: l.location.lat, lng: l.location.lng },
          title: l.name,
          status: l.status,
          color: LEAD_STATUS_COLORS[l.status],
          data: l as unknown as Record<string, unknown>,
        });
      });
    }

    return markers;
  }, [leads, branches, layers]);

  // Point-in-polygon check (ray casting)
  const isPointInPolygon = useCallback((point: GeoLocation, polygon: GeoLocation[]): boolean => {
    if (polygon.length < 3) return false;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      const intersect =
        yi > point.lng !== yj > point.lng &&
        point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }, []);

  const applyPolygonFilter = useCallback((polygon: GeoLocation[]) => {
    setDrawnPolygon(polygon);
    const ids = new Set<string>();
    leads.forEach((l) => {
      if (l.location && isPointInPolygon(l.location, polygon)) {
        ids.add(l.id);
      }
    });
    setFilteredLeadIds(ids);
  }, [leads, isPointInPolygon]);

  const clearPolygonFilter = useCallback(() => {
    setDrawnPolygon([]);
    setFilteredLeadIds(new Set());
    setDrawMode("none");
  }, []);

  const exportMapAsPNG = useCallback(async (containerId: string) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    const canvas = await html2canvas(el, { useCORS: true, scale: 2 });
    const link = document.createElement("a");
    link.download = `map-export-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const leadsInPolygon = drawnPolygon.length >= 3
    ? leads.filter((l) => l.location && isPointInPolygon(l.location, drawnPolygon))
    : [];

  return {
    layers,
    toggleLayer,
    selectedMarker,
    setSelectedMarker,
    drawMode,
    setDrawMode,
    drawnPolygon,
    filteredLeadIds,
    leadsInPolygon,
    applyPolygonFilter,
    clearPolygonFilter,
    buildMarkers,
    exportMapAsPNG,
    isFullscreen,
    toggleFullscreen,
  };
}