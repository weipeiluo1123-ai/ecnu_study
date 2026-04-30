export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("zh-CN", {
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
