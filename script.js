/* ========================================= */
/* ============ OVOZ TIZIMI ================ */
/* ========================================= */
let soundEnabled = true;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

const soundToggle = document.getElementById('soundToggle');
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
  soundToggle.classList.toggle('muted', !soundEnabled);
  if (soundEnabled) initAudio();
});

function playGoalSound() {
  if (!soundEnabled) return;
  initAudio();
  const notes = [
    { freq: 523.25, time: 0.0,  dur: 0.15 },
    { freq: 659.25, time: 0.15, dur: 0.15 },
    { freq: 783.99, time: 0.3,  dur: 0.15 },
    { freq: 1046.50, time: 0.45, dur: 0.5 }
  ];
  notes.forEach(n => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = n.freq;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + n.time);
    gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + n.time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + n.time + n.dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + n.time);
    osc.stop(audioCtx.currentTime + n.time + n.dur);
  });
}

function playCrowdCheer() {
  if (!soundEnabled) return;
  initAudio();
  const duration = 1.2;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.8;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  noise.start();
  noise.stop(audioCtx.currentTime + duration);
}

/* ========================================= */
/* ============ O'YIN VAQTI ================ */
/* ========================================= */
const MATCH_DURATION = 90;
const REAL_DURATION   = 90 * 1000;
let matchSecond = 0;
let matchEnded  = false;

const clockText = document.getElementById('clockText');
const matchClock = document.getElementById('matchClock');

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const clockInterval = setInterval(() => {
  if (matchEnded) return;
  matchSecond++;
  clockText.textContent = formatTime(matchSecond);

  if (matchSecond >= MATCH_DURATION) {
    clearInterval(clockInterval);
    endMatch();
  }
}, REAL_DURATION / MATCH_DURATION);

/* ========================================= */
/* ============ HISOB ====================== */
/* ========================================= */
let homeScore = 0;
let awayScore = 0;
const homeScoreEl = document.getElementById('homeScore');
const awayScoreEl = document.getElementById('awayScore');

