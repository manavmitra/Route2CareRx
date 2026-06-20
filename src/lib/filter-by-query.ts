export function matchesNameOrAddress(
  query: string,
  fields: (string | null | undefined)[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(q);
}
