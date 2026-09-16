// ==========================================================================
// R&D Barista Lab: Main Controller (Navigation & Interactive Physics)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------------
  // 1. Мобильная навигация (Burger Toggle)
  // ------------------------------------------------------------------------
  const burgerBtn = document.querySelector(
    ".menu-toggle, .nav-toggle, .burger, .hamburger, .mobile-menu-btn, [data-nav-toggle], header button"
  );
  const mobileNav = document.querySelector(
    ".nav-links, .nav-menu, .site-nav, .mobile-menu, nav, .header-nav"
  );

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      burgerBtn.classList.toggle("active");
      burgerBtn.classList.toggle("open");
      mobileNav.classList.toggle("active");
      mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open");
    });

    // Закрытие меню при клике на ссылки
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        burgerBtn.classList.remove("active", "open");
        mobileNav.classList.remove("active", "is-open");
        document.body.classList.remove("menu-open");
      });
    });

    // Закрытие при клике вне зоны меню
    document.addEventListener("click", (e) => {
      if (!mobileNav.contains(e.target) && !burgerBtn.contains(e.target)) {
        burgerBtn.classList.remove("active", "open");
        mobileNav.classList.remove("active", "is-open");
        document.body.classList.remove("menu-open");
      }
    });
  }

  // ------------------------------------------------------------------------
  // 2. Интерактивная сцена напитка (2.5D Tilt, Glare & Spectral Scanner)
  // ------------------------------------------------------------------------
  const stage = document.getElementById("drink-stage");
  const card = document.getElementById("master-drink-card");
  const glass = document.getElementById("glass-wrapper");
  const badgeEl = document.getElementById("layer-badge");
  const nameEl = document.getElementById("layer-name");
  const descEl = document.getElementById("layer-desc");
  const pills = document.querySelectorAll(".layer-pill");

  if (!stage || !card) return;

  const LAYERS = [
    {
      range: [0, 32],
      badge: "Слой 1 / 3 // Верхний горизонт",
      name: "Холодная соленая крем-пена (Cold Foam)",
      desc: "Плотная эмульсия сливок 10% и морской соли. Задерживает ароматические эфиры и создает контраст температур при первом глотке."
    },
    {
      range: [32, 80],
      badge: "Слой 2 / 3 // Сердце напитка",
      name: "Каскадный экстракт черники & Цветов анчана",
      desc: "Холодная ягодная мацерация с танинной кислотностью. Нитевидная диффузия каскада формирует бархатистую текстуру."
    },
    {
      range: [80, 100],
      badge: "Слой 3 / 3 // Фундамент",
      name: "Очищенный монолитный лед",
      desc: "Кристальный лед медленной заморозки без воздушных пор. Обеспечивает термостабильность 3°C при нулевом обводнении."
    }
  ];

  function updateScanState(percentY, percentX = 50) {
    card.style.setProperty("--scan-y", `${percentY}%`);
    card.style.setProperty("--glare-x", `${percentX}%`);

    const telemetryText = card.querySelector(".telemetry-text");
    if (telemetryText) {
      telemetryText.textContent = `SPECTRAL // ${percentY.toFixed(1)}%`;
    }

    const active = LAYERS.find((l) => percentY >= l.range[0] && percentY <= l.range[1]);
    if (active && nameEl && nameEl.textContent !== active.name) {
      if (badgeEl) badgeEl.textContent = active.badge;
      nameEl.textContent = active.name;
      if (descEl) descEl.textContent = active.desc;

      pills.forEach((pill, idx) => {
        const isActivePill =
          (idx === 0 && percentY <= 32) ||
          (idx === 1 && percentY > 32 && percentY <= 80) ||
          (idx === 2 && percentY > 80);
        pill.classList.toggle("active", isActivePill);
      });
    }
  }

  // Десктоп: мышь
  if (window.matchMedia("(hover: hover)").matches) {
    stage.addEventListener("mousemove", (e) => {
      const rect = stage.getBoundingClientRect();
      const percentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const percentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      const tiltX = (((e.clientY - rect.top) - rect.height / 2) / (rect.height / 2)) * -8;
      const tiltY = (((e.clientX - rect.left) - rect.width / 2) / (rect.width / 2)) * 8;

      requestAnimationFrame(() => {
        card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
        updateScanState(percentY, percentX);
      });
    });

    stage.addEventListener("mouseleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--glare-x", "50%");
    });
  }

  // Смартфоны: ведение пальцем строго по бокалу с блокировкой сдвига страницы
  if (glass) {
    glass.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = glass.getBoundingClientRect();
        const percentY = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
        const percentX = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
        updateScanState(percentY, percentX);
      }
    }, { passive: true });

    glass.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = glass.getBoundingClientRect();
        const percentY = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
        const percentX = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
        requestAnimationFrame(() => updateScanState(percentY, percentX));
      }
    }, { passive: false });
  }

  // Кнопки слоев
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetPct = parseFloat(pill.dataset.layerPct);
      updateScanState(targetPct);
    });
  });
});