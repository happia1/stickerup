export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = iso.slice(0, 10);
  return d.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_m, y, mo, day) => `${y.slice(2)}.${mo}.${day}`);
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  return `${fmtDate(iso)} ${iso.slice(11, 16)}`;
}
