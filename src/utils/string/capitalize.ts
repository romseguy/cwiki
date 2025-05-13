export function capitalize(string?: string): string {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.substring(1, string.length);
}
