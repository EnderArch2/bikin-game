/* global monogatari */

const DEFAULT_LEADERSHIP_STATS = {
  popularitas: 50,
  integritas: 50,
  danaAnggaran: 50,
};

const ACT2_EVENTS_BEFORE_ACT3 = 5;

/* ==============================
 * Turn-Based Time System
 * ============================== */
let currentTurn = 0;

const timeMap = [
  "Tahun 1 - Bulan 1 (Pelantikan)", // Turn 0
  "Tahun 1 - Bulan 4", // Turn 1
  "Tahun 1 - Bulan 7", // Turn 2
  "Tahun 1 - Bulan 10", // Turn 3
  "Tahun 2 - Bulan 1", // Turn 4
  "Tahun 2 - Bulan 4", // Turn 5
  "Tahun 2 - Bulan 7", // Turn 6
  "Tahun 2 - Bulan 10 (Tragedi Jembatan)", // Turn 7
  "Tahun 3 - Bulan 1", // Turn 8
  "Tahun 3 - Bulan 4", // Turn 9
  "Tahun 3 - Bulan 7", // Turn 10
  "Tahun 3 - Bulan 10", // Turn 11
  "Tahun 4 - Bulan 1", // Turn 12
  "Tahun 4 - Bulan 4", // Turn 13
  "Tahun 4 - Bulan 7", // Turn 14
  "Tahun 4 - Bulan 10 (Tawaran Gelap)", // Turn 15
  "Tahun 5 - Bulan 1", // Turn 16
  "Tahun 5 - Bulan 2", // Turn 17
  "Tahun 5 - Bulan 3", // Turn 18
  "Tahun 5 - Bulan 4", // Turn 19
  "Tahun 5 - Bulan 5", // Turn 20
  "Tahun 5 - Bulan 6", // Turn 21
  "Tahun 5 - Bulan 8", // Turn 22
  "Tahun 5 - Bulan 10", // Turn 23
  "Tahun 5 - Bulan 12 (Pemilu)", // Turn 24
];

function leadershipStats() {
  return Object.assign(
    {},
    DEFAULT_LEADERSHIP_STATS,
    monogatari.storage("stats") || {},
  );
}

function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}

function updateLeadershipStatsUI() {
  const stats = leadershipStats();
  const panel = document.querySelector('[data-ui="leadership-stats"]');

  if (panel === null) {
    return;
  }

  panel.querySelector('[data-stat="popularitas"]').textContent =
    stats.popularitas;
  panel.querySelector('[data-stat="integritas"]').textContent =
    stats.integritas;
  panel.querySelector('[data-stat="danaAnggaran"]').textContent =
    stats.danaAnggaran;
  panel.querySelector('[data-stat-bar="popularitas"]').style.width =
    `${clampStat(stats.popularitas)}%`;
  panel.querySelector('[data-stat-bar="integritas"]').style.width =
    `${clampStat(stats.integritas)}%`;
  panel.querySelector('[data-stat-bar="danaAnggaran"]').style.width =
    `${clampStat(stats.danaAnggaran)}%`;
}

function setupLeadershipStatsUI() {
  const gameScreen = document.querySelector("game-screen");

  if (
    gameScreen === null ||
    document.querySelector('[data-ui="leadership-stats"]') !== null
  ) {
    return;
  }

  const panel = document.createElement("aside");
  panel.dataset.ui = "leadership-stats";
  panel.innerHTML = `
		<div class="stat-card">
			<span>Popularitas</span>
			<strong><span data-stat="popularitas">50</span></strong>
			<div class="stat-meter"><span data-stat-bar="popularitas"></span></div>
		</div>
		<div class="stat-card">
			<span>Integritas</span>
			<strong><span data-stat="integritas">50</span></strong>
			<div class="stat-meter"><span data-stat-bar="integritas"></span></div>
		</div>
		<div class="stat-card">
			<span>Dana Anggaran</span>
			<strong><span data-stat="danaAnggaran">50</span></strong>
			<div class="stat-meter"><span data-stat-bar="danaAnggaran"></span></div>
		</div>
	`;

  gameScreen.appendChild(panel);
  updateLeadershipStatsUI();

  /* Setup Turn Display UI */
  setupTurnUI();
}

/* ==============================
 * Turn UI: Badge at top-right of game screen
 * ============================== */
function setupTurnUI() {
  const gameScreen = document.querySelector("game-screen");

  if (
    gameScreen === null ||
    document.querySelector('[data-ui="turn-display"]') !== null
  ) {
    return;
  }

  const badge = document.createElement("div");
  badge.dataset.ui = "turn-display";
  badge.innerHTML = `
		<span data-turn-icon>📅</span>
		<span data-turn-label>${timeMap[currentTurn]}</span>
	`;

  gameScreen.appendChild(badge);
}

function updateTurnUI() {
  const label = document.querySelector("[data-turn-label]");

  if (label === null) {
    return;
  }

  label.textContent = timeMap[currentTurn] || `Turn ${currentTurn}`;

  /* Quick pop animation */
  const badge = document.querySelector('[data-ui="turn-display"]');

  if (badge) {
    badge.classList.remove("turn-pop");
    /* Force reflow so the animation restarts */
    void badge.offsetWidth;
    badge.classList.add("turn-pop");
  }
}

function advanceTurn() {
  if (currentTurn < timeMap.length - 1) {
    currentTurn++;
  }

  monogatari.storage({ currentTurn: currentTurn });
  updateTurnUI();
}

function resetTurn() {
  currentTurn = 0;
  monogatari.storage({ currentTurn: 0 });
  updateTurnUI();
}

function setLeadershipStats(changes) {
  monogatari.storage({
    stats: Object.assign({}, leadershipStats(), changes),
  });
  updateLeadershipStatsUI();
}

function adjustLeadershipStats(changes) {
  const stats = leadershipStats();
  const nextStats = Object.assign({}, stats);

  Object.keys(changes).forEach((key) => {
    nextStats[key] = clampStat((stats[key] || 0) + changes[key]);
  });

  setLeadershipStats(nextStats);
}

function hasFailedLeadershipStats() {
  const stats = leadershipStats();

  return (
    stats.popularitas <= 0 || stats.integritas <= 0 || stats.danaAnggaran <= 0
  );
}

function act2Progress() {
  return Object.assign({ resolvedEvents: 0 }, monogatari.storage("act2") || {});
}

function resetAct2Progress() {
  monogatari.storage({
    act2: {
      resolvedEvents: 0,
    },
  });
}

function adjustAct2Progress(change) {
  const progress = act2Progress();

  monogatari.storage({
    act2: {
      resolvedEvents: Math.max(0, progress.resolvedEvents + change),
    },
  });
}

function shouldEnterAct3() {
  return act2Progress().resolvedEvents >= ACT2_EVENTS_BEFORE_ACT3;
}

function finalEndingBranch() {
  const stats = leadershipStats();

  if (
    stats.popularitas >= 70 &&
    stats.integritas >= 70 &&
    stats.danaAnggaran >= 30
  ) {
    return "Ending1";
  } else if (stats.danaAnggaran >= 70 && stats.popularitas >= 40) {
    return "Ending2";
  }

  return "Ending3";
}

