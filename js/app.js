/* ============================================================
   SUMIT KUMAR — CINEMATIC VIDEO EDITOR PORTFOLIO
   CORE APP SCRIPT & MICRO-INTERACTIONS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------
  // 1. CUSTOM MAGNETIC CURSOR & MOUSE SOUND FX
  // ------------------------------------------------------------
  const cursor = document.getElementById('customCursor');
  const cursorDot = cursor ? cursor.querySelector('.cursor-dot') : null;
  const cursorRing = cursor ? cursor.querySelector('.cursor-ring') : null;
  const cursorLabel = document.getElementById('cursorLabel');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let ringX = mouseX;
  let ringY = mouseY;

  // Track mouse movement and play subtle harmonic sound effect
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (window.soundEngine) {
      window.soundEngine.playMouseMoveFX();
    }
  });

  if (cursor && window.innerWidth >= 992) {
    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.9;
      cursorY += (mouseY - cursorY) * 0.9;

      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (cursorDot) {
        cursorDot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      }
      if (cursorRing) {
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      requestAnimationFrame(updateCursor);
    };

    requestAnimationFrame(updateCursor);

    // Cursor State Triggers & Hover Sounds
    const addHoverTargets = () => {
      // 1. General interactive links and buttons
      document.querySelectorAll('a, button, .magnetic-target, .tool-pill, .service-card, .process-node-card').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('cursor-hover');
          if (cursorLabel) cursorLabel.textContent = el.getAttribute('data-hover') || 'VIEW';
          if (window.soundEngine) window.soundEngine.playPip(1400);
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('cursor-hover');
        });
      });

      // 2. Project cards (Play Reel state)
      document.querySelectorAll('.project-card[data-project]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('cursor-play');
          cursor.classList.remove('cursor-hover');
          if (window.soundEngine) window.soundEngine.playPip(1800);
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('cursor-play');
        });
      });
    };

    addHoverTargets();
  }

  // ------------------------------------------------------------
  // 2. MAGNETIC BUTTON ATTRACTION EFFECT
  // ------------------------------------------------------------
  if (window.innerWidth >= 992) {
    document.querySelectorAll('.magnetic-target').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // ------------------------------------------------------------
  // 3. GLOBAL CLICK SOUND FX & RIPPLE EFFECT
  // ------------------------------------------------------------
  document.addEventListener('click', (e) => {
    // Play tactile shutter click on any interactive click
    const isInteractive = e.target.closest('button, a, .project-card, .tool-pill, .copyable, .speed-btn, .modal-close-btn');
    if (isInteractive && window.soundEngine) {
      window.soundEngine.playCameraClick();
    }
  });

  document.querySelectorAll('button, a.btn, .social-circle').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      // Ripple animation
      const rect = btn.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('btn-ripple-effect');

      const existingRipple = btn.querySelector('.btn-ripple-effect');
      if (existingRipple) existingRipple.remove();

      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  // ------------------------------------------------------------
  // 4. TOP TIMELINE PROGRESS SCRUBBER & TIMECODE
  // ------------------------------------------------------------
  const timelineFill = document.getElementById('timelineFill');
  const timelinePlayhead = document.getElementById('timelinePlayhead');
  const globalTimecode = document.getElementById('globalTimecode');
  const siteHeader = document.getElementById('siteHeader');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, scrollTop / (scrollHeight || 1)));

    // Update timeline bar
    if (timelineFill) timelineFill.style.width = `${progress * 100}%`;
    if (timelinePlayhead) timelinePlayhead.style.left = `${progress * 100}%`;

    // Calculate real-time Timecode (e.g. 00:02:14:18)
    const totalFrames = Math.floor(progress * 1800); // 60s at 30fps
    const minutes = Math.floor(totalFrames / (30 * 60));
    const seconds = Math.floor((totalFrames % (30 * 60)) / 30);
    const frames = totalFrames % 30;

    const minStr = minutes.toString().padStart(2, '0');
    const secStr = seconds.toString().padStart(2, '0');
    const frStr = frames.toString().padStart(2, '0');

    if (globalTimecode) {
      globalTimecode.textContent = `TC 00:${minStr}:${secStr}:${frStr}`;
    }

    // Header blur background toggle
    if (siteHeader) {
      if (scrollTop > 80) {
        siteHeader.classList.add('header-scrolled');
      } else {
        siteHeader.classList.remove('header-scrolled');
      }
    }
  }, { passive: true });

  // ------------------------------------------------------------
  // 5. MOBILE MENU DRAWER
  // ------------------------------------------------------------
  const menuToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('drawer-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      if (window.soundEngine) window.soundEngine.playCameraClick();
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('drawer-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ------------------------------------------------------------
  // 6. COPY PHONE NUMBER & TOAST NOTIFICATION
  // ------------------------------------------------------------
  const toastContainer = document.getElementById('toastContainer');

  const showToast = (message) => {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<i class="fa-solid fa-check gold"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  document.querySelectorAll('.copyable').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = el.getAttribute('data-copy') || el.innerText.trim();
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied WhatsApp Number: ${textToCopy}`);
        if (window.soundEngine) window.soundEngine.playPip(2000);
      }).catch(() => {
        showToast(`WhatsApp: ${textToCopy}`);
      });
    });
  });

});
