export async function reportIssue(message: string) {
  await logseq.UI.showMsg(message, "error");
}
