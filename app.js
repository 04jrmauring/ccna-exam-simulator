(() => {
  const QUESTION_POOL = window.CCNA_QUESTION_POOL || [];
  const DRAG_DROP_POOL = window.CCNA_DRAG_DROP_POOL || [];
  const LAB_POOL = window.CCNA_LAB_POOL || [];
  const BLUEPRINT = window.CCNA_BLUEPRINT || [];
  const HISTORY_KEY = "ccna_200_301_exam_history_v1";
  const SEEN_Q_KEY = "ccna_200_301_seen_questions_v3";
  const SEEN_DD_KEY = "ccna_200_301_seen_dragdrops_v1";
  const SEEN_LAB_KEY = "ccna_200_301_seen_labs_v3";

  function cryptoRandFloat() {
    if (window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return buf[0] / 4294967296;
    }
    return Math.random();
  }

  function shuffleCopy(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(cryptoRandFloat() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function loadIdSet(key) {
    try {
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  function saveIdSet(key, setObj) {
    try {
      localStorage.setItem(key, JSON.stringify([...setObj]));
    } catch {
      // ignore storage errors
    }
  }

  // Spread selections evenly across distinct subtopics so an exam never clumps identical topics
  function pickDiverseFromBucket(items, count) {
    const bySub = new Map();
    shuffleCopy(items).forEach((q) => {
      const k = q.subtopic || "General";
      if (!bySub.has(k)) bySub.set(k, []);
      bySub.get(k).push(q);
    });
    const keys = shuffleCopy([...bySub.keys()]);
    const result = [];
    while (result.length < count && keys.length > 0) {
      for (let i = keys.length - 1; i >= 0 && result.length < count; i--) {
        const list = bySub.get(keys[i]);
        if (list && list.length > 0) {
          result.push(list.pop());
        }
        if (!list || list.length === 0) {
          keys.splice(i, 1);
        }
      }
    }
    return result;
  }

  // Draw 100 weighted questions (20/20/25/10/15/10) including 12-15 Drag-and-Drop items across all 6 domains
  function drawWeighted100Questions() {
    const seenQ = loadIdSet(SEEN_Q_KEY);
    const seenDD = loadIdSet(SEEN_DD_KEY);
    const drawn = [];
    let deckResetOccurred = false;

    // Base Drag-and-Drop quotas per section = 12, plus 0..3 random bonus slots -> 12 to 15 Drag-and-Drops per exam
    const ddQuotas = { "1.0": 3, "2.0": 2, "3.0": 3, "4.0": 1, "5.0": 2, "6.0": 1 };
    const bonusCandidates = shuffleCopy(["2.0", "4.0", "6.0"]);
    const bonusCount = Math.floor(cryptoRandFloat() * 4); // 0, 1, 2, or 3 -> total 12, 13, 14, or 15
    for (let i = 0; i < bonusCount; i++) {
      ddQuotas[bonusCandidates[i]] += 1;
    }

    BLUEPRINT.forEach((sec) => {
      // 1) Draw Drag-and-Drop items for this section
      const allDdInSec = DRAG_DROP_POOL.filter((d) => d.sectionCode === sec.code);
      const wantDd = Math.min(ddQuotas[sec.code] || 0, allDdInSec.length, sec.examCount);
      let pickedDd = [];
      if (wantDd > 0) {
        const unseenDd = allDdInSec.filter((d) => !seenDD.has(d.id));
        if (unseenDd.length >= wantDd) {
          pickedDd = shuffleCopy(unseenDd).slice(0, wantDd);
        } else {
          pickedDd = shuffleCopy(unseenDd);
          const pickedDdIds = new Set(pickedDd.map((d) => d.id));
          allDdInSec.forEach((d) => seenDD.delete(d.id));
          const refillDd = allDdInSec.filter((d) => !pickedDdIds.has(d.id));
          pickedDd.push(...shuffleCopy(refillDd).slice(0, wantDd - pickedDd.length));
        }
        pickedDd.forEach((d) => seenDD.add(d.id));
        pickedDd = pickedDd.map((d) => ({
          ...d,
          type: "drag-drop",
          shuffledItems: shuffleCopy(d.items),
        }));
      }

      // 2) Fill remaining section slots with diverse unseen Multiple-Choice questions
      const wantMcq = sec.examCount - pickedDd.length;
      const allInSec = QUESTION_POOL.filter((q) => q.sectionCode === sec.code);
      const unseen = allInSec.filter((q) => !seenQ.has(q.id));
      let pickedMcq = [];

      if (unseen.length >= wantMcq) {
        pickedMcq = pickDiverseFromBucket(unseen, wantMcq);
      } else {
        pickedMcq = shuffleCopy(unseen);
        const pickedIds = new Set(pickedMcq.map((q) => q.id));
        allInSec.forEach((q) => seenQ.delete(q.id));
        deckResetOccurred = true;
        const refillPool = allInSec.filter((q) => !pickedIds.has(q.id));
        pickedMcq.push(...pickDiverseFromBucket(refillPool, wantMcq - pickedMcq.length));
      }

      pickedMcq.forEach((q) => seenQ.add(q.id));
      drawn.push(...pickedDd, ...pickedMcq);
    });

    saveIdSet(SEEN_Q_KEY, seenQ);
    saveIdSet(SEEN_DD_KEY, seenDD);
    if (deckResetOccurred) {
      showToast(`You completed a full ${QUESTION_POOL.length.toLocaleString()}-question cycle! Reshuffled the deck for fresh exams.`);
    }
    return shuffleCopy(drawn).map((q, index) => ({ ...q, examNumber: index + 1 }));
  }

  // Draw 6 unique labs from the 20-lab pool prioritizing unseen labs first
  function draw6Labs() {
    const seenLabs = loadIdSet(SEEN_LAB_KEY);
    let unseen = LAB_POOL.filter((l) => !seenLabs.has(l.id));
    let selected = [];

    if (unseen.length >= 6) {
      const unseenPasser = shuffleCopy(unseen.filter((l) => l.passerTag.startsWith("Passer Lab")));
      const unseenBp = shuffleCopy(unseen.filter((l) => !l.passerTag.startsWith("Passer Lab")));
      const takePasser = unseenPasser.slice(0, Math.min(4, unseenPasser.length));
      const remaining = 6 - takePasser.length;
      const takeBp = unseenBp.slice(0, Math.min(remaining, unseenBp.length));
      selected = [...takePasser, ...takeBp];
      if (selected.length < 6) {
        const chosenIds = new Set(selected.map((l) => l.id));
        const extra = shuffleCopy(unseen.filter((l) => !chosenIds.has(l.id)));
        selected.push(...extra.slice(0, 6 - selected.length));
      }
    } else {
      selected = shuffleCopy(unseen);
      const chosenIds = new Set(selected.map((l) => l.id));
      seenLabs.clear();
      const refill = shuffleCopy(LAB_POOL.filter((l) => !chosenIds.has(l.id)));
      selected.push(...refill.slice(0, 6 - selected.length));
    }

    selected.forEach((l) => seenLabs.add(l.id));
    saveIdSet(SEEN_LAB_KEY, seenLabs);
    return shuffleCopy(selected).map((lab) => createLabSessionState(lab));
  }

  function updateUnseenDeckLabel() {
    const seenQ = loadIdSet(SEEN_Q_KEY);
    const seenDD = loadIdSet(SEEN_DD_KEY);
    const seenL = loadIdSet(SEEN_LAB_KEY);
    const remQ = Math.max(0, QUESTION_POOL.length - seenQ.size);
    const remDD = Math.max(0, DRAG_DROP_POOL.length - seenDD.size);
    const remL = Math.max(0, LAB_POOL.length - seenL.size);
    const elDeck = document.getElementById("unseenDeckStatus");
    if (elDeck) {
      elDeck.textContent = `${remQ} / ${QUESTION_POOL.length} unseen MCQs • ${remDD} / ${DRAG_DROP_POOL.length} unseen Drag & Drops • ${remL} / ${LAB_POOL.length} unseen labs remaining.`;
    }
  }

  function createLabSessionState(lab) {
    const completedIds = new Set();
    lab.objectives.forEach((o) => {
      if (o.preCompleted) completedIds.add(o.id);
    });
    const devList = lab.devices && lab.devices.length ? lab.devices : [lab.deviceName || "R1"];
    const deviceSessions = {};
    devList.forEach((devName) => {
      deviceSessions[devName] = {
        deviceName: devName,
        mode: "user",
        prompt: `${devName}>`,
        appliedConfigs: [],
        history: [
          {
            type: "out",
            text: `Cisco IOS Software — ${devName} Console (${lab.id})\nUser EXEC mode. Type 'enable' (or 'en') -> 'configure terminal' (or 'conf t') to begin configuring ${devName}.\nType '?' anytime for full context-sensitive IOS command help.`,
          },
        ],
        cmdHistory: [],
        cmdCursor: -1,
      };
    });
    const primaryNode = lab.nodes.find((n) => n.label === devList[0]) || lab.nodes.find((n) => n.selected) || lab.nodes[0];
    return {
      lab,
      activeDevice: devList[0],
      deviceSessions,
      completedIds,
      skipped: false,
      showConfigs: false,
      selectedNodeId: primaryNode ? primaryNode.id : "N1",
    };
  }

  function getActiveSession(ls) {
    return ls.deviceSessions[ls.activeDevice] || Object.values(ls.deviceSessions)[0];
  }

  function getDeviceProgress(ls, devName) {
    const devObjs = ls.lab.objectives.filter((o) => (o.device || ls.activeDevice) === devName);
    const done = devObjs.filter((o) => ls.completedIds.has(o.id)).length;
    return { done, total: devObjs.length };
  }

  function switchLabDevice(ls, devName) {
    if (!ls || !ls.deviceSessions[devName]) return;
    ls.activeDevice = devName;
    const matchNode = ls.lab.nodes.find((n) => n.label === devName);
    if (matchNode) ls.selectedNodeId = matchNode.id;
    renderLab();
    if (state.ptDeviceTab === "cli") el.cliHiddenInput.focus();
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveHistory(items) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 20)));
    } catch {
      // ignore storage errors
    }
  }

  // Application State: Starts on Phase 1 (6 Packet Tracer Labs) BEFORE Phase 2 (100 Q&A)
  const state = {
    attemptNumber: loadHistory().length + 1,
    examPhase: "labs", // "labs" | "qa"
    qaUnlocked: false,
    examQuestions: [],
    examLabs: [],
    currentQIdx: 0,
    currentLabIdx: 0,
    answers: {},
    flagged: new Set(),
    gridFilter: "all",
    showExplanation: false,
    studyMode: true,
    submitted: false,
    secondsRemaining: 2 * 3600,
    simElapsedSeconds: 0,
    timerPaused: false,
    activeView: "mock-exams",
    labCatalogFilter: "all",
    ptTool: "select", // "select" | "pdu"
    ptDeviceTab: "cli", // "cli" | "config" | "physical" | "desktop"
    ddSelectedItemId: null,
  };

  const el = {
    // Phase Stepper
    stepPhaseLabs: document.getElementById("stepPhaseLabs"),
    stepPhaseQa: document.getElementById("stepPhaseQa"),
    phaseLabsSub: document.getElementById("phaseLabsSub"),
    phaseLabsBadge: document.getElementById("phaseLabsBadge"),
    phaseQaSub: document.getElementById("phaseQaSub"),
    phaseQaBadge: document.getElementById("phaseQaBadge"),
    phaseLabsSection: document.getElementById("phaseLabsSection"),
    phaseQaSection: document.getElementById("phaseQaSection"),
    qaLabsDoneMini: document.getElementById("qaLabsDoneMini"),
    // Packet Tracer Elements
    ptWindowTitle: document.getElementById("ptWindowTitle"),
    ptSimClock: document.getElementById("ptSimClock"),
    ptPduStatus: document.getElementById("ptPduStatus"),
    ptToolSelect: document.getElementById("ptToolSelect"),
    ptToolPdu: document.getElementById("ptToolPdu"),
    ptFastForwardBtn: document.getElementById("ptFastForwardBtn"),
    ptLabStatusBanner: document.getElementById("ptLabStatusBanner"),
    ptTargetDevicesInfo: document.getElementById("ptTargetDevicesInfo"),
    ptSkipNotice: document.getElementById("ptSkipNotice"),
    ptConfigPane: document.getElementById("ptConfigPane"),
    ptPhysicalPane: document.getElementById("ptPhysicalPane"),
    ptDesktopPane: document.getElementById("ptDesktopPane"),
    labPasserBadge: document.getElementById("labPasserBadge"),
    labOverallPill: document.getElementById("labOverallPill"),
    labTitle: document.getElementById("labTitle"),
    labTabs: document.getElementById("labTabs"),
    labScenarioText: document.getElementById("labScenarioText"),
    topoCaption: document.getElementById("topoCaption"),
    topologySvg: document.getElementById("topologySvg"),
    cliDeviceTitle: document.getElementById("cliDeviceTitle"),
    cliBody: document.getElementById("cliBody"),
    cliHistory: document.getElementById("cliHistory"),
    cliActivePrompt: document.getElementById("cliActivePrompt"),
    cliTyped: document.getElementById("cliTyped"),
    cliHiddenInput: document.getElementById("cliHiddenInput"),
    cliVerifyBtn: document.getElementById("cliVerifyBtn"),
    cliSolutionBtn: document.getElementById("cliSolutionBtn"),
    ptShowConfigsBtn: document.getElementById("ptShowConfigsBtn"),
    ptRevealConfigsBtn: document.getElementById("ptRevealConfigsBtn"),
    ptCorrectConfigsBox: document.getElementById("ptCorrectConfigsBox"),
    resetLabBtn: document.getElementById("resetLabBtn"),
    prevLabBtn: document.getElementById("prevLabBtn"),
    nextLabBtn: document.getElementById("nextLabBtn"),
    jumpToQaBtn: document.getElementById("jumpToQaBtn"),
    // Q&A Elements
    examTitle: document.getElementById("examTitle"),
    domainBadge: document.getElementById("domainBadge"),
    subtopicBadge: document.getElementById("subtopicBadge"),
    qTypeBadge: document.getElementById("qTypeBadge"),
    flaggedBadge: document.getElementById("flaggedBadge"),
    ddFilterChip: document.getElementById("ddFilterChip"),
    questionCounter: document.getElementById("questionCounter"),
    progressStats: document.getElementById("progressStats"),
    progressFill: document.getElementById("progressFill"),
    qBadge: document.getElementById("qBadge"),
    qPoolId: document.getElementById("qPoolId"),
    questionStem: document.getElementById("questionStem"),
    optionsList: document.getElementById("optionsList"),
    explainToggle: document.getElementById("explainToggle"),
    explanationBox: document.getElementById("explanationBox"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    reviewBtn: document.getElementById("reviewBtn"),
    toggleNavigatorBtn: document.getElementById("toggleNavigatorBtn"),
    questionGridDrawer: document.getElementById("questionGridDrawer"),
    questionGridCells: document.getElementById("questionGridCells"),
    // Topbar / Global
    timerDisplay: document.getElementById("timerDisplay"),
    pauseTimerBtn: document.getElementById("pauseTimerBtn"),
    profileSubText: document.getElementById("profileSubText"),
    avatarRingArc: document.getElementById("avatarRingArc"),
    sidebarProgressFill: document.getElementById("sidebarProgressFill"),
    sidebarProgressMeta: document.getElementById("sidebarProgressMeta"),
    modeStatusLabel: document.getElementById("modeStatusLabel"),
    scoreModal: document.getElementById("scoreModal"),
    scoreModalBody: document.getElementById("scoreModalBody"),
    modalResultBadge: document.getElementById("modalResultBadge"),
    viewToast: document.getElementById("viewToast"),
  };

  let toastTimer = null;
  function showToast(msg) {
    el.viewToast.textContent = msg;
    el.viewToast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.viewToast.classList.add("hidden"), 3500);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function formatTime(sec) {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function isLabSolved(ls) {
    return ls.completedIds.size === ls.lab.objectives.length;
  }

  function isDragDropSlotCorrect(target, placedItemId) {
    if (!placedItemId) return false;
    if (Array.isArray(target.accepts)) return target.accepts.includes(placedItemId);
    return target.accepts === placedItemId;
  }

  function isQuestionAnswered(q) {
    if (!q) return false;
    const ans = state.answers[q.examNumber];
    if (q.type === "drag-drop") {
      if (!ans || typeof ans !== "object") return false;
      return q.targets.every((t) => Boolean(ans[t.id]));
    }
    return Boolean(ans);
  }

  function isQuestionCorrect(q) {
    if (!q) return false;
    const ans = state.answers[q.examNumber];
    if (q.type === "drag-drop") {
      if (!ans || typeof ans !== "object") return false;
      const used = new Set();
      for (const t of q.targets) {
        const placed = ans[t.id];
        if (!placed || used.has(placed)) return false;
        used.add(placed);
        if (!isDragDropSlotCorrect(t, placed)) return false;
      }
      return true;
    }
    return ans === q.correct;
  }

  function answeredQuestionsCount() {
    return state.examQuestions.filter(isQuestionAnswered).length;
  }

  function solvedLabsCount() {
    return state.examLabs.filter(isLabSolved).length;
  }

  function allLabsVisitedOrDone() {
    return state.qaUnlocked || solvedLabsCount() === state.examLabs.length;
  }

  // Switch between Phase 1 (Packet Tracer Labs) and Phase 2 (100Q Q&A)
  function setExamPhase(phase) {
    if (phase === "qa") {
      state.qaUnlocked = true;
    }
    state.examPhase = phase;
    el.phaseLabsSection.classList.toggle("hidden", phase !== "labs");
    el.phaseQaSection.classList.toggle("hidden", phase !== "qa");
    updatePhaseStepper();
    if (phase === "labs") renderLab();
    else renderQuestion();
  }

  function updatePhaseStepper() {
    const labsDone = solvedLabsCount();
    const qDone = answeredQuestionsCount();
    const labsAllDone = labsDone === state.examLabs.length;

    el.stepPhaseLabs.classList.toggle("active", state.examPhase === "labs");
    el.stepPhaseLabs.classList.toggle("completed", labsAllDone);
    el.phaseLabsSub.textContent = `Accomplish 6 hands-on labs first (${labsDone}/6 completed)`;
    el.phaseLabsBadge.textContent = labsAllDone ? "6/6 Completed" : `Lab ${state.currentLabIdx + 1}/6 Active`;
    el.phaseLabsBadge.className = `phase-badge${labsAllDone ? " done" : ""}`;

    el.stepPhaseQa.classList.toggle("active", state.examPhase === "qa");
    el.stepPhaseQa.classList.toggle("completed", qDone === state.examQuestions.length);
    el.phaseQaSub.textContent = `100 weighted CCNA questions (${qDone}/100 answered)`;
    if (state.examPhase === "qa") {
      el.phaseQaBadge.textContent = `Q${state.currentQIdx + 1}/100 Active`;
      el.phaseQaBadge.className = "phase-badge";
    } else if (allLabsVisitedOrDone()) {
      el.phaseQaBadge.textContent = "Ready — Click to Enter";
      el.phaseQaBadge.className = "phase-badge done";
    } else {
      el.phaseQaBadge.textContent = "Finish / Skip 6 Labs First";
      el.phaseQaBadge.className = "phase-badge locked";
    }
    el.qaLabsDoneMini.textContent = `${labsDone}/6`;
  }

  // Start Fresh Exam -> ALWAYS Begins at Part 1 (Lab 1 of 6)
  function startNewExam(silent = false) {
    state.examQuestions = drawWeighted100Questions();
    state.examLabs = draw6Labs();
    state.currentQIdx = 0;
    state.currentLabIdx = 0;
    state.answers = {};
    state.flagged = new Set();
    state.showExplanation = false;
    state.submitted = false;
    state.qaUnlocked = false;
    state.examPhase = "labs";
    state.secondsRemaining = 2 * 3600;
    state.simElapsedSeconds = 0;
    state.timerPaused = false;
    state.attemptNumber = loadHistory().length + 1;
    state.ptTool = "select";
    state.ptDeviceTab = "cli";
    state.ddSelectedItemId = null;

    const ddInExam = state.examQuestions.filter((q) => q.type === "drag-drop").length;
    if (el.ddFilterChip) {
      el.ddFilterChip.textContent = `Drag & Drop (${ddInExam})`;
    }

    el.examTitle.textContent = `CCNA 200-301 Practice Exam #${state.attemptNumber} — Part 2: Written Q&A`;
    el.timerDisplay.textContent = formatTime(state.secondsRemaining);
    el.pauseTimerBtn.classList.remove("paused");
    el.modeStatusLabel.textContent = state.studyMode ? "Active (Study)" : "Active (Strict)";

    setExamPhase("labs");
    renderDashboard();
    renderAnalytics();
    updateUnseenDeckLabel();
    switchView("mock-exams");
    if (!silent) {
      const rem = Math.max(0, QUESTION_POOL.length - loadIdSet(SEEN_Q_KEY).size);
      showToast(`Fresh exam loaded: 6 labs + 100 questions (${ddInExam} Drag & Drop, ${rem} unseen MCQs left).`);
    }
  }

  function updateProgressIndicators() {
    const answeredCount = answeredQuestionsCount();
    const labsDone = solvedLabsCount();
    const totalTasks = state.examQuestions.length + state.examLabs.length;
    const pct = totalTasks > 0 ? Math.round(((answeredCount + labsDone) / totalTasks) * 100) : 0;

    el.profileSubText.textContent = `Labs: ${labsDone}/6 • Qs: ${answeredCount}/100`;
    el.avatarRingArc.style.strokeDashoffset = String(119.38 * (1 - pct / 100));
    el.sidebarProgressFill.style.width = `${Math.max(2, pct)}%`;
    el.sidebarProgressMeta.textContent = `Labs (${labsDone}/6) • Questions (${answeredCount}/100)`;
    updatePhaseStepper();
  }

  // ============================================================================
  // PACKET TRACER LAB RENDERER & AUTHENTIC CISCO SVG ICONS
  // ============================================================================
  function renderLab() {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls) return;
    const { lab } = ls;
    const solved = isLabSolved(ls);
    const isLastLab = state.currentLabIdx === state.examLabs.length - 1;
    const devs = lab.devices || Object.keys(ls.deviceSessions);

    el.ptWindowTitle.textContent = `Cisco Packet Tracer — Lab ${state.currentLabIdx + 1} of ${state.examLabs.length}: ${lab.title} (.pka)`;
    el.labPasserBadge.textContent = lab.passerTag;
    el.labOverallPill.textContent = `${solvedLabsCount()}/${state.examLabs.length} Done`;
    el.labTitle.textContent = `Lab ${state.currentLabIdx + 1} of ${state.examLabs.length}: ${lab.title}`;
    el.topoCaption.textContent = `Root / ${lab.id} (${lab.section})`;
    el.labScenarioText.textContent = lab.scenario;

    // Lab Status Banner — stays "In Progress" until ALL devices satisfy the scenario, then lights up "DONE"!
    if (el.ptLabStatusBanner) {
      el.ptLabStatusBanner.className = `pt-lab-status-banner ${solved ? "done" : "in-progress"}`;
      el.ptLabStatusBanner.innerHTML = solved
        ? `<span class="status-check-icon">✓</span><div><strong>DONE — Lab Accomplished!</strong><span>All scenario requirements verified across ${escapeHtml(devs.join(", "))}.</span></div>`
        : `<span class="status-dot-icon">●</span><div><strong>Status: In Progress</strong><span>Configure ${escapeHtml(devs.join(", "))} via CLI until the scenario is complete.</span></div>`;
    }

    // 6-Lab Switcher Pills in PT Titlebar (no task count spoilers!)
    el.labTabs.innerHTML = "";
    state.examLabs.forEach((item, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      const s = isLabSolved(item);
      btn.className = `lab-tab${i === state.currentLabIdx ? " active" : ""}${s ? " solved" : item.skipped ? " skipped" : ""}`;
      btn.innerHTML = `<span>Lab ${i + 1}</span>${s ? "<span>✓ DONE</span>" : item.skipped ? "<span>⏭</span>" : ""}`;
      btn.title = item.lab.title;
      btn.addEventListener("click", () => {
        state.currentLabIdx = i;
        renderLab();
      });
      el.labTabs.appendChild(btn);
    });

    // Clickable Target Device Chips in Right Scenario Panel (no task counts!)
    if (el.ptTargetDevicesInfo) {
      el.ptTargetDevicesInfo.innerHTML = "";
      devs.forEach((devName) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = `pt-target-chip${devName === ls.activeDevice ? " active" : ""}${solved ? " done" : ""}`;
        chip.innerHTML = `<span>${escapeHtml(devName)}</span>${solved ? "<span>✓</span>" : ""}`;
        chip.title = `Open ${devName} CLI console`;
        chip.addEventListener("click", () => switchLabDevice(ls, devName));
        el.ptTargetDevicesInfo.appendChild(chip);
      });
    }

    // Multi-Device Switcher Bar in PT Device Window (no partial task counts!)
    const switcher = document.getElementById("ptDeviceSwitcher");
    if (switcher) {
      switcher.innerHTML = `<span class="pt-switcher-label">Configure Devices (${devs.length}):</span>`;
      devs.forEach((devName) => {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = `pt-dev-pill${devName === ls.activeDevice ? " active" : ""}${solved ? " done" : ""}`;
        pill.innerHTML = `<span>${escapeHtml(devName)}</span><span class="pt-dev-count">${solved ? "✓ DONE" : "CLI"}</span>`;
        pill.addEventListener("click", () => switchLabDevice(ls, devName));
        switcher.appendChild(pill);
      });
    }

    // Update Next / Skip Button Text Clearly
    el.prevLabBtn.disabled = state.currentLabIdx === 0;
    if (isLastLab) {
      el.nextLabBtn.textContent = solved ? "Proceed to 100-Question Exam >" : "Skip & Start 100-Question Exam >";
    } else {
      el.nextLabBtn.textContent = solved ? `Next Lab (${state.currentLabIdx + 2}/6) >` : "Next Lab (Skip) >";
    }

    el.ptSkipNotice.classList.toggle("hidden", solved);

    // Render Packet Tracer Topology & Device Dialog Panes
    renderPacketTracerCanvas(ls);
    renderDevicePanes(ls);

    // Active Device CLI History
    const sess = getActiveSession(ls);
    el.cliHistory.innerHTML = "";
    sess.history.forEach((line) => {
      const div = document.createElement("div");
      div.className = "cli-line";
      if (line.type === "cmd") {
        div.innerHTML = `<span class="cli-prompt">${escapeHtml(line.prompt)}</span> <span class="cli-cmd">${escapeHtml(line.cmd)}</span>`;
      } else {
        div.innerHTML = `<span class="cli-out ${line.cls || ""}">${escapeHtml(line.text)}</span>`;
      }
      el.cliHistory.appendChild(div);
    });
    el.cliActivePrompt.textContent = sess.prompt;
    el.cliTyped.textContent = "";
    el.cliHiddenInput.value = "";
    el.cliBody.scrollTop = el.cliBody.scrollHeight;

    el.cliSolutionBtn.classList.toggle("hidden", !state.studyMode && !state.submitted);
    renderCorrectConfigsPanel(ls);
    updateProgressIndicators();
  }

  function renderCorrectConfigsPanel(ls) {
    if (!el.ptCorrectConfigsBox || !el.ptRevealConfigsBtn) return;
    const isOpen = Boolean(ls && ls.showConfigs);
    el.ptCorrectConfigsBox.classList.toggle("hidden", !isOpen);
    el.ptRevealConfigsBtn.classList.toggle("active", isOpen);
    if (el.ptShowConfigsBtn) el.ptShowConfigsBtn.classList.toggle("active", isOpen);
    el.ptRevealConfigsBtn.querySelector("span").textContent = isOpen
      ? "✕ Hide Correct Configs"
      : "📖 Stuck? Show All Correct Configs";

    if (!isOpen || !ls) {
      el.ptCorrectConfigsBox.innerHTML = "";
      return;
    }

    const sols = ls.lab.solutions || {};
    const devs = ls.lab.devices || Object.keys(sols);

    el.ptCorrectConfigsBox.innerHTML = `
      <div class="pt-cfg-intro">Complete Cisco IOS configuration commands for <strong>${escapeHtml(ls.lab.id)}</strong>. Type these into each device's CLI (shortened commands work too):</div>
    `;

    devs.forEach((devName) => {
      const cmds = sols[devName] || [];
      const fullLines = ["enable", "configure terminal", ...cmds, "end", "write memory"];
      const scriptText = fullLines.join("\n");

      const card = document.createElement("div");
      card.className = "pt-cfg-dev-card";
      card.innerHTML = `
        <div class="pt-cfg-dev-head">
          <span class="pt-cfg-dev-name">${escapeHtml(devName)} (${cmds.length} config lines)</span>
          <div class="pt-cfg-dev-actions">
            <button type="button" class="pt-cfg-mini-btn pt-cfg-open-btn">Open ${escapeHtml(devName)} CLI</button>
            <button type="button" class="pt-cfg-mini-btn pt-cfg-copy-btn">Copy</button>
          </div>
        </div>
        <pre class="pt-cfg-pre">${escapeHtml(scriptText)}</pre>
      `;

      card.querySelector(".pt-cfg-open-btn").addEventListener("click", () => {
        switchLabDevice(ls, devName);
      });
      card.querySelector(".pt-cfg-copy-btn").addEventListener("click", (e) => {
        const btn = e.currentTarget;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(scriptText).then(() => {
            btn.textContent = "Copied!";
            setTimeout(() => { btn.textContent = "Copy"; }, 1400);
          }).catch(() => {});
        }
        showToast(`Copied ${devName} configuration to clipboard.`);
      });

      el.ptCorrectConfigsBox.appendChild(card);
    });
  }

  // Scale lab coordinates from 460x238 to Packet Tracer 680x285 spacious canvas
  function scalePtCoords(x, y) {
    return {
      cx: Math.round((x / 460) * 560 + 62),
      cy: Math.round((y / 238) * 205 + 32),
    };
  }

  function renderPacketTracerCanvas(ls) {
    const { lab } = ls;
    const solved = isLabSolved(ls);

    const statusCol = (st) => {
      if (solved && st === "red") return "#16a34a";
      if (st === "blue" || st === "green") return "#16a34a";
      if (st === "orange") return "#f97316";
      return "#dc2626";
    };

    // Map node center points
    const nodePos = {};
    lab.nodes.forEach((nd) => {
      const p = scalePtCoords(nd.x + 50, nd.y + 28);
      nodePos[nd.id] = p;
    });

    let svg = "";

    // Draw Links with Classic Packet Tracer Cables & Green/Red/Orange Triangles
    lab.links.forEach((lk, idx) => {
      const p1 = scalePtCoords(lk.x1, lk.y1);
      const p2 = scalePtCoords(lk.x2, lk.y2);
      const col = statusCol(lk.status);
      const isAlert = lk.status === "red" && !solved;
      const strokeStyle = isAlert ? 'stroke="#dc2626" stroke-dasharray="6 4"' : 'stroke="#1e293b"';

      // Cable line (double line if EtherChannel Po1!)
      const isBundle = /po\d|ether|channel/i.test(lk.label);
      if (isBundle) {
        svg += `<line x1="${p1.cx}" y1="${p1.cy - 4}" x2="${p2.cx}" y2="${p2.cy - 4}" stroke="#0f172a" stroke-width="2" />`;
        svg += `<line x1="${p1.cx}" y1="${p1.cy + 4}" x2="${p2.cx}" y2="${p2.cy + 4}" stroke="#0f172a" stroke-width="2" />`;
        const mx = (p1.cx + p2.cx) / 2;
        const my = (p1.cy + p2.cy) / 2;
        svg += `<ellipse cx="${mx}" cy="${my}" rx="9" ry="13" fill="none" stroke="#0284c7" stroke-width="2" />`;
      } else {
        svg += `<line x1="${p1.cx}" y1="${p1.cy}" x2="${p2.cx}" y2="${p2.cy}" ${strokeStyle} stroke-width="2.2" />`;
      }

      // Animated PDU envelope dot when link is up
      if (!isAlert) {
        svg += `<circle r="3.4" fill="#0284c7"><animateMotion dur="${2.6 + idx * 0.4}s" repeatCount="indefinite" path="M ${p1.cx} ${p1.cy} L ${p2.cx} ${p2.cy}"/></circle>`;
      }

      // Packet Tracer Triangular Link Status Indicators near both endpoints!
      const dx = p2.cx - p1.cx;
      const dy = p2.cy - p1.cy;
      const t1x = Math.round(p1.cx + dx * 0.24);
      const t1y = Math.round(p1.cy + dy * 0.24);
      const t2x = Math.round(p1.cx + dx * 0.76);
      const t2y = Math.round(p1.cy + dy * 0.76);

      if (lk.status === "orange" && !solved) {
        svg += `<circle cx="${t1x}" cy="${t1y}" r="5.2" fill="#f97316" stroke="#fff" stroke-width="1.3"/>`;
        svg += `<circle cx="${t2x}" cy="${t2y}" r="5.2" fill="#f97316" stroke="#fff" stroke-width="1.3"/>`;
      } else {
        svg += `<polygon points="${t1x},${t1y - 6} ${t1x - 5.5},${t1y + 4.5} ${t1x + 5.5},${t1y + 4.5}" fill="${col}" stroke="#ffffff" stroke-width="1.1"/>`;
        svg += `<polygon points="${t2x},${t2y - 6} ${t2x - 5.5},${t2y + 4.5} ${t2x + 5.5},${t2y + 4.5}" fill="${col}" stroke="#ffffff" stroke-width="1.1"/>`;
      }

      // Port Label Pill
      const mx = Math.round((p1.cx + p2.cx) / 2);
      const my = Math.round((p1.cy + p2.cy) / 2);
      svg += `<rect x="${mx - 36}" y="${my - 10}" width="72" height="17" rx="4" fill="#ffffff" fill-opacity="0.92" stroke="#cbd5e1" stroke-width="1"/>`;
      svg += `<text x="${mx}" y="${my + 2}" text-anchor="middle" fill="#0f172a" font-family="monospace" font-size="9.5" font-weight="700">${escapeHtml(lk.label)}</text>`;
    });

    // Draw Authentic Cisco Packet Tracer Device Icons (with CLI badge for configurable devices)
    lab.nodes.forEach((nd) => {
      const p = nodePos[nd.id];
      const isSelected = ls.selectedNodeId === nd.id || nd.label === ls.activeDevice;
      const isCfg = Boolean(ls.deviceSessions[nd.label]);
      svg += `<g class="pt-node${isSelected ? " selected" : ""}" data-nodeid="${nd.id}" transform="translate(${p.cx}, ${p.cy})">`;
      svg += `<rect class="pt-node-halo" x="-48" y="-34" width="96" height="84" rx="10" />`;
      svg += getCiscoPtDeviceSvg(nd.type);
      if (isCfg) {
        svg += `<rect x="14" y="-31" width="34" height="15" rx="4" fill="${solved ? "#16a34a" : "#0284c7"}" stroke="#ffffff" stroke-width="1"/>`;
        svg += `<text x="31" y="-20.5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="7.8" font-weight="800">${solved ? "✓ DONE" : "CLI"}</text>`;
      }
      svg += `<text x="0" y="32" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">${escapeHtml(nd.label)}</text>`;
      svg += `<text x="0" y="45" text-anchor="middle" fill="#475569" font-size="9.5" font-family="monospace" font-weight="600">${escapeHtml(nd.sub)}</text>`;
      svg += `</g>`;
    });

    el.topologySvg.innerHTML = svg;

    // Bind Click on Devices (Switches active CLI console when clicking any configurable device!)
    el.topologySvg.querySelectorAll(".pt-node").forEach((g) => {
      g.addEventListener("click", () => {
        const nd = lab.nodes.find((n) => n.id === g.dataset.nodeid);
        if (!nd) return;
        ls.selectedNodeId = nd.id;
        if (state.ptTool === "pdu") {
          const ok = isLabSolved(ls) || nd.status !== "red";
          el.ptPduStatus.innerHTML = `<strong>Simple PDU (ICMP)</strong> to <strong>${escapeHtml(nd.label)}</strong> (${escapeHtml(nd.sub)}): <span style="color:${ok ? "#4ade80" : "#f87171"};font-weight:700">${ok ? "Successful (TTL=255, 1ms)" : "Failed — Check Lab Configuration"}</span>`;
          showToast(`PDU Ping to ${nd.label}: ${ok ? "Successful" : "Failed (policy/config incomplete)"}`);
          renderPacketTracerCanvas(ls);
          renderDevicePanes(ls);
        } else if (ls.deviceSessions[nd.label]) {
          el.ptPduStatus.innerHTML = `Opened CLI Console for <strong>${escapeHtml(nd.label)}</strong> (${escapeHtml(nd.sub)}).`;
          switchLabDevice(ls, nd.label);
        } else {
          el.ptPduStatus.innerHTML = `Inspecting endpoint <strong>${escapeHtml(nd.label)}</strong> (${escapeHtml(nd.sub)}) — console stays on <strong>${escapeHtml(ls.activeDevice)}</strong>.`;
          renderPacketTracerCanvas(ls);
          renderDevicePanes(ls);
        }
      });
    });
  }

  // Authentic Cisco Packet Tracer Vector Icons (Router Cylinder, Catalyst Switch Box, Server Tower, PC)
  function getCiscoPtDeviceSvg(type) {
    if (type === "router") {
      return `
        <ellipse cx="0" cy="8" rx="24" ry="10" fill="#0369a1" stroke="#0c4a6e" stroke-width="1.4"/>
        <rect x="-24" y="-8" width="48" height="16" fill="#0284c7" stroke="#0c4a6e" stroke-width="1.2"/>
        <ellipse cx="0" cy="-8" rx="24" ry="10" fill="#38bdf8" stroke="#0c4a6e" stroke-width="1.4"/>
        <path d="M-11 -11 L-3 -8 L-11 -5 M11 -11 L3 -8 L11 -5 M-4 -14 L0 -10 L4 -14 M-4 -2 L0 -6 L4 -2" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }
    if (type === "switch") {
      return `
        <polygon points="-28,-8 -18,-18 28,-18 18,-8" fill="#38bdf8" stroke="#0c4a6e" stroke-width="1.3"/>
        <rect x="-28" y="-8" width="46" height="18" fill="#0284c7" stroke="#0c4a6e" stroke-width="1.3"/>
        <polygon points="18,-8 28,-18 28,0 18,10" fill="#0369a1" stroke="#0c4a6e" stroke-width="1.3"/>
        <path d="M-14 -14 H10 M6 -16 L11 -14 L6 -12 M14 -10 H-10 M-6 -12 L-11 -10 L-6 -8" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }
    if (type === "server") {
      return `
        <rect x="-15" y="-22" width="30" height="38" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
        <rect x="-10" y="-16" width="20" height="5" rx="1" fill="#38bdf8"/>
        <rect x="-10" y="-8" width="20" height="5" rx="1" fill="#38bdf8"/>
        <circle cx="-7" cy="6" r="2.2" fill="#22c55e"/>
        <circle cx="-1" cy="6" r="2.2" fill="#22c55e"/>
        <rect x="4" y="4" width="6" height="4" rx="1" fill="#64748b"/>
      `;
    }
    // Desktop PC
    return `
      <rect x="-20" y="-20" width="40" height="26" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="-16" y="-16" width="32" height="18" rx="1.5" fill="#0ea5e9"/>
      <rect x="-5" y="6" width="10" height="6" fill="#475569"/>
      <rect x="-15" y="12" width="30" height="4" rx="1.5" fill="#334155"/>
    `;
  }

  function renderDevicePanes(ls) {
    const { lab } = ls;
    const nd = lab.nodes.find((n) => n.id === ls.selectedNodeId) || lab.nodes[0];
    const solved = isLabSolved(ls);
    el.cliDeviceTitle.textContent = `${ls.activeDevice} — Cisco Packet Tracer Console (${(lab.devices || [ls.activeDevice]).length} Devices to Configure)`;

    // Config Tab
    const rows = lab.links
      .map((lk) => {
        const up = lk.status !== "red" || solved;
        return `<tr>
          <td class="mono">${escapeHtml(lk.label)}</td>
          <td><span style="color:${up ? "#4ade80" : "#f87171"};font-weight:700">${up ? "up / up" : "down / alert"}</span></td>
          <td class="mono">${escapeHtml(nd ? nd.sub : "Configured")}</td>
          <td>${escapeHtml(lab.section)}</td>
        </tr>`;
      })
      .join("");
    el.ptConfigPane.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <strong>Device Configuration Overview — ${escapeHtml(nd ? nd.label : lab.deviceName)}</strong>
        <span class="lab-badge">${escapeHtml(lab.id)}</span>
      </div>
      <table class="ref-table">
        <thead><tr><th>Interface / Link</th><th>Line Status</th><th>Role / IP</th><th>Domain</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    // Physical Tab
    const portCount = nd && nd.type === "switch" ? 12 : 4;
    let portsHtml = "";
    for (let i = 0; i < portCount; i++) {
      const isDown = !solved && i === portCount - 1;
      portsHtml += `<div class="pt-rj45${isDown ? " down" : ""}" title="Port ${i + 1}"></div>`;
    }
    el.ptPhysicalPane.innerHTML = `
      <strong>Physical Device View — ${escapeHtml(nd ? nd.label : lab.deviceName)} (${(nd ? nd.type : "switch").toUpperCase()})</strong>
      <p style="font-size:11.8px;color:#94a3b8;margin-top:4px;">Power: ON &bull; Module Status: Operational &bull; Link LEDs reflect real-time lab status.</p>
      <div class="pt-chassis">
        <div>
          <div style="font-weight:700;color:#38bdf8;font-size:12px;">CISCO SYSTEMS</div>
          <div class="mono" style="font-size:11px;color:#94a3b8;">${escapeHtml(nd ? nd.label : lab.deviceName)} &bull; ${escapeHtml(nd ? nd.sub : "")}</div>
        </div>
        <div class="pt-port-bank">${portsHtml}</div>
      </div>
    `;

    // Desktop Tab
    el.ptDesktopPane.innerHTML = `
      <strong>Desktop Utilities — ${escapeHtml(nd ? nd.label : lab.deviceName)}</strong>
      <p style="font-size:12px;color:#94a3b8;margin:6px 0 12px;">Quick connectivity check simulating Packet Tracer Desktop Command Prompt.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
        <button class="btn btn-primary" id="ptDesktopPingBtn" style="padding:6px 12px;font-size:12px;">Run Ping Test</button>
        <button class="btn btn-secondary" id="ptDesktopIpBtn" style="padding:6px 12px;font-size:12px;">Show IP Config</button>
      </div>
      <pre class="ref-code" id="ptDesktopOut">C:\\&gt; Ready. Click "Run Ping Test" or switch to the CLI tab to configure ${escapeHtml(lab.deviceName)}.</pre>
    `;
    const pingBtn = document.getElementById("ptDesktopPingBtn");
    const ipBtn = document.getElementById("ptDesktopIpBtn");
    const outPre = document.getElementById("ptDesktopOut");
    if (pingBtn) {
      pingBtn.onclick = () => {
        outPre.textContent = solved
          ? `C:\\> ping ${nd ? nd.sub : "10.10.10.1"}\nReply from ${nd ? nd.sub : "10.10.10.1"}: bytes=32 time=1ms TTL=128\nReply from ${nd ? nd.sub : "10.10.10.1"}: bytes=32 time<1ms TTL=128\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss) — Lab DONE!`
          : `C:\\> ping ${nd ? nd.sub : "10.10.10.1"}\nRequest timed out.\nNote: Required device configurations are not yet complete across ${(lab.devices || [ls.activeDevice]).join(", ")}.`;
      };
    }
    if (ipBtn) {
      ipBtn.onclick = () => {
        outPre.textContent = `Device: ${nd ? nd.label : ls.activeDevice}\nAddress / Role: ${nd ? nd.sub : "Default"}\nLab Section: ${lab.section}\nLab Status: ${solved ? "DONE (Verified)" : "In Progress"}`;
      };
    }
  }

  // ============================================================================
  // CISCO PACKET TRACER FULL '?' CONTEXT HELPER, TAB COMPLETION & SHORT COMMANDS
  // Powered by window.CISCO_IOS_CLI (data/ios_cli.js)
  // ============================================================================
  const IOS_CLI = window.CISCO_IOS_CLI;

  function showContextHelp(currentText) {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls || !IOS_CLI) return;
    const sess = getActiveSession(ls);
    const mode = sess.mode || "user";
    const res = IOS_CLI.resolveContext(mode, currentText);

    // Echo command + '?' exactly like Cisco Packet Tracer / IOS
    sess.history.push({ type: "cmd", prompt: sess.prompt, cmd: `${currentText}?` });

    if (res.ambiguous) {
      sess.history.push({
        type: "out",
        cls: "warn",
        text: `% Ambiguous command: matches ${res.ambiguous.join(", ")}`,
      });
    } else if (res.entries.length > 0) {
      const lines = res.entries.map(([k, v]) => `  ${k.padEnd(22, " ")}${v.desc}`);
      if (res.cr) lines.push(`  ${"<cr>".padEnd(22, " ")}`);
      sess.history.push({ type: "out", text: lines.join("\n") });
    } else if (res.leafDesc || res.cr) {
      const lines = [];
      if (res.leafDesc) lines.push(`  ${"<info>".padEnd(22, " ")}${res.leafDesc}`);
      if (res.cr) lines.push(`  ${"<cr>".padEnd(22, " ")}`);
      sess.history.push({ type: "out", text: lines.join("\n") });
    } else {
      sess.history.push({
        type: "out",
        cls: "warn",
        text: "% Unrecognized command at '^' marker. Type '?' on an empty line for available commands.",
      });
    }

    renderLab();
    el.cliHiddenInput.value = currentText;
    el.cliTyped.textContent = currentText;
    el.cliHiddenInput.focus();
  }

  function tryTabAutocomplete(currentText) {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls || !IOS_CLI) return currentText;
    const sess = getActiveSession(ls);
    const trimmed = currentText.trim();
    if (!trimmed || /\s$/.test(currentText)) return currentText;
    const res = IOS_CLI.resolveContext(sess.mode || "user", currentText);
    const nonPlaceholder = res.entries.filter(([k]) => !k.startsWith("<"));
    if (nonPlaceholder.length === 1) {
      return [...res.completedTokens, nonPlaceholder[0][0]].join(" ") + " ";
    }
    if (nonPlaceholder.length > 1) {
      showContextHelp(currentText);
    }
    return currentText;
  }

  // Interactive Multi-Device Cisco IOS CLI Engine (Authentic User EXEC -> Priv EXEC -> Config -> Submodes)
  function executeCliCommand(raw, explicitDevice = null) {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls) return;
    const dev = explicitDevice || ls.activeDevice;
    const sess = ls.deviceSessions[dev] || getActiveSession(ls);
    const cmd = raw.trim();
    if (cmd.endsWith("?")) {
      showContextHelp(cmd.slice(0, -1));
      return;
    }
    sess.history.push({ type: "cmd", prompt: sess.prompt, cmd });
    if (cmd) {
      sess.cmdHistory.push(cmd);
      sess.cmdCursor = sess.cmdHistory.length;
    } else {
      if (!explicitDevice) renderLab();
      return;
    }

    const rawLower = cmd.toLowerCase();
    if (rawLower === "clear" || rawLower === "cls") {
      sess.history = [];
      if (!explicitDevice) renderLab();
      return;
    }
    if (rawLower === "help") {
      showContextHelp("");
      return;
    }
    if (rawLower === "verify" || rawLower === "do verify") {
      const solvedNow = isLabSolved(ls);
      const devs = ls.lab.devices || [dev];
      if (solvedNow) {
        sess.history.push({
          type: "out",
          cls: "success",
          text: `✓ DONE — LAB ACCOMPLISHED!\n${ls.lab.verifyOutput}`,
        });
      } else {
        sess.history.push({
          type: "out",
          cls: "warn",
          text: `Lab Status: INCOMPLETE — One or more scenario requirements are not yet configured across ${devs.join(", ")}.\nReview the scenario brief and use 'show running-config' (or 'do sh run') on each device to inspect your configuration.`,
        });
      }
      if (!explicitDevice) renderLab();
      return;
    }

    // Expand shortened Cisco IOS commands (e.g. ex -> exit, en -> enable, conf t -> configure terminal, sw tr na vl 99 -> switchport trunk native vlan 99)
    const exp = IOS_CLI ? IOS_CLI.expandCommand(sess.mode, cmd) : { ok: true, expanded: cmd };
    if (!exp.ok) {
      let errMsg = exp.error || "% Invalid input detected at '^' marker.";
      if (sess.mode === "user" && !exp.error.includes("Ambiguous")) {
        errMsg += " (Hint: type 'en' or 'enable' to enter Privileged EXEC mode, or '?' for available commands.)";
      } else if (sess.mode === "priv" && !exp.error.includes("Ambiguous")) {
        errMsg += " (Hint: type 'conf t' or 'configure terminal' to enter Global Configuration mode, or '?' for help.)";
      }
      sess.history.push({ type: "out", cls: "warn", text: errMsg });
      if (!explicitDevice) renderLab();
      return;
    }

    const expanded = exp.expanded;
    const lower = expanded.toLowerCase();

    // Save config commands (wr / write memory / copy running-config startup-config / do wr)
    if (/^(do\s+)?(write(\s+memory)?|copy\s+running-config\s+startup-config)$/i.test(expanded)) {
      sess.history.push({ type: "out", text: "Building configuration...\n[OK]" });
      if (!explicitDevice) renderLab();
      return;
    }

    // Ping / Traceroute simulation
    if (/^(do\s+)?ping\s+/i.test(expanded)) {
      const target = expanded.replace(/^(do\s+)?ping\s+/i, "").trim();
      const solvedNow = isLabSolved(ls);
      sess.history.push({
        type: "out",
        cls: solvedNow ? "success" : "",
        text: solvedNow
          ? `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms`
          : `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)`,
      });
      if (!explicitDevice) renderLab();
      return;
    }

    // Verify / Check Results (NO per-objective spoilers!)
    if (lower === "verify" || lower === "do verify") {
      const solvedNow = isLabSolved(ls);
      const devs = ls.lab.devices || [dev];
      if (solvedNow) {
        sess.history.push({
          type: "out",
          cls: "success",
          text: `✓ DONE — LAB ACCOMPLISHED!\n${ls.lab.verifyOutput}`,
        });
      } else {
        sess.history.push({
          type: "out",
          cls: "warn",
          text: `Lab Status: INCOMPLETE — One or more scenario requirements are not yet configured across ${devs.join(", ")}.\nReview the scenario brief and use 'show running-config' (or 'do sh run') on each device to inspect your configuration.`,
        });
      }
      if (!explicitDevice) renderLab();
      return;
    }

    // Show commands (show / do show)
    if (lower.startsWith("show ") || lower.startsWith("do show ")) {
      if (lower.includes("running-config") || lower.includes("startup-config")) {
        const applied = sess.appliedConfigs.map((c) => "  " + c).join("\n");
        sess.history.push({
          type: "out",
          text: `Building configuration...\n!\nhostname ${dev}\n!\n${applied || "  ! (No configuration commands applied on " + dev + " yet)"}\n!\nend`,
        });
      } else if (lower.includes("cdp")) {
        const cdpDisabledGlobally = sess.appliedConfigs.some((c) => /^no cdp run$/i.test(c));
        const timerMatch = [...sess.appliedConfigs].reverse().find((c) => /^cdp timer \d+/i.test(c));
        const holdMatch = [...sess.appliedConfigs].reverse().find((c) => /^cdp holdtime \d+/i.test(c));
        const timerVal = timerMatch ? timerMatch.split(/\s+/)[2] : "60";
        const holdVal = holdMatch ? holdMatch.split(/\s+/)[2] : "180";
        if (cdpDisabledGlobally) {
          sess.history.push({ type: "out", text: "% CDP is not enabled" });
        } else if (lower.includes("neighbors detail")) {
          const peers = (ls.lab.nodes || []).filter((n) => n.label !== dev && (n.type === "router" || n.type === "switch"));
          const detail = peers
            .map((p, idx) => `-------------------------\nDevice ID: ${p.label}\nEntry address(es): IP address: 10.0.0.${idx + 11}\nPlatform: cisco ${p.type === "router" ? "ISR4331" : "WS-C2960X"}, Capabilities: ${p.type === "router" ? "Router" : "Switch IGMP"}\nInterface: GigabitEthernet0/${idx + 1},  Port ID (outgoing port): GigabitEthernet0/${idx + 1}\nHoldtime : ${holdVal} sec\nVersion : Cisco IOS Software, Version 15.2(4)M`)
            .join("\n");
          sess.history.push({ type: "out", text: detail || "Total cdp entries displayed : 0" });
        } else if (lower.includes("neighbors")) {
          const peers = (ls.lab.nodes || []).filter((n) => n.label !== dev && (n.type === "router" || n.type === "switch"));
          const rows = peers
            .map((p, idx) => `${p.label.padEnd(14, " ")}Gig 0/${idx + 1}       ${holdVal.padEnd(9, " ")}${p.type === "router" ? "R S I" : "S I  "}    ${p.type === "router" ? "ISR4331" : "C2960X "}  Gig 0/${idx + 1}`)
            .join("\n");
          sess.history.push({
            type: "out",
            text: `Capability Codes: R - Router, S - Switch, I - IGMP\nDevice ID     Local Intrfce  Holdtme  Capability  Platform  Port ID\n${rows || "(No CDP neighbors detected)"}\nTotal cdp entries displayed : ${peers.length}`,
          });
        } else {
          sess.history.push({
            type: "out",
            text: `Global CDP information:\n  Sending CDP packets every ${timerVal} seconds\n  Sending a holdtime value of ${holdVal} seconds\n  Sending CDPv2 advertisements is enabled`,
          });
        }
      } else if (lower.includes("lldp")) {
        const lldpEnabled = sess.appliedConfigs.some((c) => /^lldp run$/i.test(c));
        const timerMatch = [...sess.appliedConfigs].reverse().find((c) => /^lldp timer \d+/i.test(c));
        const holdMatch = [...sess.appliedConfigs].reverse().find((c) => /^lldp holdtime \d+/i.test(c));
        const timerVal = timerMatch ? timerMatch.split(/\s+/)[2] : "30";
        const holdVal = holdMatch ? holdMatch.split(/\s+/)[2] : "120";
        if (!lldpEnabled) {
          sess.history.push({ type: "out", text: "% LLDP is not enabled" });
        } else if (lower.includes("neighbors detail")) {
          const peers = (ls.lab.nodes || []).filter((n) => n.label !== dev && (n.type === "router" || n.type === "switch"));
          const detail = peers
            .map((p, idx) => `------------------------------------------------\nLocal Intf: Gi0/${idx + 1}\nChassis id: 001e.bd${idx + 1}a.000${idx + 1}\nPort id: Gi0/${idx + 1}\nSystem Name: ${p.label}\nSystem Description: Cisco IOS Software (${p.type.toUpperCase()})\nTime remaining: ${holdVal} seconds\nSystem Capabilities: ${p.type === "router" ? "B,R" : "B"}`)
            .join("\n");
          sess.history.push({ type: "out", text: detail || "Total entries displayed: 0" });
        } else if (lower.includes("neighbors")) {
          const peers = (ls.lab.nodes || []).filter((n) => n.label !== dev && (n.type === "router" || n.type === "switch"));
          const rows = peers
            .map((p, idx) => `${p.label.padEnd(16, " ")}Gi0/${idx + 1}        ${holdVal.padEnd(11, " ")}${p.type === "router" ? "R  " : "B  "}          Gi0/${idx + 1}`)
            .join("\n");
          sess.history.push({
            type: "out",
            text: `Capability codes: (R) Router, (B) Bridge, (T) Telephone, (W) WLAN Access Point\nDevice ID       Local Intf   Hold-time  Capability  Port ID\n${rows || "(No LLDP neighbors detected)"}\nTotal entries displayed: ${peers.length}`,
          });
        } else {
          sess.history.push({
            type: "out",
            text: `Global LLDP Information:\n  Status: ACTIVE\n  LLDP advertisements are sent every ${timerVal} seconds\n  LLDP hold time advertised is ${holdVal} seconds\n  LLDP interface reinitialization delay is 2 seconds`,
          });
        }
      } else {
        const solvedNow = isLabSolved(ls);
        const appliedCount = sess.appliedConfigs.length;
        sess.history.push({
          type: "out",
          cls: solvedNow ? "success" : "",
          text: solvedNow
            ? `${ls.lab.verifyOutput}\n[Status: DONE — All scenario requirements active]`
            : `${dev} operational output (${appliedCount} config line(s) applied on ${dev}).\nUse 'show running-config' (or 'do sh run') to inspect full configuration.`,
        });
      }
      if (!explicitDevice) renderLab();
      return;
    }

    // Authentic IOS Mode Transitions
    let isModeNavOnly = false;
    if (lower === "enable") {
      if (sess.mode === "user") {
        sess.mode = "priv";
        sess.prompt = `${dev}#`;
        isModeNavOnly = true;
      }
    } else if (lower === "disable") {
      if (sess.mode === "priv") {
        sess.mode = "user";
        sess.prompt = `${dev}>`;
        isModeNavOnly = true;
      }
    } else if (lower === "configure terminal" || lower === "configure") {
      if (sess.mode === "priv") {
        sess.mode = "config";
        sess.prompt = `${dev}(config)#`;
        sess.history.push({ type: "out", text: "Enter configuration commands, one per line.  End with CNTL/Z." });
        isModeNavOnly = true;
      } else {
        sess.history.push({ type: "out", cls: "warn", text: "% Invalid input detected at '^' marker. (Enter 'enable' first)" });
        if (!explicitDevice) renderLab();
        return;
      }
    } else if (lower === "end") {
      if (sess.mode.startsWith("config")) {
        sess.mode = "priv";
        sess.prompt = `${dev}#`;
        sess.history.push({ type: "out", text: "%SYS-5-CONFIG_I: Configured from console by console" });
        isModeNavOnly = true;
      }
    } else if (lower === "exit") {
      isModeNavOnly = true;
      if (sess.mode.startsWith("config-")) {
        sess.mode = "config";
        sess.prompt = `${dev}(config)#`;
      } else if (sess.mode === "config") {
        sess.mode = "priv";
        sess.prompt = `${dev}#`;
        sess.history.push({ type: "out", text: "%SYS-5-CONFIG_I: Configured from console by console" });
      } else if (sess.mode === "priv") {
        sess.mode = "user";
        sess.prompt = `${dev}>`;
      } else {
        sess.history.push({ type: "out", text: `${dev} con0 is now available. Press RETURN to get started.` });
      }
    } else if (sess.mode.startsWith("config")) {
      // Submode entry commands from global config or submode jump
      if (/^interface\s+range\s+/i.test(expanded)) {
        sess.mode = "config-if";
        sess.prompt = `${dev}(config-if-range)#`;
      } else if (/^interface\s+/i.test(expanded)) {
        sess.mode = "config-if";
        sess.prompt = `${dev}(config-if)#`;
      } else if (/^vlan\s+\d+/i.test(expanded)) {
        sess.mode = "config-vlan";
        sess.prompt = `${dev}(config-vlan)#`;
      } else if (/^router\s+ospf/i.test(expanded)) {
        sess.mode = "config-router";
        sess.prompt = `${dev}(config-router)#`;
      } else if (/^ip\s+access-list\s+extended/i.test(expanded)) {
        sess.mode = "config-acl";
        sess.prompt = `${dev}(config-ext-nacl)#`;
      } else if (/^ip\s+access-list\s+/i.test(expanded)) {
        sess.mode = "config-acl";
        sess.prompt = `${dev}(config-std-nacl)#`;
      } else if (/^line\s+/i.test(expanded)) {
        sess.mode = "config-line";
        sess.prompt = `${dev}(config-line)#`;
      } else if (/^ip\s+dhcp\s+pool/i.test(expanded)) {
        sess.mode = "config-dhcp";
        sess.prompt = `${dev}(dhcp-config)#`;
      }
    }

    // Record applied configuration commands in running-config and silently grade against lab objectives
    const wasSolved = isLabSolved(ls);
    if (sess.mode.startsWith("config") && !isModeNavOnly) {
      sess.appliedConfigs.push(expanded);

      ls.lab.objectives.forEach((obj) => {
        if ((obj.device || dev) === dev && !ls.completedIds.has(obj.id)) {
          if (obj.pattern.test(expanded) || obj.pattern.test(cmd)) {
            ls.completedIds.add(obj.id);
          }
        }
      });
    }

    // Show DONE banner & celebration ONLY when the ENTIRE lab across all devices is accomplished!
    if (!wasSolved && isLabSolved(ls)) {
      ls.skipped = false;
      const devs = ls.lab.devices || [dev];
      sess.history.push({
        type: "out",
        cls: "success",
        text: `✓ DONE — LAB ACCOMPLISHED! All scenario requirements verified across ${devs.join(", ")}. Click "Next Lab >" to proceed.`,
      });
      if (!explicitDevice) {
        showToast(`✓ DONE! Lab ${state.currentLabIdx + 1}/6 (${ls.lab.title}) accomplished!`);
      }
    }

    if (!explicitDevice) {
      renderLab();
      renderAnalytics();
    }
  }

  // ============================================================================
  // PHASE 2: 100-QUESTION Q&A RENDERER (MCQ + INTERACTIVE DRAG-AND-DROP)
  // ============================================================================
  function placeDragDropItem(q, itemId, targetId) {
    if (state.submitted || !itemId || !targetId) return;
    const current = { ...(state.answers[q.examNumber] || {}) };
    // Find if itemId was already placed in another target (for move/swap)
    let sourceTargetId = null;
    Object.keys(current).forEach((tId) => {
      if (current[tId] === itemId) sourceTargetId = tId;
    });
    const displacedItemId = current[targetId] || null;
    if (sourceTargetId && sourceTargetId !== targetId) {
      if (displacedItemId) current[sourceTargetId] = displacedItemId;
      else delete current[sourceTargetId];
    }
    current[targetId] = itemId;
    state.answers[q.examNumber] = current;
    state.ddSelectedItemId = null;
    renderQuestion();
  }

  function removeDragDropTarget(q, targetId) {
    if (state.submitted || !targetId) return;
    const current = { ...(state.answers[q.examNumber] || {}) };
    delete current[targetId];
    if (Object.keys(current).length === 0) delete state.answers[q.examNumber];
    else state.answers[q.examNumber] = current;
    state.ddSelectedItemId = null;
    renderQuestion();
  }

  function renderDragDropBoard(q, canReveal) {
    const placements = state.answers[q.examNumber] && typeof state.answers[q.examNumber] === "object"
      ? state.answers[q.examNumber]
      : {};
    const items = q.shuffledItems || q.items;
    const itemById = new Map(q.items.map((it) => [it.id, it]));
    const placedIds = new Set(Object.values(placements).filter(Boolean));
    const placedCount = q.targets.filter((t) => Boolean(placements[t.id])).length;

    const wrap = document.createElement("div");
    wrap.className = "dd-workspace";

    // Top toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "dd-toolbar";
    toolbar.innerHTML = `
      <span>${q.mode === "order" ? "Drag items into the exact sequence (or click an item, then click a slot)." : "Drag items from the left bank onto matching targets (or click an item, then click a slot)."}</span>
      <div class="dd-toolbar-right">
        <span class="dd-progress-pill${placedCount === q.targets.length ? " complete" : ""}">${placedCount} / ${q.targets.length} Placed</span>
        <button type="button" class="dd-reset-btn" ${state.submitted || placedCount === 0 ? "disabled" : ""}>Reset Slots</button>
      </div>
    `;
    toolbar.querySelector(".dd-reset-btn").addEventListener("click", () => {
      if (state.submitted) return;
      delete state.answers[q.examNumber];
      state.ddSelectedItemId = null;
      renderQuestion();
    });
    wrap.appendChild(toolbar);

    // 2-Column Board
    const cols = document.createElement("div");
    cols.className = "dd-columns";

    // Left Column: Source Bank
    const leftCol = document.createElement("div");
    leftCol.className = "dd-col";
    leftCol.innerHTML = `<div class="dd-col-header"><span>Source Options (${items.length})</span><span>Drag or Click</span></div>`;
    const bankList = document.createElement("div");
    bankList.className = "dd-bank-list";

    // Allow dropping a placed target chip back onto the Left Bank to unplace it
    leftCol.addEventListener("dragover", (e) => {
      if (state.submitted) return;
      e.preventDefault();
      leftCol.classList.add("drag-over-bank");
    });
    leftCol.addEventListener("dragleave", () => leftCol.classList.remove("drag-over-bank"));
    leftCol.addEventListener("drop", (e) => {
      e.preventDefault();
      leftCol.classList.remove("drag-over-bank");
      if (state.submitted) return;
      const fromTarget = e.dataTransfer.getData("text/x-dd-from-target");
      if (fromTarget) removeDragDropTarget(q, fromTarget);
    });

    items.forEach((item) => {
      const isPlaced = placedIds.has(item.id);
      const isSelected = state.ddSelectedItemId === item.id;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `dd-item${isPlaced ? " placed" : ""}${isSelected ? " selected-item" : ""}${state.submitted ? " locked" : ""}`;
      btn.draggable = !isPlaced && !state.submitted;
      btn.innerHTML = `
        <span class="dd-grip" aria-hidden="true">⋮⋮</span>
        <span class="dd-item-label">${escapeHtml(item.label)}</span>
        ${isPlaced ? '<span class="dd-placed-tag">Placed</span>' : ""}
      `;
      if (!isPlaced && !state.submitted) {
        btn.addEventListener("dragstart", (e) => {
          btn.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", item.id);
          e.dataTransfer.setData("text/x-dd-item", item.id);
        });
        btn.addEventListener("dragend", () => btn.classList.remove("dragging"));
        btn.addEventListener("click", () => {
          state.ddSelectedItemId = state.ddSelectedItemId === item.id ? null : item.id;
          renderQuestion();
        });
      }
      bankList.appendChild(btn);
    });
    leftCol.appendChild(bankList);
    cols.appendChild(leftCol);

    // Right Column: Target Drop Slots
    const rightCol = document.createElement("div");
    rightCol.className = "dd-col";
    rightCol.innerHTML = `<div class="dd-col-header"><span>Target Slots (${q.targets.length})</span><span>Drop Here</span></div>`;
    const targetList = document.createElement("div");
    targetList.className = "dd-target-list";

    q.targets.forEach((target) => {
      const placedItemId = placements[target.id] || null;
      const placedItem = placedItemId ? itemById.get(placedItemId) : null;
      const slotCorrect = isDragDropSlotCorrect(target, placedItemId);

      const card = document.createElement("div");
      card.className = "dd-target-card";
      if (!state.submitted && state.ddSelectedItemId) card.classList.add("ready-to-place");
      if (canReveal) card.classList.add(slotCorrect ? "dd-correct" : "dd-wrong");

      const lbl = document.createElement("div");
      lbl.className = "dd-target-label";
      let statusBadge = "";
      if (canReveal) {
        statusBadge = slotCorrect
          ? '<span style="color:#86efac;font-size:11px;">✓ Correct</span>'
          : '<span style="color:#fca5a5;font-size:11px;">✕ Incorrect</span>';
      }
      lbl.innerHTML = `<span>${escapeHtml(target.label)}</span>${statusBadge}`;
      card.appendChild(lbl);

      const zone = document.createElement("div");
      zone.className = `dd-dropzone${placedItem ? " has-item" : ""}`;
      if (placedItem) {
        const chip = document.createElement("div");
        chip.className = "dd-placed-chip";
        chip.draggable = !state.submitted;
        chip.innerHTML = `<span class="dd-grip" aria-hidden="true">⋮⋮</span><span>${escapeHtml(placedItem.label)}</span>`;
        if (!state.submitted) {
          chip.addEventListener("dragstart", (e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", placedItem.id);
            e.dataTransfer.setData("text/x-dd-item", placedItem.id);
            e.dataTransfer.setData("text/x-dd-from-target", target.id);
          });
        }
        zone.appendChild(chip);

        if (!state.submitted) {
          const rmBtn = document.createElement("button");
          rmBtn.type = "button";
          rmBtn.className = "dd-remove-btn";
          rmBtn.title = "Return item to source bank";
          rmBtn.textContent = "×";
          rmBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            removeDragDropTarget(q, target.id);
          });
          zone.appendChild(rmBtn);
        }
      } else {
        zone.textContent = state.ddSelectedItemId && !state.submitted
          ? "Click here to place selected item"
          : "Drop item here";
      }
      card.appendChild(zone);

      if (canReveal && !slotCorrect) {
        const expectedIds = Array.isArray(target.accepts) ? target.accepts : [target.accepts];
        const expectedLabels = expectedIds
          .map((id) => itemById.get(id)?.label)
          .filter(Boolean)
          .join("  OR  ");
        const hint = document.createElement("div");
        hint.className = "dd-expected-hint";
        hint.innerHTML = `<strong>Expected:</strong> ${escapeHtml(expectedLabels)}`;
        card.appendChild(hint);
      }

      if (!state.submitted) {
        card.addEventListener("dragover", (e) => {
          e.preventDefault();
          card.classList.add("drag-over");
        });
        card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
        card.addEventListener("drop", (e) => {
          e.preventDefault();
          card.classList.remove("drag-over");
          const draggedId = e.dataTransfer.getData("text/x-dd-item") || e.dataTransfer.getData("text/plain");
          if (draggedId && itemById.has(draggedId)) {
            placeDragDropItem(q, draggedId, target.id);
          }
        });
        card.addEventListener("click", () => {
          if (state.ddSelectedItemId) {
            placeDragDropItem(q, state.ddSelectedItemId, target.id);
          }
        });
      }

      targetList.appendChild(card);
    });

    rightCol.appendChild(targetList);
    cols.appendChild(rightCol);
    wrap.appendChild(cols);
    return wrap;
  }

  function renderQuestion() {
    const q = state.examQuestions[state.currentQIdx];
    if (!q) return;

    const isDragDrop = q.type === "drag-drop";
    const selectedKey = !isDragDrop ? (state.answers[q.examNumber] || null) : null;
    const isFlagged = state.flagged.has(q.examNumber);
    const answeredTotal = answeredQuestionsCount();
    const pctPos = Math.round(((state.currentQIdx + 1) / state.examQuestions.length) * 100);

    el.domainBadge.textContent = q.section;
    el.subtopicBadge.textContent = q.subtopic;
    if (el.qTypeBadge) el.qTypeBadge.classList.toggle("hidden", !isDragDrop);
    el.flaggedBadge.classList.toggle("hidden", !isFlagged);
    el.questionCounter.textContent = `Question ${q.examNumber} of ${state.examQuestions.length}`;
    el.progressStats.textContent = `${answeredTotal} Answered • ${state.flagged.size} Flagged`;
    el.progressFill.style.width = `${pctPos}%`;

    el.qBadge.textContent = `Q${q.examNumber}`;
    el.qPoolId.textContent = `Pool ID: ${q.id} • Blueprint Section ${q.sectionCode}${isDragDrop ? " • Interactive Drag & Drop" : ""}`;
    el.questionStem.textContent = q.stem;

    const canReveal = state.submitted || (state.studyMode && state.showExplanation);

    el.optionsList.innerHTML = "";
    if (isDragDrop) {
      el.optionsList.setAttribute("role", "region");
      el.optionsList.setAttribute("aria-label", "Interactive drag and drop matching area");
      el.optionsList.appendChild(renderDragDropBoard(q, canReveal));
    } else {
      el.optionsList.setAttribute("role", "radiogroup");
      el.optionsList.setAttribute("aria-label", "Answer choices");
      q.options.forEach((opt) => {
        const isSelected = selectedKey === opt.key;
        const btn = document.createElement("button");
        btn.type = "button";
        let cls = "option-card";
        if (isSelected) cls += " selected";
        if (canReveal && opt.key === q.correct) cls += " correct-reveal";
        else if (canReveal && isSelected && opt.key !== q.correct) cls += " wrong-reveal";

        btn.className = cls;
        btn.setAttribute("role", "radio");
        btn.setAttribute("aria-checked", String(isSelected));

        let tagHtml = "";
        if (canReveal && opt.key === q.correct) {
          tagHtml = '<span class="option-selected-tag" style="color:#86efac;background:rgba(34,197,94,0.2)">Correct</span>';
        } else if (canReveal && isSelected && opt.key !== q.correct) {
          tagHtml = '<span class="option-selected-tag" style="color:#fca5a5;background:rgba(239,68,68,0.2)">Your Pick</span>';
        } else if (isSelected) {
          tagHtml = '<span class="option-selected-tag">Selected</span>';
        }

        btn.innerHTML = `
          <span class="radio-outer"><span class="radio-inner"></span></span>
          <span class="option-letter">${opt.key}.</span>
          <span class="option-text">${escapeHtml(opt.text)}</span>
          ${tagHtml}
        `;
        btn.addEventListener("click", () => {
          if (state.submitted) return;
          state.answers[q.examNumber] = opt.key;
          renderQuestion();
        });
        el.optionsList.appendChild(btn);
      });
    }

    el.reviewBtn.classList.toggle("active", isFlagged);
    el.reviewBtn.querySelector("span").textContent = isFlagged ? "Flagged for Review" : "Mark for Review";
    el.prevBtn.disabled = state.currentQIdx === 0;
    el.nextBtn.disabled = state.currentQIdx === state.examQuestions.length - 1;

    const allowExplainBtn = state.studyMode || state.submitted;
    el.explainToggle.classList.toggle("hidden", !allowExplainBtn);
    const shouldShowExp = (state.submitted || state.showExplanation) && allowExplainBtn;
    el.explanationBox.classList.toggle("hidden", !shouldShowExp);
    if (isDragDrop) {
      el.explanationBox.innerHTML = `<strong>Drag &amp; Drop Explanation:</strong> ${escapeHtml(q.explanation)}`;
    } else {
      el.explanationBox.innerHTML = `<strong>Correct Answer: ${q.correct}</strong> &mdash; ${escapeHtml(q.explanation)}`;
    }
    el.explainToggle.querySelector("span").textContent = shouldShowExp ? "Hide Answer Explanation" : "Show Answer Explanation";

    renderQuestionGrid();
    updateProgressIndicators();
  }

  function renderQuestionGrid() {
    const activeNum = state.examQuestions[state.currentQIdx]?.examNumber;
    el.questionGridCells.innerHTML = "";
    state.examQuestions.forEach((q, idx) => {
      const answered = isQuestionAnswered(q);
      const flagged = state.flagged.has(q.examNumber);
      const isDd = q.type === "drag-drop";

      if (state.gridFilter === "drag-drop" && !isDd) return;
      if (state.gridFilter === "unanswered" && answered) return;
      if (state.gridFilter === "flagged" && !flagged) return;
      if (/^\d\.0$/.test(state.gridFilter) && q.sectionCode !== state.gridFilter) return;

      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "q-cell";
      if (isDd) cell.classList.add("is-dd");
      if (answered) cell.classList.add("answered");
      if (flagged) cell.classList.add("flagged");
      if (state.submitted && !isQuestionCorrect(q)) {
        cell.classList.remove("answered");
        cell.classList.add("wrong-graded");
      }
      if (q.examNumber === activeNum) cell.classList.add("current");
      cell.textContent = q.examNumber;
      cell.title = `Q${q.examNumber}${isDd ? " [Drag & Drop]" : ""} — ${q.section} (${q.subtopic})`;
      cell.addEventListener("click", () => {
        state.currentQIdx = idx;
        state.showExplanation = false;
        state.ddSelectedItemId = null;
        renderQuestion();
      });
      el.questionGridCells.appendChild(cell);
    });
  }

  // ============================================================================
  // EXAM GRADING & SCORE REPORT
  // ============================================================================
  function gradeAndSubmitExam() {
    state.submitted = true;
    state.qaUnlocked = true;
    state.timerPaused = true;
    el.pauseTimerBtn.classList.add("paused");
    el.modeStatusLabel.textContent = "Graded";

    let correctMcq = 0;
    const sectionBreakdown = BLUEPRINT.map((bp) => {
      const qs = state.examQuestions.filter((q) => q.sectionCode === bp.code);
      const right = qs.filter(isQuestionCorrect).length;
      correctMcq += right;
      return { ...bp, total: qs.length, correct: right, pct: qs.length ? Math.round((right / qs.length) * 100) : 0 };
    });

    const ddQs = state.examQuestions.filter((q) => q.type === "drag-drop");
    const ddCorrect = ddQs.filter(isQuestionCorrect).length;

    const labsSolved = solvedLabsCount();
    const labsTotal = state.examLabs.length;
    const combinedRatio = (correctMcq / 100) * 0.8 + (labsSolved / labsTotal) * 0.2;
    const scaledScore = Math.round(300 + combinedRatio * 700);
    const passed = scaledScore >= 825;

    const hist = loadHistory();
    hist.unshift({
      attempt: state.attemptNumber,
      date: new Date().toLocaleString(),
      scaledScore,
      passed,
      correctMcq,
      labsSolved,
      labsTotal,
      sectionBreakdown,
    });
    saveHistory(hist);

    el.modalResultBadge.textContent = passed ? "PASS — CCNA CERTIFIED LEVEL" : "KEEP PRACTICING — TARGET 825";
    el.modalResultBadge.style.color = passed ? "#86efac" : "#fdba74";

    const barsHtml = sectionBreakdown
      .map(
        (s) => `
      <div class="bp-row">
        <div class="bp-top">
          <span><strong>${escapeHtml(s.name)}</strong> (${s.weight}%)</span>
          <span class="mono">${s.correct}/${s.total} (${s.pct}%)</span>
        </div>
        <div class="bp-bar-track">
          <div class="bp-bar-fill ${s.pct >= 80 ? "good" : s.pct < 60 ? "warn" : ""}" style="width:${s.pct}%"></div>
        </div>
      </div>`
      )
      .join("");

    el.scoreModalBody.innerHTML = `
      <div class="score-hero">
        <div class="score-hero-item">
          <span>Scaled Score (Pass: 825)</span>
          <strong class="${passed ? "text-green" : "text-orange"}">${scaledScore} / 1000</strong>
        </div>
        <div class="score-hero-item">
          <span>Packet Tracer Labs (6)</span>
          <strong class="text-green">${labsSolved} / ${labsTotal}</strong>
        </div>
        <div class="score-hero-item">
          <span>Written Q&amp;A (100 Qs)</span>
          <strong class="text-cisco">${correctMcq} / 100</strong>
          <span style="margin-top:2px;">Drag &amp; Drop: ${ddCorrect} / ${ddQs.length}</span>
        </div>
      </div>
      <div>
        <h3 class="card-h2" style="margin-bottom:10px;">Section-by-Section Performance</h3>
        <div class="blueprint-list">${barsHtml}</div>
      </div>
    `;

    el.scoreModal.classList.remove("hidden");
    renderQuestion();
    renderLab();
    renderDashboard();
    renderAnalytics();
  }

  // ============================================================================
  // DASHBOARD, 20-LAB CATALOG & ANALYTICS
  // ============================================================================
  function renderDashboard() {
    const hist = loadHistory();
    document.getElementById("kpiAttempts").textContent = String(hist.length);
    if (hist.length > 0) {
      const best = Math.max(...hist.map((h) => h.scaledScore));
      const passes = hist.filter((h) => h.passed).length;
      document.getElementById("kpiBestScore").textContent = `${best} / 1000`;
      document.getElementById("kpiPassRate").textContent = `${passes}/${hist.length} passing attempts (≥825)`;
    } else {
      document.getElementById("kpiBestScore").textContent = "—";
      document.getElementById("kpiPassRate").textContent = "Submit an exam to record your score";
    }

    document.getElementById("blueprintTable").innerHTML = BLUEPRINT.map(
      (b) => `
      <div class="bp-row">
        <div class="bp-top">
          <span><strong>${escapeHtml(b.name)}</strong></span>
          <span class="mono text-cisco">${b.weight}% &bull; ${b.poolCount} Pool &rarr; ${b.examCount}/Exam</span>
        </div>
        <div class="bp-bar-track"><div class="bp-bar-fill" style="width:${b.weight * 3.5}%"></div></div>
      </div>`
    ).join("");

    const histEl = document.getElementById("recentHistoryList");
    if (hist.length === 0) {
      histEl.innerHTML = `<div class="history-row"><div><strong>No submitted attempts yet</strong><div class="history-meta">Finish the 6 Packet Tracer labs + 100 questions and click "Submit Exam".</div></div></div>`;
    } else {
      histEl.innerHTML = hist
        .slice(0, 6)
        .map(
          (h) => `
        <div class="history-row">
          <div>
            <strong>Attempt #${h.attempt} &mdash; ${h.scaledScore} / 1000</strong>
            <div class="history-meta">${h.date} &bull; Labs: ${h.labsSolved}/${h.labsTotal} &bull; MCQ: ${h.correctMcq}/100</div>
          </div>
          <span class="pass-pill ${h.passed ? "pass" : "fail"}">${h.passed ? "PASS" : "REVIEW"}</span>
        </div>`
        )
        .join("");
    }
  }

  function renderLabCatalog() {
    const grid = document.getElementById("labCatalogGrid");
    const filtered = LAB_POOL.filter((l) => {
      if (state.labCatalogFilter === "passer") return l.passerTag.startsWith("Passer Lab");
      if (state.labCatalogFilter === "enterprise") return l.passerTag.startsWith("Enterprise Lab");
      if (state.labCatalogFilter === "blueprint") return l.passerTag.startsWith("Blueprint Lab");
      return true;
    });

    grid.innerHTML = "";
    filtered.forEach((lab) => {
      const card = document.createElement("div");
      card.className = "lab-catalog-card";
      card.innerHTML = `
        <div class="eyebrow-row">
          <span class="domain-badge">${escapeHtml(lab.id)}</span>
          <span class="lab-badge">${escapeHtml(lab.passerTag)}</span>
        </div>
        <h3>${escapeHtml(lab.title)}</h3>
        <p>${escapeHtml(lab.scenario)}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
          <span class="history-meta">${escapeHtml(lab.section)}</span>
          <button class="btn btn-primary" style="padding:6px 12px;font-size:12px;">Open in Packet Tracer &rarr;</button>
        </div>
      `;
      card.querySelector("button").addEventListener("click", () => {
        const existingIdx = state.examLabs.findIndex((x) => x.lab.id === lab.id);
        if (existingIdx >= 0) {
          state.currentLabIdx = existingIdx;
        } else {
          state.examLabs[state.currentLabIdx] = createLabSessionState(lab);
        }
        switchView("mock-exams");
        setExamPhase("labs");
        showToast(`Opened ${lab.id}: ${lab.title} in Packet Tracer.`);
      });
      grid.appendChild(card);
    });
  }

  function renderAnalytics() {
    document.getElementById("analyticsSectionBars").innerHTML = BLUEPRINT.map((bp) => {
      const qs = state.examQuestions.filter((q) => q.sectionCode === bp.code);
      const answered = qs.filter(isQuestionAnswered).length;
      const correct = qs.filter(isQuestionCorrect).length;
      const acc = answered > 0 ? Math.round((correct / answered) * 100) : 0;
      const fillPct = state.submitted || state.studyMode ? acc : Math.round((answered / qs.length) * 100);
      const label = state.submitted || state.studyMode
        ? `${correct}/${answered} correct (${answered}/${qs.length} answered)`
        : `${answered}/${qs.length} answered`;
      return `
        <div class="bp-row">
          <div class="bp-top">
            <span><strong>${escapeHtml(bp.name)}</strong> (${bp.weight}%)</span>
            <span class="mono">${label}</span>
          </div>
          <div class="bp-bar-track"><div class="bp-bar-fill ${fillPct >= 80 ? "good" : ""}" style="width:${fillPct}%"></div></div>
        </div>
      `;
    }).join("");

    document.getElementById("analyticsLabList").innerHTML = state.examLabs
      .map((ls, i) => {
        const done = isLabSolved(ls);
        const tag = done ? "DONE" : ls.skipped ? "SKIPPED" : "IN PROGRESS";
        return `
        <div class="history-row">
          <div>
            <strong>Lab ${i + 1}/6: ${escapeHtml(ls.lab.title)}</strong>
            <div class="history-meta">${escapeHtml(ls.lab.passerTag)} &bull; Devices: ${escapeHtml((ls.lab.devices || []).join(", "))}</div>
          </div>
          <span class="pass-pill ${done ? "pass" : "fail"}">${tag}</span>
        </div>`;
      })
      .join("");
  }

  function switchView(viewName) {
    state.activeView = viewName;
    document.querySelectorAll(".view-section").forEach((v) => v.classList.add("hidden"));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.remove("hidden");
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.view === viewName));
    if (viewName === "dashboard") renderDashboard();
    if (viewName === "virtual-labs") renderLabCatalog();
    if (viewName === "analytics") renderAnalytics();
  }

  // ============================================================================
  // EVENT BINDINGS
  // ============================================================================
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  // Phase Stepper Clicks
  el.stepPhaseLabs.addEventListener("click", () => setExamPhase("labs"));
  el.stepPhaseQa.addEventListener("click", () => {
    if (!allLabsVisitedOrDone()) {
      showToast("Complete the 6 Packet Tracer labs first — or use 'Next Lab (Skip) >' / 'Proceed Directly to 100-Question Q&A' if you can't finish them.");
      return;
    }
    setExamPhase("qa");
  });

  // Lab Progression Buttons (Next Lab / Skip -> Proceeds to 100Q Exam after Lab 6!)
  el.prevLabBtn.addEventListener("click", () => {
    if (state.currentLabIdx > 0) {
      state.currentLabIdx--;
      renderLab();
    }
  });

  el.nextLabBtn.addEventListener("click", () => {
    const currentLs = state.examLabs[state.currentLabIdx];
    if (currentLs && !isLabSolved(currentLs)) {
      currentLs.skipped = true;
    }
    if (state.currentLabIdx < state.examLabs.length - 1) {
      state.currentLabIdx++;
      renderLab();
      if (currentLs && currentLs.skipped) {
        showToast(`Moved to Lab ${state.currentLabIdx + 1}/6 (previous lab marked skipped — you can revisit it anytime).`);
      }
    } else {
      state.qaUnlocked = true;
      setExamPhase("qa");
      showToast(`Now starting Part 2: 100 Weighted CCNA Questions (${solvedLabsCount()}/6 labs solved).`);
    }
  });

  el.jumpToQaBtn.addEventListener("click", () => {
    state.examLabs.forEach((ls) => {
      if (!isLabSolved(ls)) ls.skipped = true;
    });
    state.qaUnlocked = true;
    setExamPhase("qa");
    showToast(`Proceeded to Part 2: 100-Question Q&A (${solvedLabsCount()}/6 labs completed).`);
  });

  document.getElementById("backToLabsBtn").addEventListener("click", () => setExamPhase("labs"));

  // Packet Tracer Toolbar Tools
  el.ptToolSelect.addEventListener("click", () => {
    state.ptTool = "select";
    el.ptToolSelect.classList.add("active");
    el.ptToolPdu.classList.remove("active");
    el.ptPduStatus.textContent = "Select tool active — click any device on the canvas to inspect or configure it.";
  });
  el.ptToolPdu.addEventListener("click", () => {
    state.ptTool = "pdu";
    el.ptToolPdu.classList.add("active");
    el.ptToolSelect.classList.remove("active");
    el.ptPduStatus.innerHTML = "<strong>Simple PDU Mode</strong> — click any target device on the Logical Workspace to send a test ICMP ping.";
  });
  el.ptFastForwardBtn.addEventListener("click", () => {
    state.simElapsedSeconds += 30;
    el.ptSimClock.textContent = formatTime(state.simElapsedSeconds);
    showToast("Packet Tracer Fast Forward (+30s): STP / OSPF timers converged.");
  });

  // Device Dialog Tabs (CLI | Config | Physical | Desktop)
  document.getElementById("ptDeviceTabs").addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".pt-dtab");
    if (!tabBtn) return;
    state.ptDeviceTab = tabBtn.dataset.dtab;
    document.querySelectorAll(".pt-dtab").forEach((b) => b.classList.toggle("active", b === tabBtn));
    ["cli", "config", "physical", "desktop"].forEach((name) => {
      document.getElementById(`dtab-${name}`).classList.toggle("hidden", name !== state.ptDeviceTab);
    });
    if (state.ptDeviceTab === "cli") el.cliHiddenInput.focus();
  });

  // CLI Keyboard & Quick Actions (Authentic Cisco IOS '?' immediate help + Tab auto-complete)
  el.cliBody.addEventListener("click", () => el.cliHiddenInput.focus());
  el.cliHiddenInput.addEventListener("input", () => {
    el.cliTyped.textContent = el.cliHiddenInput.value;
  });
  el.cliHiddenInput.addEventListener("keydown", (e) => {
    const ls = state.examLabs[state.currentLabIdx];
    if (e.key === "?") {
      e.preventDefault();
      showContextHelp(el.cliHiddenInput.value);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const updated = tryTabAutocomplete(el.cliHiddenInput.value);
      el.cliHiddenInput.value = updated;
      el.cliTyped.textContent = updated;
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const val = el.cliHiddenInput.value;
      el.cliHiddenInput.value = "";
      el.cliTyped.textContent = "";
      executeCliCommand(val);
    } else if (e.key === "ArrowUp" && ls) {
      const sess = getActiveSession(ls);
      if (sess && sess.cmdHistory.length > 0) {
        e.preventDefault();
        sess.cmdCursor = Math.max(0, sess.cmdCursor - 1);
        el.cliHiddenInput.value = sess.cmdHistory[sess.cmdCursor] || "";
        el.cliTyped.textContent = el.cliHiddenInput.value;
      }
    } else if (e.key === "ArrowDown" && ls) {
      const sess = getActiveSession(ls);
      if (sess && sess.cmdHistory.length > 0) {
        e.preventDefault();
        sess.cmdCursor = Math.min(sess.cmdHistory.length, sess.cmdCursor + 1);
        el.cliHiddenInput.value = sess.cmdHistory[sess.cmdCursor] || "";
        el.cliTyped.textContent = el.cliHiddenInput.value;
      }
    }
  });

  document.getElementById("ptHelpQueryBtn").addEventListener("click", () => {
    const cliTabBtn = document.querySelector('.pt-dtab[data-dtab="cli"]');
    if (cliTabBtn) cliTabBtn.click();
    showContextHelp(el.cliHiddenInput.value);
  });

  function toggleLabCorrectConfigs() {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls) return;
    ls.showConfigs = !ls.showConfigs;
    renderCorrectConfigsPanel(ls);
    if (ls.showConfigs && el.ptCorrectConfigsBox) {
      el.ptCorrectConfigsBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
  if (el.ptShowConfigsBtn) el.ptShowConfigsBtn.addEventListener("click", toggleLabCorrectConfigs);
  if (el.ptRevealConfigsBtn) el.ptRevealConfigsBtn.addEventListener("click", toggleLabCorrectConfigs);

  el.cliVerifyBtn.addEventListener("click", () => executeCliCommand("verify"));
  el.cliSolutionBtn.addEventListener("click", () => {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls) return;
    const sols = ls.lab.solutions || {};
    Object.entries(sols).forEach(([devName, cmds]) => {
      const sess = ls.deviceSessions[devName];
      if (sess) {
        if (sess.mode === "user") executeCliCommand("enable", devName);
        if (sess.mode === "priv") executeCliCommand("configure terminal", devName);
        else if (sess.mode.startsWith("config-")) executeCliCommand("exit", devName);
      }
      cmds.forEach((cmd) => executeCliCommand(cmd, devName));
    });
    renderLab();
    renderAnalytics();
    showToast(`✓ DONE! Applied multi-device solution across ${Object.keys(sols).join(", ")} — review each device via 'do sh run'.`);
  });
  el.resetLabBtn.addEventListener("click", () => {
    const currentLab = state.examLabs[state.currentLabIdx].lab;
    state.examLabs[state.currentLabIdx] = createLabSessionState(currentLab);
    renderLab();
    showToast(`Reset Lab ${state.currentLabIdx + 1}: ${currentLab.title}.`);
  });

  // Q&A Navigation
  el.prevBtn.addEventListener("click", () => {
    if (state.currentQIdx > 0) {
      state.currentQIdx--;
      state.showExplanation = false;
      state.ddSelectedItemId = null;
      renderQuestion();
    }
  });
  el.nextBtn.addEventListener("click", () => {
    if (state.currentQIdx < state.examQuestions.length - 1) {
      state.currentQIdx++;
      state.showExplanation = false;
      state.ddSelectedItemId = null;
      renderQuestion();
    }
  });
  el.reviewBtn.addEventListener("click", () => {
    const num = state.examQuestions[state.currentQIdx].examNumber;
    if (state.flagged.has(num)) state.flagged.delete(num);
    else state.flagged.add(num);
    renderQuestion();
  });
  el.explainToggle.addEventListener("click", () => {
    state.showExplanation = !state.showExplanation;
    renderQuestion();
  });
  el.toggleNavigatorBtn.addEventListener("click", () => {
    const isHidden = el.questionGridDrawer.classList.toggle("hidden");
    el.toggleNavigatorBtn.textContent = isHidden ? "100-Q Grid ▾" : "100-Q Grid ▴";
  });

  document.getElementById("gridFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    document.querySelectorAll("#gridFilters .filter-chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    state.gridFilter = btn.dataset.filter;
    renderQuestionGrid();
  });

  document.getElementById("labCatalogFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    document.querySelectorAll("#labCatalogFilters .filter-chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    state.labCatalogFilter = btn.dataset.labfilter;
    renderLabCatalog();
  });

  // Countdown + Packet Tracer Realtime Clock
  setInterval(() => {
    if (!state.timerPaused && state.secondsRemaining > 0) {
      state.secondsRemaining -= 1;
      state.simElapsedSeconds += 1;
      el.timerDisplay.textContent = formatTime(state.secondsRemaining);
      el.ptSimClock.textContent = formatTime(state.simElapsedSeconds);
      if (state.secondsRemaining === 0 && !state.submitted) {
        gradeAndSubmitExam();
      }
    }
  }, 1000);

  el.pauseTimerBtn.addEventListener("click", () => {
    state.timerPaused = !state.timerPaused;
    el.pauseTimerBtn.classList.toggle("paused", state.timerPaused);
    showToast(state.timerPaused ? "Countdown paused." : "Countdown resumed.");
  });

  // Global Actions
  document.getElementById("newExamBtn").addEventListener("click", () => startNewExam(false));
  document.getElementById("dashStartExamBtn").addEventListener("click", () => startNewExam(false));
  document.getElementById("analyticsGoExamBtn").addEventListener("click", () => switchView("mock-exams"));
  document.getElementById("submitExamBtn").addEventListener("click", gradeAndSubmitExam);

  document.getElementById("closeModalBtn").addEventListener("click", () => el.scoreModal.classList.add("hidden"));
  document.getElementById("modalReviewBtn").addEventListener("click", () => {
    el.scoreModal.classList.add("hidden");
    setExamPhase("qa");
  });
  document.getElementById("modalNewExamBtn").addEventListener("click", () => {
    el.scoreModal.classList.add("hidden");
    startNewExam(false);
  });

  document.getElementById("studyModeToggle").addEventListener("change", (e) => {
    state.studyMode = e.target.checked;
    el.modeStatusLabel.textContent = state.submitted ? "Graded" : state.studyMode ? "Active (Study)" : "Active (Strict)";
    renderQuestion();
    renderLab();
    showToast(state.studyMode ? "Study Mode enabled." : "Strict Exam Mode enabled.");
  });

  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    renderDashboard();
    showToast("Cleared saved exam history.");
  });

  document.getElementById("resetDeckBtn").addEventListener("click", () => {
    localStorage.removeItem(SEEN_Q_KEY);
    localStorage.removeItem(SEEN_DD_KEY);
    localStorage.removeItem(SEEN_LAB_KEY);
    updateUnseenDeckLabel();
    showToast(`Unseen ${QUESTION_POOL.length.toLocaleString()}-MCQ, ${DRAG_DROP_POOL.length}-Drag & Drop & ${LAB_POOL.length}-lab deck reset! Click 'New Exam' for a fresh draw.`);
  });

  // Boot Exam -> Part 1: Lab 1 of 6 (Cisco Packet Tracer)
  startNewExam(true);
})();
