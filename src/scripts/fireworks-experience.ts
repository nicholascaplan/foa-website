type Colour = [number, number, number];
type Kind = "peony" | "ring" | "willow";

interface Particle { x: number; y: number; vx: number; vy: number; life: number; decay: number; gravity: number; colour: Colour; thin: boolean; }
interface Rocket { x: number; y: number; targetY: number; vy: number; colour: Colour; kind: Kind; }

const PALETTE: Colour[] = [[45, 100, 60], [38, 100, 58], [8, 95, 56], [50, 100, 82], [28, 100, 56]];
const colour = (index: number) => PALETTE[index % PALETTE.length];

class Sky {
  private readonly ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rockets: Rocket[] = [];
  private running = false;
  private width = 0;
  private height = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is unavailable");
    this.ctx = ctx;
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) this.start(); });
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * ratio);
    this.canvas.height = Math.round(rect.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  launch(fx: number, fy: number, shade: Colour, kind: Kind) {
    const targetY = fy * 0.8 * this.height;
    const climb = this.height - targetY;
    // With 1.5% drag per frame a rocket coasts to a stop after about (speed - 1.2) / 0.015 pixels.
    const vy = -(climb * 0.015 + 1.2) * (1 + Math.random() * 0.04);
    this.rockets.push({ x: fx * this.width, y: this.height, targetY, vy, colour: shade, kind });
    this.start();
  }

  private burst(x: number, y: number, shade: Colour, kind: Kind) {
    const count = kind === "ring" ? 70 : 90;
    const speed = kind === "willow" ? 2.4 : 3.2;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.1;
      const velocity = kind === "ring" ? speed : speed * (0.35 + Math.random() * 0.75);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        decay: kind === "willow" ? 0.007 + Math.random() * 0.005 : 0.011 + Math.random() * 0.012,
        gravity: kind === "willow" ? 0.035 : 0.022,
        colour: shade,
        thin: kind === "willow",
      });
    }
  }

  stop() {
    this.particles = [];
    this.rockets = [];
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private start() {
    if (this.running || document.hidden) return;
    this.running = true;
    requestAnimationFrame(() => this.tick());
  }

  private tick() {
    const { ctx } = this;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = "lighter";

    for (let i = this.rockets.length - 1; i >= 0; i -= 1) {
      const rocket = this.rockets[i];
      rocket.y += rocket.vy;
      rocket.vy *= 0.985;
      ctx.fillStyle = "hsla(40, 100%, 80%, 0.9)";
      ctx.fillRect(rocket.x - 1, rocket.y, 2, 6);
      if (rocket.y <= rocket.targetY || rocket.vy > -1.2) {
        this.burst(rocket.x, rocket.y, rocket.colour, rocket.kind);
        this.rockets.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + p.gravity;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `hsla(${p.colour[0]}, ${p.colour[1]}%, ${p.colour[2]}%, ${Math.min(1, p.life * 1.4)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.thin ? 1.4 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    if ((this.particles.length || this.rockets.length) && !document.hidden) {
      requestAnimationFrame(() => this.tick());
    } else {
      this.running = false;
      if (!this.particles.length && !this.rockets.length) this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

/* Particle flames are started only when immersive mode is enabled. */
function createCanvasFlames(stage: HTMLElement) {
  stage.classList.add("fw-stage--canvas-flames");
  const flames = [...stage.querySelectorAll<HTMLElement>(".fw-torch__flames")].map((host) => {
    const canvas = document.createElement("canvas");
    canvas.width = 90;
    canvas.height = 140;
    host.append(canvas);
    return { ctx: canvas.getContext("2d"), canvas, particles: [] as { x: number; y: number; vx: number; vy: number; life: number; decay: number }[], time: 0 };
  }).filter((flame): flame is typeof flame & { ctx: CanvasRenderingContext2D } => flame.ctx !== null);
  let enabled = false;
  let frameId = 0;

  const frame = () => {
    if (enabled && !document.hidden) {
      for (const flame of flames) {
        const { ctx, canvas, particles } = flame;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        flame.time += 0.03;
        for (let i = 0; i < 5; i += 1) {
          particles.push({ x: 45 + (Math.random() - 0.5) * 16, y: 132, vx: (Math.random() - 0.5) * 0.5, vy: -(0.9 + Math.random() * 1.3), life: 1, decay: 0.012 + Math.random() * 0.014 });
        }
        ctx.globalCompositeOperation = "lighter";
        for (let i = particles.length - 1; i >= 0; i -= 1) {
          const p = particles[i];
          p.x += p.vx + Math.sin(flame.time * 2 + p.y * 0.05) * 0.35;
          p.y += p.vy;
          p.life -= p.decay;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
          const hue = 10 + p.life * 50;
          const radius = 3 + p.life * 9;
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          gradient.addColorStop(0, `hsla(${hue}, 100%, ${45 + p.life * 35}%, ${p.life * 0.5})`);
          gradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    if (enabled && !document.hidden) frameId = requestAnimationFrame(frame);
  };
  const update = () => {
    cancelAnimationFrame(frameId);
    if (enabled && !document.hidden) frameId = requestAnimationFrame(frame);
    else for (const flame of flames) {
      flame.particles.length = 0;
      flame.ctx.clearRect(0, 0, flame.canvas.width, flame.canvas.height);
    }
  };
  document.addEventListener("visibilitychange", update);
  return (value: boolean) => {
    enabled = value;
    update();
  };
}

function init(stage: HTMLElement) {
  const canvas = stage.querySelector<HTMLCanvasElement>("[data-fw-sky]");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const timers: number[] = [];
  let sky: Sky | undefined;
  let setFlames: ((value: boolean) => void) | undefined;
  let active = false;
  let paused = true;
  const toggle = document.querySelector<HTMLButtonElement>("[data-fw-mode]");
  const bar = document.querySelector<HTMLElement>("[data-fw-mode-bar]");
  if (!toggle || !bar) return;
  bar.hidden = false;

  const later = (delay: number, action: () => void) => {
    timers.push(window.setTimeout(() => { if (!paused) action(); }, delay));
  };

  const smallBurst = () => later(0, () => {
    sky?.launch(0.14, 0.3, colour(0), "peony");
    later(350, () => sky?.launch(0.86, 0.34, colour(2), "ring"));
  });

  const finale = () => {
    [0.1, 0.3, 0.5, 0.7, 0.9].forEach((x, index) => later(index * 320, () => sky?.launch(x, 0.18 + (index % 2) * 0.14, colour(index), index % 2 ? "willow" : "peony")));
  };

  const intro = () => {
    ([[0, 0.3, 0.35, 0, "peony"], [500, 0.7, 0.3, 2, "ring"], [1100, 0.5, 0.22, 1, "willow"], [1700, 0.2, 0.4, 4, "peony"], [2200, 0.8, 0.42, 0, "peony"], [2900, 0.35, 0.25, 3, "ring"], [3000, 0.5, 0.3, 1, "willow"], [3100, 0.68, 0.22, 2, "peony"]] as const)
      .forEach(([delay, x, y, shade, kind]) => later(400 + delay, () => sky?.launch(x, y, colour(shade), kind)));
  };

  const applyPaused = (value: boolean) => {
    paused = value;
    stage.toggleAttribute("data-fw-paused", paused);
    setFlames?.(!paused);
    if (paused) {
      timers.splice(0).forEach(window.clearTimeout);
      sky?.stop();
    }
  };

  applyPaused(true);
  reduceMotion.addEventListener("change", () => applyPaused(!active || reduceMotion.matches));

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || paused) continue;
      const kind = (entry.target as HTMLElement).dataset.fwBurst;
      observer.unobserve(entry.target);
      if (kind === "small") smallBurst();
      if (kind === "finale") finale();
    }
  }, { threshold: 0.7 });

  const setActive = (value: boolean) => {
    if (active === value) return;
    active = value;
    document.body.classList.toggle("fw-theme", active);
    stage.classList.toggle("fw-stage", active);
    toggle.setAttribute("aria-checked", String(active));
    if (active) {
      if (!sky && canvas) sky = new Sky(canvas);
      setFlames ??= createCanvasFlames(stage);
    }
    applyPaused(!active || reduceMotion.matches);
    if (!active) observer.disconnect();
    if (!paused) {
      intro();
      stage.querySelectorAll("[data-fw-burst]").forEach((element) => observer.observe(element));
    }
  };

  toggle.addEventListener("click", () => {
    setActive(!active);
    const url = new URL(window.location.href);
    if (active) url.searchParams.set("immersive", "1");
    else url.searchParams.delete("immersive");
    window.history.replaceState(window.history.state, "", url);
  });

  const applyUrlMode = () => setActive(new URL(window.location.href).searchParams.get("immersive") === "1");
  window.addEventListener("popstate", applyUrlMode);
  applyUrlMode();
}

const stage = document.querySelector<HTMLElement>("[data-fw-stage]");
if (stage) init(stage);
