/* ============================================================
   GSAP, SCROLLTRIGGER & LENIS CINEMATIC ANIMATIONS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ------------------------------------------------------------
  // 1. LENIS SMOOTH SCROLL INITIALIZATION
  // ------------------------------------------------------------
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
    window.lenisInstance = lenis;
  }

  // ------------------------------------------------------------
  // 2. 4-PHASE FULL-SCREEN CINEMATIC LOADER
  // ------------------------------------------------------------
  const loaderEl = document.getElementById('cinematicLoader');
  const flashCutEl = document.getElementById('flashCut');
  const loaderBarEl = document.getElementById('loaderTimelineBar');
  const loaderTcEl = document.getElementById('loaderTimecode');
  const skipBtn = document.getElementById('skipLoaderBtn');

  let loaderFinished = false;

  const runLoaderTimeline = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        finishLoader();
      }
    });

    // Timecode simulation counter
    let tcObj = { frame: 0 };
    tl.to(tcObj, {
      frame: 90, // 3 seconds at 30fps
      duration: 3.2,
      ease: 'power1.inOut',
      onUpdate: () => {
        const sec = Math.floor(tcObj.frame / 30);
        const fr = Math.floor(tcObj.frame % 30);
        const secStr = sec.toString().padStart(2, '0');
        const frStr = fr.toString().padStart(2, '0');
        if (loaderTcEl) {
          loaderTcEl.textContent = `00:00:${secStr}:${frStr}`;
        }
      }
    }, 0);

    // Phase 1 (0-1s): Horizontal timeline line draw
    tl.to(loaderBarEl, {
      width: '100%',
      duration: 1.2,
      ease: 'power2.inOut'
    }, 0);

    // Phase 2 (1-1.8s): 35mm Projector Flicker & White flash frame
    tl.to('.loader-projector-flicker', {
      opacity: 0.8,
      duration: 0.8,
      ease: 'rough({template: none.out, strength: 2, points: 20, taper: "none", randomize: true})'
    }, 0.8);

    tl.call(() => {
      if (window.soundEngine) window.soundEngine.playPip(1200);
    }, null, 1.2);

    // Phase 3 (1.5-3.2s): Staggered letter-by-letter drop "SUMIT KUMAR"
    tl.to('.title-char', {
      opacity: 1,
      y: 0,
      rotate: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: 'back.out(1.7)'
    }, 1.4);

    tl.to('#loaderSubtitle', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, 2.4);

    tl.to('.loader-tools-ticker', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, 2.7);

    // Phase 4 (3.4s): Hard razor cut transition
    tl.to(flashCutEl, {
      opacity: 1,
      duration: 0.06,
      ease: 'power4.in'
    }, 3.3);

    tl.call(() => {
      if (window.soundEngine) window.soundEngine.playWhoosh();
    }, null, 3.35);

    return tl;
  };

  const masterLoaderTl = runLoaderTimeline();

  const finishLoader = () => {
    if (loaderFinished) return;
    loaderFinished = true;

    // Hard cut removal of loader
    if (loaderEl) {
      loaderEl.style.display = 'none';
    }
    document.body.classList.remove('loading-state');

    // Fade out white flash cut
    if (flashCutEl) {
      gsap.to(flashCutEl, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    }

    // Trigger Hero Entrance Animation immediately
    runHeroEntrance();
  };

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      masterLoaderTl.kill();
      finishLoader();
    });
  }

  // ------------------------------------------------------------
  // 3. HERO ENTRANCE ANIMATION
  // ------------------------------------------------------------
  const runHeroEntrance = () => {
    const heroTl = gsap.timeline();

    heroTl.fromTo('.hero-eyebrow-wrapper', {
      opacity: 0,
      y: -20
    }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    heroTl.to('.hero-word', {
      opacity: 1,
      y: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: 'power4.out'
    }, '-=0.5');

    heroTl.fromTo('.hero-subtext-container', {
      opacity: 0,
      y: 30
    }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6');

    heroTl.fromTo('.hero-cta-group .btn', {
      opacity: 0,
      y: 25,
      scale: 0.95
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      stagger: 0.15,
      ease: 'back.out(1.5)'
    }, '-=0.5');

    heroTl.fromTo('.hero-scroll-indicator', {
      opacity: 0
    }, {
      opacity: 1,
      duration: 0.8
    }, '-=0.3');

    // Initialize all scroll triggered animations once hero has landed
    initScrollTriggers();
  };

  // ------------------------------------------------------------
  // 4. SCROLLTRIGGER CINEMATIC REVEALS
  // ------------------------------------------------------------
  const initScrollTriggers = () => {
    // A. Section 3: The Interview / Subtitle Word-by-Word Reveal
    const speakWords = document.querySelectorAll('.speak-word');
    if (speakWords.length > 0) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#interview',
          start: 'top 75%',
          toggleActions: 'play none none none',
          onEnter: () => {
            if (window.soundEngine) window.soundEngine.playPip(900);
          }
        }
      })
      .to(speakWords, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out'
      })
      .fromTo('#interviewParagraph', {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.2')
      .fromTo('.stat-card', {
        opacity: 0,
        y: 40
      }, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.4)',
        onComplete: () => {
          // Number Counter Animation
          document.querySelectorAll('.stat-number').forEach((numEl) => {
            const target = parseInt(numEl.getAttribute('data-target'), 10) || 0;
            gsap.fromTo(numEl, {
              innerText: 0
            }, {
              innerText: target,
              duration: 2,
              ease: 'power2.out',
              snap: { innerText: 1 }
            });
          });
        }
      }, '-=0.4');
    }

    // B. Section 4: Vertical Video Showcase Grid Reveal & Pill Stagger
    const showcaseSection = document.getElementById('showcase');
    const videoCards = gsap.utils.toArray('.vertical-video-card');

    if (showcaseSection && videoCards.length > 0) {
      // Animate category filter pill bar
      gsap.fromTo('.video-filter-pill-container', {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.video-filter-pill-container',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      // Animate vertical video cards with responsive stagger
      gsap.fromTo(videoCards, {
        opacity: 0,
        y: 50,
        scale: 0.96
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#videoShowcaseGrid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }

    // C. Section 5: Services Reveal
    gsap.utils.toArray('.service-card').forEach((card, index) => {
      gsap.fromTo(card, {
        opacity: 0,
        y: 50
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: (index % 3) * 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });

    // D. Section 6: Process Timeline Bar Draw
    const processTrackFill = document.getElementById('processTrackFill');
    if (processTrackFill) {
      gsap.to(processTrackFill, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '#process',
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: 0.5
        }
      });
    }

    gsap.utils.toArray('.process-node-card').forEach((node, idx) => {
      gsap.fromTo(node, {
        opacity: 0,
        y: 40
      }, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: idx * 0.15,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '#process',
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      });
    });

    // E. Section 7: CTA Reveal
    gsap.fromTo('.cta-content-box', {
      opacity: 0,
      scale: 0.95,
      y: 40
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#cta',
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    });
  };
});