function applyStatChanges(changes) {
  return {
    Function: {
      Apply: function () {
        adjustLeadershipStats(changes);
        return true;
      },
      Revert: function () {
        const revertChanges = {};

        Object.keys(changes).forEach((key) => {
          revertChanges[key] = -changes[key];
        });

        adjustLeadershipStats(revertChanges);
        return true;
      },
    },
  };
}

function caseLoadingDetails() {
  if (currentTurn >= 24) {
    return {
      eyebrow: "Berkas Akhir",
      title: "Malam Penghakiman",
      subtitle: "Semua keputusan lima tahun terakhir sedang dihitung.",
    };
  }

  if (currentTurn === 18) {
    return {
      eyebrow: "Kasus Khusus",
      title: "Tawaran di Ruang Tertutup",
      subtitle: "Satu koper dapat membeli kemenangan, atau merusak sisanya.",
    };
  }

  if (currentTurn === 10) {
    return {
      eyebrow: "Kasus Khusus",
      title: "Tragedi Jembatan Barat",
      subtitle: "Krisis besar pertama menunggu keputusan Anda.",
    };
  }

  if (currentTurn >= 16) {
    return {
      eyebrow: "Babak III",
      title: "Tahun Kelima",
      subtitle: "Waktu memperbaiki citra sudah habis. Publik mulai menilai.",
    };
  }

  if (currentTurn >= 4) {
    return {
      eyebrow: "Babak II",
      title: "Rutinitas Sang Gubernur",
      subtitle: "Briefing pagi, keputusan siang, evaluasi malam.",
    };
  }

  return {
    eyebrow: "Babak I",
    title: "Masa Jabatan Dimulai",
    subtitle: "Kantor baru, janji lama, dan konsekuensi pertama.",
  };
}

function ShowCaseLoadingScreen() {
  const details = caseLoadingDetails();
  const stats = leadershipStats();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduceMotion ? 650 : 1650;
  const overlay = document.createElement("div");

  overlay.id = "case-loading-overlay";
  overlay.innerHTML = `
		<div class="case-loading-panel">
			<div class="case-loading-eyebrow">${details.eyebrow}</div>
			<h1>${details.title}</h1>
			<p>${details.subtitle}</p>
			<div class="case-loading-meta">
				<span>${timeMap[currentTurn] || "Agenda Berikutnya"}</span>
				<span>Pop ${stats.popularitas}</span>
				<span>Int ${stats.integritas}</span>
				<span>Dana ${stats.danaAnggaran}</span>
			</div>
			<div class="case-loading-track">
				<span></span>
			</div>
		</div>
	`;

  document.body.appendChild(overlay);

  requestAnimationFrame(function () {
    overlay.classList.add("case-loading-visible");
  });

  setTimeout(function () {
    overlay.classList.add("case-loading-exit");

    setTimeout(function () {
      overlay.remove();

      try {
        monogatari.next();
      } catch (_e) {
        const gameScreen = document.querySelector("game-screen");

        if (gameScreen) {
          gameScreen.click();
        }
      }
    }, reduceMotion ? 120 : 320);
  }, duration);
}

function endingCreditDetails() {
  const ending = monogatari.storage("lastEnding") || "unknown";
  const stats = leadershipStats();
  const endingTitles = {
    statesman: "Legasi Sang Negarawan",
    puppet: "Sang Boneka Emas",
    collapse: "Runtuhnya Kekuasaan",
    gameover: "Masa Jabatan Terhenti",
    unknown: "Masa Jabatan 5 Tahun",
  };

  return {
    title: endingTitles[ending] || endingTitles.unknown,
    stats: stats,
  };
}

function prepareCreditStorage() {
  const details = endingCreditDetails();

  monogatari.storage({
    creditTitle: details.title,
    creditPopularitas: details.stats.popularitas,
    creditIntegritas: details.stats.integritas,
    creditDanaAnggaran: details.stats.danaAnggaran,
  });
}

function StartCreditScene() {
  const details = endingCreditDetails();
  const overlay = document.createElement("div");

  overlay.id = "ending-credits-overlay";
  overlay.innerHTML = `
		<div class="ending-credits-scroll">
			<p class="ending-credits-kicker">Laporan Akhir Masa Jabatan</p>
			<h1>${details.title}</h1>
			<div class="ending-credits-stats">
				<div><span>Popularitas</span><strong>${details.stats.popularitas}</strong></div>
				<div><span>Integritas</span><strong>${details.stats.integritas}</strong></div>
				<div><span>Dana Anggaran</span><strong>${details.stats.danaAnggaran}</strong></div>
			</div>
			<section>
				<h2>Credits</h2>
				<p>Visual Novel Developer</p>
				<strong>Monogatari Implementation</strong>
				<p>Story Draft</p>
				<strong>DRAFT_CERITA.md</strong>
				<p>Characters</p>
				<strong>Arya, Maya, Pak Surya, Warga Kota</strong>
				<p>Core Systems</p>
				<strong>Stat Kepemimpinan, Rutinitas Kasus, Minigame Politik</strong>
				<p>Terima kasih sudah memimpin kota ini sampai akhir.</p>
			</section>
			<button type="button" id="ending-credits-finish">Selesai</button>
		</div>
	`;

  document.body.appendChild(overlay);

  requestAnimationFrame(function () {
    overlay.classList.add("ending-credits-visible");
  });

  document
    .getElementById("ending-credits-finish")
    .addEventListener("click", function () {
      overlay.classList.add("ending-credits-exit");

      setTimeout(function () {
        overlay.remove();
        monogatari.next();
      }, 280);
    });
}

/* ==============================
 * Typing Minigame — Pidato Publik
 * ============================== */
