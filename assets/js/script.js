document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const contactForm = document.querySelector('[data-contact-form]');
  const contactCard = document.querySelector('.contact-card');
  const contactSuccess = document.querySelector('[data-contact-success]');
  const contactSuccessTitle = document.querySelector('[data-contact-success-title]');
  const contactSuccessBody = document.querySelector('[data-contact-success-body]');
  const contactFeedback = document.querySelector('[data-contact-feedback]');
  const contactSubmit = document.querySelector('[data-contact-submit]');
  const confettiLayer = document.querySelector('[data-confetti-layer]');
  const root = document.documentElement;

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('is-open');
    });
  }

  const themeStorageKey = 'portfolio-theme';

  function readStoredTheme() {
    try {
      const storedTheme = localStorage.getItem(themeStorageKey);
      return storedTheme === 'dark' ? 'dark' : 'light';
    } catch (_error) {
      return 'light';
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch (_error) {
      // Ignore storage errors and keep the current theme in memory.
    }
  }

  root.dataset.theme = root.dataset.theme === 'dark' || root.dataset.theme === 'light'
    ? root.dataset.theme
    : readStoredTheme();

  function syncThemeButton() {
    if (!themeToggle) {
      return;
    }
    const isDark = root.dataset.theme === 'dark';
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    themeToggle.setAttribute('aria-pressed', String(isDark));
  }

  syncThemeButton();
  root.dataset.themeReady = 'true';

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = nextTheme;
      storeTheme(nextTheme);
      syncThemeButton();
    });
  }

  const travelCarousels = document.querySelectorAll('[data-travel-carousel]');

  travelCarousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
    const previousButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    const count = carousel.querySelector('[data-carousel-count]');

    if (slides.length === 0) {
      return;
    }

    let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    activeIndex = activeIndex >= 0 ? activeIndex : 0;

    function updateCarousel(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.hidden = !isActive;
      });

      if (count) {
        count.textContent = `${activeIndex + 1} / ${slides.length}`;
      }
    }

    previousButton?.addEventListener('click', () => updateCarousel(activeIndex - 1));
    nextButton?.addEventListener('click', () => updateCarousel(activeIndex + 1));
    updateCarousel(activeIndex);
  });

  const lightboxImages = document.querySelectorAll('main img');

  if (lightboxImages.length > 0) {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.hidden = true;

    const lightboxDialog = document.createElement('div');
    lightboxDialog.className = 'image-lightbox-dialog';
    lightboxDialog.setAttribute('role', 'dialog');
    lightboxDialog.setAttribute('aria-modal', 'true');

    const lightboxClose = document.createElement('button');
    lightboxClose.type = 'button';
    lightboxClose.className = 'image-lightbox-close';
    lightboxClose.setAttribute('aria-label', 'Close image preview');
    lightboxClose.textContent = 'X';

    const lightboxPrevious = document.createElement('button');
    lightboxPrevious.type = 'button';
    lightboxPrevious.className = 'image-lightbox-nav image-lightbox-prev';
    lightboxPrevious.setAttribute('aria-label', 'Previous image');
    lightboxPrevious.hidden = true;
    lightboxPrevious.textContent = '\u2039';

    const lightboxNext = document.createElement('button');
    lightboxNext.type = 'button';
    lightboxNext.className = 'image-lightbox-nav image-lightbox-next';
    lightboxNext.setAttribute('aria-label', 'Next image');
    lightboxNext.hidden = true;
    lightboxNext.textContent = '\u203a';

    const lightboxImage = document.createElement('img');
    lightboxImage.className = 'image-lightbox-image';
    lightboxImage.alt = '';

    lightboxDialog.append(lightboxClose, lightboxPrevious, lightboxImage, lightboxNext);
    lightbox.appendChild(lightboxDialog);
    document.body.appendChild(lightbox);

    let activeTrigger = null;
    let activeGallery = [];
    let activeGalleryIndex = -1;

    function syncCarouselToTrigger(trigger) {
      const carousel = trigger.closest('[data-travel-carousel]');
      if (!carousel) {
        return;
      }

      const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
      const count = carousel.querySelector('[data-carousel-count]');
      const nextIndex = slides.indexOf(trigger);

      if (nextIndex < 0) {
        return;
      }

      slides.forEach((slide, index) => {
        const isActive = index === nextIndex;
        slide.classList.toggle('is-active', isActive);
        slide.hidden = !isActive;
      });

      if (count) {
        count.textContent = `${nextIndex + 1} / ${slides.length}`;
      }
    }

    function setLightboxImage(trigger) {
      activeTrigger = trigger;
      const ratio = trigger.naturalWidth / Math.max(1, trigger.naturalHeight);
      const isPortrait = ratio < 1;
      const isExtreme = ratio > 2.2 || ratio < 0.55;
      lightboxDialog.classList.toggle('is-extreme', isExtreme);
      lightboxDialog.classList.toggle('is-portrait', isPortrait);
      lightboxDialog.classList.toggle('is-landscape', !isPortrait);
      lightboxImage.src = trigger.currentSrc || trigger.src;
      lightboxImage.alt = trigger.alt || '';
      syncCarouselToTrigger(trigger);
    }

    function setLightboxNavigation(trigger) {
      const carousel = trigger.closest('[data-travel-carousel]');
      activeGallery = carousel ? Array.from(carousel.querySelectorAll('[data-carousel-slide]')) : [];
      activeGalleryIndex = activeGallery.indexOf(trigger);
      const hasGalleryNavigation = activeGallery.length > 1 && activeGalleryIndex >= 0;

      lightboxPrevious.hidden = !hasGalleryNavigation;
      lightboxNext.hidden = !hasGalleryNavigation;
      lightbox.classList.toggle('has-gallery-nav', hasGalleryNavigation);
      lightbox.classList.toggle('is-travel-gallery', hasGalleryNavigation);
    }

    function navigateLightbox(direction) {
      if (activeGallery.length <= 1 || activeGalleryIndex < 0) {
        return;
      }

      activeGalleryIndex = (activeGalleryIndex + direction + activeGallery.length) % activeGallery.length;
      setLightboxImage(activeGallery[activeGalleryIndex]);
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
      lightboxDialog.classList.remove('is-landscape', 'is-portrait', 'is-extreme');
      lightbox.classList.remove('has-gallery-nav', 'is-travel-gallery');
      lightboxPrevious.hidden = true;
      lightboxNext.hidden = true;
      if (activeTrigger) {
        activeTrigger.focus();
      }
      activeTrigger = null;
      activeGallery = [];
      activeGalleryIndex = -1;
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = '';
    }

    function openLightbox(trigger) {
      setLightboxNavigation(trigger);
      setLightboxImage(trigger);
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      window.requestAnimationFrame(() => {
        lightbox.classList.add('is-open');
        if (activeGallery.length > 1) {
          lightboxNext.focus();
        } else {
          lightboxClose.focus();
        }
      });
    }

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    lightboxDialog.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrevious.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !lightbox.hidden) {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft' && !lightbox.hidden) {
        navigateLightbox(-1);
      }

      if (event.key === 'ArrowRight' && !lightbox.hidden) {
        navigateLightbox(1);
      }
    });

    lightboxImages.forEach((image) => {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', image.alt ? `Open larger view of ${image.alt}` : 'Open larger image preview');
      image.classList.add('lightbox-trigger');

      image.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openLightbox(image);
      });

      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });
  }

  if (contactForm) {
    const contactStateKey = 'contact-form-sent';
    const defaultSubmitLabel = contactSubmit ? contactSubmit.textContent : 'Send message';
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    const wasReloaded = navigationEntry && navigationEntry.type === 'reload';

    try {
      if (wasReloaded) {
        sessionStorage.removeItem(contactStateKey);
      }
    } catch (_error) {
      // Ignore storage failures and keep the visual behavior working.
    }

    function clearContactFeedback() {
      if (!contactFeedback) {
        return;
      }
      contactFeedback.textContent = '';
      contactFeedback.classList.remove('is-visible');
    }

    function setLockedState(isLocked) {
      if (contactCard) {
        contactCard.classList.toggle('is-sent', isLocked);
      }
      if (!contactForm) {
        return;
      }
      contactForm.querySelectorAll('input, textarea, button').forEach((field) => {
        field.disabled = isLocked;
      });
    }

    function persistSentState() {
      try {
        sessionStorage.setItem(contactStateKey, '1');
      } catch (_error) {
        // Ignore storage failures and keep the visual behavior working.
      }
    }

    function isSentStatePersisted() {
      try {
        return sessionStorage.getItem(contactStateKey) === '1';
      } catch (_error) {
        return false;
      }
    }

    function showContactFeedback(message) {
      if (!contactFeedback) {
        return;
      }
      contactFeedback.textContent = message;
      contactFeedback.classList.add('is-visible');
    }

    function showSuccessMessage() {
      if (!contactSuccess) {
        return;
      }
      setLockedState(true);
      if (contactSuccessTitle) {
        contactSuccessTitle.textContent = 'Thanks, message sent.';
      }
      if (contactSuccessBody) {
        contactSuccessBody.textContent = 'I will get back to you as soon as I can.';
      }
      contactSuccess.hidden = false;
      contactSuccess.classList.add('is-visible');
      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.textContent = 'Email already sent!';
      }
      contactForm.setAttribute('aria-busy', 'false');
    }

    function hideSuccessMessage() {
      if (!contactSuccess) {
        return;
      }
      contactSuccess.hidden = true;
      contactSuccess.classList.remove('is-visible');
      setLockedState(false);
    }

    function setSubmitting(isSubmitting) {
      if (contactSubmit) {
        contactSubmit.disabled = isSubmitting;
        contactSubmit.textContent = isSubmitting ? 'Email already sent!' : defaultSubmitLabel;
      }
      contactForm.setAttribute('aria-busy', String(isSubmitting));
    }

    function launchConfetti() {
      if (!confettiLayer) {
        return;
      }

      const colors = ['#0a66c2', '#111827', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#fb7185', '#22c55e'];
      confettiLayer.replaceChildren();
      const bounds = confettiLayer.getBoundingClientRect();
      const width = bounds.width || 1;
      const height = bounds.height || 1;
      const originY = height - 22;
      const launchPoints = [0.08, 0.24, 0.42, 0.58, 0.76, 0.92];
      const pieces = [];

      for (let index = 0; index < 60; index += 1) {
        const piece = document.createElement('span');
        const size = 10 + Math.random() * 12;
        const launchPoint = launchPoints[index % launchPoints.length];
        const originX = width * launchPoint;
        const horizontalBias = launchPoint < 0.5 ? 1 : -1;
        piece.className = 'confetti-piece';
        piece.style.left = '0px';
        piece.style.top = '0px';
        piece.style.width = `${size}px`;
        piece.style.height = `${size * (1.15 + Math.random() * 0.9)}px`;
        piece.style.background = colors[index % colors.length];
        piece.style.borderRadius = `${Math.random() > 0.5 ? 999 : 4}px`;
        piece.style.opacity = '1';
        confettiLayer.appendChild(piece);

        pieces.push({
          el: piece,
          x: originX + (Math.random() - 0.5) * (width * 0.08),
          y: originY + (Math.random() - 0.5) * 8,
          vx: horizontalBias * (120 + Math.random() * 260) + (Math.random() - 0.5) * 80,
          vy: -(920 + Math.random() * 520),
          gravity: 980 + Math.random() * 420,
          rot: Math.random() * 360,
          spin: horizontalBias * (420 + Math.random() * 780),
          life: 0,
          fadeStart: 1800 + Math.random() * 700,
          fadeLength: 1700 + Math.random() * 600,
        });
      }

      let lastTime = performance.now();
      const maxLife = 6500;

      function step(now) {
        const dt = Math.min(0.032, (now - lastTime) / 1000);
        lastTime = now;
        let activePieces = 0;

        for (const piece of pieces) {
          piece.life += dt * 1000;
          piece.vy += piece.gravity * dt;
          piece.x += piece.vx * dt;
          piece.y += piece.vy * dt;
          piece.rot += piece.spin * dt;

          const enteredFade = piece.life > piece.fadeStart;
          const fadeProgress = enteredFade ? Math.min(1, (piece.life - piece.fadeStart) / piece.fadeLength) : 0;
          const alpha = enteredFade ? Math.max(0, 1 - fadeProgress) : 1;
          const outOfBounds = piece.x < -80 || piece.x > width + 80 || piece.y > height + 120;

          piece.el.style.opacity = outOfBounds ? '0' : String(alpha);
          piece.el.style.transform = `translate3d(${piece.x}px, ${piece.y}px, 0) rotate(${piece.rot}deg)`;

          if (!outOfBounds && alpha > 0) {
            activePieces += 1;
          }
        }

        if (activePieces > 0 && now - pieces[0].startTime < maxLife) {
          window.requestAnimationFrame(step);
          return;
        }

        confettiLayer.replaceChildren();
      }

      const startedAt = performance.now();
      for (const piece of pieces) {
        piece.startTime = startedAt;
      }

      window.requestAnimationFrame(step);
    }

    if (isSentStatePersisted()) {
      showSuccessMessage();
    }

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearContactFeedback();
      hideSuccessMessage();
      setSubmitting(true);
      let submissionSucceeded = false;

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          contactForm.reset();
          showSuccessMessage();
          persistSentState();
          launchConfetti();
          submissionSucceeded = true;
          return;
        }

        let errorMessage = 'Sorry, the message could not be sent right now. Please try again.';
        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors) && data.errors.length > 0) {
            errorMessage = data.errors.map((error) => error.message).join(' ');
          }
        } catch (_error) {
          // Fall back to the generic error message.
        }
        showContactFeedback(errorMessage);
      } catch (_error) {
        showContactFeedback('Could not connect to the form service. Please try again in a moment.');
      } finally {
        if (!submissionSucceeded) {
          setSubmitting(false);
        }
      }
    });
  }
});
