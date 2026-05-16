// Version
const APP_VERSION = 'v1.33-test';

// Geräteerkennung
function isIOS() {
  return (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)) &&
    !window.MSStream;
}

// Audio
let audioCtx = null;
let customAudioBuffer = null;
let rawAudioBuffer = null; // rohes ArrayBuffer – überlebt AudioContext-Neustarts

function getAudioCtx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    customAudioBuffer = null; // Buffer war an alten Context gebunden
  }
  return audioCtx;
}

async function playGong() {
  if (!rawAudioBuffer) return;
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
    try { await ctx.resume(); } catch (e) {}
  }
  if (!customAudioBuffer) {
    try {
      customAudioBuffer = await ctx.decodeAudioData(rawAudioBuffer.slice(0));
    } catch (e) {
      // Context beim Dekodieren gestorben – einmal neu versuchen
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      customAudioBuffer = null;
      try {
        customAudioBuffer = await audioCtx.decodeAudioData(rawAudioBuffer.slice(0));
      } catch (e2) {
        console.error('Dekodierung fehlgeschlagen:', e2);
        return;
      }
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = customAudioBuffer;
  source.connect(ctx.destination);
  source.start(ctx.currentTime);
}

// Timer-State
let durationMinutes = 40;
let remainingSeconds = 0;
let timerInterval = null;
let isRunning = false;

// Dimm-State
let dimOpacity = 0;
let isDimmed = false;
let autoDimTimeout = null;

// Wake Lock
let wakeLock = null;
let wakeLockExtendTimer = null;

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
const klangBtns   = document.querySelectorAll('.klang-btn');
const dimSlider   = document.getElementById('dim-slider');
const dimLevelLabel = document.getElementById('dim-level-label');
const flameSlider = document.getElementById('flame-slider');
const flameLevelLabel = document.getElementById('flame-level-label');
const flickerCheckbox = document.getElementById('flicker-checkbox');
const flameFlicker = document.getElementById('flame-flicker');
const bgSmile     = document.getElementById('bg-smile');
const buddhaAura  = document.getElementById('buddha-aura');

// Timer-Anzeige: jede Ziffer in fixen Span, verhindert iOS-Ruckeln
function renderTimer(timeStr) {
  timerText.innerHTML = timeStr.split('').map(ch =>
    `<span class="${ch === ':' ? 'colon' : 'digit'}">${ch}</span>`
  ).join('');
}

// Slider
function updateSliderProgress() {
  const val = parseInt(slider.value);
  const pct = ((val - 1) / (90 - 1)) * 100;
  slider.style.setProperty('--progress', pct + '%');
}

function updateDuration(val) {
  durationMinutes = val;
  slider.value = val;
  renderTimer(formatTime(val * 60));
  updateSliderProgress();
  localStorage.setItem('medi_dauer', val);
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
  if (wakeLockExtendTimer) { clearTimeout(wakeLockExtendTimer); wakeLockExtendTimer = null; }
  remainingSeconds = durationMinutes * 60;
  isRunning = true;
  gongLabel.textContent = 'STOP';
  document.body.classList.add('running');
  slider.disabled = true;
  minusBtn.disabled = true;
  plusBtn.disabled = true;
  requestWakeLock();
  scheduleAutoDim();
  scheduleBuddhaSmile();

  timerInterval = setInterval(() => {
    remainingSeconds--;
    renderTimer(formatTime(remainingSeconds));
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
  stopBuddhaSmile();
  updateDuration(durationMinutes);
}

function finishTimer() {
  stopTimer();
  playGong();
  swingGong();
  // Nachklang: Screen noch 5 Minuten anlassen nach Ende der Meditation
  requestWakeLock();
  wakeLockExtendTimer = setTimeout(releaseWakeLock, 5 * 60 * 1000);
}

// Gong-Animation
function swingGong() {
  if (gongEl.classList.contains('swinging')) return;
  gongEl.classList.add('swinging');
  gongEl.addEventListener('animationend', () => {
    gongEl.classList.remove('swinging');
  }, { once: true });
}

// Buddha-Lächeln + Aura
let buddhaSmileTimer = null;
let buddhaSmileBusy  = false;

function triggerBuddhaSmile() {
  if (buddhaSmileBusy || !isRunning) return;
  buddhaSmileBusy = true;

  bgSmile.style.opacity    = '1';
  buddhaAura.style.opacity = '1';

  // 5 Sek. sichtbar, dann ausblenden
  setTimeout(() => {
    bgSmile.style.opacity    = '0';
    buddhaAura.style.opacity = '0';
  }, 6500);

  setTimeout(() => {
    buddhaSmileBusy = false;
  }, 8000);
}

function scheduleBuddhaSmile() {
  clearTimeout(buddhaSmileTimer);
  if (!isRunning) return;
  const delay = 8000; // TEST – danach auf 60000 + Math.random() * 30000 zurücksetzen
  buddhaSmileTimer = setTimeout(() => {
    triggerBuddhaSmile();
    scheduleBuddhaSmile();
  }, delay);
}

function stopBuddhaSmile() {
  clearTimeout(buddhaSmileTimer);
  buddhaSmileTimer = null;
  buddhaSmileBusy  = false;
  bgSmile.style.opacity    = '0';
  buddhaAura.style.opacity = '0';
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

function scheduleAutoDim(delayMs = 3000) {
  clearTimeout(autoDimTimeout);
  if (dimOpacity > 0 && isRunning) {
    autoDimTimeout = setTimeout(() => {
      if (isRunning) dim();
    }, delayMs);
  }
}

// Overlay: Tap während abgedunkelt → nur aufhellen, bleibt hell bis zum nächsten Tipp
overlay.addEventListener('click', (e) => {
  e.stopPropagation();
  if (isRunning && isDimmed) {
    brighten();
  }
});

// Gong antippen
let gongLocked = false;
gongEl.addEventListener('click', (e) => {
  e.stopPropagation();
  if (gongLocked) return;
  gongLocked = true;
  setTimeout(() => { gongLocked = false; }, 1000);

  if (!isRunning) {
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

// Tap auf Display (nicht Gong, nicht Nav) während Timer hell läuft → sofort abdunkeln
document.addEventListener('click', (e) => {
  if (!isRunning || isDimmed) return;
  if (e.target.closest('#gong')) return;
  if (e.target.closest('#bottom-nav')) return;
  if (e.target.closest('#audio-menu')) return;
  clearTimeout(autoDimTimeout);
  dim();
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
  rawAudioBuffer = await file.arrayBuffer();
  customAudioBuffer = null; // wird beim nächsten Abspielen frisch dekodiert
  currentName.textContent = 'Aktuell: ' + file.name;
  klangBtns.forEach(b => b.classList.remove('selected'));
});

klangBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const file = btn.dataset.file;
    const label = btn.dataset.label;
    try {
      const response = await fetch(encodeURI(file));
      if (!response.ok) throw new Error('Datei nicht gefunden');
      rawAudioBuffer = await response.arrayBuffer();
      customAudioBuffer = null; // wird beim nächsten Abspielen frisch dekodiert
      currentName.textContent = 'Aktuell: ' + label;
      klangBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      localStorage.setItem('medi_klang_file', file);
      localStorage.setItem('medi_klang_label', label);
    } catch (e) {
      console.error(label + ' konnte nicht geladen werden:', e);
    }
  });
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

function updateDimSliderProgress() {
  dimSlider.style.setProperty('--progress', dimSlider.value + '%');
}

dimSlider.addEventListener('input', () => {
  dimOpacity = dimSlider.value / 100;
  updateDimLabel();
  updateDimSliderProgress();
  localStorage.setItem('medi_abdunkelung', dimSlider.value);
});

// Flammen-Schein einstellen
function updateFlameGlow() {
  const v = flameSlider.value / 100;
  const a1 = Math.min(1.0, v * 1.5).toFixed(3);
  const a2 = Math.min(1.0, v * 0.85).toFixed(3);
  const size = Math.round(180 + v * 220); // 180px bei 0%, 400px bei 100%
  document.documentElement.style.setProperty('--flame-a1', a1);
  document.documentElement.style.setProperty('--flame-a2', a2);
  document.documentElement.style.setProperty('--flame-size', size + 'px');
  updateFlameLevelLabel();
  updateFlameSliderProgress();
}

function updateFlameLevelLabel() {
  const v = parseInt(flameSlider.value);
  if (v === 0)       flameLevelLabel.textContent = 'Aus';
  else if (v <= 20)  flameLevelLabel.textContent = 'Sehr leicht';
  else if (v <= 40)  flameLevelLabel.textContent = 'Leicht';
  else if (v <= 60)  flameLevelLabel.textContent = 'Mittel';
  else if (v <= 80)  flameLevelLabel.textContent = 'Stark';
  else               flameLevelLabel.textContent = 'Sehr stark';
}

function updateFlameSliderProgress() {
  flameSlider.style.setProperty('--progress', flameSlider.value + '%');
}

flameSlider.addEventListener('input', () => {
  updateFlameGlow();
  localStorage.setItem('medi_flamme', flameSlider.value);
});

// Flammen-Flackern ein/aus
function setFlicker(enabled) {
  flameFlicker.classList.toggle('hidden', !enabled);
  flickerCheckbox.checked = enabled;
  localStorage.setItem('medi_flackern', enabled ? '1' : '0');
}

flickerCheckbox.addEventListener('change', () => setFlicker(flickerCheckbox.checked));

// Layout-Berechnung
const timerArea = document.getElementById('timer-area');

const IMG_W = 852, IMG_H = 1846;
const BUDDHA_PCT  = 0.54;   // Buddha-Kopfkrone bei 54% der Bildhöhe
const FLAME_X_PCT = 0.85;   // Flammen-Mitte X (rechts unten im Bild)
const FLAME_Y_PCT = 0.72;   // Flammen-Mitte Y
const AURA_X_PCT  = 0.28;   // Aura-Mitte X (Buddha-Kopf)
const AURA_Y_PCT  = 0.59;   // Aura-Mitte Y
const AURA_SIZE_PCT = 0.22; // Aura-Durchmesser als % der Bildbreite
const GONG_ASPECT = 312 / 360;
const MIN_TIMER_ZONE = 115; // px Mindestplatz für Timer + Slider

function getBuddhaScreenY() {
  const scale = Math.max(window.innerWidth / IMG_W, window.innerHeight / IMG_H);
  const offsetY = (IMG_H * scale - window.innerHeight) / 2;
  return Math.round(IMG_H * BUDDHA_PCT * scale - offsetY);
}

function positionFlame() {
  const scale = Math.max(window.innerWidth / IMG_W, window.innerHeight / IMG_H);
  const offsetX = (IMG_W * scale - window.innerWidth) / 2;
  const offsetY = (IMG_H * scale - window.innerHeight) / 2;
  const flameX = Math.round(IMG_W * FLAME_X_PCT * scale - offsetX);
  const flameY = Math.round(IMG_H * FLAME_Y_PCT * scale - offsetY);
  document.documentElement.style.setProperty('--flame-x', flameX + 'px');
  document.documentElement.style.setProperty('--flame-y', flameY + 'px');
}

function fixBgHeight() {
  const h = window.screen.height + 'px';
  const bg = document.getElementById('app-bg');
  if (bg) bg.style.height = h;
  if (bgSmile) bgSmile.style.height = h;
}

function positionAura() {
  const scale   = Math.max(window.innerWidth / IMG_W, window.innerHeight / IMG_H);
  const offsetX = (IMG_W * scale - window.innerWidth)  / 2;
  const offsetY = (IMG_H * scale - window.innerHeight) / 2;
  const auraX   = Math.round(IMG_W * AURA_X_PCT  * scale - offsetX);
  const auraY   = Math.round(IMG_H * AURA_Y_PCT  * scale - offsetY);
  const auraSize = Math.round(IMG_W * AURA_SIZE_PCT * scale);
  document.documentElement.style.setProperty('--aura-x',    auraX    + 'px');
  document.documentElement.style.setProperty('--aura-y',    auraY    + 'px');
  document.documentElement.style.setProperty('--aura-size', auraSize + 'px');
}

function forceRepaint() {
  const bg = document.getElementById('app-bg');
  if (!bg) return;
  bg.style.opacity = '0.999';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bg.style.opacity = '';
  }));
}

function initLayout() {
  fixBgHeight();
  const buddhaY = getBuddhaScreenY();
  const gongH = Math.min(360, buddhaY - MIN_TIMER_ZONE);
  const gongW = Math.round(gongH * GONG_ASPECT);
  document.documentElement.style.setProperty('--gong-height', gongH + 'px');
  document.documentElement.style.setProperty('--gong-width', gongW + 'px');
  positionFlame();
  positionAura();
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

// Overlay präventiv schwarz – via visibilitychange UND blur (power-button)
let overlayWasPreventive = false;

function setOverlayBlack() {
  if (!isRunning) {
    overlay.style.transition = 'none';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'none';
    overlayWasPreventive = true;
  }
}

function fadeOverlayOut() {
  if (overlayWasPreventive) {
    overlayWasPreventive = false;
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 1.5s ease';
      overlay.style.opacity = '0';
    });
  }
}

// Screen-Off via visibilitychange
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    setOverlayBlack();
  } else {
    fadeOverlayOut();
    fixBgHeight();
    initLayout();
    if (isRunning) requestWakeLock();
  }
});

