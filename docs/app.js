(() => {
  "use strict";

  const STORAGE_SESSIONS_KEY = "morning-gym-coach:v0.1:sessions";
  const STORAGE_ACTIVE_KEY = "morning-gym-coach:v0.1:activeSession";

  const EXERCISES = {
    squat: {
      id: "squat",
      name: "スクワット",
      type: "heavy_compound",
      loadType: "barbell_total",
      weightStepKg: 2.5,
      defaultRepRange: "6〜8",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    bulgarian_split_squat: {
      id: "bulgarian_split_squat",
      name: "ブルガリアンスクワット",
      type: "heavy_compound",
      loadType: "dumbbell_each_hand",
      weightStepKg: 2.5,
      defaultRepRange: "8〜10",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    leg_extension: {
      id: "leg_extension",
      name: "レッグエクステンション",
      type: "isolation",
      loadType: "machine_stack",
      weightStepKg: 2.5,
      defaultRepRange: "12〜15",
      allOutAllowed: true,
      restPauseAllowed: true,
    },
  };

  const SESSION_PLAN = {
    id: "legs-45-v0.1",
    name: "脚",
    durationMinutes: 45,
    plannedExercises: [
      {
        exerciseId: "squat",
        plannedWeightKg: 40,
        sets: 3,
        repRange: "6〜8",
        targetRir: [3, 2, 1],
        restSeconds: 180,
        allOutAllowed: false,
        restPauseAllowed: false,
      },
      {
        exerciseId: "bulgarian_split_squat",
        plannedWeightKg: 10,
        sets: 2,
        repRange: "8〜10",
        targetRir: [2, 1],
        restSeconds: 120,
        allOutAllowed: false,
        restPauseAllowed: false,
      },
      {
        exerciseId: "leg_extension",
        plannedWeightKg: 30,
        sets: 2,
        repRange: "12〜15",
        targetRir: [1, 0],
        restSeconds: 60,
        allOutAllowed: true,
        restPauseAllowed: true,
      },
    ],
  };

  const RIR_OPTIONS = ["4+", "3", "2", "1", "0"];
  const app = document.getElementById("app");

  const state = {
    view: "menu",
    session: null,
    selectedRir: null,
    draftKey: "",
    draft: {
      actualWeightKg: "",
      reps: "",
    },
    timerId: null,
    timerTotal: 0,
    timerRemaining: 0,
    lastCompletedExerciseIndex: 0,
    coachNote: "",
  };

  document.addEventListener("DOMContentLoaded", () => {
    state.session = loadActiveSession();
    render();
  });

  function render() {
    if (state.view !== "rest") {
      stopTimer();
    }

    if (state.view === "input") {
      renderInput();
      return;
    }

    if (state.view === "rest") {
      renderRest();
      return;
    }

    if (state.view === "next") {
      renderNext();
      return;
    }

    if (state.view === "summary") {
      renderSummary();
      return;
    }

    renderMenu();
  }

  function setView(view) {
    state.view = view;
    render();
  }

  function renderMenu() {
    const activeSession = loadActiveSession();
    const latestSession = getLatestSession();
    const cards = SESSION_PLAN.plannedExercises.map((planned) => {
      const exercise = EXERCISES[planned.exerciseId];
      return `
        <article class="exercise-card">
          <div class="exercise-title">
            <strong>${exercise.name}</strong>
            <span class="tag">${planned.sets}セット</span>
          </div>
          <dl class="facts">
            <div><dt>重量</dt><dd>${formatWeight(planned.plannedWeightKg, exercise.loadType)}</dd></div>
            <div><dt>回数</dt><dd>${formatRepRange(planned, exercise)}</dd></div>
            <div><dt>RIR</dt><dd>${formatRirPlan(planned.targetRir)}</dd></div>
            <div><dt>休憩</dt><dd>${planned.restSeconds}秒</dd></div>
          </dl>
          <p class="helper-text">${menuSafetyText(planned, exercise)}</p>
        </article>
      `;
    }).join("");

    app.innerHTML = `
      <section class="screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">Morning Gym Coach</p>
            <h1>脚 / 45分</h1>
          </div>
        </header>
        <div class="stack">${cards}</div>
        <div class="action-row">
          ${activeSession ? '<button class="button" id="continue-session" type="button">続きから</button>' : ""}
          <button class="button primary" id="start-session" type="button">トレーニング開始</button>
          ${latestSession ? '<button class="button ghost" id="latest-summary" type="button">直近まとめ</button>' : ""}
        </div>
      </section>
    `;

    document.getElementById("start-session").addEventListener("click", () => {
      if (activeSession && !window.confirm("進行中の記録を終了して、新しく開始しますか？")) {
        return;
      }
      state.session = createSession();
      saveSession(state.session);
      resetDraft();
      setView("input");
    });

    const continueButton = document.getElementById("continue-session");
    if (continueButton) {
      continueButton.addEventListener("click", () => {
        state.session = activeSession;
        resetDraft();
        setView("input");
      });
    }

    const latestButton = document.getElementById("latest-summary");
    if (latestButton) {
      latestButton.addEventListener("click", () => {
        state.session = latestSession;
        setView("summary");
      });
    }
  }

  function renderInput() {
    if (!state.session || state.session.status !== "active") {
      setView("menu");
      return;
    }

    normalizeTarget();
    const planned = currentPlanned();
    if (!planned) {
      completeSession();
      return;
    }

    const exercise = EXERCISES[planned.exerciseId];
    ensureDraft(planned);
    const setNumber = state.session.currentSetNumber;
    const targetRir = targetRirFor(planned, setNumber);
    const lastSet = lastPerformedSet();
    const rirButtons = RIR_OPTIONS.map((rir) => {
      const disabled = rir === "0" && !canUseRirZero(planned, setNumber);
      const selected = state.selectedRir === rir ? " selected" : "";
      return `<button class="rir-button${selected}" type="button" data-rir="${rir}" ${disabled ? "disabled" : ""}>${rir}</button>`;
    }).join("");

    app.innerHTML = `
      <section class="screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">${state.session.plannedSession.name} / ${state.session.plannedSession.durationMinutes}分</p>
            <h1>${exercise.name} ${setNumber}セット目</h1>
          </div>
        </header>

        <section class="panel">
          <h2>予定</h2>
          <dl class="facts">
            <div><dt>重量</dt><dd>${formatWeight(planned.plannedWeightKg, exercise.loadType)}</dd></div>
            <div><dt>回数</dt><dd>${formatRepRange(planned, exercise)}</dd></div>
            <div><dt>目標</dt><dd>RIR${targetRir}</dd></div>
            <div><dt>休憩</dt><dd>${planned.restSeconds}秒</dd></div>
          </dl>
          <p class="helper-text ${canUseRirZero(planned, setNumber) ? "" : "safety"}">${inputSafetyText(planned, setNumber)}</p>
        </section>

        <section class="panel">
          <h2>実際</h2>
          <div class="input-grid">
            <div class="field">
              <label for="actual-weight">重量 kg</label>
              <input id="actual-weight" type="number" inputmode="decimal" min="0" step="${exercise.weightStepKg}" value="${state.draft.actualWeightKg}">
            </div>
            <div class="field">
              <label for="actual-reps">回数</label>
              <input id="actual-reps" type="number" inputmode="numeric" min="0" step="1" value="${state.draft.reps}">
            </div>
          </div>
          <h3>同じフォームであと何回できた？</h3>
          <div class="rir-grid">${rirButtons}</div>
          <p class="helper-text">反動、浅い可動域、フォーム崩れ込みは含めない。</p>
        </section>

        ${lastSet ? renderLastSetPanel(lastSet) : ""}

        <div class="action-row">
          <button class="button primary" id="record-set" type="button">記録して休憩</button>
          <button class="button danger" id="pain-button" type="button">痛みあり</button>
        </div>
      </section>
    `;

    document.getElementById("actual-weight").addEventListener("input", (event) => {
      state.draft.actualWeightKg = event.target.value;
    });
    document.getElementById("actual-reps").addEventListener("input", (event) => {
      state.draft.reps = event.target.value;
    });
    document.querySelectorAll("[data-rir]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedRir = button.dataset.rir;
        renderInput();
      });
    });
    document.getElementById("record-set").addEventListener("click", recordSet);
    document.getElementById("pain-button").addEventListener("click", handlePain);

    const editButton = document.getElementById("edit-last-set");
    if (editButton) {
      editButton.addEventListener("click", editLastSet);
    }

    const deleteButton = document.getElementById("delete-last-set");
    if (deleteButton) {
      deleteButton.addEventListener("click", deleteLastSet);
    }
  }

  function renderLastSetPanel(set) {
    const exercise = EXERCISES[set.exerciseId];
    const label = set.painFlag ? `${exercise.name} 痛みあり` : `${exercise.name} ${set.setNumber}セット目`;
    return `
      <section class="mini-panel">
        <h3>直前: ${label}</h3>
        <div class="compact-actions">
          <button class="button ghost" id="edit-last-set" type="button">直前を修正</button>
          <button class="button warning" id="delete-last-set" type="button">直前を削除</button>
        </div>
      </section>
    `;
  }

  function renderRest() {
    if (!state.session || state.session.status !== "active") {
      setView("menu");
      return;
    }

    const planned = currentPlanned();
    if (!planned) {
      completeSession();
      return;
    }

    const exercise = EXERCISES[planned.exerciseId];
    const setNumber = state.session.currentSetNumber;
    app.innerHTML = `
      <section class="screen timer-screen">
        <div>
          <p class="timer-label">休憩 ${state.timerTotal}秒</p>
          <div class="timer-count">${state.timerRemaining}</div>
          <div class="next-lines">
            <p>次: ${formatWeight(planned.plannedWeightKg, exercise.loadType)}</p>
            <p>目標 ${formatRepRange(planned, exercise)}</p>
            <p>${shortSafetyText(planned, setNumber)}</p>
          </div>
        </div>
        <div class="compact-actions three">
          <button class="button" id="add-rest" type="button">+30秒</button>
          <button class="button primary" id="skip-rest" type="button">今すぐ次セット</button>
          <button class="button ghost" id="end-exercise" type="button">種目終了</button>
        </div>
      </section>
    `;

    document.getElementById("add-rest").addEventListener("click", () => {
      state.timerRemaining += 30;
      state.timerTotal += 30;
      renderRest();
    });
    document.getElementById("skip-rest").addEventListener("click", goNext);
    document.getElementById("end-exercise").addEventListener("click", endExerciseFromRest);
  }

  function renderNext() {
    if (!state.session || state.session.status !== "active") {
      setView("menu");
      return;
    }

    const planned = currentPlanned();
    if (!planned) {
      completeSession();
      return;
    }

    const exercise = EXERCISES[planned.exerciseId];
    const setNumber = state.session.currentSetNumber;
    const targetRir = targetRirFor(planned, setNumber);
    const lead = lastPerformedSet()?.exerciseId === planned.exerciseId ? "次も" : "次は";

    app.innerHTML = `
      <section class="screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">${exercise.name} ${setNumber}セット目</p>
            <h1>次セット</h1>
          </div>
        </header>
        <div class="coach-lines">
          <p>${lead}${formatWeight(planned.plannedWeightKg, exercise.loadType)}。</p>
          <p>目標${formatRepRange(planned, exercise)}。</p>
          <p>${instructionSafetyText(planned, setNumber, targetRir)}</p>
        </div>
        <div class="action-row">
          <button class="button primary" id="go-input" type="button">入力へ</button>
          ${state.coachNote ? `<p class="helper-text">${state.coachNote}</p>` : ""}
        </div>
      </section>
    `;

    document.getElementById("go-input").addEventListener("click", () => {
      resetDraft();
      setView("input");
    });
  }

  function renderSummary() {
    if (!state.session) {
      setView("menu");
      return;
    }

    const session = state.session;
    const cards = session.plannedSession.plannedExercises.map((planned) => {
      const exercise = EXERCISES[planned.exerciseId];
      const sets = session.performedSets.filter((set) => set.exerciseId === planned.exerciseId);
      const actualRows = sets.length
        ? sets.map((set) => `<li>${formatPerformedSet(set, exercise)}</li>`).join("")
        : '<li class="muted">記録なし</li>';

      return `
        <section class="summary-card">
          <h2>${exercise.name}</h2>
          <p class="muted">予定: ${formatWeight(planned.plannedWeightKg, exercise.loadType)} / ${planned.sets}セット / ${formatRepRange(planned, exercise)}</p>
          <ul class="summary-list">${actualRows}</ul>
          <p class="judge">判定: ${judgeExercise(planned, exercise, sets)}</p>
        </section>
      `;
    }).join("");

    app.innerHTML = `
      <section class="screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">${formatDateTime(session.startedAt)}</p>
            <h1>トレ後まとめ</h1>
          </div>
        </header>
        <div class="stack">${cards}</div>
        <div class="action-row">
          <button class="button primary" id="new-session" type="button">新しく始める</button>
          <button class="button ghost" id="back-menu" type="button">メニューへ</button>
        </div>
      </section>
    `;

    document.getElementById("new-session").addEventListener("click", () => {
      state.session = createSession();
      saveSession(state.session);
      resetDraft();
      setView("input");
    });
    document.getElementById("back-menu").addEventListener("click", () => {
      state.session = loadActiveSession();
      setView("menu");
    });
  }

  function recordSet() {
    const session = state.session;
    const planned = currentPlanned();
    const exercise = EXERCISES[planned.exerciseId];
    const actualWeightKg = Number(state.draft.actualWeightKg);
    const reps = Number.parseInt(state.draft.reps, 10);

    if (!Number.isFinite(actualWeightKg) || actualWeightKg <= 0) {
      window.alert("重量を入力してください。");
      return;
    }

    if (!Number.isInteger(reps) || reps <= 0) {
      window.alert("回数を入力してください。");
      return;
    }

    if (state.selectedRir === null) {
      window.alert("RIRを選んでください。");
      return;
    }

    let rir = state.selectedRir;
    if (rir === "0" && !canUseRirZero(planned, session.currentSetNumber)) {
      if (exercise.type === "heavy_compound" || !planned.allOutAllowed) {
        window.alert("この種目はRIR0禁止です。RIR1として記録します。");
        rir = "1";
      } else {
        window.alert("このセットではRIR0を選べません。");
        return;
      }
    }

    const performedSet = {
      sessionId: session.id,
      exerciseId: planned.exerciseId,
      setNumber: session.currentSetNumber,
      plannedWeightKg: planned.plannedWeightKg,
      actualWeightKg,
      reps,
      rir,
      rpe: rirToRpe(rir),
      restSeconds: planned.restSeconds,
      painFlag: false,
      isAllOut: rir === "0",
      note: rirJudgment(rir),
    };

    session.performedSets.push(performedSet);
    state.lastCompletedExerciseIndex = session.currentExerciseIndex;
    state.coachNote = rirJudgment(rir);

    const nextTarget = nextTargetAfter(session.currentExerciseIndex, session.currentSetNumber, rir);
    if (!nextTarget) {
      completeSession();
      return;
    }

    moveToTarget(nextTarget);
    saveSession(session);
    startRest(performedSet.restSeconds);
  }

  function handlePain() {
    const session = state.session;
    const planned = currentPlanned();
    const actualWeightKg = Number(state.draft.actualWeightKg) || planned.plannedWeightKg;

    if (!window.confirm("痛みありとして、この種目を終了しますか？")) {
      return;
    }

    session.performedSets.push({
      sessionId: session.id,
      exerciseId: planned.exerciseId,
      setNumber: session.currentSetNumber,
      plannedWeightKg: planned.plannedWeightKg,
      actualWeightKg,
      reps: null,
      rir: null,
      rpe: null,
      restSeconds: 0,
      painFlag: true,
      isAllOut: false,
      note: "痛みあり。種目終了。",
    });
    session.allOutBanned = true;
    state.lastCompletedExerciseIndex = session.currentExerciseIndex;
    state.coachNote = "痛みあり。今日はRIR0なし。";

    const nextTarget = firstSetOfNextExercise(session.currentExerciseIndex);
    if (!nextTarget) {
      completeSession();
      return;
    }

    moveToTarget(nextTarget);
    saveSession(session);
    setView("next");
  }

  function editLastSet() {
    const set = state.session.performedSets.pop();
    if (!set) {
      return;
    }

    const exerciseIndex = state.session.plannedSession.plannedExercises.findIndex((planned) => planned.exerciseId === set.exerciseId);
    state.session.currentExerciseIndex = Math.max(0, exerciseIndex);
    state.session.currentSetNumber = set.setNumber;
    recalculateAllOutBan();
    saveSession(state.session);

    const planned = currentPlanned();
    state.draftKey = makeDraftKey(planned);
    state.draft = {
      actualWeightKg: set.actualWeightKg || planned.plannedWeightKg,
      reps: set.reps || "",
    };
    state.selectedRir = set.rir;
    setView("input");
  }

  function deleteLastSet() {
    if (!window.confirm("直前セットを削除しますか？")) {
      return;
    }

    const set = state.session.performedSets.pop();
    if (!set) {
      return;
    }

    const exerciseIndex = state.session.plannedSession.plannedExercises.findIndex((planned) => planned.exerciseId === set.exerciseId);
    state.session.currentExerciseIndex = Math.max(0, exerciseIndex);
    state.session.currentSetNumber = set.setNumber;
    recalculateAllOutBan();
    saveSession(state.session);
    resetDraft();
    setView("input");
  }

  function startRest(seconds) {
    state.timerTotal = seconds;
    state.timerRemaining = seconds;
    state.view = "rest";
    renderRest();
    stopTimer();
    state.timerId = window.setInterval(() => {
      state.timerRemaining -= 1;
      if (state.timerRemaining <= 0) {
        goNext();
        return;
      }
      renderRest();
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function goNext() {
    stopTimer();
    setView("next");
  }

  function endExerciseFromRest() {
    stopTimer();
    const nextTarget = firstSetOfNextExercise(state.lastCompletedExerciseIndex);
    if (!nextTarget) {
      completeSession();
      return;
    }
    moveToTarget(nextTarget);
    saveSession(state.session);
    state.coachNote = "種目終了。次の種目へ。";
    setView("next");
  }

  function createSession() {
    const now = new Date();
    return {
      id: `session-${now.toISOString()}`,
      status: "active",
      startedAt: now.toISOString(),
      endedAt: null,
      allOutBanned: false,
      currentExerciseIndex: 0,
      currentSetNumber: 1,
      plannedSession: {
        id: SESSION_PLAN.id,
        date: dateKey(now),
        name: SESSION_PLAN.name,
        durationMinutes: SESSION_PLAN.durationMinutes,
        plannedExercises: clone(SESSION_PLAN.plannedExercises),
      },
      performedSets: [],
    };
  }

  function completeSession() {
    stopTimer();
    state.session.status = "complete";
    state.session.endedAt = new Date().toISOString();
    state.session.currentExerciseIndex = state.session.plannedSession.plannedExercises.length;
    state.session.currentSetNumber = 0;
    saveSession(state.session);
    setView("summary");
  }

  function normalizeTarget() {
    const planned = currentPlanned();
    if (!planned) {
      return;
    }

    if (state.session.currentSetNumber > planned.sets) {
      const nextTarget = firstSetOfNextExercise(state.session.currentExerciseIndex);
      if (nextTarget) {
        moveToTarget(nextTarget);
      }
    }
  }

  function moveToTarget(target) {
    state.session.currentExerciseIndex = target.exerciseIndex;
    state.session.currentSetNumber = target.setNumber;
    resetDraft();
  }

  function currentPlanned() {
    if (!state.session) {
      return null;
    }
    return state.session.plannedSession.plannedExercises[state.session.currentExerciseIndex] || null;
  }

  function nextTargetAfter(exerciseIndex, setNumber, rir) {
    const planned = state.session.plannedSession.plannedExercises[exerciseIndex];
    if (rir !== "0" && setNumber < planned.sets) {
      return { exerciseIndex, setNumber: setNumber + 1 };
    }
    return firstSetOfNextExercise(exerciseIndex);
  }

  function firstSetOfNextExercise(exerciseIndex) {
    const nextIndex = exerciseIndex + 1;
    if (nextIndex >= state.session.plannedSession.plannedExercises.length) {
      return null;
    }
    return { exerciseIndex: nextIndex, setNumber: 1 };
  }

  function canUseRirZero(planned, setNumber) {
    const exercise = EXERCISES[planned.exerciseId];
    if (state.session?.allOutBanned) {
      return false;
    }
    if (exercise.type === "heavy_compound") {
      return false;
    }
    if (!planned.allOutAllowed) {
      return false;
    }
    return planned.exerciseId === "leg_extension" && setNumber === planned.sets;
  }

  function canUseRestPause(planned, setNumber) {
    if (state.session?.allOutBanned) {
      return false;
    }
    return planned.restPauseAllowed && planned.exerciseId === "leg_extension" && setNumber === planned.sets;
  }

  function ensureDraft(planned) {
    const key = makeDraftKey(planned);
    if (state.draftKey === key) {
      return;
    }
    state.draftKey = key;
    state.draft = {
      actualWeightKg: planned.plannedWeightKg,
      reps: "",
    };
    state.selectedRir = null;
  }

  function resetDraft() {
    state.draftKey = "";
    state.draft = {
      actualWeightKg: "",
      reps: "",
    };
    state.selectedRir = null;
  }

  function makeDraftKey(planned) {
    return `${state.session.id}:${planned.exerciseId}:${state.session.currentSetNumber}`;
  }

  function lastPerformedSet() {
    if (!state.session || state.session.performedSets.length === 0) {
      return null;
    }
    return state.session.performedSets[state.session.performedSets.length - 1];
  }

  function recalculateAllOutBan() {
    state.session.allOutBanned = state.session.performedSets.some((set) => set.painFlag);
  }

  function loadSessions() {
    try {
      const raw = window.localStorage.getItem(STORAGE_SESSIONS_KEY);
      const sessions = raw ? JSON.parse(raw) : [];
      return Array.isArray(sessions) ? sessions : [];
    } catch (error) {
      console.warn("Could not load sessions", error);
      return [];
    }
  }

  function loadActiveSession() {
    try {
      const raw = window.localStorage.getItem(STORAGE_ACTIVE_KEY);
      const session = raw ? JSON.parse(raw) : null;
      return session && session.status === "active" ? session : null;
    } catch (error) {
      console.warn("Could not load active session", error);
      return null;
    }
  }

  function getLatestSession() {
    const sessions = loadSessions();
    return sessions[sessions.length - 1] || null;
  }

  function saveSession(session) {
    const sessions = loadSessions();
    const snapshot = clone(session);
    const existingIndex = sessions.findIndex((item) => item.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = snapshot;
    } else {
      sessions.push(snapshot);
    }

    window.localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions.slice(-20)));
    if (session.status === "active") {
      window.localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(snapshot));
    } else {
      window.localStorage.removeItem(STORAGE_ACTIVE_KEY);
    }
  }

  function formatWeight(weightKg, loadType) {
    if (loadType === "dumbbell_each_hand") {
      return `片手${formatNumber(weightKg)}kg`;
    }
    return `${formatNumber(weightKg)}kg`;
  }

  function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : String(value).replace(/\.0$/, "");
  }

  function formatRepRange(planned, exercise) {
    if (exercise.id === "bulgarian_split_squat") {
      return `片脚${planned.repRange}回`;
    }
    return `${planned.repRange}回`;
  }

  function formatRirPlan(targetRir) {
    return `RIR ${targetRir.join(" → ")}`;
  }

  function menuSafetyText(planned, exercise) {
    if (exercise.id === "leg_extension") {
      return "最終セットのみRIR0可。最終セットのみレストポーズ可。";
    }
    return "RIR0は禁止。フォーム優先。";
  }

  function inputSafetyText(planned, setNumber) {
    const exercise = EXERCISES[planned.exerciseId];
    if (state.session?.allOutBanned) {
      return "痛みあり後: RIR0とレストポーズは禁止。";
    }
    if (exercise.type === "heavy_compound") {
      return "RIR0は禁止。余力1回を残す。";
    }
    if (canUseRestPause(planned, setNumber)) {
      return "最終セットのみRIR0とレストポーズ可。";
    }
    return "最終セットのみRIR0可。今はフォーム優先。";
  }

  function shortSafetyText(planned, setNumber) {
    if (!canUseRirZero(planned, setNumber)) {
      return "RIR0は禁止";
    }
    return `目標RIR${targetRirFor(planned, setNumber)}`;
  }

  function instructionSafetyText(planned, setNumber, targetRir) {
    if (!canUseRirZero(planned, setNumber)) {
      return "RIR0は禁止。";
    }
    if (targetRir === 0) {
      return "RIR0可。フォーム固定。";
    }
    return `目標RIR${targetRir}。`;
  }

  function targetRirFor(planned, setNumber) {
    return planned.targetRir[setNumber - 1] ?? planned.targetRir[planned.targetRir.length - 1];
  }

  function rirToRpe(rir) {
    if (rir === "4+") {
      return 6;
    }
    const value = Number(rir);
    if (value >= 4) {
      return 6;
    }
    if (value === 3) {
      return 7;
    }
    if (value === 2) {
      return 8;
    }
    if (value === 1) {
      return 9;
    }
    return 10;
  }

  function rirJudgment(rir) {
    if (rir === "4+") {
      return "軽い。次も同重量。次回重量アップ候補。";
    }
    if (rir === "3") {
      return "良い入り。同重量。";
    }
    if (rir === "2") {
      return "ちょうどいい。同重量。";
    }
    if (rir === "1") {
      return "かなり重い。同重量、下限狙い。";
    }
    return "RIR0。安全種目の最終セットで終了。";
  }

  function formatPerformedSet(set, exercise) {
    if (set.painFlag) {
      return `${set.setNumber}. 痛みあり: 種目終了`;
    }
    const actual = formatWeight(set.actualWeightKg, exercise.loadType);
    const planned = formatWeight(set.plannedWeightKg, exercise.loadType);
    const diff = set.actualWeightKg === set.plannedWeightKg ? "" : ` (予定${planned})`;
    return `${set.setNumber}. ${actual} x ${set.reps}回 RIR${set.rir} / RPE${set.rpe}${diff}`;
  }

  function judgeExercise(planned, exercise, sets) {
    if (sets.some((set) => set.painFlag)) {
      return "痛みあり。次回は重量を上げない。";
    }

    const completed = sets.filter((set) => !set.painFlag);
    if (completed.length < planned.sets) {
      return "未完了。次回は無理せず同重量。";
    }

    const [minRep, maxRep] = planned.repRange.split("〜").map(Number);
    const belowPlan = completed.some((set) => set.reps < minRep || set.actualWeightKg < planned.plannedWeightKg);
    const topRange = completed.every((set) => set.reps >= maxRep);
    const rirEnough = completed.every((set, index) => rirNumber(set.rir) >= planned.targetRir[index]);

    if (belowPlan) {
      return "重め。次回は同重量か調整。";
    }

    if (topRange && rirEnough && !state.session.allOutBanned) {
      return `余裕あり。次回は${formatWeight(planned.plannedWeightKg + exercise.weightStepKg, exercise.loadType)}候補。`;
    }

    return `予定通り。次回は${formatWeight(planned.plannedWeightKg, exercise.loadType)}継続。`;
  }

  function rirNumber(rir) {
    if (rir === "4+") {
      return 4;
    }
    return Number(rir);
  }

  function formatDateTime(value) {
    if (!value) {
      return "";
    }
    const date = new Date(value);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
})();
