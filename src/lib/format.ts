/** Format kobo as Nigerian Naira, e.g. 2800000 -> "₦28,000". */
export function formatNaira(kobo: number): string {
  return `₦${Math.round(kobo / 100).toLocaleString("en-US")}`;
}
