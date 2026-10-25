/** Opens the corner chat. If a prompt is given, it is typed into the box but not sent. */
export function askGenesis(prompt?: string) {
  window.dispatchEvent(new CustomEvent("open-genesis", { detail: { prompt } }));
}