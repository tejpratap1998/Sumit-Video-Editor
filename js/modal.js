/* ============================================================
   INTERACTIVE VIDEO MODAL & BEFORE/AFTER COLOR GRADE SLIDER
   ============================================================ */

class VideoModalController {
  constructor() {
    this.modal = document.getElementById('videoModalDialog');
    this.closeBtn = document.getElementById('modalCloseBtn');
    this.backdrop = document.getElementById('modalBackdrop');

    this.titleEl = document.getElementById('modalProjectTitle');
    this.catEl = document.getElementById('modalProjectCategory');
    this.toolsEl = document.getElementById('modalProjectTools');
    this.summaryEl = document.getElementById('modalProjectSummary');
    this.sceneTitleEl = document.getElementById('modalSceneTitle');

    // Splitter elements
    this.container = document.getElementById('colorGradeContainer');
    this.beforeLayer = document.getElementById('gradeBeforeLayer');
    this.handle = document.getElementById('gradeSplitterHandle');

    // Transport controls
    this.playPauseBtn = document.getElementById('modalPlayPauseBtn');
    this.playPauseIcon = document.getElementById('playPauseIcon');
    this.restartBtn = document.getElementById('modalRestartBtn');
    this.scrubSlider = document.getElementById('modalScrubSlider');
    this.timeDisplay = document.getElementById('modalTimeDisplay');
    this.liveTcDisplay = document.getElementById('modalLiveTimecode');
    this.aspectBtn = document.getElementById('aspectToggleBtn');
    this.displayArea = document.getElementById('videoDisplayArea');
    this.speedBtns = document.querySelectorAll('.speed-btn');

    this.isPlaying = true;
    this.currentTime = 12;
    this.totalDuration = 30;
    this.speed = 1.0;
    this.isDraggingSplitter = false;
    this.timer = null;

    this.initEvents();
  }

  initEvents() {
    // Open modal on project card click
    document.querySelectorAll('.vertical-video-card[data-project], .project-card[data-project]').forEach((card) => {
      card.addEventListener('click', (e) => {
        // Prevent opening modal if clicking sound toggle button
        if (e.target.closest('.video-card-sound-btn')) {
          return;
        }
        const title = card.getAttribute('data-title') || 'Project Showcase';
        const cat = card.getAttribute('data-category') || 'VIDEO EDIT';
        const tools = card.getAttribute('data-tools') || 'Premiere Pro';
        const summary = card.getAttribute('data-summary') || 'High performance cinematic edit.';
        this.open(title, cat, tools, summary);
      });
    });

    // Close handlers
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.open) {
        this.close();
      }
    });

    // Splitter drag handlers (Mouse & Touch)
    if (this.container) {
      this.container.addEventListener('mousedown', (e) => {
        this.isDraggingSplitter = true;
        this.updateSplitter(e.clientX);
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDraggingSplitter) return;
        this.updateSplitter(e.clientX);
      });

      window.addEventListener('mouseup', () => {
        this.isDraggingSplitter = false;
      });

      // Touch events for mobile
      this.container.addEventListener('touchstart', (e) => {
        this.isDraggingSplitter = true;
        if (e.touches.length > 0) this.updateSplitter(e.touches[0].clientX);
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!this.isDraggingSplitter) return;
        if (e.touches.length > 0) this.updateSplitter(e.touches[0].clientX);
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isDraggingSplitter = false;
      });
    }

    // Play / Pause
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => this.togglePlay());
    }

    // Restart
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        this.currentTime = 0;
        this.updateTransportUI();
        if (window.soundEngine) window.soundEngine.playCameraClick();
      });
    }

    // Scrubber
    if (this.scrubSlider) {
      this.scrubSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.currentTime = (val / 100) * this.totalDuration;
        this.updateTransportUI();
      });
    }

    // Speed selector
    this.speedBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.speed = parseFloat(btn.getAttribute('data-speed')) || 1.0;
        if (window.soundEngine) window.soundEngine.playPip(1600);
      });
    });

    // Aspect Ratio toggle
    if (this.aspectBtn && this.displayArea) {
      this.aspectBtn.addEventListener('click', () => {
        const isVertical = this.displayArea.classList.toggle('aspect-vertical');
        this.aspectBtn.innerHTML = isVertical
          ? '<i class="fa-solid fa-desktop"></i> 16:9'
          : '<i class="fa-solid fa-mobile-screen"></i> 9:16';
        if (window.soundEngine) window.soundEngine.playCameraClick();
      });
    }
  }

  updateSplitter(clientX) {
    if (!this.container || !this.beforeLayer || !this.handle) return;
    const rect = this.container.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    let percentage = (offsetX / rect.width) * 100;

    percentage = Math.max(5, Math.min(95, percentage));

    this.beforeLayer.style.width = `${percentage}%`;
    this.handle.style.left = `${percentage}%`;
  }

  open(title, cat, tools, summary) {
    if (!this.modal) return;
    if (this.titleEl) this.titleEl.textContent = title;
    if (this.catEl) this.catEl.textContent = cat;
    if (this.toolsEl) this.toolsEl.textContent = tools;
    if (this.summaryEl) this.summaryEl.textContent = summary;
    if (this.sceneTitleEl) this.sceneTitleEl.textContent = `${title.toUpperCase()} — COLOR GRADE`;

    this.modal.showModal();
    this.isPlaying = true;
    this.startPlaybackLoop();

    if (window.soundEngine) {
      window.soundEngine.playWhoosh();
    }
  }

  close() {
    if (!this.modal) return;
    this.modal.close();
    this.stopPlaybackLoop();
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.playPauseIcon) {
      this.playPauseIcon.className = this.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    if (window.soundEngine) window.soundEngine.playPip(1400);
  }

  startPlaybackLoop() {
    this.stopPlaybackLoop();
    this.timer = setInterval(() => {
      if (this.isPlaying) {
        this.currentTime += 0.1 * this.speed;
        if (this.currentTime >= this.totalDuration) {
          this.currentTime = 0;
        }
        this.updateTransportUI();
      }
    }, 100);
  }

  stopPlaybackLoop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateTransportUI() {
    const curSec = Math.floor(this.currentTime);
    const totSec = Math.floor(this.totalDuration);
    const fr = Math.floor((this.currentTime % 1) * 24);

    const curStr = `00:${curSec.toString().padStart(2, '0')}`;
    const totStr = `00:${totSec.toString().padStart(2, '0')}`;
    const frStr = fr.toString().padStart(2, '0');

    if (this.timeDisplay) {
      this.timeDisplay.textContent = `${curStr} / ${totStr}`;
    }

    if (this.liveTcDisplay) {
      this.liveTcDisplay.textContent = `00:00:${curSec.toString().padStart(2, '0')}:${frStr}`;
    }

    if (this.scrubSlider) {
      this.scrubSlider.value = (this.currentTime / this.totalDuration) * 100;
    }
  }
}

// Initialize Modal Controller
document.addEventListener('DOMContentLoaded', () => {
  window.videoModal = new VideoModalController();
});
