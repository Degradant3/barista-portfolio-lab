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