// Screen-Off via window blur (fängt Power-Button zuverlässiger ab)
window.addEventListener('blur', setOverlayBlack);
window.addEventListener('focus', fadeOverlayOut);

// Viewport-Resize (Statusbar erscheint/verschwindet): Repaint wenn Viewport wächst
if (window.visualViewport) {
  let lastVpHeight = window.visualViewport.height;
  window.visualViewport.addEventListener('resize', () => {
    const vh = window.visualViewport.height;
    if (vh > lastVpHeight) forceRepaint();
    lastVpHeight = vh;
  });
}

// Init
const savedDauer = parseInt(localStorage.getItem('medi_dauer'));
updateDuration((savedDauer >= 1 && savedDauer <= 90) ? savedDauer : 30);

const savedDim = localStorage.getItem('medi_abdunkelung');
const dimVal = savedDim !== null ? parseInt(savedDim) : 0;
dimOpacity = dimVal / 100;
dimSlider.value = dimVal;
updateDimLabel();
updateDimSliderProgress();

const savedFlame = localStorage.getItem('medi_flamme');
flameSlider.value = savedFlame !== null ? parseInt(savedFlame) : 60;
updateFlameGlow();

const savedFlackern = localStorage.getItem('medi_flackern');
setFlicker(savedFlackern !== '0');

