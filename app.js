// Audio-Kontext
let audioCtx = null;
let customAudioBuffer = null;
let usingCustomAudio = false;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Demo-Gong synthetisch erzeugen
function playDemoGong() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  // Grundton: tiefer Gong ~110 Hz mit Obertönen
  const frequencies = [110, 220, 330, 550, 880];
  const gains      = [0.5, 0.3, 0.15, 0.08, 0.04];
  const decays     = [4.0, 3.0, 2.0,  1.5,  1.0];

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + decays[i]);

    gain.gain.setValueAtTime(gains[i], now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decays[i]);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + decays[i]);
  });
}

// Eigene MP3 abspielen
function playCustomAudio() {
  const ctx = getAudioCtx();
  const source = ctx.createBufferSource();
  source.buffer = customAudioBuffer;
  source.connect(ctx.destination);
  source.start();
}

function playGong() {
  if (usingCustomAudio && customAudioBuffer) {
    playCustomAudio();
  } else {
    playDemoGong();
  }
}

// Timer-State
let durationMinutes = 40;
let remainingSeconds = 0;
let timerInterval = null;
let isRunning = false;

// DOM
const gongEl       = document.getElementById('gong');
const gongLabel    = document.getElementById('gong-label');
const timerText    = document.getElementById('timer-text');
const slider       = document.getElementById('duration-slider');
const durationVal  = document.getElementById('duration-value');
const minusBtn     = document.getElementById('minus-btn');
const plusBtn      = document.getElementById('plus-btn');
const overlay      = document.getElementById('overlay');
const audioMenu    = document.getElementById('audio-menu');
const navAudio     = document.getElementById('nav-audio');
const closeMenu    = document.getElementById('close-menu');
const fileInput    = document.getElementById('audio-file-input');
const currentName  = document.getElementById('current-audio-name');
const useDemoBtn   = document.getElementById('use-demo-gong');

// Slider initialisieren
function updateSliderProgress() {
  const val = parseInt(slider.value);
  const pct = ((val - 1) / (90 - 1)) * 100;
  slider.style.setProperty('--progress', pct + '%');
}

function updateDuration(val) {
  durationMinutes = val;
  slider.value = val;
  durationVal.textContent = val === 1 ? '1 Minute' : val + ' Minuten';
  timerText.textContent = formatTime(val * 60);
  updateSliderProgress();
}

slider.addEventListener('input', () => {
  if (!isRunning) updateDuration(parseInt(slider.value));
});

minusBtn.addEventListener('click', () => {
  if (!isRunning && durationMinutes > 1) updateDuration(durationMinutes - 1);
});
plusBtn.addEventListener('click', () => {
  if (!isRunning && durationMinutes < 90) updateDuration(durationMinutes + 1);
});

// Timer
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function startTimer() {
  remainingSeconds = durationMinutes * 60;
  isRunning = true;
  gongLabel.textContent = 'STOP';
  document.body.classList.add('running');

  // Controls sperren
  slider.disabled = true;
  minusBtn.disabled = true;
  plusBtn.disabled = true;

  // Display dimmen nach 3 Sekunden
  setTimeout(() => {
    if (isRunning) {
      overlay.classList.remove('hidden');
      overlay.dataset.dimmed = 'true';
    }
  }, 3000);

  timerInterval = setInterval(() => {
    remainingSeconds--;
    timerText.textContent = formatTime(remainingSeconds);

    if (remainingSeconds <= 0) {
      finishTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  gongLabel.textContent = 'START';
  document.body.classList.remove('running');

  slider.disabled = false;
  minusBtn.disabled = false;
  plusBtn.disabled = false;

  overlay.classList.add('hidden');
  overlay.dataset.dimmed = 'false';
  updateDuration(durationMinutes);
}

function finishTimer() {
  stopTimer();
  playGong();
  swingGong();
}

// Gong-Animation
function swingGong() {
  gongEl.classList.remove('swinging');
  void gongEl.offsetWidth; // Reflow
  gongEl.classList.add('swinging');
  gongEl.addEventListener('animationend', () => {
    gongEl.classList.remove('swinging');
  }, { once: true });
}

// Gong antippen
gongEl.addEventListener('click', () => {
  if (!isRunning) {
    playGong();
    swingGong();
    setTimeout(() => startTimer(), 500);
  } else {
    stopTimer();
  }
});

// Overlay: Display hell/dunkel toggle
overlay.addEventListener('click', () => {
  if (overlay.dataset.dimmed === 'true') {
    // Hell machen – Klicks durchlassen
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.dataset.dimmed = 'false';
    // Nach 5 Sekunden wieder abdunkeln
    setTimeout(() => {
      if (isRunning && overlay.dataset.dimmed === 'false') {
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        overlay.dataset.dimmed = 'true';
      }
    }, 5000);
  } else {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    overlay.dataset.dimmed = 'true';
  }
});

// Wake Lock (verhindert automatisches Screen-Ausschalten)
let wakeLock = null;
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (e) {
      // Wake Lock nicht verfügbar – kein Problem
    }
  }
}
async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

// Wake Lock beim Starten/Stoppen
const origStart = startTimer;
// (Wake Lock ist in startTimer integriert via Patch)
gongEl.addEventListener('click', () => {}, { passive: true });

// Navigation: Audio-Menü
navAudio.addEventListener('click', () => {
  audioMenu.classList.remove('hidden');
});
closeMenu.addEventListener('click', () => {
  audioMenu.classList.add('hidden');
});

// Eigene MP3 laden
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const ctx = getAudioCtx();
  const arrayBuffer = await file.arrayBuffer();
  customAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
  usingCustomAudio = true;
  currentName.textContent = 'Aktuell: ' + file.name;
  audioMenu.classList.add('hidden');
});

useDemoBtn.addEventListener('click', () => {
  usingCustomAudio = false;
  customAudioBuffer = null;
  currentName.textContent = 'Aktuell: Demo-Gong';
  audioMenu.classList.add('hidden');
});

// Wake Lock in Timer integrieren
const _startTimer = startTimer;
window.addEventListener('load', () => {
  // Override startTimer mit Wake Lock
  gongEl.addEventListener('click', () => {
    if (!isRunning) requestWakeLock();
    else releaseWakeLock();
  }, { passive: true });
});

// Init
updateDuration(40);
