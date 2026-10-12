// =======================================================
// Jemputan Digital - Adam & Hawa (FLO092) Application Logic
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
  const data = INVITATION_DATA.order;

  // Audio state
  let isPlaying = false;
  let bgAudio = null;
  let ytPlayer = null;

  // Initialize UI elements
  initOpening();
  initCountdown();
  initAttendanceAndWishes();
  initModals();
  initMusic();
  initCalendar();
  initParticles();
  initScrollAnimations();
  initAutoScroll();

  // 1. OPENING SEQUENCE
  function initOpening() {
    const seal = document.getElementById('seal-anchor');
    const envelopeStage = document.getElementById('envelope-stage');
    const envelope = document.getElementById('envelope');
    const coverEnvelope = document.getElementById('cover_envelope');
    const cardContent = document.getElementById('card-content');
    const floatingMusicBtn = document.getElementById('floating-music-btn');

    seal.addEventListener('click', () => {
      // 1. Play song automatically on user click
      startMusic();

      // Show floating music toggle button
      if (floatingMusicBtn) {
        floatingMusicBtn.classList.add('visible');
      }

      // 2. Open flap
      coverEnvelope.classList.add('open');

      // 3. Slide envelope down
      setTimeout(() => {
        envelope.classList.add('open');
      }, 900);

      // 4. Reveal invitation card
      setTimeout(() => {
        envelopeStage.classList.add('stage-hidden');
        cardContent.classList.add('revealed');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Statik selama 2 saat dahulu, kemudian auto scroll ke bawah perlahan-lahan
        startAutoScroll(2000);
      }, 1500);
    });
  }

  // 2. MUSIC PLAYER (assets/backgroundSong.mp3)
  function initMusic() {
    bgAudio = document.getElementById('bg-audio');
    if (!bgAudio) {
      bgAudio = new Audio('assets/backgroundSong.mp3');
      bgAudio.id = 'bg-audio';
      bgAudio.loop = true;
      document.body.appendChild(bgAudio);
    }
    bgAudio.loop = true;
    bgAudio.volume = 0.85;

    const musicBtn = document.getElementById('floating-music-btn');
    const musicPlayBtn = document.getElementById('btn-play-music');
    const disc = document.getElementById('music-disc');
    const soundwaves = document.querySelectorAll('.soundwave-bar');

    function updatePlayState(playing) {
      isPlaying = playing;
      if (musicBtn) {
        if (playing) musicBtn.classList.add('playing');
        else musicBtn.classList.remove('playing');
      }
      if (disc) {
        if (playing) disc.classList.add('rotating');
        else disc.classList.remove('rotating');
      }
      soundwaves.forEach(b => b.style.animationPlayState = playing ? 'running' : 'paused');
      if (musicPlayBtn) {
        musicPlayBtn.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
      }
    }

    window.startMusic = function () {
      if (!bgAudio) return;
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          updatePlayState(true);
        }).catch(err => {
          console.log('Audio playback prevented or error:', err);
        });
      }
    };

    window.toggleMusic = function () {
      if (!bgAudio) return;
      if (bgAudio.paused) {
        bgAudio.play().then(() => {
          updatePlayState(true);
        }).catch(err => console.log('Audio resume error:', err));
      } else {
        bgAudio.pause();
        updatePlayState(false);
      }
    };

    if (musicBtn) {
      musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.toggleMusic();
      });
    }

    if (musicPlayBtn) {
      musicPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.toggleMusic();
      });
    }

    bgAudio.addEventListener('play', () => updatePlayState(true));
    bgAudio.addEventListener('pause', () => updatePlayState(false));
  }

  // 3. COUNTDOWN TIMER
  function initCountdown() {
    // Target date: 19 December 2026 3:00 PM
    const targetDate = new Date('2026-12-19T15:00:00+08:00').getTime();

    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minsEl = document.getElementById('count-mins');
    const secsEl = document.getElementById('count-secs');

    function update() {
      const now = new Date().getTime();
      let diff = targetDate - now;

      // If already passed in current year, calculate demonstration counter or celebrate
      if (diff < 0) {
        // Let's create an ongoing anniversary or upcoming countdown
        diff = Math.abs(diff) % (365 * 24 * 60 * 60 * 1000);
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(minutes).padStart(2, '0');
      secsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // 4. ATTENDANCE & WISHES
  function initAttendanceAndWishes() {
    const attTotal = document.getElementById('att-total');
    const attAdults = document.getElementById('att-adults');
    const attKids = document.getElementById('att-kids');
    const wishesContainer = document.getElementById('wishes-list');

    if (!attTotal && !wishesContainer) return;

    const rawRsvps = data.rsvps || [];
    const savedRsvps = JSON.parse(localStorage.getItem('adam_hawa_rsvps') || '[]');
    const allRsvps = [...savedRsvps, ...rawRsvps];

    // Compute stats
    let totalPax = 0;
    let adultPax = 0;
    let kidPax = 0;

    allRsvps.forEach(r => {
      if (r.status === 'yes') {
        const pax = Number(r.pax) || 1;
        const kids = Number(r.pax_kid) || 0;
        totalPax += pax + kids;
        adultPax += pax;
        kidPax += kids;
      }
    });

    if (attTotal) attTotal.textContent = totalPax;
    if (attAdults) attAdults.textContent = adultPax;
    if (attKids) attKids.textContent = kidPax;

    // Render wishes
    if (wishesContainer) {
      renderWishes(allRsvps);
    }
  }

  function renderWishes(rsvps) {
    const wishesContainer = document.getElementById('wishes-list');
    if (!wishesContainer) return;
    wishesContainer.innerHTML = '';

    const validWishes = rsvps.filter(r => r.wish && r.wish.trim() !== '');

    validWishes.slice(0, 30).forEach(w => {
      const item = document.createElement('div');
      item.className = 'wish-item';

      let statusBadge = '';
      if (w.status === 'yes') {
        statusBadge = '<span class="wish-badge hadir">Hadir</span>';
      } else if (w.status === 'maybe') {
        statusBadge = '<span class="wish-badge mungkin">Mungkin</span>';
      } else if (w.status === 'no') {
        statusBadge = '<span class="wish-badge tidak-hadir">Tidak Hadir</span>';
      }

      const dateStr = w.created_at ? w.created_at.split(' ')[0] : 'Terkini';

      item.innerHTML = `
        <div class="wish-item-header">
          <span class="wish-author">${escapeHtml(w.name || 'Tetamu')}</span>
          <span class="wish-time">${dateStr}</span>
        </div>
        <div class="wish-text">${escapeHtml(w.wish)}</div>
        ${statusBadge}
      `;
      wishesContainer.appendChild(item);
    });
  }

  // 5. MODALS & POPUPS
  function initModals() {
    const backdrop = document.getElementById('popup-backdrop');
    const popups = document.querySelectorAll('.popup');

    window.openPopup = function (popupId) {
      stopAutoScroll();
      closeAllPopups();
      const target = document.getElementById(popupId);
      if (target) {
        target.classList.add('show');
        backdrop.classList.add('show');
      }
    };

    window.closeAllPopups = function () {
      popups.forEach(p => p.classList.remove('show'));
      backdrop.classList.remove('show');
    };

    backdrop.addEventListener('click', closeAllPopups);

    document.querySelectorAll('.popup-close-btn').forEach(btn => {
      btn.addEventListener('click', closeAllPopups);
    });

    // Bottom Navigation Bar click bindings
    document.querySelectorAll('.btn-footer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-popup');
        if (action) {
          openPopup(action);
        }
      });
    });

    // Gift tabs switching
    const tabSalam = document.getElementById('tab-salam');
    const tabWishlist = document.getElementById('tab-wishlist');
    const viewSalam = document.getElementById('view-salam');
    const viewWishlist = document.getElementById('view-wishlist');

    if (tabSalam && tabWishlist) {
      tabSalam.addEventListener('click', () => {
        tabSalam.classList.add('active');
        tabWishlist.classList.remove('active');
        viewSalam.style.display = 'block';
        viewWishlist.style.display = 'none';
      });

      tabWishlist.addEventListener('click', () => {
        tabWishlist.classList.add('active');
        tabSalam.classList.remove('active');
        viewSalam.style.display = 'none';
        viewWishlist.style.display = 'block';
      });
    }

    // Copy Account Numbers
    window.copyAccountNumber = function (text, bank) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Nombor akaun ${bank} disalin: ${text}`);
      }).catch(() => {
        showToast(`Nombor: ${text}`);
      });
    };

    // RSVP Form submission (if present)
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
      let selectedStatus = 'yes';

      document.querySelectorAll('.rsvp-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.rsvp-type-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedStatus = btn.getAttribute('data-status');
        });
      });

      rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rsvp-name').value.trim();
        const phone = document.getElementById('rsvp-phone').value.trim();
        const pax = parseInt(document.getElementById('rsvp-pax').value) || 1;
        const kids = parseInt(document.getElementById('rsvp-kids').value) || 0;
        const slot = document.getElementById('rsvp-slot').value;
        const wish = document.getElementById('rsvp-wish').value.trim();

        if (!name) {
          showToast('Sila masukkan nama anda');
          return;
        }

        const newRsvp = {
          id: Date.now(),
          name,
          phone,
          pax,
          pax_kid: kids,
          slot,
          wish,
          status: selectedStatus,
          created_at: new Date().toISOString().split('T')[0]
        };

        const saved = JSON.parse(localStorage.getItem('adam_hawa_rsvps') || '[]');
        saved.unshift(newRsvp);
        localStorage.setItem('adam_hawa_rsvps', JSON.stringify(saved));

        // Re-render
        initAttendanceAndWishes();

        showToast('Terima kasih atas maklum balas RSVP anda!');
        rsvpForm.reset();
        closeAllPopups();
      });
    }
  }

  // 6. CALENDAR INTEGRATION
  function initCalendar() {
    const btnGoogle = document.getElementById('btn-add-google-cal');
    const btnIcs = document.getElementById('btn-add-ics-cal');

    const eventTitle = encodeURIComponent("Majlis Pertunangan Aisya & Khairi");
    const eventDetails = encodeURIComponent("Majlis Pertunangan Aisya & Khairi di RS Resort.");
    const eventLocation = encodeURIComponent("RS Resort");
    // 2026-12-19 3:00 PM - 6:00 PM (UTC+8) -> 20261219T070000Z / 20261219T100000Z
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=20261219T070000Z/20261219T100000Z&details=${eventDetails}&location=${eventLocation}`;

    btnGoogle.href = gCalUrl;

    btnIcs.addEventListener('click', (e) => {
      e.preventDefault();
      const icsData = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Jemputan//Majlis Pertunangan//MY",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "DTSTART:20261219T070000Z",
        "DTEND:20261219T100000Z",
        "SUMMARY:Majlis Pertunangan Aisya & Khairi",
        "DESCRIPTION:Majlis Pertunangan Aisya & Khairi di RS Resort",
        "LOCATION:RS Resort",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "Majlis_Pertunangan_Aisya_Khairi.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Jadual disimpan ke peranti!");
    });
  }

  // 7. PARTICLES (Floating Rose & Gold Sparkles)
  function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 4;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${Math.random() * 6 + 5}s`;
      p.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(p);
    }
  }

  // 8. SCROLL REVEAL ANIMATIONS FOR ELEGANT TEXT
  function initScrollAnimations() {
    const targets = document.querySelectorAll(
      '.bismillah-text, .greeting-lead, .couple-box, .hashtag-box, .doa-card, .venue-card, .countdown-container'
    );

    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    targets.forEach(el => {
      el.classList.add('scroll-reveal');
      observer.observe(el);
    });
  }

  // 9. AUTO SCROLL FUNCTIONALITY
  let autoScrollActive = false;
  let autoScrollTimeout = null;
  let autoScrollAnimId = null;

  function initAutoScroll() {
    // Interaksi manual untuk menghentikan auto scroll apabila pengguna menyentuh skrin
    const cancelEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    cancelEvents.forEach(evt => {
      window.addEventListener(evt, (e) => {
        // Jangan batalkan jika pengguna klik pada seal pembukaan atau butang muzik
        if (e.target && (e.target.closest('#seal-anchor') || e.target.closest('#envelope-stage'))) {
          return;
        }
        if (e.target && e.target.closest('#floating-music-btn')) {
          return;
        }
        if (autoScrollActive || autoScrollTimeout) {
          stopAutoScroll();
        }
      }, { passive: true });
    });
  }

  function startAutoScroll(delayMs = 2000) {
    stopAutoScroll();

    // Berhenti / statik selama tempoh delay (2 saat) sebelum mula skrol
    autoScrollTimeout = setTimeout(() => {
      autoScrollActive = true;
      let lastTimestamp = null;
      let fractionalScrollY = window.scrollY || window.pageYOffset || 0;

      // Kelajuan perlahan & lancar (~40px sesaat)
      const scrollSpeed = 40;

      function step(timestamp) {
        if (!autoScrollActive) return;

        if (!lastTimestamp) {
          lastTimestamp = timestamp;
          fractionalScrollY = window.scrollY || window.pageYOffset || 0;
        }

        const delta = Math.min(timestamp - lastTimestamp, 100) / 1000;
        lastTimestamp = timestamp;

        const currentY = window.scrollY || window.pageYOffset || 0;
        // Jika pengguna skrol secara manual, hentikan auto scroll
        if (Math.abs(currentY - fractionalScrollY) > 6) {
          stopAutoScroll();
          return;
        }

        fractionalScrollY += scrollSpeed * delta;
        window.scrollTo(0, fractionalScrollY);

        const maxScroll = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) - window.innerHeight;

        // Berhenti apabila sampai ke penghujung halaman
        if (currentY >= maxScroll - 2) {
          stopAutoScroll();
          return;
        }

        autoScrollAnimId = requestAnimationFrame(step);
      }

      autoScrollAnimId = requestAnimationFrame(step);
    }, delayMs);
  }

  function stopAutoScroll() {
    if (autoScrollTimeout) {
      clearTimeout(autoScrollTimeout);
      autoScrollTimeout = null;
    }
    if (autoScrollAnimId) {
      cancelAnimationFrame(autoScrollAnimId);
      autoScrollAnimId = null;
    }
    autoScrollActive = false;
  }

  // Toast Helper
  function showToast(msg) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }
});
