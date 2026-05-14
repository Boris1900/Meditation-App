// Audio
let audioCtx = null;
let customAudioBuffer = null;
let usingCustomAudio = false;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playDemoGong() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
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

function playCustomAudio() {
  const ctx = getAudioCtx();
  const source = ctx.createBufferSource();
  source.buffer = customAudioBuffer;
  source.connect(ctx.destination);
  source.start();
}

function playGong() {
  if (usingCustomAudio && customAudioBuffer) playCustomAudio();
  else playDemoGong();
}

// Timer-State
let durationMinutes = 40;
let remainingSeconds = 0;
let timerInterval = null;
let isRunning = false;

// Dimm-State
let dimOpacity = 0.85;
let isDimmed = false;
let autoDimTimeout = null;

// Wake Lock
let wakeLock = null;

// DOM
const gongEl      = document.getElementById('gong');
const gongLabel   = document.getElementById('gong-label');
const timerText   = document.getElementById('timer-text');
const slider      = document.getElementById('duration-slider');
const minusBtn    = document.getElementById('minus-btn');
const plusBtn     = document.getElementById('plus-btn');
const overlay     = document.getElementById('overlay');
const audioMenu   = document.getElementById('audio-menu');
const navAudio    = document.getElementById('nav-audio');
const closeMenu   = document.getElementById('close-menu');
const fileInput   = document.getElementById('audio-file-input');
const currentName = document.getElementById('current-audio-name');
const useDemoBtn  = document.getElementById('use-demo-gong');
const dimSlider   = document.getElementById('dim-slider');
const dimLevelLabel = document.getElementById('dim-level-label');

// Slider
function updateSliderProgress() {
  const val = parseInt(slider.value);
  const pct = ((val - 1) / (90 - 1)) * 100;
  slider.style.setProperty('--progress', pct + '%');
}

function updateDuration(val) {
  durationMinutes = val;
  slider.value = val;
  timerText.textContent = formatTime(val * 60);
  updateSliderProgress();
}

slider.addEventListener('input', () => {
  if (!isRunning) updateDuration(parseInt(slider.value));
});

minusBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!isRunning && durationMinutes > 1) updateDuration(durationMinutes - 1);
});
plusBtn.addEventListener('click', (e) => {
  e.stopPropagation();
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
  slider.disabled = true;
  minusBtn.disabled = true;
  plusBtn.disabled = true;
  requestWakeLock();
  scheduleAutoDim();

  timerInterval = setInterval(() => {
    remainingSeconds--;
    timerText.textContent = formatTime(remainingSeconds);
    if (remainingSeconds <= 0) finishTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  clearTimeout(autoDimTimeout);
  timerInterval = null;
  autoDimTimeout = null;
  isRunning = false;
  gongLabel.textContent = 'START';
  document.body.classList.remove('running');
  slider.disabled = false;
  minusBtn.disabled = false;
  plusBtn.disabled = false;
  releaseWakeLock();
  brighten();
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
  void gongEl.offsetWidth;
  gongEl.classList.add('swinging');
  gongEl.addEventListener('animationend', () => {
    gongEl.classList.remove('swinging');
  }, { once: true });
}

// Dimm-Logik
function dim() {
  if (dimOpacity === 0) return;
  overlay.style.transitionDuration = '3s';
  overlay.style.opacity = dimOpacity;
  overlay.style.pointerEvents = 'auto';
  isDimmed = true;
}

function brighten() {
  overlay.style.transitionDuration = '1s';
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  isDimmed = false;
}

function scheduleAutoDim() {
  clearTimeout(autoDimTimeout);
  if (dimOpacity > 0 && isRunning) {
    autoDimTimeout = setTimeout(() => {
      if (isRunning) dim();
    }, 3000);
  }
}

// Overlay: Tap während abgedunkelt → aufhellen, Timer läuft weiter
overlay.addEventListener('click', (e) => {
  e.stopPropagation();
  if (isRunning && isDimmed) {
    brighten();
    scheduleAutoDim();
  }
});

// Gong antippen
gongEl.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!isRunning) {
    // Timer starten
    playGong();
    swingGong();
    setTimeout(() => startTimer(), 500);
  } else {
    // Nur erreichbar wenn NICHT abgedunkelt – Overlay fängt Klick ab wenn dimmed
    stopTimer();
    playGong();
    swingGong();
  }
});

// Tap auf Display (nicht Gong, nicht Nav) während Timer hell läuft → wieder abdunkeln
document.addEventListener('click', (e) => {
  if (!isRunning || isDimmed) return;
  if (e.target.closest('#gong')) return;
  if (e.target.closest('#bottom-nav')) return;
  if (e.target.closest('#audio-menu')) return;
  scheduleAutoDim();
});

// Wake Lock
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {}
  }
}
async function releaseWakeLock() {
  if (wakeLock) { await wakeLock.release(); wakeLock = null; }
}

// Navigation: Menü öffnen/schließen
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

// Abdunkelung einstellen
function updateDimLabel() {
  const v = Math.round(dimOpacity * 100);
  if (v === 0)       dimLevelLabel.textContent = 'Keine Abdunkelung';
  else if (v <= 20)  dimLevelLabel.textContent = 'Sehr leicht';
  else if (v <= 45)  dimLevelLabel.textContent = 'Leicht';
  else if (v <= 65)  dimLevelLabel.textContent = 'Mittel';
  else if (v <= 80)  dimLevelLabel.textContent = 'Stark';
  else               dimLevelLabel.textContent = 'Sehr stark';
}

dimSlider.addEventListener('input', () => {
  dimOpacity = dimSlider.value / 100;
  updateDimLabel();
});

// Layout-Berechnung
const timerArea = document.getElementById('timer-area');

const IMG_W = 852, IMG_H = 1846;
const BUDDHA_PCT = 0.54;   // Buddha-Kopfkrone bei 54% der Bildhöhe
const GONG_ASPECT = 312 / 360;
const MIN_TIMER_ZONE = 130; // px Mindestplatz für Timer + Slider

function getBuddhaScreenY() {
  const scale = Math.max(window.innerWidth / IMG_W, window.innerHeight / IMG_H);
  const offsetY = (IMG_H * scale - window.innerHeight) / 2;
  return Math.round(IMG_H * BUDDHA_PCT * scale - offsetY);
}

function initLayout() {
  const buddhaY = getBuddhaScreenY();
  const gongH = Math.min(360, buddhaY - MIN_TIMER_ZONE);
  const gongW = Math.round(gongH * GONG_ASPECT);
  document.documentElement.style.setProperty('--gong-height', gongH + 'px');
  document.documentElement.style.setProperty('--gong-width', gongW + 'px');
  requestAnimationFrame(positionTimerArea);
}

function positionTimerArea() {
  const gongBottom = gongEl.getBoundingClientRect().bottom;
  const buddhaY = getBuddhaScreenY();
  timerArea.style.top = gongBottom + 'px';
  timerArea.style.height = (buddhaY - gongBottom) + 'px';
}

window.addEventListener('load', initLayout);
window.addEventListener('resize', initLayout);

// Init
updateDuration(40);
updateDimLabel();
