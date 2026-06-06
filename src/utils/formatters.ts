import { format, formatDistanceToNow } from "date-fns";

export function formatCurrency(
  amount: number,
  currency: "BDT" | "USD" | "EUR" = "BDT"
): string {
  const localeMap = { BDT: "en-BD", USD: "en-US", EUR: "de-DE" };
  return new Intl.NumberFormat(localeMap[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function formatDate(timestamp: number, dateFormat = "dd MMM yyyy"): string {
  return format(new Date(timestamp), dateFormat);
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatChangeIndicator(change: number): string {
  return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
}