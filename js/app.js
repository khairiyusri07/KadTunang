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

  // 1. OPENING SEQUENCE
  function initOpening() {
    const seal = document.getElementById('seal-anchor');
    const envelopeStage = document.getElementById('envelope-stage');
    const envelope = document.getElementById('envelope');
    const coverEnvelope = document.getElementById('cover_envelope');
    const cardContent = document.getElementById('card-content');

    seal.addEventListener('click', () => {
      // 1. Play song
      startMusic();

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
      }, 1500);
    });
  }

  // 2. MUSIC PLAYER (Web Audio API + YouTube IFrame fallback)
  function initMusic() {
    // Build audio synthesizer fallback / romantic ambient wedding chords using Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    let synthTimer = null;

    const musicPlayBtn = document.getElementById('btn-play-music');
    const disc = document.getElementById('music-disc');
    const soundwaves = document.querySelectorAll('.soundwave-bar');

    function updatePlayState(playing) {
      isPlaying = playing;
      if (disc) {
        if (playing) disc.classList.add('rotating');
        else disc.classList.remove('rotating');
      }
      soundwaves.forEach(b => b.style.animationPlayState = playing ? 'running' : 'paused');
      if (musicPlayBtn) {
        musicPlayBtn.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
      }
    }

    // Play wedding acoustic chords with soft synthesizer
    function playRomanticSynth() {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const chords = [
        [261.63, 329.63, 392.00, 523.25], // C major
        [220.00, 261.63, 329.63, 440.00], // A minor
        [174.61, 220.00, 261.63, 349.23], // F major
        [196.00, 246.94, 293.66, 392.00]  // G major
      ];

      let chordIdx = 0;
      function arpeggiate() {
        if (!isPlaying) return;
        const currentChord = chords[chordIdx % chords.length];
        currentChord.forEach((freq, noteIdx) => {
          setTimeout(() => {
            if (!isPlaying) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 1.9);
          }, noteIdx * 400);
        });
        chordIdx++;
        synthTimer = setTimeout(arpeggiate, 2000);
      }
      arpeggiate();
    }

    window.startMusic = function () {
      // Don't auto-play if music controls / popup are removed
      if (!musicPlayBtn && !disc) return;
      updatePlayState(true);
      try {
        playRomanticSynth();
      } catch (e) {
        console.log('Audio init on interaction:', e);
      }
    };

    window.toggleMusic = function () {
      if (isPlaying) {
        updatePlayState(false);
        if (synthTimer) clearTimeout(synthTimer);
      } else {
        updatePlayState(true);
        playRomanticSynth();
      }
    };

    if (musicPlayBtn) {
      musicPlayBtn.addEventListener('click', window.toggleMusic);
    }
  }

  // 3. COUNTDOWN TIMER
  function initCountdown() {
    // Target date: 1 May 2025 11:00 AM
    const targetDate = new Date('2026-12-19T11:00:00+08:00').getTime();

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

    const eventTitle = encodeURIComponent("Walimatul Urus Adam & Hawa");
    const eventDetails = encodeURIComponent("Majlis Perkahwinan Adam & Hawa di Glass House Glenmarie. Selamat Pengantin Baru!");
    const eventLocation = encodeURIComponent("Glass House Glenmarie, LOT 16859, 3 Stone Park, Jalan Penyair U1/44, Shah Alam");
    // 20250501T110000 / 20250501T163000 (UTC+8) -> 20250501T030000Z / 20250501T083000Z
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=20250501T030000Z/20250501T083000Z&details=${eventDetails}&location=${eventLocation}`;

    btnGoogle.href = gCalUrl;

    btnIcs.addEventListener('click', (e) => {
      e.preventDefault();
      const icsData = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Jemputan//Walimatul Urus//MY",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "DTSTART:20250501T030000Z",
        "DTEND:20250501T083000Z",
        "SUMMARY:Walimatul Urus Adam & Hawa",
        "DESCRIPTION:Majlis Perkahwinan Adam & Hawa di Glass House Glenmarie",
        "LOCATION:Glass House Glenmarie, 40150 Shah Alam, Selangor",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "Walimatul_Urus_Adam_Hawa.ics");
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
