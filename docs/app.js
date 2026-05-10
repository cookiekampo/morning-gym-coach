(() => {
  "use strict";

  const STORAGE_SESSIONS_KEY = "morning-gym-coach:v0.1:sessions";
  const STORAGE_ACTIVE_KEY = "morning-gym-coach:v0.1:activeSession";
  const RIR_ZERO_WARNING = "この種目でRIR0は非推奨です。フォームが崩れていない場合のみ記録してください。";

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
    id: "legs-45-v0.2",
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
      plannedWeightKg: "",
      actualWeightKg: "",
      reps: "",
    },
    timerId: null,
    timerTotal: 0,
    timerRemaining: 0,
    restFinished: false,
    restNotified: false,
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
            <p class="eyebrow">Morning Gym Coach v0.2</p>
            <h1>脚 / 45分</h1>
          </div>
        </header>
        <div class="stack">${cards}</div>
        ${renderSettingsPanel()}
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

    wireSettingsPanel();
  }

  function renderInput() {
    if (!state.session || state.session.status !== "active") {
      setView("menu");
      return;
    }

    const planned = currentPlanned();
    if (!planned) {
      setView("next");
      return;
    }

    const exercise = EXERCISES[planned.exerciseId];
    ensureDraft(planned);
    const setNumber = state.session.currentSetNumber;
    const isExtraSet = setNumber > planned.sets;
    const targetRir = targetRirFor(planned, setNumber);
    const lastSet = lastPerformedSet();
    const rirButtons = RIR_OPTIONS.map((rir) => {
      const disabled = rir === "0" && state.session.allOutBanned;
      const selected = state.selectedRir === rir ? " selected" : "";
      return `<button class="rir-button${selected}" type="button" data-rir="${rir}" ${disabled ? "disabled" : ""}>${rir}</button>`;
    }).join("");

    app.innerHTML = `
      <section class="screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">${state.session.plannedSession.name} / ${state.session.plannedSession.durationMinutes}分</p>
            <h1>${exercise.name} ${isExtraSet ? "追加セット" : `${setNumber}セット目`}</h1>
          </div>
        </header>

        <section class="panel">
          <h2>予定</h2>
          <dl class="facts">
            <div><dt>重量</dt><dd>${formatWeight(Number(state.draft.plannedWeightKg), exercise.loadType)}</dd></div>
            <div><dt>回数</dt><dd>${formatRepRange(planned, exercise)}</dd></div>
            <div><dt>目標</dt><dd>RIR${targetRir}</dd></div>
            <div><dt>休憩</dt><dd>${planned.restSeconds}秒</dd></div>
          </dl>
          <p class="helper-text ${state.session.allOutBanned ? "safety" : ""}">${inputSafetyText(planned, setNumber)}</p>
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
    const label = set.painFlag
      ? `${exercise.name} 痛みあり`
      : `${exercise.name} ${set.isExtraSet ? "追加セット" : `${set.setNumber}セット目`}`;
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

    const info = transitionInfo();
    if (!info) {
      completeSession();
      return;
    }

    const nextLines = renderTransitionLines(info);
    const extraButton = info.canAddExtra
      ? '<button class="button ghost" id="add-extra-set" type="button">この種目をもう1セット追加</button>'
      : "";
    const endExerciseButton = info.kind === "same"
      ? '<button class="button ghost" id="end-exercise" type="button">種目終了</button>'
      : "";

    app.innerHTML = `
      <section class="screen timer-screen">
        <div>
          <p class="timer-label">${state.restFinished ? "休憩終了" : `休憩 ${state.timerTotal}秒`}</p>
          <div class="timer-count ${state.restFinished ? "rest-ended" : ""}">${state.timerRemaining}</div>
          ${state.restFinished ? '<p class="notice-pill">休憩終了</p>' : ""}
          <div class="next-lines">${nextLines}</div>
        </div>
        <div class="compact-actions ${extraButton || endExerciseButton ? "three" : ""}">
          <button class="button" id="add-rest" type="button">+30秒</button>
          <button class="button primary" id="rest-primary" type="button">${info.primaryLabel}</button>
          ${extraButton || endExerciseButton}
        </div>
      </section>
    `;

    document.getElementById("add-rest").addEventListener("click", () => {
      state.timerTotal += 30;
      state.timerRemaining += 30;
      state.restFinished = false;
      state.restNotified = false;
      renderRest();
      startTimerInterval();
    });
    document.getElementById("rest-primary").addEventListener("click", handleTransitionPrimaryFromRest);

    const addExtraButton = document.getElementById("add-extra-set");
    if (addExtraButton) {
      addExtraButton.addEventListener("click", addExtraSetFromLast);
    }

    const endExerciseButtonNode = document.getElementById("end-exercise");
    if (endExerciseButtonNode) {
      endExerciseButtonNode.addEventListener("click", endExerciseFromRest);
    }
  }

  function renderNext() {
    if (!state.session || state.session.status !== "active") {
      setView("menu");
      return;
    }

    const info = transitionInfo();
    if (!info) {
      completeSession();
      return;
    }

    const extraButton = info.canAddExtra
      ? '<button class="button ghost" id="add-extra-set" type="button">この種目をもう1セット追加</button>'
      : "";

    app.innerHTML = `
      <section class="screen">
        <header class="screen-header">
          <div>
            <p class="eyebrow">${info.eyebrow}</p>
            <h1>${info.title}</h1>
          </div>
        </header>
        <div class="coach-lines">${renderTransitionLines(info)}</div>
        <div class="action-row">
          <button class="button primary" id="next-primary" type="button">${info.primaryLabel}</button>
          ${extraButton}
          ${state.coachNote ? `<p class="helper-text">${state.coachNote}</p>` : ""}
        </div>
      </section>
    `;

    document.getElementById("next-primary").addEventListener("click", handleTransitionPrimaryFromNext);
    const addExtraButton = document.getElementById("add-extra-set");
    if (addExtraButton) {
      addExtraButton.addEventListener("click", addExtraSetFromLast);
    }
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
      const plannedRows = Array.from({ length: planned.sets }, (_, index) => {
        const setNumber = index + 1;
        return `<li>${setNumber}. ${formatWeight(planned.plannedWeightKg, exercise.loadType)} / ${formatRepRange(planned, exercise)} / RIR${targetRirFor(planned, setNumber)}</li>`;
      }).join("");
      const actualRows = sets.length
        ? sets.map((set) => `<li>${formatPerformedSet(set, exercise)}</li>`).join("")
        : '<li class="muted">記録なし</li>';
      const notes = summaryNotes(planned, exercise, sets);

      return `
        <section class="summary-card">
          <h2>${exercise.name}</h2>
          <h3 class="summary-section-title">予定セット</h3>
          <ul class="summary-list">${plannedRows}</ul>
          <h3 class="summary-section-title">実績セット</h3>
          <ul class="summary-list">${actualRows}</ul>
          ${notes ? `<p class="summary-note">${notes}</p>` : ""}
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
        ${renderSettingsPanel()}
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
    wireSettingsPanel();
  }

  function renderSettingsPanel() {
    return `
      <section class="mini-panel settings-panel">
        <h3>設定</h3>
        <div class="settings-actions">
          ${notificationControlHtml()}
          <button class="button danger" id="delete-records" type="button">記録を削除</button>
        </div>
        <p class="helper-text">通知はこの端末の対応環境のみ。サーバープッシュ通知は使いません。</p>
      </section>
    `;
  }

  function notificationControlHtml() {
    if (!("Notification" in window)) {
      return '<button class="button ghost" type="button" disabled>通知非対応</button>';
    }
    if (Notification.permission === "granted") {
      return '<button class="button ghost" type="button" disabled>通知許可済み</button>';
    }
    if (Notification.permission === "denied") {
      return '<button class="button ghost" type="button" disabled>通知は拒否されています</button>';
    }
    return '<button class="button" id="allow-notifications" type="button">通知を許可</button>';
  }

  function wireSettingsPanel() {
    const allowButton = document.getElementById("allow-notifications");
    if (allowButton && "Notification" in window) {
      allowButton.addEventListener("click", () => {
        Promise.resolve(Notification.requestPermission()).finally(render);
      });
    }

    const deleteButton = document.getElementById("delete-records");
    if (deleteButton) {
      deleteButton.addEventListener("click", deleteAllRecords);
    }
  }

  function recordSet() {
    const session = state.session;
    const planned = currentPlanned();
    const exercise = EXERCISES[planned.exerciseId];
    const actualWeightKg = Number(state.draft.actualWeightKg);
    const plannedWeightKg = Number(state.draft.plannedWeightKg);
    const reps = Number.parseInt(state.draft.reps, 10);
    const isExtraSet = session.currentSetNumber > planned.sets;

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

    const rir = state.selectedRir;
    if (rir === "0" && session.allOutBanned) {
      window.alert("痛みあり後はRIR0を記録できません。");
      return;
    }

    if (rir === "0" && exercise.type === "heavy_compound" && !window.confirm(RIR_ZERO_WARNING)) {
      return;
    }

    const performedSet = {
      sessionId: session.id,
      exerciseId: planned.exerciseId,
      setNumber: session.currentSetNumber,
      plannedWeightKg: Number.isFinite(plannedWeightKg) ? plannedWeightKg : planned.plannedWeightKg,
      actualWeightKg,
      reps,
      rir,
      rpe: rirToRpe(rir),
      restSeconds: planned.restSeconds,
      painFlag: false,
      isAllOut: rir === "0",
      isExtraSet,
      note: rirJudgment(rir),
    };

    session.performedSets.push(performedSet);
    state.coachNote = rir === "0" ? "この種目は終了推奨。" : rirJudgment(rir);

    const nextTarget = nextTargetAfter(session.currentExerciseIndex, session.currentSetNumber, rir);
    if (nextTarget) {
      moveToTarget(nextTarget);
    } else {
      markSessionAtEnd();
    }

    saveSession(session);
    startRest(performedSet.restSeconds);
  }

  function handlePain() {
    const session = state.session;
    const planned = currentPlanned();
    const actualWeightKg = Number(state.draft.actualWeightKg) || planned.plannedWeightKg;
    const plannedWeightKg = Number(state.draft.plannedWeightKg) || planned.plannedWeightKg;

    if (!window.confirm("痛みありとして、この種目を終了しますか？")) {
      return;
    }

    session.performedSets.push({
      sessionId: session.id,
      exerciseId: planned.exerciseId,
      setNumber: session.currentSetNumber,
      plannedWeightKg,
      actualWeightKg,
      reps: null,
      rir: null,
      rpe: null,
      restSeconds: 0,
      painFlag: true,
      isAllOut: false,
      isExtraSet: session.currentSetNumber > planned.sets,
      note: "痛みあり。種目終了。",
    });
    session.allOutBanned = true;
    state.coachNote = "痛みあり。今日はRIR0なし。";

    const nextTarget = firstSetOfNextExercise(session.currentExerciseIndex);
    if (nextTarget) {
      moveToTarget(nextTarget);
      saveSession(session);
      setView("next");
      return;
    }

    completeSession();
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
      plannedWeightKg: set.plannedWeightKg || planned.plannedWeightKg,
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

  function deleteAllRecords() {
    if (!window.confirm("すべての記録を削除します。よろしいですか？")) {
      return;
    }

    stopTimer();
    window.localStorage.removeItem(STORAGE_SESSIONS_KEY);
    window.localStorage.removeItem(STORAGE_ACTIVE_KEY);
    state.session = null;
    state.coachNote = "";
    state.restFinished = false;
    state.restNotified = false;
    resetDraft();
    setView("menu");
  }

  function startRest(seconds) {
    state.timerTotal = seconds;
    state.timerRemaining = seconds;
    state.restFinished = false;
    state.restNotified = false;
    state.view = "rest";
    renderRest();
    startTimerInterval();
  }

  function startTimerInterval() {
    stopTimer();
    state.timerId = window.setInterval(() => {
      state.timerRemaining -= 1;
      if (state.timerRemaining <= 0) {
        finishRestTimer();
        return;
      }
      renderRest();
    }, 1000);
  }

  function finishRestTimer() {
    stopTimer();
    state.timerRemaining = 0;
    state.restFinished = true;
    renderRest();
    notifyRestFinished();
  }

  function stopTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function notifyRestFinished() {
    if (state.restNotified) {
      return;
    }
    state.restNotified = true;
    playBeep();
    if ("vibrate" in navigator) {
      navigator.vibrate([160, 70, 160]);
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("休憩終了", {
        body: "次セットを開始できます。",
      });
    }
  }

  function playBeep() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }

    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.24);
      window.setTimeout(() => context.close(), 320);
    } catch (error) {
      console.warn("Beep failed", error);
    }
  }

  function handleTransitionPrimaryFromRest() {
    stopTimer();
    const info = transitionInfo();
    if (!info) {
      completeSession();
      return;
    }
    if (info.kind === "complete") {
      completeSession();
      return;
    }
    setView("next");
  }

  function handleTransitionPrimaryFromNext() {
    const info = transitionInfo();
    if (!info || info.kind === "complete") {
      completeSession();
      return;
    }
    resetDraft();
    setView("input");
  }

  function addExtraSetFromLast() {
    const last = lastPerformedSet();
    if (!last || last.painFlag) {
      return;
    }

    const exerciseIndex = state.session.plannedSession.plannedExercises.findIndex((planned) => planned.exerciseId === last.exerciseId);
    if (exerciseIndex < 0) {
      return;
    }

    state.session.currentExerciseIndex = exerciseIndex;
    state.session.currentSetNumber = performedSetsFor(last.exerciseId).filter((set) => !set.painFlag).length + 1;
    state.coachNote = "追加セット。フォーム優先。";
    resetDraft();
    saveSession(state.session);
    setView("input");
  }

  function endExerciseFromRest() {
    stopTimer();
    const last = lastPerformedSet();
    if (!last) {
      setView("menu");
      return;
    }

    const exerciseIndex = state.session.plannedSession.plannedExercises.findIndex((planned) => planned.exerciseId === last.exerciseId);
    const nextTarget = firstSetOfNextExercise(exerciseIndex);
    if (nextTarget) {
      moveToTarget(nextTarget);
      saveSession(state.session);
      state.coachNote = "種目終了。次の種目へ。";
      setView("next");
      return;
    }

    markSessionAtEnd();
    saveSession(state.session);
    state.coachNote = "予定完了。まとめへ。";
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
    if (!state.session) {
      setView("menu");
      return;
    }
    state.session.status = "complete";
    state.session.endedAt = new Date().toISOString();
    markSessionAtEnd();
    saveSession(state.session);
    setView("summary");
  }

  function markSessionAtEnd() {
    state.session.currentExerciseIndex = state.session.plannedSession.plannedExercises.length;
    state.session.currentSetNumber = 0;
    resetDraft();
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

  function transitionInfo() {
    const last = lastPerformedSet();
    if (!state.session || !last) {
      return null;
    }

    const completedExerciseIndex = state.session.plannedSession.plannedExercises.findIndex((planned) => planned.exerciseId === last.exerciseId);
    const completedPlanned = state.session.plannedSession.plannedExercises[completedExerciseIndex];
    const completedExercise = EXERCISES[last.exerciseId];
    const nextPlanned = currentPlanned();
    const regularCompleted = performedSetsFor(last.exerciseId).filter((set) => !set.painFlag && !set.isExtraSet).length;
    const canAddExtra = !last.painFlag && regularCompleted >= completedPlanned.sets;
    const endRecommended = last.rir === "0";

    if (nextPlanned && nextPlanned.exerciseId === last.exerciseId) {
      const nextExercise = EXERCISES[nextPlanned.exerciseId];
      return {
        kind: "same",
        title: "次セット",
        eyebrow: `${nextExercise.name} ${state.session.currentSetNumber}セット目`,
        primaryLabel: "次セットへ",
        planned: nextPlanned,
        exercise: nextExercise,
        setNumber: state.session.currentSetNumber,
        canAddExtra: false,
        endRecommended,
      };
    }

    if (nextPlanned) {
      const nextExercise = EXERCISES[nextPlanned.exerciseId];
      return {
        kind: "nextExercise",
        title: "次の種目",
        eyebrow: `${completedExercise.name} 完了`,
        primaryLabel: `次の種目へ：${nextExercise.name}`,
        planned: nextPlanned,
        exercise: nextExercise,
        setNumber: 1,
        canAddExtra,
        endRecommended,
      };
    }

    return {
      kind: "complete",
      title: "予定完了",
      eyebrow: `${completedExercise.name} 完了`,
      primaryLabel: "トレーニング終了・まとめへ",
      planned: completedPlanned,
      exercise: completedExercise,
      setNumber: last.setNumber,
      canAddExtra,
      endRecommended,
    };
  }

  function renderTransitionLines(info) {
    if (info.kind === "complete") {
      return `
        <p>予定セット完了。</p>
        <p>まとめを確認。</p>
        <p>${info.endRecommended ? "この種目は終了推奨。" : "追加も選べます。"}</p>
      `;
    }

    const targetRir = targetRirFor(info.planned, info.setNumber);
    const line1 = info.kind === "same"
      ? `次も${formatWeight(info.planned.plannedWeightKg, info.exercise.loadType)}。`
      : `${info.exercise.name}へ。`;
    const line2 = info.kind === "same"
      ? `目標${formatRepRange(info.planned, info.exercise)}。`
      : `${formatWeight(info.planned.plannedWeightKg, info.exercise.loadType)} / ${formatRepRange(info.planned, info.exercise)}。`;
    const line3 = info.endRecommended ? "この種目は終了推奨。" : `目標RIR${targetRir}。`;

    return `
      <p>${line1}</p>
      <p>${line2}</p>
      <p>${line3}</p>
    `;
  }

  function ensureDraft(planned) {
    const key = makeDraftKey(planned);
    if (state.draftKey === key) {
      return;
    }

    const isExtraSet = state.session.currentSetNumber > planned.sets;
    const previousSet = lastSetForExercise(planned.exerciseId);
    const initialWeight = isExtraSet && previousSet
      ? previousSet.actualWeightKg
      : planned.plannedWeightKg;

    state.draftKey = key;
    state.draft = {
      plannedWeightKg: initialWeight,
      actualWeightKg: initialWeight,
      reps: "",
    };
    state.selectedRir = null;
  }

  function resetDraft() {
    state.draftKey = "";
    state.draft = {
      plannedWeightKg: "",
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

  function performedSetsFor(exerciseId) {
    return state.session.performedSets.filter((set) => set.exerciseId === exerciseId);
  }

  function lastSetForExercise(exerciseId) {
    const sets = performedSetsFor(exerciseId).filter((set) => !set.painFlag);
    return sets[sets.length - 1] || null;
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
      return session && session.status === "active" ? normalizeLoadedSession(session) : null;
    } catch (error) {
      console.warn("Could not load active session", error);
      return null;
    }
  }

  function getLatestSession() {
    const sessions = loadSessions().map(normalizeLoadedSession);
    return sessions[sessions.length - 1] || null;
  }

  function normalizeLoadedSession(session) {
    session.performedSets = (session.performedSets || []).map((set) => ({
      isExtraSet: false,
      ...set,
    }));
    session.allOutBanned = Boolean(session.allOutBanned);
    return session;
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
    if (exercise.type === "heavy_compound") {
      return "RIR0は警告付きで記録可。フォーム優先。";
    }
    if (exercise.id === "leg_extension") {
      return "RIR0可。最終セットのみレストポーズ可。";
    }
    return planned.allOutAllowed ? "RIR0可。" : "フォーム優先。";
  }

  function inputSafetyText(planned, setNumber) {
    const exercise = EXERCISES[planned.exerciseId];
    if (state.session?.allOutBanned) {
      return "痛みあり後: RIR0とレストポーズは禁止。";
    }
    if (exercise.type === "heavy_compound") {
      return "RIR0は非推奨。記録前に確認します。";
    }
    if (canUseRestPause(planned, setNumber)) {
      return "レストポーズ可。フォーム固定。";
    }
    return "RIR0可。フォーム優先。";
  }

  function canUseRestPause(planned, setNumber) {
    if (state.session?.allOutBanned) {
      return false;
    }
    return planned.restPauseAllowed && planned.exerciseId === "leg_extension" && setNumber >= planned.sets;
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
    return "RIR0。この種目は終了推奨。";
  }

  function formatPerformedSet(set, exercise) {
    if (set.painFlag) {
      return `${set.isExtraSet ? "追加 " : `${set.setNumber}. `}痛みあり: 種目終了`;
    }
    const actual = formatWeight(set.actualWeightKg, exercise.loadType);
    const planned = formatWeight(set.plannedWeightKg, exercise.loadType);
    const diff = set.actualWeightKg === set.plannedWeightKg ? "" : ` (予定${planned})`;
    const prefix = set.isExtraSet ? `追加 ${set.setNumber}. ` : `${set.setNumber}. `;
    return `${prefix}${actual} x ${set.reps}回 RIR${set.rir} / RPE${set.rpe}${diff}`;
  }

  function summaryNotes(planned, exercise, sets) {
    const notes = [];
    if (sets.some((set) => set.painFlag)) {
      notes.push("痛みあり");
    }
    if (exercise.type === "heavy_compound" && sets.some((set) => set.rir === "0")) {
      notes.push("RIR0記録あり。次回はフォーム確認");
    }
    if (sets.some((set) => set.isExtraSet)) {
      notes.push("追加セットあり");
    }
    return notes.join(" / ");
  }

  function judgeExercise(planned, exercise, sets) {
    if (sets.some((set) => set.painFlag)) {
      return "痛みあり。次回は重量を上げない。";
    }

    const regularSets = sets.filter((set) => !set.painFlag && !set.isExtraSet);
    if (regularSets.length < planned.sets) {
      return "未完了。次回は無理せず同重量。";
    }

    const [minRep, maxRep] = planned.repRange.split("〜").map(Number);
    const belowPlan = regularSets.some((set) => set.reps < minRep || set.actualWeightKg < planned.plannedWeightKg);
    const topRange = regularSets.every((set) => set.reps >= maxRep);
    const rirEnough = regularSets.every((set, index) => rirNumber(set.rir) >= planned.targetRir[index]);

    if (exercise.type === "heavy_compound" && regularSets.some((set) => set.rir === "0")) {
      return "RIR0記録あり。次回はフォーム確認。";
    }

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
