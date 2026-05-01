export function formatDate(date: string): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: string): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function estimateReadingTime(text: string): number {
  const cnChars = (text.match(/[一-鿿]/g) || []).length;
  const words = text.replace(/[一-鿿]/g, " ").split(/\s+/).filter(Boolean).length;
  const totalMinutes = cnChars / 300 + words / 200;
  return Math.max(1, Math.ceil(totalMinutes));
}