if (isIOS()) {
  const hint = document.getElementById('ios-mute-hint');
  if (hint) hint.style.display = 'block';
  document.body.classList.add('ios');
}

const versionEl = document.getElementById('app-version');
if (versionEl) versionEl.textContent = APP_VERSION;

// Gespeicherten Klang laden (Standard: Klangschale Morgenstern)
// Nur fetch – kein AudioContext nötig, Dekodierung erst beim ersten Abspielen
async function autoLoadKlang(file, label) {
  try {
    const response = await fetch(encodeURI(file));
    if (!response.ok) throw new Error('Datei nicht gefunden');
    rawAudioBuffer = await response.arrayBuffer();
    customAudioBuffer = null;
    currentName.textContent = 'Aktuell: ' + label;
    klangBtns.forEach(btn => btn.classList.toggle('selected', btn.dataset.file === file));
  } catch (e) {
    console.error('Auto-Laden fehlgeschlagen:', e);
  }
}

const savedFile  = localStorage.getItem('medi_klang_file')  || 'Sounds/Klangschale Morgenstern.mp3';
const savedLabel = localStorage.getItem('medi_klang_label') || 'Klangschale Morgenstern';
autoLoadKlang(savedFile, savedLabel);

// Update-Check
async function checkForUpdate() {
  const btn    = document.getElementById('update-btn');
  const status = document.getElementById('update-status');
  btn.disabled = true;
  btn.textContent = '⏳ Prüfe...';
  try {
    const res  = await fetch('app.js?t=' + Date.now(), { cache: 'no-store' });
    const text = await res.text();
    const match = text.match(/const APP_VERSION\s*=\s*'([^']+)'/);
    const latest = match ? match[1] : null;
    if (!latest) throw new Error('Version nicht lesbar');
    if (latest === APP_VERSION) {
      status.textContent = '✅ Du hast die aktuelle Version.';
    } else {
      status.innerHTML = '🆕 Update verfügbar! <button onclick="applyUpdate()" style="margin-left:6px;padding:4px 10px;border-radius:8px;border:none;background:#b47832;color:#fff;font-size:11px;font-weight:600;cursor:pointer;">Jetzt laden</button>';
    }
  } catch (e) {
    status.textContent = '⚠️ Prüfung fehlgeschlagen.';
  }
  btn.textContent = '🔄 Auf Update prüfen';
  btn.disabled = false;
}

async function applyUpdate() {
  const status = document.getElementById('update-status');
  status.textContent = '⏳ Wird geladen...';
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  } catch (e) {}
  try {
    await Promise.all([
      fetch('index.html', { cache: 'reload' }),
      fetch('app.js',    { cache: 'reload' }),
      fetch('style.css', { cache: 'reload' }),
    ]);
  } catch (e) {}
  window.location.href = window.location.pathname + '?v=' + Date.now();
}

// Cache-Buster-Parameter nach Update-Reload wieder entfernen
if (window.location.search) {
  history.replaceState(null, '', window.location.pathname);
}
