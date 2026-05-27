// The list of districts that have been fully built as field guides.
// Order matters — the folio number is 1-indexed based on this array.
export const BUILT_DISTRICTS: string[] = ["satkhira", "shariatpur", "noakhali", "habiganj", "barisal", "natore", "chuadanga", "meherpur"];

export function folioNumber(slug: string): string | null {
  const idx = BUILT_DISTRICTS.indexOf(slug);
  if (idx === -1) return null;
  const n = idx + 1;
  return `N°${n.toString().padStart(2, "0")}`;
}
