(() => {
  "use strict";

  /* ---------- populate content from config ---------- */
  const cfg = window.SITE_CONFIG || {};

  const handleEl = document.getElementById("handleText");
  if (cfg.handle) handleEl.textContent = cfg.handle;

  const taglineEl = document.getElementById("taglineText");
  if (cfg.tagline) taglineEl.textContent = cfg.tagline;

  const inviteEl = document.getElementById("discordInviteLink");
  if (cfg.discord?.inviteUrl) {
    inviteEl.href = cfg.discord.inviteUrl;
    inviteEl.textContent = cfg.discord.inviteUrl.replace(/^https?:\/\//, "");
  }

  const statusDot = document.querySelector(".status-dot");
  const statusText = document.querySelector(".status-text");
  if (cfg.discord?.online) {
    statusDot.classList.add("online");
    statusText.textContent = "ONLINE";
  }

  const socialLinks = document.querySelectorAll(".social-link");
  if (socialLinks[0] && cfg.socials?.youtube) socialLinks[0].href = cfg.socials.youtube;
  if (socialLinks[1] && cfg.socials?.instagram) socialLinks[1].href = cfg.socials.instagram;
  if (socialLinks[2] && cfg.socials?.discord) socialLinks[2].href = cfg.socials.discord;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- avatar fallback if no clip uploaded yet ---------- */
  const avatarVideo = document.getElementById("avatarVideo");
  avatarVideo.addEventListener("error", () => {
    avatarVideo.style.display = "none";
    avatarVideo.parentElement.style.background =
      "linear-gradient(135deg, #1a2230, #0b0e13)";
  });

  /* ---------- skills grid render ---------- */
  const grid = document.getElementById("skillsGrid");
  (cfg.skills || []).forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.style.setProperty("--fill", `${s.level}%`);
    card.innerHTML = `
      <div class="skill-index">${String(i + 1).padStart(2, "0")}</div>
      <div class="skill-name">${s.name}</div>
      <div class="skill-desc">${s.desc}</div>
      <div class="skill-bar-track"><div class="skill-bar-fill"></div></div>
    `;
    grid.appendChild(card);
  });

  /* ---------- reveal skill cards on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("in-view"), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".skill-card").forEach(card => revealObserver.observe(card));

  /* ---------- custom cursor ---------- */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  const isTouch = window.matchMedia("(max-width: 720px)").matches;

  if (!isTouch) {
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });

    const lerp = (a, b, n) => a + (b - a) * n;
    function animateRing() {
      rx = lerp(rx, mx, 0.18);
      ry = lerp(ry, my, 0.18);
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll("a, button, .skill-card").forEach(el => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });

    document.addEventListener("mouseleave", () => {
      dot.classList.add("hidden"); ring.classList.add("hidden");
    });
    document.addEventListener("mouseenter", () => {
      dot.classList.remove("hidden"); ring.classList.remove("hidden");
    });
  }

  /* ---------- entry gate ---------- */
  const gate = document.getElementById("gate");
  const gateBtn = document.getElementById("gateBtn");
  const bgVideo = document.getElementById("bgVideo");
  const bgAudio = document.getElementById("bgAudio");
  const audioToggle = document.getElementById("audioToggle");

  function enterSite() {
    // video is already autoplaying muted; audio needs the gesture
    bgAudio.volume = 0;
    bgAudio.play().catch(() => {});
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol += 0.04;
      bgAudio.volume = Math.min(vol, 0.55);
      if (vol >= 0.55) clearInterval(fadeIn);
    }, 40);

    gate.classList.add("entered");
    setTimeout(() => { gate.style.display = "none"; }, 1100);
  }

  gateBtn.addEventListener("click", enterSite);

  /* ---------- audio toggle button ---------- */
  audioToggle.addEventListener("click", () => {
    if (bgAudio.paused) {
      bgAudio.play().catch(() => {});
      audioToggle.classList.remove("paused");
    } else {
      bgAudio.pause();
      audioToggle.classList.add("paused");
    }
  });

  /* ---------- view counter (session-based, local) ---------- */
  const viewEl = document.getElementById("viewCount");
  try {
    const key = "ov_views";
    const n = (parseInt(localStorage.getItem(key) || "0", 10) || 0) + 1;
    localStorage.setItem(key, n);
    viewEl.textContent = n;
  } catch (e) {
    viewEl.textContent = "1";
  }

  /* ---------- film grain canvas ---------- */
  const canvas = document.getElementById("grain");
  const ctx = canvas.getContext("2d");
  function resizeGrain() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeGrain();
  window.addEventListener("resize", resizeGrain);

  function drawGrain() {
    const w = canvas.width, h = canvas.height;
    const imgData = ctx.createImageData(w, h);
    const buffer = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < buffer.length; i++) {
      const v = (Math.random() * 255) | 0;
      buffer[i] = (255 << 24) | (v << 16) | (v << 8) | v;
    }
    ctx.putImageData(imgData, 0, 0);
  }
  // grain is expensive at 60fps full-res; throttle it
  let last = 0;
  function grainLoop(t) {
    if (t - last > 90) { drawGrain(); last = t; }
    requestAnimationFrame(grainLoop);
  }
  requestAnimationFrame(grainLoop);

})();
