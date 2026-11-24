(() => {
  const QUESTION_POOL = window.CCNA_QUESTION_POOL || [];
  const LAB_POOL = window.CCNA_LAB_POOL || [];
  const BLUEPRINT = window.CCNA_BLUEPRINT || [];
  const HISTORY_KEY = "ccna_200_301_exam_history_v1";

  function shuffleCopy(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Draw 100 weighted questions (20/20/25/10/15/10) from the 1,000-question pool
  function drawWeighted100Questions() {
    const drawn = [];
    BLUEPRINT.forEach((sec) => {
      const bucket = QUESTION_POOL.filter((q) => q.sectionCode === sec.code);
      drawn.push(...shuffleCopy(bucket).slice(0, sec.examCount));
    });
    return shuffleCopy(drawn).map((q, index) => ({ ...q, examNumber: index + 1 }));
  }

  // Draw 6 unique labs from the 20-lab pool (at least 4 passer labs + 2 blueprint labs)
  function draw6Labs() {
    const passerLabs = shuffleCopy(LAB_POOL.filter((l) => l.passerTag.startsWith("Passer Lab")));
    const blueprintLabs = shuffleCopy(LAB_POOL.filter((l) => !l.passerTag.startsWith("Passer Lab")));
    const selected = shuffleCopy([...passerLabs.slice(0, 4), ...blueprintLabs.slice(0, 2)]);
    return selected.map((lab) => createLabSessionState(lab));
  }

  function createLabSessionState(lab) {
    const completedIds = new Set();
    lab.objectives.forEach((o) => {
      if (o.preCompleted) completedIds.add(o.id);
    });
    const iosBanner = [
      {
        type: "out",
        text: `Cisco IOS Software, ${lab.deviceName} Virtual Lab (${lab.id}) — Packet Tracer Engine\nPress RETURN or type Cisco IOS commands below.`,
      },
      ...lab.initialHistory.map((h) => ({ ...h, type: "cmd" })),
    ];
    const primaryNode = lab.nodes.find((n) => n.selected) || lab.nodes[0];
    return {
      lab,
      mode: lab.initialMode || "config",
      prompt: lab.initialPrompt || `${lab.deviceName}(config)#`,
      history: iosBanner,
      completedIds,
      skipped: false,
      selectedNodeId: primaryNode ? primaryNode.id : "N1",
      cmdHistory: [],
      cmdCursor: -1,
    };
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
    ptCompletionPct: document.getElementById("ptCompletionPct"),
    ptCompletionBar: document.getElementById("ptCompletionBar"),
    ptSkipNotice: document.getElementById("ptSkipNotice"),
    ptConfigPane: document.getElementById("ptConfigPane"),
    ptPhysicalPane: document.getElementById("ptPhysicalPane"),
    ptDesktopPane: document.getElementById("ptDesktopPane"),
    labPasserBadge: document.getElementById("labPasserBadge"),
    labOverallPill: document.getElementById("labOverallPill"),
    labTitle: document.getElementById("labTitle"),
    labTabs: document.getElementById("labTabs"),
    labScenarioText: document.getElementById("labScenarioText"),
    labObjectives: document.getElementById("labObjectives"),
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
    resetLabBtn: document.getElementById("resetLabBtn"),
    prevLabBtn: document.getElementById("prevLabBtn"),
    nextLabBtn: document.getElementById("nextLabBtn"),
    jumpToQaBtn: document.getElementById("jumpToQaBtn"),
    // Q&A Elements
    examTitle: document.getElementById("examTitle"),
    domainBadge: document.getElementById("domainBadge"),
    subtopicBadge: document.getElementById("subtopicBadge"),
    flaggedBadge: document.getElementById("flaggedBadge"),
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
    const qDone = Object.keys(state.answers).length;
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

    el.examTitle.textContent = `CCNA 200-301 Practice Exam #${state.attemptNumber} — Part 2: Written Q&A`;
    el.timerDisplay.textContent = formatTime(state.secondsRemaining);
    el.pauseTimerBtn.classList.remove("paused");
    el.modeStatusLabel.textContent = state.studyMode ? "Active (Study)" : "Active (Strict)";

    setExamPhase("labs");
    renderDashboard();
    renderAnalytics();
    switchView("mock-exams");
    if (!silent) {
      showToast("Started new exam: Part 1 loads 6 Packet Tracer labs first, followed by 100 weighted questions.");
    }
  }

  function updateProgressIndicators() {
    const answeredCount = Object.keys(state.answers).length;
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
    const compPct = Math.round((ls.completedIds.size / lab.objectives.length) * 100);
    const isLastLab = state.currentLabIdx === state.examLabs.length - 1;

    el.ptWindowTitle.textContent = `Cisco Packet Tracer — Lab ${state.currentLabIdx + 1} of ${state.examLabs.length}: ${lab.title} (.pka)`;
    el.labPasserBadge.textContent = lab.passerTag;
    el.labOverallPill.textContent = `${solvedLabsCount()}/${state.examLabs.length} Solved`;
    el.labTitle.textContent = `Lab ${state.currentLabIdx + 1} of ${state.examLabs.length}: ${lab.title}`;
    el.topoCaption.textContent = `Root / ${lab.id} (${lab.section})`;
    el.labScenarioText.textContent = lab.scenario;

    el.ptCompletionPct.textContent = `${compPct}%`;
    el.ptCompletionBar.style.width = `${compPct}%`;

    // 6-Lab Switcher Pills in PT Titlebar
    el.labTabs.innerHTML = "";
    state.examLabs.forEach((item, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      const s = isLabSolved(item);
      btn.className = `lab-tab${i === state.currentLabIdx ? " active" : ""}${s ? " solved" : item.skipped ? " skipped" : ""}`;
      btn.innerHTML = `<span>Lab ${i + 1}</span>${s ? "<span>✓</span>" : item.skipped ? "<span>⏭</span>" : ""}`;
      btn.title = `${item.lab.title} (${item.completedIds.size}/${item.lab.objectives.length})`;
      btn.addEventListener("click", () => {
        state.currentLabIdx = i;
        renderLab();
      });
      el.labTabs.appendChild(btn);
    });

    // Objectives Checklist
    el.labObjectives.innerHTML = "";
    lab.objectives.forEach((obj) => {
      const done = ls.completedIds.has(obj.id);
      const row = document.createElement("div");
      row.className = `obj-item${done ? " done" : ""}`;
      row.innerHTML = `<span class="obj-check">${done ? "✓" : ""}</span><span>${escapeHtml(obj.text)}</span>`;
      el.labObjectives.appendChild(row);
    });

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

    // CLI History
    el.cliHistory.innerHTML = "";
    ls.history.forEach((line) => {
      const div = document.createElement("div");
      div.className = "cli-line";
      if (line.type === "cmd") {
        div.innerHTML = `<span class="cli-prompt">${escapeHtml(line.prompt)}</span> <span class="cli-cmd">${escapeHtml(line.cmd)}</span>`;
      } else {
        div.innerHTML = `<span class="cli-out ${line.cls || ""}">${escapeHtml(line.text)}</span>`;
      }
      el.cliHistory.appendChild(div);
    });
    el.cliActivePrompt.textContent = ls.prompt;
    el.cliTyped.textContent = "";
    el.cliHiddenInput.value = "";
    el.cliBody.scrollTop = el.cliBody.scrollHeight;

    el.cliSolutionBtn.classList.toggle("hidden", !state.studyMode && !state.submitted);
    updateProgressIndicators();
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

    // Draw Authentic Cisco Packet Tracer Device Icons
    lab.nodes.forEach((nd) => {
      const p = nodePos[nd.id];
      const isSelected = ls.selectedNodeId === nd.id;
      svg += `<g class="pt-node${isSelected ? " selected" : ""}" data-nodeid="${nd.id}" transform="translate(${p.cx}, ${p.cy})">`;
      svg += `<rect class="pt-node-halo" x="-48" y="-34" width="96" height="84" rx="10" />`;
      svg += getCiscoPtDeviceSvg(nd.type);
      // Label Pill underneath icon (classic Packet Tracer clean typography)
      svg += `<text x="0" y="32" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="700">${escapeHtml(nd.label)}</text>`;
      svg += `<text x="0" y="45" text-anchor="middle" fill="#475569" font-size="9.5" font-family="monospace" font-weight="600">${escapeHtml(nd.sub)}</text>`;
      svg += `</g>`;
    });

    el.topologySvg.innerHTML = svg;

    // Bind Click on Devices (Select device -> open its CLI/Config OR send Simple PDU ping!)
    el.topologySvg.querySelectorAll(".pt-node").forEach((g) => {
      g.addEventListener("click", () => {
        const nd = lab.nodes.find((n) => n.id === g.dataset.nodeid);
        if (!nd) return;
        ls.selectedNodeId = nd.id;
        if (state.ptTool === "pdu") {
          const ok = isLabSolved(ls) || nd.status !== "red";
          el.ptPduStatus.innerHTML = `<strong>Simple PDU (ICMP)</strong> to <strong>${escapeHtml(nd.label)}</strong> (${escapeHtml(nd.sub)}): <span style="color:${ok ? "#4ade80" : "#f87171"};font-weight:700">${ok ? "Successful (TTL=255, 1ms)" : "Failed — Check Lab Configuration"}</span>`;
          showToast(`PDU Ping to ${nd.label}: ${ok ? "Successful" : "Failed (policy/config incomplete)"}`);
        } else {
          el.ptPduStatus.innerHTML = `Selected <strong>${escapeHtml(nd.label)}</strong> (${escapeHtml(nd.sub)}) &mdash; Viewing <strong>${state.ptDeviceTab.toUpperCase()}</strong> tab below.`;
        }
        renderPacketTracerCanvas(ls);
        renderDevicePanes(ls);
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
    el.cliDeviceTitle.textContent = `${nd ? nd.label : lab.deviceName} — Cisco Packet Tracer Device Window (${lab.deviceName} Console Active)`;

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
          ? `C:\\> ping ${nd ? nd.sub : "10.10.10.1"}\nReply from ${nd ? nd.sub : "10.10.10.1"}: bytes=32 time=1ms TTL=128\nReply from ${nd ? nd.sub : "10.10.10.1"}: bytes=32 time<1ms TTL=128\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss) — Lab Verified!`
          : `C:\\> ping ${nd ? nd.sub : "10.10.10.1"}\nRequest timed out.\nNote: Complete all ${lab.objectives.length} configuration objectives in the CLI tab (${ls.completedIds.size}/${lab.objectives.length} done).`;
      };
    }
    if (ipBtn) {
      ipBtn.onclick = () => {
        outPre.textContent = `Device: ${nd ? nd.label : lab.deviceName}\nAddress / Role: ${nd ? nd.sub : "Default"}\nLab Section: ${lab.section}\nObjectives Satisfied: ${ls.completedIds.size}/${lab.objectives.length}`;
      };
    }
  }

  // ============================================================================
  // CISCO PACKET TRACER CONTEXT-SENSITIVE '?' HELPER & TAB COMPLETION TREE
  // ============================================================================
  const IOS_HELP_TREES = {
    priv: {
      configure: { desc: "Enter configuration mode", sub: { terminal: { desc: "Configure from the terminal <cr>" } } },
      show: {
        desc: "Show running system information",
        sub: {
          "running-config": { desc: "Current operating configuration <cr>" },
          "ip": {
            desc: "IP information",
            sub: {
              "interface": { desc: "IP interface status and configuration", sub: { brief: { desc: "Brief summary of IP status <cr>" } } },
              "route": { desc: "IP routing table <cr>" },
              "ospf": { desc: "OSPF information", sub: { neighbor: { desc: "OSPF neighbor list <cr>" } } },
              "nat": { desc: "IP NAT information", sub: { translations: { desc: "Translation entries <cr>" } } },
              "dhcp": { desc: "DHCP information", sub: { snooping: { desc: "DHCP snooping status <cr>" }, binding: { desc: "DHCP address bindings <cr>" } } },
              "arp": { desc: "ARP information", sub: { inspection: { desc: "Dynamic ARP inspection status <cr>" } } },
            },
          },
          "vlan": { desc: "VTP VLAN status", sub: { brief: { desc: "Brief VLAN summary <cr>" } } },
          "interfaces": { desc: "Interface status and configuration", sub: { trunk: { desc: "Show trunk interfaces <cr>" }, status: { desc: "Show interface line status <cr>" } } },
          "etherchannel": { desc: "EtherChannel information", sub: { summary: { desc: "One-line summary per channel-group <cr>" } } },
          "spanning-tree": { desc: "Spanning tree topology <cr>" },
          "cdp": { desc: "CDP information", sub: { neighbors: { desc: "CDP neighbor entries <cr>" } } },
          "lldp": { desc: "LLDP information", sub: { neighbors: { desc: "LLDP neighbor entries <cr>" } } },
          "ntp": { desc: "NTP information", sub: { status: { desc: "NTP synchronization status <cr>" } } },
          "access-lists": { desc: "List access lists <cr>" },
          "standby": { desc: "HSRP information", sub: { brief: { desc: "Brief HSRP status <cr>" } } },
        },
      },
      verify: { desc: "Run Packet Tracer lab verification check <cr>" },
      clear: { desc: "Clear terminal screen <cr>" },
    },
    config: {
      "access-list": {
        desc: "Add an access list entry",
        sub: {
          "<1-99>": { desc: "IP standard access list", sub: { permit: { desc: "Specify packets to forward <ip> <wildcard>" }, deny: { desc: "Specify packets to reject <ip> <wildcard>" } } },
          "<100-199>": { desc: "IP extended access list", sub: { permit: { desc: "Specify packets to forward <tcp|udp|ip> <src> <dst>" }, deny: { desc: "Specify packets to reject <tcp|udp|ip> <src> <dst> eq <port>" } } },
        },
      },
      interface: {
        desc: "Select an interface to configure",
        sub: {
          gigabitethernet: { desc: "GigabitEthernet IEEE 802.3z (e.g. 0/0, 0/1, 0/0.10)" },
          fastethernet: { desc: "FastEthernet IEEE 802.3 (e.g. 0/1, 0/2, 0/3, 0/5)" },
          "port-channel": { desc: "Ethernet Channel of interfaces (e.g. 1)" },
          range: { desc: "Interface range command", sub: { gigabitethernet: { desc: "Range of GigabitEthernet ports (e.g. 0/1 - 2)" }, fastethernet: { desc: "Range of FastEthernet ports (e.g. 0/1 - 5)" } } },
        },
      },
      ip: {
        desc: "Global IP configuration subcommands",
        sub: {
          "access-list": { desc: "Named access-list", sub: { standard: { desc: "Standard Access List <name>" }, extended: { desc: "Extended Access List <name>" } } },
          "arp": { desc: "Global ARP configuration", sub: { inspection: { desc: "Dynamic ARP Inspection (DAI)", sub: { vlan: { desc: "Enable DAI on VLAN <vlan-id>" }, validate: { desc: "Validate addresses: src-mac dst-mac ip" } } } } },
          "dhcp": {
            desc: "Configure DHCP server and relay/snooping parameters",
            sub: {
              "excluded-address": { desc: "Prevent DHCP from assigning IP range <low-ip> <high-ip>" },
              pool: { desc: "Configure DHCP address pool <pool-name>" },
              snooping: { desc: "DHCP Snooping (<cr> to enable globally)", sub: { vlan: { desc: "Enable DHCP Snooping on VLAN <vlan-id>" }, "<cr>": { desc: "Enable DHCP Snooping globally" } } },
            },
          },
          "domain-name": { desc: "Define default domain name (e.g. corp.local)" },
          "http": { desc: "HTTP server configuration", sub: { "secure-server": { desc: "Enable HTTPS server for RESTCONF <cr>" } } },
          nat: {
            desc: "NAT configuration commands",
            sub: {
              inside: {
                desc: "Inside address translation",
                sub: {
                  source: {
                    desc: "Source address translation",
                    sub: {
                      list: { desc: "Specify access list <acl-num> interface <int> overload" },
                      static: { desc: "Specify static local->global mapping <local-ip> <global-ip>" },
                    },
                  },
                },
              },
            },
          },
          route: { desc: "Establish static routes (<dest> <mask> <next-hop> [AD])" },
          routing: { desc: "Enable IP routing <cr>" },
          ssh: { desc: "Configure SSH options", sub: { version: { desc: "Specify protocol version (2)" } } },
        },
      },
      ipv6: {
        desc: "Global IPv6 configuration commands",
        sub: {
          "unicast-routing": { desc: "Enable unicast IPv6 routing <cr>" },
          route: { desc: "Configure static IPv6 route (e.g. ::/0 <next-hop>)" },
        },
      },
      line: { desc: "Configure a terminal line", sub: { vty: { desc: "Virtual terminal (e.g. 0 15)" }, console: { desc: "Primary terminal line (0)" } } },
      lldp: { desc: "Global LLDP configuration subcommands", sub: { run: { desc: "Enable LLDP globally <cr>" } } },
      "netconf-yang": { desc: "Enable NETCONF YANG server over SSH port 830 <cr>" },
      no: { desc: "Negate a command or set its defaults", sub: { cdp: { desc: "Disable CDP globally (run)" }, "ip": { desc: "Negate IP configuration" } } },
      ntp: {
        desc: "Configure Network Time Protocol (NTP)",
        sub: {
          authenticate: { desc: "Authenticate time sources <cr>" },
          "authentication-key": { desc: "Authentication key (<key-id> md5 <secret>)" },
          "trusted-key": { desc: "Key numbers for trusted time sources (<key-id>)" },
          server: { desc: "Configure NTP server (<ip-address> [key <id>])" },
        },
      },
      restconf: { desc: "Enable RESTCONF HTTPS API server <cr>" },
      router: { desc: "Enable a routing process", sub: { ospf: { desc: "Open Shortest Path First (<process-id>)" } } },
      "spanning-tree": {
        desc: "Spanning Tree Subsystem",
        sub: {
          mode: { desc: "Spanning tree operating mode", sub: { "rapid-pvst": { desc: "Rapid Per-VLAN Spanning Tree <cr>" }, pvst: { desc: "Per-VLAN Spanning Tree <cr>" } } },
          vlan: { desc: "VLAN Switch Spanning Tree (<vlan-id> root primary|secondary)" },
        },
      },
      vlan: { desc: "Configure a VLAN (<1-4094>)" },
      do: { desc: "Run privileged EXEC command (e.g. do show run)" },
      exit: { desc: "Exit from configure mode <cr>" },
      end: { desc: "Return to privileged EXEC mode <cr>" },
    },
    "config-if": {
      "channel-group": { desc: "EtherChannel/port bundling (<1-64> mode active|passive|desirable|auto|on)" },
      encapsulation: { desc: "Set encapsulation type for subinterface", sub: { dot1q: { desc: "IEEE 802.1Q Virtual LAN (<vlan-id>)" } } },
      ip: {
        desc: "Interface IP configuration subcommands",
        sub: {
          "access-group": { desc: "Specify access control for packets (<acl> in|out)" },
          address: { desc: "Set the IPv4 address of an interface (<ip> <mask>)" },
          "arp": { desc: "ARP interface config", sub: { inspection: { desc: "Dynamic ARP Inspection", sub: { trust: { desc: "Configure interface as DAI trusted <cr>" } } } } },
          dhcp: {
            desc: "DHCP interface config",
            sub: {
              snooping: {
                desc: "DHCP Snooping interface options",
                sub: {
                  trust: { desc: "Trust DHCP server replies on this port <cr>" },
                  limit: { desc: "DHCP Snooping limit", sub: { rate: { desc: "Packets per second (e.g. 15)" } } },
                },
              },
            },
          },
          "helper-address": { desc: "Specify a destination DHCP relay address (<ip>)" },
          nat: { desc: "NAT interface commands", sub: { inside: { desc: "Inside interface for address translation <cr>" }, outside: { desc: "Outside interface for address translation <cr>" } } },
          ospf: { desc: "OSPF interface commands", sub: { priority: { desc: "Router DR election priority (<0-255>)" }, "<process-id>": { desc: "Enable OSPF process on interface (area <area-id>)" } } },
        },
      },
      ipv6: { desc: "IPv6 interface subcommands", sub: { address: { desc: "Configure IPv6 address (<prefix/len> or <fe80::1 link-local>)" } } },
      lldp: { desc: "LLDP interface subcommands", sub: { transmit: { desc: "Enable LLDP transmission on interface <cr>" }, receive: { desc: "Enable LLDP reception on interface <cr>" } } },
      no: {
        desc: "Negate a command or bring interface up",
        sub: {
          shutdown: { desc: "Restart / enable the interface <cr>" },
          cdp: { desc: "Disable CDP on this interface", sub: { enable: { desc: "Disable CDP on interface <cr>" } } },
          switchport: { desc: "Convert switchport to Layer 3 routed port <cr>" },
        },
      },
      shutdown: { desc: "Shutdown the selected interface <cr>" },
      "spanning-tree": {
        desc: "Spanning Tree interface options",
        sub: {
          portfast: { desc: "Enable edge PortFast immediately <cr>" },
          bpduguard: { desc: "Prevent BPDUs on edge port", sub: { enable: { desc: "Enable BPDU Guard on this interface <cr>" } } },
        },
      },
      standby: {
        desc: "HSRP interface configuration commands",
        sub: {
          version: { desc: "HSRP version (1 or 2)" },
          "<group>": { desc: "HSRP group number (ip <vip> | priority <0-255> | preempt)" },
        },
      },
      switchport: {
        desc: "Set switching mode characteristics",
        sub: {
          mode: { desc: "Set trunking mode", sub: { access: { desc: "Static access port <cr>" }, trunk: { desc: "Static 802.1Q trunk <cr>" } } },
          access: { desc: "Set access mode characteristics", sub: { vlan: { desc: "Set VLAN when in access mode (<vlan-id>)" } } },
          voice: { desc: "Voice appliance attributes", sub: { vlan: { desc: "Vlan for voice traffic (<vlan-id>)" } } },
          trunk: {
            desc: "Set trunking characteristics",
            sub: {
              native: { desc: "Set trunking native characteristics", sub: { vlan: { desc: "Set native VLAN (<vlan-id>)" } } },
              allowed: { desc: "Set allowed VLANs", sub: { vlan: { desc: "Allowed VLAN list (<vlan-list>)" } } },
            },
          },
          "port-security": {
            desc: "Security related command (<cr> to enable)",
            sub: {
              maximum: { desc: "Max secure addresses (<1-132>)" },
              "mac-address": { desc: "Secure mac address", sub: { sticky: { desc: "Configure dynamic secure addresses as sticky <cr>" } } },
              violation: { desc: "Security violation mode", sub: { protect: { desc: "Drop silently" }, restrict: { desc: "Drop + log/count" }, shutdown: { desc: "Err-disable port" } } },
              "<cr>": { desc: "Enable port-security on interface" },
            },
          },
          nonegotiate: { desc: "Disable DTP negotiation frames <cr>" },
        },
      },
      exit: { desc: "Exit interface configuration mode <cr>" },
      end: { desc: "Return to privileged EXEC mode <cr>" },
    },
    "config-vlan": {
      name: { desc: "ASCII name of the VLAN (e.g. SALES)" },
      exit: { desc: "Apply changes and exit VLAN mode <cr>" },
      end: { desc: "Return to privileged EXEC mode <cr>" },
    },
    "config-router": {
      "router-id": { desc: "OSPF router-id in IPv4 format (e.g. 1.1.1.1)" },
      network: { desc: "Enable routing on an IP network (<net> <wildcard> area <id>)" },
      "passive-interface": { desc: "Suppress OSPF Hellos on an interface (<int>)" },
      "default-information": { desc: "Control distribution of default information", sub: { originate: { desc: "Distribute a default route <cr>" } } },
      "auto-cost": { desc: "Calculate OSPF cost according to bandwidth", sub: { "reference-bandwidth": { desc: "Reference bandwidth in Mbps" } } },
      exit: { desc: "Exit OSPF router configuration mode <cr>" },
      end: { desc: "Return to privileged EXEC mode <cr>" },
    },
    "config-acl": {
      permit: { desc: "Specify packets to forward (<ip> <wildcard> | any | host <ip>)" },
      deny: { desc: "Specify packets to reject (<ip> <wildcard> | any | host <ip>)" },
      exit: { desc: "Exit ACL configuration mode <cr>" },
      end: { desc: "Return to privileged EXEC mode <cr>" },
    },
    "config-line": {
      "access-class": { desc: "Filter connections based on an IP access list (<acl> in|out)" },
      transport: { desc: "Define transport protocols for line", sub: { input: { desc: "Define incoming protocols", sub: { ssh: { desc: "Allow SSH only <cr>" }, all: { desc: "Allow all protocols <cr>" }, none: { desc: "Block all protocols <cr>" } } } } },
      login: { desc: "Enable password checking", sub: { local: { desc: "Local username/password checking <cr>" } } },
      "exec-timeout": { desc: "Set the EXEC timeout (<minutes> <seconds>)" },
      exit: { desc: "Exit line configuration mode <cr>" },
      end: { desc: "Return to privileged EXEC mode <cr>" },
    },
    "config-dhcp": {
      network: { desc: "Network number and mask (<net> <mask>)" },
      "default-router": { desc: "Default gateway router IP (<ip>)" },
      "dns-server": { desc: "DNS server IP address (<ip>)" },
      "domain-name": { desc: "Domain name for DHCP clients (<name>)" },
      exit: { desc: "Exit DHCP pool configuration mode <cr>" },
      end: { desc: "Return to privileged EXEC mode <cr>" },
    },
  };

  function resolveIosContext(mode, rawInput) {
    const root = IOS_HELP_TREES[mode] || IOS_HELP_TREES.config;
    const hasTrailingSpace = /\s$/.test(rawInput);
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { entries: Object.entries(root), partial: "", completedTokens: [] };
    }
    const tokens = trimmed.split(/\s+/);
    const walkTokens = hasTrailingSpace ? tokens : tokens.slice(0, -1);
    const partial = hasTrailingSpace ? "" : tokens[tokens.length - 1].toLowerCase();

    let node = root;
    const completedTokens = [];
    for (const tok of walkTokens) {
      const low = tok.toLowerCase();
      // Exact or unambiguous prefix match (or numeric placeholder like <1-99>, <group>)
      const keys = Object.keys(node);
      let matchedKey = keys.find((k) => k.toLowerCase() === low);
      if (!matchedKey) {
        const prefMatches = keys.filter((k) => !k.startsWith("<") && k.toLowerCase().startsWith(low));
        if (prefMatches.length === 1) matchedKey = prefMatches[0];
      }
      if (!matchedKey && /^\d+$/.test(low)) {
        matchedKey = keys.find((k) => k.startsWith("<") && k !== "<cr>");
      }
      if (!matchedKey || !node[matchedKey] || !node[matchedKey].sub) {
        return { entries: [], partial, completedTokens, leafDesc: matchedKey && node[matchedKey] ? node[matchedKey].desc : null };
      }
      completedTokens.push(matchedKey.startsWith("<") ? tok : matchedKey);
      node = node[matchedKey].sub;
    }

    const entries = Object.entries(node).filter(([k]) => !partial || k.toLowerCase().startsWith(partial));
    return { entries, partial, completedTokens };
  }

  function showContextHelp(currentText) {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls) return;
    const mode = ls.mode || "config";
    const { entries, leafDesc } = resolveIosContext(mode, currentText);

    // Echo command + '?' just like Cisco Packet Tracer / IOS
    ls.history.push({ type: "cmd", prompt: ls.prompt, cmd: `${currentText}?` });

    if (entries.length > 0) {
      const lines = entries
        .map(([k, v]) => `  ${k.padEnd(20, " ")}${v.desc}`)
        .join("\n");
      ls.history.push({ type: "out", text: lines });
    } else if (leafDesc) {
      ls.history.push({ type: "out", text: `  <parameters>        ${leafDesc}\n  <cr>` });
    } else {
      ls.history.push({ type: "out", cls: "warn", text: "% Unrecognized command at '^' marker. Type '?' on an empty line for available commands." });
    }

    // Re-render history while keeping user's typed prefix intact!
    renderLab();
    el.cliHiddenInput.value = currentText;
    el.cliTyped.textContent = currentText;
    el.cliHiddenInput.focus();
  }

  function tryTabAutocomplete(currentText) {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls) return currentText;
    const trimmed = currentText.trim();
    if (!trimmed || /\s$/.test(currentText)) return currentText;
    const { entries, completedTokens } = resolveIosContext(ls.mode || "config", currentText);
    const nonPlaceholder = entries.filter(([k]) => !k.startsWith("<"));
    if (nonPlaceholder.length === 1) {
      const completed = [...completedTokens, nonPlaceholder[0][0]].join(" ") + " ";
      return completed;
    }
    if (nonPlaceholder.length > 1) {
      showContextHelp(currentText);
    }
    return currentText;
  }

  // Interactive Cisco IOS CLI Engine
  function executeCliCommand(raw) {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls) return;
    const cmd = raw.trim();
    if (cmd.endsWith("?")) {
      showContextHelp(cmd.slice(0, -1));
      return;
    }
    ls.history.push({ type: "cmd", prompt: ls.prompt, cmd });
    if (cmd) {
      ls.cmdHistory.push(cmd);
      ls.cmdCursor = ls.cmdHistory.length;
    } else {
      renderLab();
      return;
    }

    const lower = cmd.toLowerCase();
    const dev = ls.lab.deviceName;

    if (lower === "clear") {
      ls.history = [];
      renderLab();
      return;
    }
    if (lower === "help") {
      showContextHelp("");
      return;
    }
    if (lower === "verify" || lower.startsWith("show ") || lower.startsWith("do show ") || lower.startsWith("sh ")) {
      if (lower.includes("run")) {
        const applied = ls.history
          .filter((h) => h.type === "cmd" && !h.cmd.startsWith("!") && !/^(sh|show|verify|clear|\?|help)/i.test(h.cmd))
          .map((h) => "  " + h.cmd)
          .join("\n");
        ls.history.push({ type: "out", text: `Building configuration...\nhostname ${dev}\n${applied || "  ! (No user commands applied yet)"}` });
      } else {
        const doneCount = ls.completedIds.size;
        const totalObj = ls.lab.objectives.length;
        ls.history.push({
          type: "out",
          cls: doneCount === totalObj ? "success" : "",
          text: `${ls.lab.verifyOutput}\n[Packet Tracer Activity Check: ${doneCount}/${totalObj} objectives completed (${Math.round((doneCount / totalObj) * 100)}%)]`,
        });
      }
      renderLab();
      return;
    }

    // Mode Transitions
    if (lower === "end") {
      ls.mode = "priv";
      ls.prompt = `${dev}#`;
      ls.history.push({ type: "out", text: "%SYS-5-CONFIG_I: Configured from console by console" });
    } else if (lower === "exit") {
      if (ls.mode !== "config" && ls.mode !== "priv") {
        ls.mode = "config";
        ls.prompt = `${dev}(config)#`;
      } else {
        ls.mode = "priv";
        ls.prompt = `${dev}#`;
      }
    } else if (lower === "enable" || lower === "en") {
      ls.mode = "priv";
      ls.prompt = `${dev}#`;
    } else if (lower === "conf t" || lower === "configure terminal") {
      ls.mode = "config";
      ls.prompt = `${dev}(config)#`;
    } else if (/^int(erface)?\s+/i.test(cmd)) {
      ls.mode = "config-if";
      ls.prompt = `${dev}(config-if)#`;
    } else if (/^vlan\s+\d+/i.test(cmd)) {
      ls.mode = "config-vlan";
      ls.prompt = `${dev}(config-vlan)#`;
    } else if (/^router\s+ospf/i.test(cmd)) {
      ls.mode = "config-router";
      ls.prompt = `${dev}(config-router)#`;
    } else if (/^ip\s+access-list\s+/i.test(cmd)) {
      ls.mode = "config-acl";
      ls.prompt = `${dev}(config-std-nacl)#`;
    } else if (/^line\s+vty/i.test(cmd)) {
      ls.mode = "config-line";
      ls.prompt = `${dev}(config-line)#`;
    } else if (/^ip\s+dhcp\s+pool/i.test(cmd)) {
      ls.mode = "config-dhcp";
      ls.prompt = `${dev}(dhcp-config)#`;
    }

    // Grade against Lab Objectives
    let newlyMatched = 0;
    ls.lab.objectives.forEach((obj) => {
      if (!ls.completedIds.has(obj.id) && obj.pattern.test(cmd)) {
        ls.completedIds.add(obj.id);
        newlyMatched++;
      }
    });

    if (newlyMatched > 0) {
      if (isLabSolved(ls)) {
        ls.skipped = false;
        ls.history.push({ type: "out", cls: "success", text: `✓ Activity 100% Complete on ${dev}! Click "Next Lab >" to continue.` });
        showToast(`Lab ${state.currentLabIdx + 1}/6 (${ls.lab.title}) completed at 100%!`);
      } else {
        ls.history.push({ type: "out", cls: "success", text: `✓ Objective matched (${ls.completedIds.size}/${ls.lab.objectives.length}).` });
      }
    }

    renderLab();
    renderAnalytics();
  }

  // ============================================================================
  // PHASE 2: 100-QUESTION Q&A RENDERER
  // ============================================================================
  function renderQuestion() {
    const q = state.examQuestions[state.currentQIdx];
    if (!q) return;

    const selectedKey = state.answers[q.examNumber] || null;
    const isFlagged = state.flagged.has(q.examNumber);
    const answeredTotal = Object.keys(state.answers).length;
    const pctPos = Math.round(((state.currentQIdx + 1) / state.examQuestions.length) * 100);

    el.domainBadge.textContent = q.section;
    el.subtopicBadge.textContent = q.subtopic;
    el.flaggedBadge.classList.toggle("hidden", !isFlagged);
    el.questionCounter.textContent = `Question ${q.examNumber} of ${state.examQuestions.length}`;
    el.progressStats.textContent = `${answeredTotal} Answered • ${state.flagged.size} Flagged`;
    el.progressFill.style.width = `${pctPos}%`;

    el.qBadge.textContent = `Q${q.examNumber}`;
    el.qPoolId.textContent = `Pool ID: ${q.id} • Blueprint Section ${q.sectionCode}`;
    el.questionStem.textContent = q.stem;

    const canReveal = state.submitted || (state.studyMode && state.showExplanation);

    el.optionsList.innerHTML = "";
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

    el.reviewBtn.classList.toggle("active", isFlagged);
    el.reviewBtn.querySelector("span").textContent = isFlagged ? "Flagged for Review" : "Mark for Review";
    el.prevBtn.disabled = state.currentQIdx === 0;
    el.nextBtn.disabled = state.currentQIdx === state.examQuestions.length - 1;

    const allowExplainBtn = state.studyMode || state.submitted;
    el.explainToggle.classList.toggle("hidden", !allowExplainBtn);
    const shouldShowExp = (state.submitted || state.showExplanation) && allowExplainBtn;
    el.explanationBox.classList.toggle("hidden", !shouldShowExp);
    el.explanationBox.innerHTML = `<strong>Correct Answer: ${q.correct}</strong> &mdash; ${escapeHtml(q.explanation)}`;
    el.explainToggle.querySelector("span").textContent = shouldShowExp ? "Hide Answer Explanation" : "Show Answer Explanation";

    renderQuestionGrid();
    updateProgressIndicators();
  }

  function renderQuestionGrid() {
    const activeNum = state.examQuestions[state.currentQIdx]?.examNumber;
    el.questionGridCells.innerHTML = "";
    state.examQuestions.forEach((q, idx) => {
      const answered = Boolean(state.answers[q.examNumber]);
      const flagged = state.flagged.has(q.examNumber);

      if (state.gridFilter === "unanswered" && answered) return;
      if (state.gridFilter === "flagged" && !flagged) return;
      if (/^\d\.0$/.test(state.gridFilter) && q.sectionCode !== state.gridFilter) return;

      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "q-cell";
      if (answered) cell.classList.add("answered");
      if (flagged) cell.classList.add("flagged");
      if (state.submitted && state.answers[q.examNumber] !== q.correct) {
        cell.classList.remove("answered");
        cell.classList.add("wrong-graded");
      }
      if (q.examNumber === activeNum) cell.classList.add("current");
      cell.textContent = q.examNumber;
      cell.title = `Q${q.examNumber} — ${q.section} (${q.subtopic})`;
      cell.addEventListener("click", () => {
        state.currentQIdx = idx;
        state.showExplanation = false;
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
      const right = qs.filter((q) => state.answers[q.examNumber] === q.correct).length;
      correctMcq += right;
      return { ...bp, total: qs.length, correct: right, pct: qs.length ? Math.round((right / qs.length) * 100) : 0 };
    });

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
      if (state.labCatalogFilter === "blueprint") return !l.passerTag.startsWith("Passer Lab");
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
      const answered = qs.filter((q) => state.answers[q.examNumber]).length;
      const correct = qs.filter((q) => state.answers[q.examNumber] === q.correct).length;
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
        const tag = done ? "SOLVED" : ls.skipped ? "SKIPPED" : "IN PROGRESS";
        return `
        <div class="history-row">
          <div>
            <strong>Lab ${i + 1}/6: ${escapeHtml(ls.lab.title)}</strong>
            <div class="history-meta">${escapeHtml(ls.lab.passerTag)} &bull; ${ls.completedIds.size}/${ls.lab.objectives.length} tasks</div>
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
    } else if (e.key === "ArrowUp" && ls && ls.cmdHistory.length > 0) {
      e.preventDefault();
      ls.cmdCursor = Math.max(0, ls.cmdCursor - 1);
      el.cliHiddenInput.value = ls.cmdHistory[ls.cmdCursor] || "";
      el.cliTyped.textContent = el.cliHiddenInput.value;
    } else if (e.key === "ArrowDown" && ls && ls.cmdHistory.length > 0) {
      e.preventDefault();
      ls.cmdCursor = Math.min(ls.cmdHistory.length, ls.cmdCursor + 1);
      el.cliHiddenInput.value = ls.cmdHistory[ls.cmdCursor] || "";
      el.cliTyped.textContent = el.cliHiddenInput.value;
    }
  });

  document.getElementById("ptHelpQueryBtn").addEventListener("click", () => {
    // Switch to CLI tab if user was on Config/Physical/Desktop
    const cliTabBtn = document.querySelector('.pt-dtab[data-dtab="cli"]');
    if (cliTabBtn) cliTabBtn.click();
    showContextHelp(el.cliHiddenInput.value);
  });

  el.cliVerifyBtn.addEventListener("click", () => executeCliCommand("verify"));
  el.cliSolutionBtn.addEventListener("click", () => {
    const ls = state.examLabs[state.currentLabIdx];
    if (!ls) return;
    ls.lab.solution.forEach((cmd) => executeCliCommand(cmd));
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
      renderQuestion();
    }
  });
  el.nextBtn.addEventListener("click", () => {
    if (state.currentQIdx < state.examQuestions.length - 1) {
      state.currentQIdx++;
      state.showExplanation = false;
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

  // Boot Exam -> Part 1: Lab 1 of 6 (Cisco Packet Tracer)
  startNewExam(true);
})();
