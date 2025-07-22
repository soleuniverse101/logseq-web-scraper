export function reportIssue(message: string) {
  return logseq.UI.showMsg("❌ " + message);
}
