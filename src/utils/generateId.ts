import { v4 as uuid } from "uuid";

export const generateId = (): string => uuid();

export const generateShortId = (): string =>
  Math.random().toString(36).slice(2, 8).toUpperCase();