function StartTypingGame() {
  const SENTENCES = [
    "SAYA BERJANJI BERSIH!",
    "RAKYAT ADALAH PRIORITAS UTAMA!",
    "TRANSPARANSI BUKAN PILIHAN!",
    "ANGGARAN UNTUK RAKYAT!",
    "TIDAK ADA TOLERANSI KORUPSI!",
    "KOTA INI MILIK KITA SEMUA!",
    "KEADILAN DIMULAI DARI SINI!",
    "SAYA HADIR UNTUK MELAYANI!",
    "INTEGRITAS TIDAK BISA DITAWAR!",
    "BERSAMA KITA MEMBANGUN!",
  ];
  const TARGET = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
  monogatari.storage({ typingTarget: TARGET });

  const TIME_LIMIT = 10000;
  let resolved = false;

  /* --- Build overlay UI --- */
  const overlay = document.createElement("div");
  overlay.id = "typing-game-overlay";
  overlay.innerHTML = `
		<div class="typing-game-box">
			<div class="typing-game-header">⌨️ Tantangan Pidato!</div>
			<p class="typing-game-prompt">Ketik kalimat berikut dengan tepat lalu tekan <kbd>Enter</kbd></p>
			<div class="typing-game-target">${TARGET}</div>
			<input type="text" id="typing-game-input" autocomplete="off" spellcheck="false" placeholder="Mulai mengetik..." />
			<div class="typing-game-timer"><div id="typing-game-bar"></div></div>
			<div class="typing-game-clock" id="typing-game-clock">10.0 detik</div>
		</div>
	`;

  /* Prevent clicks from reaching the VN behind the overlay */
  overlay.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  document.body.appendChild(overlay);

  const input = document.getElementById("typing-game-input");
  const bar = document.getElementById("typing-game-bar");
  const clock = document.getElementById("typing-game-clock");
  const box = overlay.querySelector(".typing-game-box");

  /* Small delay so the overlay transition plays, then focus */
  requestAnimationFrame(function () {
    overlay.classList.add("typing-game-visible");
    setTimeout(function () {
      input.focus();
    }, 120);
  });

  const startTime = Date.now();

  /* --- Countdown timer --- */
  const timerFrame = function () {
    if (resolved) return;

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 1 - elapsed / TIME_LIMIT);

    bar.style.width = remaining * 100 + "%";
    clock.textContent =
      Math.max(0, (TIME_LIMIT - elapsed) / 1000).toFixed(1) + " detik";

    if (remaining <= 0.3) {
      bar.style.background = "#ef4444";
    }

    if (elapsed >= TIME_LIMIT) {
      finishGame(false);
      return;
    }

    requestAnimationFrame(timerFrame);
  };

  requestAnimationFrame(timerFrame);

  /* --- Input handler --- */
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !resolved) {
      finishGame(input.value.trim() === TARGET);
    }
  });

  /* --- Live validation highlight --- */
  input.addEventListener("input", function () {
    if (resolved) return;

    const val = input.value;
    const match = TARGET.startsWith(val);

    input.classList.toggle("typing-mismatch", !match && val.length > 0);
  });

  /* --- Finish --- */
  function finishGame(success) {
    if (resolved) return;
    resolved = true;

    input.disabled = true;

    if (success) {
      box.classList.add("typing-game-success");
      adjustLeadershipStats({ popularitas: 5 });
    } else {
      box.classList.add("typing-game-fail");
      adjustLeadershipStats({ popularitas: -5 });
    }

    monogatari.storage({ typingResult: success ? "win" : "lose" });

    setTimeout(function () {
      overlay.classList.remove("typing-game-visible");

      setTimeout(function () {
        overlay.remove();

        /* Advance to the Conditional that reads typingResult */
        try {
          monogatari.next();
        } catch (_e) {
          document.querySelector("game-screen").click();
        }
      }, 300);
    }, 900);
  }
}

window.updateLeadershipStatsUI = updateLeadershipStatsUI;
window.setLeadershipStats = setLeadershipStats;
window.adjustLeadershipStats = adjustLeadershipStats;
window.hasFailedLeadershipStats = hasFailedLeadershipStats;
window.finalEndingBranch = finalEndingBranch;
window.advanceTurn = advanceTurn;
window.resetTurn = resetTurn;
window.updateTurnUI = updateTurnUI;
window.ShowCaseLoadingScreen = ShowCaseLoadingScreen;
window.StartCreditScene = StartCreditScene;
window.StartTypingGame = StartTypingGame;

/* ==============================
 * Debat Timer — Timed Choice
 * ============================== */