function bumpScore(el) {
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

function scoreGoal(team) {
  if (team === 'home') {
    homeScore++;
    homeScoreEl.textContent = homeScore;
    bumpScore(homeScoreEl);
  } else {
    awayScore++;
    awayScoreEl.textContent = awayScore;
    bumpScore(awayScoreEl);
  }
}

/* ========================================= */
/* ============ TO'P ANIMATSIYASI ========== */
/* ========================================= */
const ballWrap   = document.getElementById('ballWrap');
const ballShadow = document.getElementById('ballShadow');
const goalBanner = document.getElementById('goalBanner');
const confettiLayer = document.getElementById('confettiLayer');

const BALL_CENTER_X = 50;
const BALL_CENTER_Y = 50;
const GOAL_TOP_Y    = 3;
const GOAL_BOTTOM_Y = 97;
const GOAL_WIDTH_MIN = 42;
const GOAL_WIDTH_MAX = 58;

let attackSide = 'home';
let ballBusy = false;
let currentRunner = null;

function moveBall(topPercent, leftPercent) {
  ballWrap.style.top  = topPercent + '%';
  ballWrap.style.left = leftPercent + '%';
  ballShadow.style.top  = `calc(${topPercent}% + 13px)`;
  ballShadow.style.left = leftPercent + '%';
}

function resetBall() {
  moveBall(BALL_CENTER_Y, BALL_CENTER_X);
}

function showGoalAnimation() {
  goalBanner.classList.remove('show');
  void goalBanner.offsetWidth;
  goalBanner.classList.add('show');

  confettiLayer.classList.remove('active');
  void confettiLayer.offsetWidth;
  confettiLayer.classList.add('active');

  setTimeout(() => {
    goalBanner.classList.remove('show');
    confettiLayer.classList.remove('active');
  }, 2000);
}

/* ========================================= */
/* ==== O'YINCHINI TO'P ORTIDAN YUGURTIRISH = */
/* ========================================= */
function sendPlayerToBall(targetY, targetX, isHome) {
  const attackers = isHome
    ? document.querySelectorAll('.home-team .fwd')
    : document.querySelectorAll('.away-team .fwd');

  if (!attackers.length) return;

  if (currentRunner && currentRunner.dataset.origTop) {
    currentRunner.style.top  = currentRunner.dataset.origTop;
    currentRunner.style.left = currentRunner.dataset.origLeft;
    currentRunner.style.zIndex = '';
  }

  const chosen = attackers[Math.floor(Math.random() * attackers.length)];

  if (!chosen.dataset.origTop) {
    const cs = getComputedStyle(chosen);
    chosen.dataset.origTop  = cs.top;
    chosen.dataset.origLeft = cs.left;
  }

  chosen.style.top  = targetY + '%';
  chosen.style.left = targetX + '%';
  chosen.style.zIndex = '25';

  currentRunner = chosen;

  setTimeout(() => {
    if (currentRunner === chosen && chosen.dataset.origTop) {
      chosen.style.top  = chosen.dataset.origTop;
      chosen.style.left = chosen.dataset.origLeft;
      chosen.style.zIndex = '';
      currentRunner = null;
    }
  }, 2600);
}

function launchAttack() {
  if (matchEnded || ballBusy) return;
  ballBusy = true;

  const isHome = attackSide === 'home';
  const targetY = isHome ? GOAL_TOP_Y : GOAL_BOTTOM_Y;
  const targetX = GOAL_WIDTH_MIN + Math.random() * (GOAL_WIDTH_MAX - GOAL_WIDTH_MIN);

  moveBall(targetY, targetX);
  sendPlayerToBall(targetY, targetX, isHome);

  setTimeout(() => {
    if (matchEnded) { ballBusy = false; return; }

    playGoalSound();
    playCrowdCheer();
    showGoalAnimation();
    scoreGoal(isHome ? 'home' : 'away');

    setTimeout(() => {
      resetBall();
      ballBusy = false;
      attackSide = isHome ? 'away' : 'home';
    }, 900);
  }, 1500);
}

const attackInterval = setInterval(() => {
  if (matchEnded) {
    clearInterval(attackInterval);
    return;
  }
  launchAttack();
}, 4000);

setTimeout(launchAttack, 1000);

/* ========================================= */
/* ============ O'YIN TUGASHI ============== */
/* ========================================= */
const winnerModal = document.getElementById('winnerModal');
const winnerName  = document.getElementById('winnerName');
const finalScore  = document.getElementById('finalScore');
const closeModal  = document.getElementById('closeModal');

function endMatch() {
  matchEnded = true;
  matchClock.classList.add('ended');
  clockText.textContent = '90:00';
  clearInterval(attackInterval);

  let winnerText = '';
  let winnerColor = '';
  if (homeScore > awayScore) {
    winnerText = 'SIZNING JAMOANGIZ';
    winnerColor = '#5dade2';
  } else if (awayScore > homeScore) {
    winnerText = 'RAQIB KOMANDA';
    winnerColor = '#ec7063';
  } else {
    winnerText = 'DURRANG';
    winnerColor = '#f1c40f';
  }

  winnerName.textContent = winnerText;
  winnerName.style.color = winnerColor;
  winnerName.style.textShadow = `0 0 20px ${winnerColor}, 0 0 40px ${winnerColor}`;
  finalScore.textContent = `${homeScore} : ${awayScore}`;

  setTimeout(() => {
    winnerModal.classList.add('show');
  }, 600);

  playGoalSound();
  playCrowdCheer();
}

closeModal.addEventListener('click', () => {
  winnerModal.classList.remove('show');
  location.reload();
});

/* ========================================= */
/* =========  O'YINCHI ALMASHTIRISH  ======= */
/* ========================================= */
const subToast = document.getElementById('subToast');
let selectedPlayer = null;

function showSubToast(text) {
  subToast.textContent = text;
  subToast.classList.add('show');
  setTimeout(() => {
    subToast.classList.remove('show');
  }, 1800);
}

function selectPlayer(playerEl) {
  if (selectedPlayer === playerEl) {
    playerEl.classList.remove('selected');
    selectedPlayer = null;
    return;
  }

  if (selectedPlayer) {
    selectedPlayer.classList.remove('selected');
  }

  selectedPlayer = playerEl;
  playerEl.classList.add('selected');

  showSubToast('👉 Endi zaxira o\'yinchini tanlang');
}

document.querySelectorAll('#homeTeam .player, #awayTeam .player').forEach(player => {
  player.addEventListener('click', (e) => {
    e.stopPropagation();
    if (matchEnded) return;
    selectPlayer(player);
  });
});

document.querySelectorAll('.bench-player').forEach(bench => {
  bench.addEventListener('click', () => {
    if (matchEnded) return;

    if (!selectedPlayer) {
      showSubToast('⚠️ Avval maydondagi o\'yinchini tanlang');
      return;
    }

    const benchImg = bench.querySelector('img');
    const benchName = benchImg.alt;
    const benchSrc = benchImg.src;
    const benchPos = bench.dataset.pos || 'mid';

    const fieldImg = selectedPlayer.querySelector('img');
    const fieldName = fieldImg.alt;
    const fieldSrc = fieldImg.src;
    const fieldPos = selectedPlayer.dataset.pos || 'mid';

    fieldImg.src = benchSrc;
    fieldImg.alt = benchName;
    benchImg.src = fieldSrc;
    benchImg.alt = fieldName;

    selectedPlayer.dataset.pos = benchPos;
    bench.dataset.pos = fieldPos;

    selectedPlayer.classList.remove('gk', 'def', 'mid', 'fwd');
    selectedPlayer.classList.add(benchPos);

    const benchPhoto = bench.querySelector('.bench-photo');
    if (benchPhoto) {
      benchPhoto.classList.remove('gk', 'def', 'mid', 'fwd');
      benchPhoto.classList.add(fieldPos);
    }

    const benchLabel = bench.querySelector('span');
    if (benchLabel) {
      const labels = {
        gk:  'Zaxira DR',
        def: 'Himoyachi',
        mid: 'Poluzashitnik',
        fwd: 'Hujumchi'
      };
      benchLabel.textContent = labels[fieldPos] || 'O\'yinchi';
    }

    selectedPlayer.classList.remove('selected');
    selectedPlayer = null;

    showSubToast(`🔄 ${fieldName.toUpperCase()} ↔ ${benchName.toUpperCase()}`);
  });
});

document.addEventListener('click', (e) => {
  if (selectedPlayer && !e.target.closest('.player') && !e.target.closest('.bench-player')) {
    selectedPlayer.classList.remove('selected');
    selectedPlayer = null;
  }
});