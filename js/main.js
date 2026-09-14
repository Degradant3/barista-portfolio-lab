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
// Handle Contact Form Submission (UX Simulation)
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Прерываем реальную отправку страницы
      
      formStatus.classList.remove("success", "error");
      formStatus.innerText = "Отправка бриф-заявки...";
      formStatus.style.display = "block";

      // Эмулируем задержку сети
      setTimeout(() => {
        // Мы предполагаем, что всё прошло успешно (UI UX симуляция)
        formStatus.classList.add("success");
        formStatus.innerText = "Спасибо! Заявка принята. Я свяжусь с вами в Telegram или WhatsApp в течение 2-3 часов.";
        contactForm.reset(); // Очистить форму
      }, 1500);
    });
  }