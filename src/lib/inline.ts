const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const renderInline = (value: string) =>
  escapeHtml(value)
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/g, (_match, text: string, href: string) => {
      const external = href.startsWith("http");
      return external
        ? `<a class="text-link" href="${href}" target="_blank" rel="noopener noreferrer">${text}<span class="external-link-icon" aria-hidden="true"> ↗</span><span class="visually-hidden"> (opens in a new tab)</span></a>`
        : `<a class="text-link" href="${href}">${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
