(function () {
  const doc = document.documentElement;
  const body = document.body;
  const nav = document.querySelector("nav");
  const modals = document.querySelectorAll(".modal");
  const btns = document.querySelectorAll(".btn");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu");
  const scrollLinks = document.querySelectorAll(".scroll-link");

  window.toggleTheme = function () {
    const currentTheme = doc.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    doc.setAttribute("data-theme", newTheme);

    // Update aria-pressed state for theme toggle
    const toggleSwitch = document.querySelector(".toggle-switch");
    if (toggleSwitch) {
      toggleSwitch.setAttribute("aria-pressed", newTheme === "light");
    }
  };

  let lastActiveElement;
  window.openModal = function (type) {
    const modal = document.getElementById(type + "-modal");
    if (modal) {
      lastActiveElement = document.activeElement;
      modal.classList.add("active");
      body.style.overflow = "hidden";
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
      const form = modal.querySelector("form");
      const successMsg = modal.querySelector(".success-message");
      if (form) form.reset();
      if (successMsg) {
        successMsg.classList.remove("show");
        form.style.display = "block";
      }
    }
  };

  window.closeModal = function (type) {
    const modal = document.getElementById(type + "-modal");
    if (modal) {
      modal.classList.remove("active");
      body.style.overflow = "auto";
      if (lastActiveElement) {
        lastActiveElement.focus();
      }
    }
  };

  window.switchModal = function (from, to) {
    closeModal(from);
    setTimeout(() => openModal(to), 200);
  };

  window.handleAuth = function (event, type) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.btn[type="submit"]');
    const originalText = submitBtn.innerText;
    const successMsg = document.getElementById(type + "-success");
    submitBtn.innerText = type === "signin" ? "Signing In" : "Creating Account";
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    setTimeout(() => {
      successMsg.classList.add("show");
      form.style.display = "none";
      setTimeout(() => {
        closeModal(type);
        form.style.display = "block";
        submitBtn.innerText = originalText;
        submitBtn.classList.remove("btn-loading");
        submitBtn.disabled = false;
      }, 2000);
    }, 1500);
  };

  window.handleDemo = function (event) {
    event.preventDefault();
    const title = document.getElementById("courseTitle").value;
    const level = document.getElementById("skillLevel").value;
    alert(
      `🎉 Course Generated!\n\nTitle: ${title}\nLevel: ${level}\n\nYour personalized course is being created! Sign up to save and access your generated courses!`
    );
  };

  window.toggleMobileMenu = function () {
    mobileMenu.classList.toggle("active");
    mobileMenuBtn.classList.toggle("active");
    body.style.overflow = mobileMenu.classList.contains("active")
      ? "hidden"
      : "auto";
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Initialize theme toggle state
    const toggleSwitch = document.querySelector(".toggle-switch");
    if (toggleSwitch) {
      const currentTheme = doc.getAttribute("data-theme");
      toggleSwitch.setAttribute("aria-pressed", currentTheme === "light");
    }

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        nav.style.background = "var(--nav-bg-scroll)";
      } else {
        nav.style.background = "var(--nav-bg)";
      }
    });

    btns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        const ripple = document.createElement("span");
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.5;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.classList.add("ripple");
        ripple.style.cssText = `width: ${size}px; height: ${size}px; left: ${x}px; top: ${y}px;`;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });

    scrollLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
          if (window.innerWidth <= 991) {
            toggleMobileMenu();
          }
        }
      });
    });

    // Mobile menu button event listener
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", toggleMobileMenu);
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      const modalId = e.target.id.replace("-modal", "");
      closeModal(modalId);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modals.forEach((modal) => {
        if (modal.classList.contains("active")) {
          const modalId = modal.id.replace("-modal", "");
          closeModal(modalId);
        }
      });

      // Also close mobile menu if open
      if (mobileMenu.classList.contains("active")) {
        toggleMobileMenu();
      }
    }
  });

  modals.forEach((modal) => {
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Tab" && modal.classList.contains("active")) {
        const focusable = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 991 && mobileMenu.classList.contains("active")) {
      toggleMobileMenu();
    }
  });
})();
