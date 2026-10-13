// Find the largest size that preserves the baseline's line breaks, within 0.1px.
export function largestHeadingSize(baseline: number, maximum: number, fits: (size: number) => boolean) {
  if (maximum <= baseline) return baseline;
  if (fits(maximum)) return maximum;
  let low = baseline;
  let high = maximum;
  while (high - low > 0.1) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  return low;
}

export function initHeadingFit() {
  const heading = document.querySelector<HTMLElement>("[data-fit-heading]");
  const container = heading?.closest<HTMLElement>(".mobile-page-heading-copy");
  if (!heading || !container) return;
  const mobile = window.matchMedia("(max-width: 63.99rem)");
  const words: Range[] = [];
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    for (const match of node.textContent?.matchAll(/\S+/g) ?? []) {
      const range = document.createRange();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      words.push(range);
    }
  }

  const signature = () => {
    const lines: number[] = [];
    const tolerance = parseFloat(getComputedStyle(heading).fontSize) / 4;
    return words.map((word) => [...word.getClientRects()].map((rect) => {
      const centre = (rect.top + rect.bottom) / 2;
      let line = lines.findIndex((y) => Math.abs(y - centre) < tolerance);
      if (line < 0) line = lines.push(centre) - 1;
      return line;
    }).join(",")).join("|");
  };

  let lastWidth = 0;
  let lastRootSize = "";
  const fit = () => {
    // Always start from Option C's CSS size, not the previous fitted size.
    heading.style.fontSize = "";
    delete heading.dataset.headingFit;
    lastWidth = container.getBoundingClientRect().width;
    lastRootSize = getComputedStyle(document.documentElement).fontSize;
    if (!mobile.matches || !lastWidth || !words.length) return;
    const baseline = parseFloat(getComputedStyle(heading).fontSize);
    const original = signature();
    heading.style.fontSize = "var(--home-heading-fit-max)";
    const maximum = parseFloat(getComputedStyle(heading).fontSize);
    const size = largestHeadingSize(baseline, maximum, (candidate) => {
      heading.style.fontSize = `${candidate}px`;
      const bounds = heading.getBoundingClientRect();
      return signature() === original && words.every((word) => [...word.getClientRects()].every(
        (rect) => rect.left >= bounds.left - 0.5 && rect.right <= bounds.right + 0.5,
      ));
    });
    heading.style.fontSize = `${size}px`;
    heading.dataset.headingFit = "ready";
  };

  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; fit(); });
  };
  fit();
  document.fonts?.ready.then(schedule);
  mobile.addEventListener("change", schedule);
  window.addEventListener("resize", schedule);
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      // Height changes caused by fitting must not trigger an observer loop.
      if (container.getBoundingClientRect().width !== lastWidth || getComputedStyle(document.documentElement).fontSize !== lastRootSize) schedule();
    }).observe(container);
  }
}
