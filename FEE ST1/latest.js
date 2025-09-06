(function () {
  // Cache DOM elements
  const doc = document.documentElement;
  const body = document.body;
  const nav = document.querySelector("nav");
  const modals = document.querySelectorAll(".modal");
  const btns = document.querySelectorAll(".btn");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu");
  const scrollLinks = document.querySelectorAll(".scroll-link");
  const toggleSwitch = document.querySelector(".toggle-switch");

  // Constants
  const FOCUSABLE_SELECTORS =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const MOBILE_BREAKPOINT = 991;

  let lastActiveElement;

  // Theme functionality
  window.toggleTheme = function () {
    const currentTheme = doc.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    doc.setAttribute("data-theme", newTheme);

    if (toggleSwitch) {
      toggleSwitch.setAttribute("aria-pressed", newTheme === "light");
    }
  };

  // Modal functionality
  window.openModal = function (type) {
    const modal = document.getElementById(type + "-modal");
    if (!modal) return;

    lastActiveElement = document.activeElement;
    modal.classList.add("active");
    body.style.overflow = "hidden";

    const focusableElements = modal.querySelectorAll(FOCUSABLE_SELECTORS);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Reset form and hide success message
    const form = modal.querySelector("form");
    const successMsg = modal.querySelector(".success-message");
    if (form) form.reset();
    if (successMsg) {
      successMsg.classList.remove("show");
      form.style.display = "block";
    }
  };

  window.closeModal = function (type) {
    const modal = document.getElementById(type + "-modal");
    if (!modal) return;

    modal.classList.remove("active");
    body.style.overflow = "auto";

    if (lastActiveElement) {
      lastActiveElement.focus();
    }
  };

  window.switchModal = function (from, to) {
    closeModal(from);
    setTimeout(() => openModal(to), 200);
  };

  // Authentication handling
  window.handleAuth = function (event, type) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('.btn[type="submit"]');
    const originalText = submitBtn.innerText;
    const successMsg = document.getElementById(type + "-success");
    const loadingText = type === "signin" ? "Signing In" : "Creating Account";

    // Set loading state
    submitBtn.innerText = loadingText;
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    setTimeout(() => {
      successMsg.classList.add("show");
      form.style.display = "none";

      setTimeout(() => {
        closeModal(type);
        // Reset form state
        form.style.display = "block";
        submitBtn.innerText = originalText;
        submitBtn.classList.remove("btn-loading");
        submitBtn.disabled = false;
      }, 2000);
    }, 1500);
  };

  // Demo functionality
  window.handleDemo = function (event) {
    event.preventDefault();
    const title = document.getElementById("courseTitle").value;
    const level = document.getElementById("skillLevel").value;
    alert(
      `🎉 Course Generated!\n\nTitle: ${title}\nLevel: ${level}\n\nYour personalized course is being created! Sign up to save and access your generated courses!`
    );
  };

  // Mobile menu functionality
  window.toggleMobileMenu = function () {
    const isActive = mobileMenu.classList.contains("active");

    mobileMenu.classList.toggle("active");
    mobileMenuBtn.classList.toggle("active");
    body.style.overflow = !isActive ? "hidden" : "auto";
  };

  // Utility functions
  function createRippleEffect(btn, e) {
    const ripple = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.classList.add("ripple");
    ripple.style.cssText = `width: ${size}px; height: ${size}px; left: ${x}px; top: ${y}px;`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  function handleScrollLink(link, e) {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        toggleMobileMenu();
      }
    }
  }

  function handleModalTabbing(modal, e) {
    if (e.key !== "Tab" || !modal.classList.contains("active")) return;

    const focusable = modal.querySelectorAll(FOCUSABLE_SELECTORS);
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

  function closeActiveModals() {
    modals.forEach((modal) => {
      if (modal.classList.contains("active")) {
        const modalId = modal.id.replace("-modal", "");
        closeModal(modalId);
      }
    });
  }

  // Event listeners
  document.addEventListener("DOMContentLoaded", () => {
    // Initialize theme toggle state
    if (toggleSwitch) {
      const currentTheme = doc.getAttribute("data-theme");
      toggleSwitch.setAttribute("aria-pressed", currentTheme === "light");
    }

    // Scroll effect for navigation
    window.addEventListener("scroll", () => {
      nav.style.background =
        window.scrollY > 50 ? "var(--nav-bg-scroll)" : "var(--nav-bg)";
    });

    // Button ripple effects
    btns.forEach((btn) => {
      btn.addEventListener("click", (e) => createRippleEffect(btn, e));
    });

    // Scroll links
    scrollLinks.forEach((link) => {
      link.addEventListener("click", (e) => handleScrollLink(link, e));
    });

    // Mobile menu button
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", toggleMobileMenu);
    }
  });

  // Modal click-outside-to-close
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      const modalId = e.target.id.replace("-modal", "");
      closeModal(modalId);
    }
  });

  // Global keyboard handlers
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeActiveModals();

      // Also close mobile menu if open
      if (mobileMenu.classList.contains("active")) {
        toggleMobileMenu();
      }
    }
  });

  // Modal keyboard navigation
  modals.forEach((modal) => {
    modal.addEventListener("keydown", (e) => handleModalTabbing(modal, e));
  });

  // Responsive behavior
  window.addEventListener("resize", () => {
    if (
      window.innerWidth > MOBILE_BREAKPOINT &&
      mobileMenu.classList.contains("active")
    ) {
      toggleMobileMenu();
    }
  });
})();
