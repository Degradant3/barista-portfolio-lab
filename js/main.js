// ==========================================================================
// R&D Barista Lab: Main Controller (Navigation, Form & Interactive 2.5D)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {

// ------------------------------------------------------------------------
  // 1. Мобильная навигация (Burger Toggle)
  // ------------------------------------------------------------------------
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = menuToggle.classList.toggle("active");
      menuToggle.classList.toggle("open", isOpen);
      navLinks.classList.toggle("active", isOpen);
      navLinks.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("menu-open", isOpen);
    });

    // Закрытие шторки при клике на любую ссылку
    navLinks.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active", "open");
        navLinks.classList.remove("active", "open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });

    // Закрытие при тапе в любое свободное место экрана
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove("active", "open");
        navLinks.classList.remove("active", "open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      }
    });
  }
  // ------------------------------------------------------------------------
  // 2. Асинхронная отправка формы брифа (Без редиректа на /api/send-brief)
  // ------------------------------------------------------------------------
  const briefForm = document.querySelector("form");

  if (briefForm) {
    briefForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Запрещаем браузеру переходить на страницу {"success":true}

      const submitBtn = briefForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "Отправить";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправка...";
      }

      try {
        const formData = new FormData(briefForm);
        const formPayload = Object.fromEntries(formData.entries());

        const response = await fetch(briefForm.action || "/api/send-brief", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(formPayload)
        });

        if (response.ok) {
          briefForm.reset();
          alert("Бриф успешно отправлен! Я свяжусь с вами в ближайшее время.");
        } else {
          alert("Ошибка при отправке. Пожалуйста, попробуйте еще раз.");
        }
      } catch (err) {
        console.error("Submission error:", err);
        alert("Ошибка сети. Проверьте соединение.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // ------------------------------------------------------------------------
  // 3. Интерактивная сцена напитка (Запускается ТОЛЬКО на странице menu.html)
  // ------------------------------------------------------------------------
  const stage = document.getElementById("drink-stage");
  const card = document.getElementById("master-drink-card");
  const glass = document.getElementById("glass-wrapper");
  const badgeEl = document.getElementById("layer-badge");
  const nameEl = document.getElementById("layer-name");
  const descEl = document.getElementById("layer-desc");
  const pills = document.querySelectorAll(".layer-pill");

  if (stage && card) {
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

    // Мобильные: ведение пальцем по бокалу с изоляцией от скролла страницы
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

    // Мобильные кнопки выбора слоя
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const targetPct = parseFloat(pill.dataset.layerPct);
        updateScanState(targetPct);
      });
    });
  }
});