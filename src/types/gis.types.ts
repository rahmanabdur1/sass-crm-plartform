import { ID, Timestamp, GeoLocation } from "./common.types";

export interface MapMarker {
  id: ID;
  type: "branch" | "lead";
  position: GeoLocation;
  title: string;
  status?: string;
  color?: string;
  data: Record<string, unknown>;
}

export interface MapLayer {
  id: string;
  name: string;
  type: "markers" | "heatmap" | "boundary" | "route";
  visible: boolean;
  data: MapMarker[];
}

export interface DrawPolygon {
  id: ID;
  points: GeoLocation[];
  name: string;
  createdAt: Timestamp;
}