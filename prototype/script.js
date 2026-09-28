// Archived design-prototype interactions. Production scripts live in Astro components.
const menu = document.querySelector("[data-mobile-menu]");
const menuButton = document.querySelector("[data-menu-toggle]");
const menuClose = document.querySelector("[data-menu-close]");
const previewToggles = document.querySelectorAll("[data-device-preview-toggle]");
const views = document.querySelectorAll("[data-view]");
const routeLinks = document.querySelectorAll("[data-route]");
const eventDateLabels = document.querySelectorAll("[data-event-date]");

function setMenu(open) {
  if (!menu || !menuButton) return;

  menu.classList.toggle("is-open", open);
  menu.setAttribute("aria-hidden", String(!open));
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);

  if (open) menuClose?.focus();
  else menuButton.focus();
}

function currentRoute() {
  return window.location.hash.slice(1) || "home";
}

function showRoute() {
  const route = currentRoute();
  const activeRoute = document.querySelector(`[data-view="${route}"]`) ? route : "home";

  views.forEach((view) => {
    view.hidden = view.dataset.view !== activeRoute;
  });

  routeLinks.forEach((link) => {
    link.toggleAttribute("aria-current", link.dataset.route === activeRoute);
  });

  const heading = document.querySelector(`[data-view="${activeRoute}"] h1`);
  document.title = activeRoute === "home"
    ? "Friends of Ashley | Ashley C of E Primary School PTA"
    : `${heading?.textContent.trim()} | Friends of Ashley`;
  window.scrollTo({ top: 0, behavior: "instant" });
}

function setRelativeEventDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  eventDateLabels.forEach((label) => {
    const eventDate = new Date(`${label.dataset.eventDate}T00:00:00`);
    const daysAway = Math.round((eventDate - today) / 86400000);
    const text = daysAway === 0 ? "Today" : daysAway === 1 ? "Tomorrow" : "";

    label.textContent = text;
    label.hidden = !text;
  });
}

menuButton?.addEventListener("click", () => setMenu(true));
menuClose?.addEventListener("click", () => setMenu(false));
menu?.addEventListener("click", (event) => {
  if (event.target === menu || event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu?.classList.contains("is-open")) setMenu(false);
});

previewToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const enabled = document.documentElement.classList.toggle("phone-preview-active");
    previewToggles.forEach((button) => button.setAttribute("aria-pressed", String(enabled)));
  });
});

window.addEventListener("hashchange", showRoute);
setRelativeEventDates();
showRoute();