function StartDebatTimer() {
  const TIME_LIMIT = 5000;
  let cancelled = false;

  /* --- Build countdown bar overlay --- */
  const bar = document.createElement("div");
  bar.id = "debat-timer-overlay";
  bar.innerHTML = `
		<div class="debat-timer-label">⏱️ Waktu tersisa untuk menjawab!</div>
		<div class="debat-timer-track"><div id="debat-timer-fill"></div></div>
	`;
  document.body.appendChild(bar);

  requestAnimationFrame(function () {
    bar.classList.add("debat-timer-visible");
  });

  const fill = document.getElementById("debat-timer-fill");
  const startTime = Date.now();

  /* --- Animate countdown --- */
  function tick() {
    if (cancelled) return;

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 1 - elapsed / TIME_LIMIT);

    fill.style.width = remaining * 100 + "%";

    if (remaining <= 0.3) {
      fill.style.background = "#ef4444";
    }

    if (elapsed >= TIME_LIMIT) {
      /* Time's up — click the panic button */
      const panicBtn = document.querySelector('[data-choice="Panik"]');

      if (panicBtn) {
        panicBtn.click();
      }

      cleanup();
      return;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  /* --- Cancel timer if player picks any choice --- */
  function onChoiceClick() {
    if (!cancelled) {
      cancelled = true;
      cleanup();
    }
  }

  document.addEventListener("click", function handler(e) {
    const btn = e.target.closest("[data-choice]");

    if (btn) {
      onChoiceClick();
      document.removeEventListener("click", handler);
    }
  });

  function cleanup() {
    cancelled = true;
    bar.classList.remove("debat-timer-visible");
    setTimeout(function () {
      bar.remove();
    }, 300);
  }
}

/* ==============================
 * Signature Minigame — Tanda Tangan Proposal
 * ============================== */
function StartSignatureGame() {
  let resolved = false;

  /* --- Build overlay UI --- */
  const overlay = document.createElement("div");
  overlay.id = "signature-game-overlay";
  overlay.innerHTML = `
		<div class="signature-game-box">
			<div class="signature-game-header">📝 Tanda Tangan Proposal</div>
			<p class="signature-game-prompt">Tanda tangani dokumen di bawah ini untuk mengesahkan.</p>
			<canvas id="signature-canvas" width="360" height="180"></canvas>
			<div class="signature-controls">
				<button id="signature-clear-btn" class="sig-btn sig-btn-secondary">Ulangi</button>
				<button id="signature-submit-btn" class="sig-btn sig-btn-primary">Sahkan Proposal</button>
			</div>
		</div>
	`;

  overlay.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  document.body.appendChild(overlay);

  const canvas = document.getElementById("signature-canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const clearBtn = document.getElementById("signature-clear-btn");
  const submitBtn = document.getElementById("signature-submit-btn");
  const box = overlay.querySelector(".signature-game-box");

  /* --- Canvas Drawing Logic --- */
  let isDrawing = false;

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#0f172a"; // dark ink

  function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function startDrawing(e) {
    if (resolved) return;
    isDrawing = true;
    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  }

  function draw(e) {
    if (!isDrawing || resolved) return;
    const pos = getPointerPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  }

  function stopDrawing() {
    if (isDrawing) {
      ctx.closePath();
      isDrawing = false;
    }
  }

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);

  canvas.addEventListener("touchstart", startDrawing, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDrawing);

  clearBtn.addEventListener("click", () => {
    if (resolved) return;
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  /* --- Validation Logic --- */
  submitBtn.addEventListener("click", () => {
    if (resolved) return;
    resolved = true;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let drawnPixels = 0;

    // Each pixel takes 4 array elements: r, g, b, a
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      if (r < 200 && g < 200 && b < 200) {
        drawnPixels++;
      }
    }

    const totalPixels = canvas.width * canvas.height;
    const percentage = (drawnPixels / totalPixels) * 100;

    const isValid = percentage >= 3 && percentage <= 15;

    if (isValid) {
      box.classList.add("signature-game-success");
      adjustLeadershipStats({ integritas: 5, popularitas: 5 });
    } else {
      box.classList.add("signature-game-fail");
      adjustLeadershipStats({ popularitas: -5, integritas: -5 });
    }

    monogatari.storage({ signatureResult: isValid ? "valid" : "invalid" });

    setTimeout(() => {
      overlay.classList.add("signature-game-fadeout");
      setTimeout(() => {
        overlay.remove();
        try {
          monogatari.next();
        } catch (_e) {
          document.querySelector("game-screen").click();
        }
      }, 300);
    }, 1200);
  });

  requestAnimationFrame(() => {
    overlay.classList.add("signature-game-visible");
  });
}

window.StartDebatTimer = StartDebatTimer;
window.StartSignatureGame = StartSignatureGame;

document.addEventListener("DOMContentLoaded", () => {
  setupLeadershipStatsUI();
});

monogatari.action("message").messages({
  Help: {
    title: "Bantuan",
    subtitle: "Masa Jabatan 5 Tahun",
    body: `
			<p>Gunakan keputusan cerita untuk menjaga Popularitas, Integritas, dan Dana Anggaran tetap stabil.</p>
		`,
  },
});

monogatari.action("notification").notifications({
  Welcome: {
    title: "Masa Jabatan Dimulai",
    body: "Tiga pilar kepemimpinan sudah aktif.",
    icon: "",
  },
  PopularitasUp: {
    title: "Popularitas Naik",
    body: "Warga merespons pidato Anda dengan antusias.",
    icon: "",
  },
  IntegritasUp: {
    title: "Integritas Naik",
    body: "Audit awal memberi sinyal pemerintahan yang bersih.",
    icon: "",
  },
  Act2OptionA: {
    title: "Popularitas Naik",
    body: "Warga melihat Anda bergerak cepat, tetapi anggaran ikut terkuras.",
    icon: "",
  },
  Act2OptionB: {
    title: "Integritas Naik",
    body: "Keputusan tertib administrasi memperkuat kepercayaan internal dan posisi dana.",
    icon: "",
  },
});

monogatari.action("particles").particles({});

monogatari.action("canvas").objects({});

monogatari.configuration("credits", {});

monogatari.assets("gallery", {});

monogatari.assets("music", {});

monogatari.assets("voices", {});

monogatari.assets("sounds", {});

monogatari.assets("videos", {});

monogatari.assets("images", {});

monogatari.assets("scenes", {
  governor_office_morning: "governor_office_morning.jpg",
  west_bridge_collapse: "west_bridge_collapse.jpg",
  press_conference_room: "press_conference_room.jpg",
  election_night_office: "election_night_office.jpg",
  victory_balcony: "victory_balcony.jpg", //--
  elite_takeover_room: "elite_takeover_room.jpg",
  bankrupt_city_hall: "bankrupt_city_hall.jpg", //--
});

monogatari.characters({
  arya: {
    name: "Arya",
    color: "#f5c16c",
    sprites: {
      neutral: "arya_neutral.png",
      thinking: "arya_thinking.png",
      concerned: "arya_concerned.png",
      determined: "arya_determined.png",
    },
  },
  maya: {
    name: "Maya",
    color: "#7fc7ff",
    sprites: {
      neutral: "maya_neutral.png",
      slight_smile: "maya_slight_smile.png",
      serious: "maya_serious.png",
      urgent: "maya_urgent.png",
    },
  },
});

monogatari.script({
  Start: [
    {
      Function: {
        Apply: function () {
          setLeadershipStats(DEFAULT_LEADERSHIP_STATS);
          resetAct2Progress();
          resetTurn();
          setupLeadershipStatsUI();
          return true;
        },
        Revert: function () {
          return true;
        },
      },
    },
    "jump Act1Pelantikan",
  ],

  Act1Pelantikan: [
    "show scene governor_office_morning with fadeIn",
    "show notification Welcome",
    "show character arya thinking at left with fadeIn",
    "arya Cahaya pagi masuk lewat jendela besar kantor gubernur. Di meja, papan nama berlapis emas itu seperti menatap balik: Gubernur Arya.",
    "arya Aku menang. Tapi tumpukan dokumen di depanku membuat kursi ini terasa lebih seperti kursi panas daripada takhta.",
    "arya Lima tahun. Cukup lama untuk mengubah kota ini, atau menghancurkan hidupku sendiri.",
    "show character maya neutral at right with fadeIn",
    "maya Selamat pagi, Pak Gubernur. Saya Maya, Kepala Staf Anda untuk lima tahun ke depan.",
    "maya Saya harap Anda sudah menikmati kopi pertama Anda, karena jadwal kita sangat padat.",
    "show character arya neutral at left",
    "arya Selamat pagi, Maya. Duduklah. Langsung saja, badai apa yang harus saya hadapi di hari pertama ini?",
    "show character maya slight_smile at right",
    "maya Sebagai permulaan, Anda harus memahami bahwa di ruangan ini, setiap tanda tangan memiliki konsekuensi.",
    "jump Act1TutorialStats",
  ],

  Act1TutorialStats: [
    "show character maya serious at right",
    "maya Ada tiga pilar utama yang menentukan kelangsungan karier Anda.",
    "maya Popularitas: kepercayaan warga. Integritas: ketaatan pada hukum dan moral. Dana Anggaran: kas daerah yang membuat semua program tetap bergerak.",
    "maya Panel di layar akan menampilkan angka ketiganya. Saat ini semuanya mulai dari 50.",
    "arya Jadi setiap keputusan akan mengangkat satu hal dan mungkin menjatuhkan hal lain.",
    "maya Tepat. Dan politik jarang memberi hadiah tanpa tagihan.",
    "maya Untuk latihan pertama, saya sudah menyiapkan jadwal internal. Anda hanya bisa memilih satu.",
    {
      Choice: {
        Dialog: "maya Kita mulai dari mana, Pak?",
        PublicSpeaking: {
          Text: "Latihan Public Speaking",
          Do: "jump Act1PublicSpeaking",
        },
        AuditMandiri: {
          Text: "Audit Mandiri",
          Do: "jump Act1AuditMandiri",
        },
      },
    },
  ],

  Act1PublicSpeaking: [
    "show character arya determined at left",
    "arya Kalau rakyat tidak percaya pada suara pemimpinnya, kebijakan terbaik pun akan mati di jalan.",
    {
      Function: {
        Apply: function () {
          adjustLeadershipStats({ popularitas: 10 });
          return true;
        },
        Revert: function () {
          adjustLeadershipStats({ popularitas: -10 });
          return true;
        },
      },
    },
    "show notification PopularitasUp",
    "maya Keputusan dicatat. Popularitas Anda naik karena tim komunikasi punya pesan yang lebih tajam untuk publik.",
    "jump Act1AfterTutorialChoice",
  ],

  Act1AuditMandiri: [
    "show character arya concerned at left",
    "arya Aku ingin tahu ke mana setiap rupiah mengalir sebelum orang lain menjadikannya senjata.",
    {
      Function: {
        Apply: function () {
          adjustLeadershipStats({ integritas: 10 });
          return true;
        },
        Revert: function () {
          adjustLeadershipStats({ integritas: -10 });
          return true;
        },
      },
    },
    "show notification IntegritasUp",
    "maya Keputusan dicatat. Integritas Anda naik karena staf melihat Anda serius memeriksa anggaran sejak hari pertama.",
    "jump Act1AfterTutorialChoice",
  ],

  Act1AfterTutorialChoice: [
    "show character maya neutral at right",
    "maya Itu baru latihan, Pak. Mulai besok, pilihan Anda tidak akan serapi dua opsi di kalender.",
    "maya Pagi ini serikat buruh sudah berkumpul menuntut janji kampanye kenaikan upah. Pengusaha mengancam menarik investasi jika tuntutan itu dikabulkan.",
    "show character arya thinking at left",
    "arya Tidak ada jalan tengah yang bisa membuat kedua belah pihak diam?",
    "show character maya serious at right",
    "maya Di politik, memuaskan semua orang sama saja dengan bunuh diri pelan-pelan.",
    "maya Silakan bersiap, Pak. Lima tahun masa jabatan Anda resmi dimulai... sekarang.",
    "jump Act2Intro",
  ],

  Act2Intro: [
    "show scene governor_office_morning with fadeIn",
    "show character maya serious at right",
    "show character arya neutral at left",
    "maya Tahun kedua sampai keempat akan bergerak lebih cepat, Pak.",
    "maya Setiap pagi saya akan membawa satu dilema harian. Masalahnya bisa muncul dari jalan rusak, penertiban warga, sampai krisis layanan publik.",
    "arya Jadi rutinitasnya sederhana: dengar briefing, ambil keputusan, lalu hidup dengan konsekuensinya.",
    "maya Sederhana di atas kertas. Melelahkan di dunia nyata.",
    "jump Next_Turn",
  ],

  /* ======================================================
   * NEXT_TURN — Central Turn Router
   * Increment turn, check for fixed events, game-over,
   * ending threshold, or pick a random generic event.
   * ====================================================== */
  Next_Turn: [
    /* 1. Advance turn & update UI */
    {
      Function: {
        Apply: function () {
          advanceTurn();
          return true;
        },
        Revert: function () {
          return true;
        },
      },
    },
    /* 2. Check game-over first */
    {
      Conditional: {
        Condition: function () {
          if (hasFailedLeadershipStats()) {
            return "failed";
          }
          return "ok";
        },
        failed: "jump GameOver",
        ok: "jump Next_Turn_Loading",
      },
    },
  ],

  Next_Turn_Loading: [
    {
      Function: {
        Apply: function () {
          ShowCaseLoadingScreen();
          return false;
        },
        Revert: function () {
          return true;
        },
      },
    },
    "jump Next_Turn_Route",
  ],

  /* Routing logic separated so Monogatari processes it as a fresh label */
  Next_Turn_Route: [
    {
      Conditional: {
        Condition: function () {
          if (currentTurn === 10) return "jembatan";
          if (currentTurn === 18) return "negosiasi";
          if (currentTurn >= 24) return "ending";
          return "generic";
        },
        jembatan: "jump Event_Jembatan_Ambruk",
        negosiasi: "jump Event_Negosiasi_VIP",
        ending: "jump Ending_Check",
        generic: "jump Next_Turn_RandomEvent",
      },
    },
  ],

  /* Pick a random generic event */
  Next_Turn_RandomEvent: [
    "show scene governor_office_morning with fadeIn",
    "show character maya neutral at right",
    "show character arya thinking at left",
    "maya Briefing pagi siap, Pak. Ada laporan baru yang masuk.",
    {
      Conditional: {
        Condition: function () {
          const pool = [
            "JalanBerlubang",
            "PenggusuranPKL",
            "KrisisAirBersih",
            "Audit",
            "Wartawan",
            "Kebijakan",
            "Pidato",
            "Debat",
            "TandaTangan",
          ];
          return pool[Math.floor(Math.random() * pool.length)];
        },
        JalanBerlubang: "jump Act2JalanBerlubang",
        PenggusuranPKL: "jump Act2PenggusuranPKL",
        KrisisAirBersih: "jump Act2KrisisAirBersih",
        Audit: "jump Event_Audit",
        Wartawan: "jump Event_Wartawan",
        Kebijakan: "jump Menu_Kebijakan",
        Pidato: "jump Event_Pidato",
        Debat: "jump Minigame_Debat",
        TandaTangan: "jump Event_TandaTangan",
      },
    },
  ],

  Act2JalanBerlubang: [
    "show character maya serious at right",
    "maya Laporan pertama: video warga memancing ikan di jalan berlubang sudah viral. Media menunggu respons Anda.",
    "arya Satu lubang di aspal, satu lubang di kepercayaan publik.",
    {
      Choice: {
        Dialog: "maya Keputusan Anda?",
        OpsiA: {
          Text: "Perbaiki sekarang dengan dana darurat",
          Do: "jump Act2JalanBerlubangA",
        },
        OpsiB: {
          Text: "Audit kontraktor dulu dan tahan pembayaran",
          Do: "jump Act2JalanBerlubangB",
        },
      },
    },
  ],

  Act2PenggusuranPKL: [
    "show character maya serious at right",
    "maya Satpol PP meminta izin menertibkan PKL di koridor utama. Pedagang meminta relokasi yang lebih manusiawi.",
    "arya Ketertiban kota selalu terlihat mudah sampai kita melihat wajah orang yang harus pindah.",
    {
      Choice: {
        Dialog: "maya Keputusan Anda?",
        OpsiA: {
          Text: "Siapkan relokasi cepat yang disorot publik",
          Do: "jump Act2PenggusuranPKLA",
        },
        OpsiB: {
          Text: "Tertibkan lewat prosedur dan pungut tunggakan retribusi",
          Do: "jump Act2PenggusuranPKLB",
        },
      },
    },
  ],

  Act2KrisisAirBersih: [
    "show character maya urgent at right",
    "maya Satu kecamatan mati air karena pipa utama bocor. Warga mulai berkumpul di kantor PDAM.",
    "arya Kalau air berhenti, kesabaran publik ikut mengering.",
    {
      Choice: {
        Dialog: "maya Keputusan Anda?",
        OpsiA: {
          Text: "Kirim truk tangki gratis sekarang",
          Do: "jump Act2KrisisAirBersihA",
        },
        OpsiB: {
          Text: "Audit PDAM dan tarik penalti kontrak",
          Do: "jump Act2KrisisAirBersihB",
        },
      },
    },
  ],

  Act2JalanBerlubangA: [
    applyStatChanges({ popularitas: 5, danaAnggaran: -5 }),
    "show notification Act2OptionA",
    "maya Tim lapangan bergerak malam ini. Warga puas, tetapi pos darurat anggaran menipis.",
    "jump Next_Turn",
  ],

  Act2PenggusuranPKLA: [
    applyStatChanges({ popularitas: 5, danaAnggaran: -5 }),
    "show notification Act2OptionA",
    "maya Relokasi cepat meredam kemarahan pedagang. Biayanya tidak kecil, tapi publik melihat Anda hadir.",
    "jump Next_Turn",
  ],

  Act2KrisisAirBersihA: [
    applyStatChanges({ popularitas: 5, danaAnggaran: -5 }),
    "show notification Act2OptionA",
    "maya Truk tangki sampai sebelum malam. Warga lega, kas operasional tertekan.",
    "jump Next_Turn",
  ],

  Act2JalanBerlubangB: [
    applyStatChanges({ integritas: 5, danaAnggaran: 5 }),
    "show notification Act2OptionB",
    "maya Audit awal menemukan klausul denda. Integritas naik, dan dana perbaikan kembali ke kas daerah.",
    "jump Next_Turn",
  ],

  Act2PenggusuranPKLB: [
    applyStatChanges({ integritas: 5, danaAnggaran: 5 }),
    "show notification Act2OptionB",
    "maya Prosedur penertiban bersih dari pungli. Retribusi tertunggak mulai masuk, meski warga bawah belum tentu senang.",
    "jump Next_Turn",
  ],

  Act2KrisisAirBersihB: [
    applyStatChanges({ integritas: 5, danaAnggaran: 5 }),
    "show notification Act2OptionB",
    "maya Penalti kontrak PDAM ditegakkan. Sistem terlihat lebih bersih, dan kas daerah bertambah.",
    "jump Next_Turn",
  ],

  /* ======================================================
   * NEW GENERIC EVENTS
   * ====================================================== */

  /* Event_Audit: Temuan audit BPK */
  Event_Audit: [
    "show scene governor_office_morning with fadeIn",
    "show character maya serious at right",
    "show character arya concerned at left",
    "maya Pak, BPK baru saja mengirim laporan. Ada selisih anggaran yang mencurigakan di Dinas Pekerjaan Umum.",
    "arya Selisih sebesar apa?",
    "maya Cukup besar untuk jadi headline koran besok kalau bocor.",
    {
      Choice: {
        Dialog: "maya Bagaimana kita menangani ini?",
        BukaPublik: {
          Text: "Buka ke publik dan pecat pelakunya",
          Do: "jump Event_Audit_A",
        },
        TutupInternal: {
          Text: "Tutup dan selesaikan secara internal",
          Do: "jump Event_Audit_B",
        },
      },
    },
  ],

  Event_Audit_A: [
    applyStatChanges({ popularitas: 5, integritas: 5, danaAnggaran: -5 }),
    "maya Pelaku ditindak, media memuji transparansi Anda. Tapi restrukturisasi dinas menelan biaya.",
    "jump Next_Turn",
  ],

  Event_Audit_B: [
    applyStatChanges({ integritas: -5 }),
    "maya Masalah ditutup rapat. Staf senang, tapi Anda tahu ini bom waktu.",
    "jump Next_Turn",
  ],

  /* Event_Wartawan: Debat mendadak dengan pers */
  Event_Wartawan: [
    "show scene press_conference_room with fadeIn",
    "show character arya thinking at left",
    "maya Pak, wartawan senior sudah menunggu di lobi. Mereka membawa pertanyaan soal proyek tahun lalu.",
    "arya Tidak bisa ditunda?",
    "maya Menolak wawancara justru membuat mereka menulis lebih liar.",
    {
      Choice: {
        Dialog: "maya Strategi Anda?",
        Transparan: {
          Text: "Hadapi langsung dengan data terbuka",
          Do: "jump Event_Wartawan_A",
        },
        Diplomatis: {
          Text: "Jawab diplomatis dan alihkan ke pencapaian",
          Do: "jump Event_Wartawan_B",
        },
      },
    },
  ],

  Event_Wartawan_A: [
    applyStatChanges({ integritas: 5, danaAnggaran: -3 }),
    "maya Konferensi pers berjalan transparan. Media menulis tajuk positif, meski ada biaya penyiapan data.",
    "jump Next_Turn",
  ],

  Event_Wartawan_B: [
    applyStatChanges({ popularitas: 5, integritas: -3 }),
    'maya Headline koran: "Gubernur Tampil Percaya Diri". Tapi beberapa jurnalis investigatif mencatat ketidakkonsistenan.',
    "jump Next_Turn",
  ],

  /* Menu_Kebijakan: Pemain memilih kegiatan grinding */
  Menu_Kebijakan: [
    "show scene governor_office_morning with fadeIn",
    "show character maya slight_smile at right",
    "show character arya neutral at left",
    "maya Hari ini relatif tenang, Pak. Tidak ada krisis mendesak. Anda punya waktu untuk inisiatif mandiri.",
    {
      Choice: {
        Dialog: "maya Mau mengisi hari ini dengan apa?",
        Blusukan: {
          Text: "Blusukan dadakan ke pasar rakyat",
          Do: "jump Menu_Kebijakan_Blusukan",
        },
        MakanMalam: {
          Text: "Makan malam dengan investor",
          Do: "jump Menu_Kebijakan_Investor",
        },
        Sidak: {
          Text: "Sidak instansi pelayanan publik",
          Do: "jump Menu_Kebijakan_Sidak",
        },
      },
    },
  ],

  Menu_Kebijakan_Blusukan: [
    applyStatChanges({ popularitas: 5 }),
    "arya Warga butuh melihat pemimpinnya turun langsung ke lapangan, bukan hanya di layar televisi.",
    "maya Foto-foto blusukan sudah viral. Popularitas Anda naik.",
    "jump Next_Turn",
  ],

  Menu_Kebijakan_Investor: [
    applyStatChanges({ danaAnggaran: 5, integritas: -3 }),
    "arya Kadang kita harus duduk di meja yang sama dengan orang-orang yang kita tidak sepenuhnya percaya.",
    "maya Investor tertarik menambah portofolio. Dana masuk, tapi ada bisik-bisik soal kedekatan Anda dengan korporat.",
    "jump Next_Turn",
  ],

  Menu_Kebijakan_Sidak: [
    applyStatChanges({ integritas: 5 }),
    "arya Pelayanan publik yang lambat adalah pengkhianatan diam-diam terhadap rakyat.",
    "maya Sidak berhasil. Beberapa petugas ditegur, antrian di kantor pelayanan membaik.",
    "jump Next_Turn",
  ],

  /* Event_Pidato: Typing Minigame */
  Event_Pidato: [
    "show scene press_conference_room with fadeIn",
    "show character arya determined at left",
    "show character maya serious at right",
    "maya Pak, ada undangan pidato terbuka di depan ribuan warga. Ini kesempatan emas untuk menaikkan kepercayaan publik.",
    "arya Apa yang harus aku lakukan?",
    "maya Anda harus mengucapkan janji publik dengan lantang dan tepat. Satu kesalahan di depan kamera, dan media akan memangsanya.",
    {
      Function: {
        Apply: function () {
          StartTypingGame();
          return false;
        },
        Revert: function () {
          return true;
        },
      },
    },
    {
      Conditional: {
        Condition: function () {
          return monogatari.storage("typingResult") || "lose";
        },
        win: "jump Event_Pidato_Success",
        lose: "jump Event_Pidato_Fail",
      },
    },
  ],

  Event_Pidato_Success: [
    "show character arya determined at left",
    "show character maya slight_smile at right",
    'arya "{{typingTarget}}" — kalimat itu menggema di seluruh alun-alun.',
    "maya Sempurna, Pak. Tidak ada jeda, tidak ada keraguan. Media langsung mengutipnya sebagai headline.",
    "maya Popularitas Anda naik tajam setelah pidato ini.",
    "jump Next_Turn",
  ],

  Event_Pidato_Fail: [
    "show character arya concerned at left",
    "show character maya serious at right",
    "arya Kata-kata itu terasa berat di lidah. Aku terbata-bata di depan ribuan pasang mata.",
    "maya Kamera menangkap semuanya, Pak. Potongan video kegagapan Anda sudah beredar.",
    "maya Popularitas Anda turun setelah insiden ini.",
    "jump Next_Turn",
  ],

  /* Event_TandaTangan: Signature Minigame */
  Event_TandaTangan: [
    "show scene governor_office_morning with fadeIn",
    "show character maya neutral at right",
    "show character arya thinking at left",
    "maya Pak Gubernur, ada proposal darurat terkait pencairan dana bantuan sosial yang harus segera Anda sahkan.",
    "arya Apakah dokumennya sudah diverifikasi oleh tim legal?",
    "maya Sudah, Pak. Semuanya aman. Publik dan media sedang mengawasi, jadi pastikan tanda tangan Anda tegas dan jelas.",
    {
      Function: {
        Apply: function () {
          StartSignatureGame();
          return false;
        },
        Revert: function () {
          return true;
        },
      },
    },
    {
      Conditional: {
        Condition: function () {
          return monogatari.storage("signatureResult") || "invalid";
        },
        valid: "jump Event_TandaTangan_Success",
        invalid: "jump Event_TandaTangan_Fail",
      },
    },
  ],

  Event_TandaTangan_Success: [
    "show character arya determined at left",
    "show character maya slight_smile at right",
    "maya Tanda tangan Anda terlihat meyakinkan dan tegas, Pak.",
    "arya Dokumen resmi harus menunjukkan bahwa pemimpinnya tidak ragu.",
    "maya Proposal telah disahkan. Kepercayaan publik dan integritas Anda meningkat.",
    "jump Next_Turn",
  ],

  Event_TandaTangan_Fail: [
    "show character arya concerned at left",
    "show character maya serious at right",
    "maya Pak... tanda tangan ini terlalu aneh. Apakah Anda sedang tidak fokus atau sengaja mencoret-coret?",
    "arya Uh... aku hanya mencoba gaya baru.",
    "maya Dokumen kenegaraan bukan tempat untuk gaya baru. Pihak bank dan publik mempertanyakan keabsahan dokumen tersebut.",
    "maya Kepercayaan terhadap profesionalisme Anda menurun.",
    "jump Next_Turn",
  ],

  /* Minigame_Debat: Timed Choice — 5 detik */
  Minigame_Debat: [
    "show scene press_conference_room with fadeIn",
    "show character arya thinking at left",
    "show character maya serious at right",
    "maya Pak, wartawan menyodorkan mikrofon langsung. Ada desas-desus dana pembangunan taman dialihkan untuk renovasi kantor.",
    "maya Anda harus menjawab SEKARANG. Tidak ada waktu untuk berpikir lama.",
    {
      Function: {
        Apply: function () {
          StartDebatTimer();
          return true;
        },
        Revert: function () {
          return true;
        },
      },
    },
    {
      Choice: {
        Dialog: "maya Respons Anda, Pak? Cepat!",
        Tegas: {
          Text: "Bantah dengan data dan fakta audit terbaru",
          Do: "jump Debat_Tegas",
        },
        Diplomatis: {
          Text: "Janjikan investigasi transparan minggu depan",
          Do: "jump Debat_Diplomatis",
        },
        Panik: {
          Text: "Panik dan salah bicara",
          Do: "jump Debat_Panik",
        },
      },
    },
  ],

  Debat_Tegas: [
    "show character arya determined at left",
    applyStatChanges({ integritas: 5, popularitas: 5 }),
    "arya Data audit sudah di tangan saya. Tidak ada satu rupiah pun yang dialihkan tanpa persetujuan tertulis.",
    "maya Jawaban solid, Pak. Wartawan tidak punya bahan untuk menyerang balik.",
    "jump Next_Turn",
  ],

  Debat_Diplomatis: [
    "show character arya neutral at left",
    applyStatChanges({ popularitas: 3, integritas: -2 }),
    "arya Kami akan membentuk tim investigasi independen. Hasilnya akan terbuka untuk publik minggu depan.",
    "maya Cukup aman, Pak. Tapi beberapa jurnalis mencatat bahwa ini bukan jawaban langsung.",
    "jump Next_Turn",
  ],

  Debat_Panik: [
    "show character arya concerned at left",
    applyStatChanges({ integritas: -10, popularitas: -10 }),
    "arya Saya... itu bukan... maksud saya, dana itu untuk... eh...",
    "maya Potongan video kegagapan Anda sudah viral dalam hitungan menit, Pak.",
    "maya Integritas dan Popularitas Anda jatuh drastis setelah insiden ini.",
    "jump Next_Turn",
  ],

  /* ======================================================
   * FIXED STORY EVENTS
   * ====================================================== */

  /* Turn 10: Tragedi Jembatan Barat */
  Event_Jembatan_Ambruk: [
    "show scene west_bridge_collapse with fadeIn",
    "show character maya urgent at right with fadeIn",
    "show character arya concerned at left with fadeIn",
    "maya Pak! Nyalakan TV sekarang. Jembatan Barat ambruk. Ratusan kendaraan terjebak.",
    "arya Jembatan itu diresmikan oleh gubernur sebelumku. Tapi masyarakat hanya tahu siapa yang menjabat saat ini.",
    "maya Oposisi pasti akan memakai ini untuk menghancurkan Anda.",
    {
      Choice: {
        Dialog: "maya Keputusan krusial, Pak!",
        TanggungJawab: {
          Text: "Ambil alih tanggung jawab penuh, gunakan Dana Darurat",
          Do: "jump Event_Jembatan_A",
        },
        LemparKesalahan: {
          Text: "Lempar kesalahan pada kontraktor dan gubernur lama",
          Do: "jump Event_Jembatan_B",
        },
      },
    },
  ],

  Event_Jembatan_A: [
    applyStatChanges({ integritas: 20, danaAnggaran: -25 }),
    "maya Evakuasi berjalan. Warga melihat Anda di lapangan. Media memuji keberanian Anda, tapi kas daerah terpukul keras.",
    "arya Harga dari tanggung jawab tidak pernah murah.",
    "jump Next_Turn",
  ],

  Event_Jembatan_B: [
    applyStatChanges({ integritas: -20, popularitas: -15 }),
    "maya Konferensi pers selesai. Anda berhasil mengalihkan kesalahan, tapi komentar publik sangat negatif.",
    "arya Mereka tidak bodoh. Mereka tahu siapa yang sedang menghindar.",
    "jump Next_Turn",
  ],

  /* Turn 18: Tawaran Ruang Tertutup dari Pak Surya */
  Event_Negosiasi_VIP: [
    "show scene elite_takeover_room with fadeIn",
    "show character arya thinking at left with fadeIn",
    "arya Aroma cerutu pekat memenuhi ruangan VIP. Di seberang meja, taipan properti Pak Surya menggeser koper kecil.",
    "arya Tahun depan pemilu lagi. Tren survei butuh keajaiban, katanya.",
    'arya Dia hanya minta aku "kehilangan" draf tata ruang kota yang melarang pembangunan di zona resapan air.',
    "arya Koper itu berisi dana kampanye tanpa seri. Tidak bisa dilacak.",
    {
      Choice: {
        Dialog:
          "arya Ini titik di mana aku menentukan siapa diriku sebenarnya.",
        Terima: {
          Text: "Terima tawaran Pak Surya",
          Do: "jump Event_Negosiasi_Terima",
        },
        Tolak: {
          Text: "Tolak mentah-mentah",
          Do: "jump Event_Negosiasi_Tolak",
        },
      },
    },
  ],

  Event_Negosiasi_Terima: [
    applyStatChanges({ danaAnggaran: 30 }),
    {
      Function: {
        Apply: function () {
          adjustLeadershipStats({
            integritas: -(leadershipStats().integritas - 15),
          });
          return true;
        },
        Revert: function () {
          return true;
        },
      },
    },
    "arya Aku mengulurkan tangan dan menerima koper itu. Berat fisiknya ringan, tapi beban moralnya menghancurkan.",
    "maya Mulai detik ini, Pak Surya memiliki Anda. Integritas Anda tidak akan bisa pulih.",
    "jump Next_Turn",
  ],

  Event_Negosiasi_Tolak: [
    applyStatChanges({ integritas: 15, popularitas: -5 }),
    "arya Aku mendorong koper itu kembali. Ruangan hening.",
    'arya Pak Surya tersenyum dingin dan berkata: "Sayang sekali. Semoga Anda tidak menyesal."',
    "maya Keputusan berani, Pak. Tapi bersiaplah. Elit politik tidak akan diam.",
    "jump Next_Turn",
  ],

  /* ======================================================
   * ENDING CHECK — Replaces old Act3 entry
   * ====================================================== */
  Ending_Check: [
    "show scene election_night_office with fadeIn",
    "show character arya thinking at left with fadeIn",
    "show character maya serious at right with fadeIn",
    "arya Lima tahun. Ribuan jam di kursi ini, ribuan tanda tangan, ribuan kompromi.",
    "arya Semuanya bermuara pada satu malam pemilihan dan satu layar hitung cepat.",
    "maya Hasil akhir sudah masuk 98 persen, Pak. Angka-angkanya sudah tidak akan berubah banyak lagi.",
    "show character arya neutral at left",
    "arya Katakan padaku, Maya. Siapa aku di mata mereka sekarang?",
    "jump Act3EndingDecision",
  ],

  Act3EndingDecision: [
    {
      Conditional: {
        Condition: function () {
          return finalEndingBranch();
        },
        Ending1: "jump Ending1",
        Ending2: "jump Ending2",
        Ending3: "jump Ending3",
      },
    },
  ],

  Ending1: [
    "show scene victory_balcony with fadeIn",
    "show character arya determined at left",
    "show character maya slight_smile at right",
    {
      Function: {
        Apply: function () {
          monogatari.storage({ lastEnding: "statesman" });
          return true;
        },
        Revert: function () {
          return true;
        },
      },
    },
    "maya Ending 1: Legasi Sang Negarawan.",
    "maya Suara dari alun-alun sampai ke balkon, Pak. Anda menang telak, bersih, dan nyaris tanpa celah gugatan.",
    "maya Anda membuktikan bahwa politik bersih bukan sekadar dongeng.",
    "arya Aku memenangkan harapan mereka. Jalan ke depan tetap sulit, tapi setidaknya malam ini aku bisa tidur nyenyak.",
    "jump CreditScene",
  ],

  Ending2: [
    "show scene elite_takeover_room with fadeIn",
    "show character arya concerned at left",
    "show character maya serious at right",
    {
      Function: {
        Apply: function () {
          monogatari.storage({ lastEnding: "puppet" });
          return true;
        },
        Revert: function () {
          return true;
        },
      },
    },
    "maya Ending 2: Sang Boneka Emas.",
    "maya Selamat, Pak. Anda menang tipis. Kampanye besar itu berhasil menutup semua retakan di depan publik.",
    "maya Tapi pesan dari Pak Surya sudah masuk. Mulai besok, kursi ini bukan lagi milik Anda sepenuhnya.",
    "arya Jadi ini bentuk kudeta yang paling sunyi. Tidak ada tank di jalan, hanya kontrak proyek dan janji yang menjerat leherku.",
    "jump CreditScene",
  ],

  Ending3: [
    "show scene bankrupt_city_hall with fadeIn",
    "show character arya concerned at left",
    "show character maya urgent at right",
    {
      Function: {
        Apply: function () {
          monogatari.storage({ lastEnding: "collapse" });
          return true;
        },
        Revert: function () {
          return true;
        },
      },
    },
    "maya Ending 3: Runtuhnya Kekuasaan.",
    "maya Rakyat sudah bicara, Pak. Hitung cepat berhenti di angka yang tidak bisa diselamatkan.",
    "maya Dana daerah kolaps, oposisi menuntut audit total, dan kejaksaan baru saja mengeluarkan surat panggilan terkait skandal.",
    "arya Aku mencoba bermain api dan akhirnya terbakar habis. Lima tahun itu berakhir dengan kota bangkrut, pintu diketuk penyidik, dan namaku runtuh di halaman depan koran.",
    "jump CreditScene",
  ],

  GameOver: [
    "show scene #1b0f0f with fadeIn",
    "show character arya concerned at left",
    "show character maya serious at right",
    {
      Function: {
        Apply: function () {
          monogatari.storage({ lastEnding: "gameover" });
          return true;
        },
        Revert: function () {
          return true;
        },
      },
    },
    "maya Salah satu pilar kepemimpinan menyentuh angka nol, Pak.",
    "maya Tanpa Popularitas, Integritas, atau Dana Anggaran, pemerintahan ini tidak lagi bisa bertahan.",
    "arya Lima tahun itu bahkan tidak sempat selesai.",
    "jump CreditScene",
  ],

  CreditScene: [
    {
      Function: {
        Apply: function () {
          prepareCreditStorage();
          return true;
        },
        Revert: function () {
          return true;
        },
      },
    },
    "show scene #10141b with fadeIn",
    "Laporan Akhir Masa Jabatan: {{creditTitle}}.",
    "Popularitas akhir: {{creditPopularitas}}. Integritas akhir: {{creditIntegritas}}. Dana Anggaran akhir: {{creditDanaAnggaran}}.",
    "Credits",
    "Visual Novel Developer: Monogatari Implementation.",
    "Story Draft: DRAFT_CERITA.md.",
    "Characters: Arya, Maya, Pak Surya, dan warga kota.",
    "Core Systems: Stat Kepemimpinan, Rutinitas Kasus, dan Minigame Politik.",
    "Terima kasih sudah memimpin kota ini sampai akhir.",
    {
      Choice: {
        Dialog: "Sesi laporan akhir selesai.",
        MainMenu: {
          Text: "Kembali ke Menu Utama",
          Do: "end",
        },
      },
    },
  ],
});
