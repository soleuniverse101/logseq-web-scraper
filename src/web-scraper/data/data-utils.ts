export function wrapText(
  text: string,
  maxCount: number,
  wrapIndicator = "...",
) {
  return text.length > maxCount
    ? text.substring(0, maxCount) + wrapIndicator
    : text;
}
