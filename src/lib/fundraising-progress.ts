const DURATION_MS = 1400;

const formatMoney = (value: number) => `£${Math.round(value).toLocaleString("en-GB")}`;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function initFundraisingProgress() {
  const card = document.querySelector<HTMLElement>("[data-fundraising-card]");
  const figure = card?.querySelector<HTMLElement>("[data-count-to]");
  if (!card || !figure || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  const target = Number(figure.dataset.countTo);
  const lockWidth = () => {
    figure.style.minWidth = "";
    figure.textContent = formatMoney(Number("8".repeat(String(Math.round(target)).length)));
    figure.style.minWidth = `${Math.ceil(figure.getBoundingClientRect().width)}px`;
    figure.textContent = formatMoney(0);
  };
  lockWidth();
  card.classList.add("is-armed");
  document.fonts?.ready.then(() => {
    if (!card.classList.contains("is-filled")) lockWidth();
  });

  const run = () => {
    card.classList.add("is-filled");
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      figure.textContent = formatMoney(target * easeOut(t));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      run();
    },
    { threshold: 0.6 },
  );
  observer.observe(card);
}
