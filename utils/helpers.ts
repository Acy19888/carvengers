export function generateId(prefix = ""): string {
  const random = Math.random().toString(36).substring(2, 10);
  const ts = Date.now().toString(36);
  return prefix ? `${prefix}_${ts}${random}` : `${ts}${random}`;
}

export function formatDate(epoch: number): string {
  return new Date(epoch).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
