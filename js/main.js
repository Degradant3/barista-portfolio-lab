document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation Toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("is-active");
      menuToggle.setAttribute(
        "aria-expanded",
        navLinks.classList.contains("is-active")
      );
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-active");
      });
    });
  }

  // Interactive Projects Filter
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-catalog-card");

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Управляем активным состоянием кнопки
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const selectedFilter = btn.getAttribute("data-filter");

        // Фильтруем карточки
        projectCards.forEach((card) => {
          const categories = card.getAttribute("data-category") || "";
          
          if (selectedFilter === "all" || categories.includes(selectedFilter)) {
            card.style.display = "flex";
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            }, 10);
          } else {
            card.style.opacity = "0";
            card.style.transform = "translateY(15px)";
            setTimeout(() => {
              card.style.display = "none";
            }, 250);
          }
        });
      });
    });
  }
});
// Handle Contact Form Submission (Реальная отправка через fetch)
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Останавливаем перезагрузку страницы браузером

      // Получаем значения полей
      const formData = {
        name: contactForm.querySelector('[name="name"]').value.trim(),
        contact_info: contactForm.querySelector('[name="contact_info"]').value.trim(),
        service_type: contactForm.querySelector('[name="service_type"]').value,
        message: contactForm.querySelector('[name="message"]').value.trim()
      };

      // Показываем индикатор загрузки
      formStatus.className = "form-status";
      formStatus.style.display = "block";
      formStatus.style.color = "var(--text-secondary)";
      formStatus.innerText = "Отправка заявки шеф-бариста...";

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        // Отправляем реальный POST-запрос в нашу серверную функцию
        const response = await fetch("/api/send-brief", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          formStatus.className = "form-status success";
          formStatus.innerText = "Спасибо! Заявка доставлена. Расул свяжется с вами в течение 2–3 часов.";
          contactForm.reset();
        } else {
          formStatus.className = "form-status error";
          formStatus.innerText = "Ошибка отправки. Пожалуйста, напишите напрямую в Telegram: @Rasul_0_0";
          console.error("API error:", result);
        }
      } catch (err) {
        formStatus.className = "form-status error";
        formStatus.innerText = "Не удалось отправить заявку. Проверьте интернет или напишите в Telegram.";
        console.error("Network error:", err);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
  // 3D Tilt Physics for Signature Drinks
  const tiltCards = document.querySelectorAll(".drink-card-3d");

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // координата X внутри карточки
      const y = e.clientY - rect.top;  // координата Y внутри карточки

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Вычисляем угол наклона (максимум 12 градусов)
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      
      // Смещаем внутреннее свечение под курсор
      const glow = card.querySelector(".drink-glow");
      if (glow) {
        glow.style.transform = `translate(${x - centerX}px, ${y - centerY}px)`;
        glow.style.opacity = "1";
      }

      // Слегка смещаем сам бокал для параллакс-глубины
      const image = card.querySelector(".drink-image-container");
      if (image) {
        image.style.transform = `translateZ(40px) translateX(${(x - centerX) * 0.05}px) translateY(${(y - centerY) * 0.05}px)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      
      const glow = card.querySelector(".drink-glow");
      if (glow) {
        glow.style.opacity = "0";
      }

      const image = card.querySelector(".drink-image-container");
      if (image) {
        image.style.transform = "translateZ(0) translateX(0) translateY(0)";
      }
    });
  });
  // ==========================================================================
// Flagship Drink Interactive Physics & Anatomy Scanner
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.getElementById("drink-stage");
  const card = document.getElementById("master-drink-card");
  const badgeEl = document.getElementById("layer-badge");
  const nameEl = document.getElementById("layer-name");
  const descEl = document.getElementById("layer-desc");

  if (!stage || !card) return;

  // Конфигурация анатомических слоев (в % от верха бокала)
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

  // Проверяем, поддерживает ли устройство точный hover
  const isHoverable = window.matchMedia("(hover: hover)").matches;

  if (isHoverable) {
    stage.addEventListener("mousemove", (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Нормализуем координаты в проценты (0 - 100%)
      const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));

      // Расчет 3D-наклона (до 8 градусов)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = ((y - centerY) / centerY) * -8;
      const tiltY = ((x - centerX) / centerX) * 8;

      requestAnimationFrame(() => {
        card.style.setProperty("--glare-x", `${percentX}%`);
        card.style.setProperty("--scan-y", `${percentY}%`);
        card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);

        // Поиск активного слоя по вертикали
        const active = LAYERS.find((l) => percentY >= l.range[0] && percentY <= l.range[1]);
        if (active && nameEl.textContent !== active.name) {
          badgeEl.textContent = active.badge;
          nameEl.textContent = active.name;
          descEl.textContent = active.desc;
        }
      });
    });

    stage.addEventListener("mouseleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--glare-x", "50%");
    });
  }
});