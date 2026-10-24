const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const renderInline = (value: string, internalHref: (path: string) => string = (path) => path) =>
  escapeHtml(value)
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/g, (_match, text: string, href: string) => {
      if (href.startsWith("http")) {
        try {
          const url = new URL(href);
          if (url.origin === "https://www.thefriendsofashley.org" && !url.username && !url.password) {
            return `<a class="text-link" href="${internalHref(`${url.pathname}${url.search}${url.hash}`)}">${text}</a>`;
          }
        } catch {
          // Keep malformed URLs as external links rather than failing the newsletter render.
        }
      }
      const external = href.startsWith("http");
      return external
        ? `<a class="text-link" href="${href}" target="_blank" rel="noopener noreferrer">${text}&nbsp;<span class="external-link-icon" aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span></a>`
        : `<a class="text-link" href="${href}">${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
