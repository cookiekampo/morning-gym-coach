(() => {
  "use strict";

  const STORAGE_SESSIONS_KEY = "morning-gym-coach:v0.1:sessions";
  const STORAGE_ACTIVE_KEY = "morning-gym-coach:v0.1:activeSession";
  const STORAGE_LAST_COURSE_KEY = "morning-gym-coach:v0.5:lastCourse";
  const DEFAULT_COURSE_ID = "legs_45_v0.5";
  const RIR_ZERO_WARNING = "この種目でRIR0は非推奨です。フォームが崩れていない場合のみ記録してください。";
  const LEG_EXTENSION_ALLOUT_WARNING = "まだ後続種目があります。ここでオールアウトすると後の種目に影響します。記録しますか？";

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
    bench_press: {
      id: "bench_press",
      name: "ベンチプレス",
      type: "heavy_compound",
      loadType: "barbell_total",
      weightStepKg: 2.5,
      defaultRepRange: "6〜8",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    incline_dumbbell_fly: {
      id: "incline_dumbbell_fly",
      name: "インクラインダンベルフライ",
      type: "isolation",
      loadType: "dumbbell_each_hand",
      weightStepKg: 2.5,
      defaultRepRange: "10〜12",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    dumbbell_fly: {
      id: "dumbbell_fly",
      name: "ダンベルフライ",
      type: "isolation",
      loadType: "dumbbell_each_hand",
      weightStepKg: 2.5,
      defaultRepRange: "10〜12",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    pectoral_fly: {
      id: "pectoral_fly",
      name: "ペクトラルフライ",
      type: "isolation",
      loadType: "machine_stack",
      weightStepKg: 2.5,
      defaultRepRange: "12〜15",
      allOutAllowed: true,
      restPauseAllowed: true,
    },
    deadlift: {
      id: "deadlift",
      name: "デッドリフト",
      type: "heavy_compound",
      loadType: "barbell_total",
      weightStepKg: 2.5,
      defaultRepRange: "4〜6",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    lat_pulldown: {
      id: "lat_pulldown",
      name: "ラットプルダウン",
      type: "machine",
      loadType: "machine_stack",
      weightStepKg: 2.5,
      defaultRepRange: "8〜12",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    seated_row: {
      id: "seated_row",
      name: "シーテッドロー",
      type: "machine",
      loadType: "machine_stack",
      weightStepKg: 2.5,
      defaultRepRange: "8〜12",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    machine_row: {
      id: "machine_row",
      name: "マシンロウイング",
      type: "machine",
      loadType: "machine_stack",
      weightStepKg: 2.5,
      defaultRepRange: "10〜12",
      allOutAllowed: true,
      restPauseAllowed: true,
    },
  };

  const COURSE_PLANS = {
    "legs_45_v0.5": {
      courseId: "legs_45_v0.5",
      id: "legs_45_v0.5",
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
    },
    "chest_45_v0.5": {
      courseId: "chest_45_v0.5",
      id: "chest_45_v0.5",
      name: "胸",
      durationMinutes: 45,
      plannedExercises: [
        {
          exerciseId: "bench_press",
          plannedWeightKg: 40,
          sets: 3,
          repRange: "6〜8",
          targetRir: [3, 2, 1],
          restSeconds: 180,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "incline_dumbbell_fly",
          plannedWeightKg: 7.5,
          sets: 2,
          repRange: "10〜12",
          targetRir: [2, 1],
          restSeconds: 90,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "dumbbell_fly",
          plannedWeightKg: 7.5,
          sets: 2,
          repRange: "10〜12",
          targetRir: [2, 1],
          restSeconds: 90,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "pectoral_fly",
          plannedWeightKg: 30,
          sets: 2,
          repRange: "12〜15",
          targetRir: [1, 0],
          restSeconds: 60,
          allOutAllowed: true,
          restPauseAllowed: true,
        },
      ],
    },
    "back_45_v0.7": {
      courseId: "back_45_v0.7",
      id: "back_45_v0.7",
      name: "背中",
      durationMinutes: 45,
      plannedExercises: [
        {
          exerciseId: "deadlift",
          plannedWeightKg: 60,
          sets: 2,
          repRange: "4〜6",
          targetRir: [3, 2],
          restSeconds: 180,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "lat_pulldown",
          plannedWeightKg: 45,
          sets: 3,
          repRange: "8〜12",
          targetRir: [2, 1, 1],
          restSeconds: 120,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "seated_row",
          plannedWeightKg: 40,
          sets: 2,
          repRange: "8〜12",
          targetRir: [2, 1],
          restSeconds: 120,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "machine_row",
          plannedWeightKg: 35,
          sets: 2,
          repRange: "10〜12",
          targetRir: [1, 0],
          restSeconds: 90,
          allOutAllowed: true,
          restPauseAllowed: true,
        },
      ],
    },
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
    copyMessage: "",
    markdownFallback: "",
    settingsMessage: "",
    selectedCourseId: DEFAULT_COURSE_ID,
    coursePanelOpen: false,
    settingsPanelOpen: false,
    menuReorderMode: false,
    menuOrder: [],
    menuPlannedExercises: [],
  };

  document.addEventListener("DOMContentLoaded", () => {
    state.session = loadActiveSession();
    state.selectedCourseId = state.session ? sessionCourseId(state.session) : loadLastCourseId();
    resetWorkingMenu();
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
    const course = currentCoursePlan();
    if (!state.menuOrder.length) {
      state.menuOrder = defaultOrder();
    }
    if (!state.menuPlannedExercises.length) {
      state.menuPlannedExercises = clone(course.plannedExercises);
    }
    const cards = state.menuOrder.map((exerciseId, index) => {
      const planned = plannedById(exerciseId, state.menuPlannedExercises);
      const exercise = EXERCISES[planned.exerciseId];
      return `
        <article class="exercise-card">
          <div class="exercise-title">
            <strong>${index + 1}. ${exercise.name}</strong>
            <span class="tag">${planned.sets}セット</span>
          </div>
          <dl class="facts">
            <div><dt>重量</dt><dd>${formatWeight(planned.plannedWeightKg, exercise.loadType)}</dd></div>
            <div><dt>回数</dt><dd>${formatRepRange(planned, exercise)}</dd></div>
            <div><dt>RIR</dt><dd>${formatRirPlan(planned.targetRir)}</dd></div>
            <div><dt>休憩</dt><dd>${planned.restSeconds}秒</dd></div>
          </dl>
          ${renderPlannedWeightEditor(planned, exercise)}
          <p class="helper-text">${menuSafetyText(planned, exercise)}</p>
          ${state.menuReorderMode ? `
            <div class="reorder-actions">
              <button class="button ghost" type="button" data-move-up="${exercise.id}" ${index === 0 ? "disabled" : ""}>上へ</button>
              <button class="button ghost" type="button" data-move-down="${exercise.id}" ${index === state.menuOrder.length - 1 ? "disabled" : ""}>下へ</button>
            </div>
          ` : ""}
        </article>
      `;
    }).join("");

    app.innerHTML = `
      <section class="screen">
        ${renderAppHeader()}
        <header class="screen-header">
          <div>
            <p class="eyebrow">今日のメニュー</p>
            <h1>${courseLabel(course)}</h1>
          </div>
        </header>
        <div class="stack">${cards}</div>
        <div class="action-row">
          ${activeSession ? '<button class="button" id="continue-session" type="button">続きから</button>' : ""}
          <button class="button ghost" id="toggle-reorder" type="button">${state.menuReorderMode ? "順番変更を閉じる" : "順番を変更"}</button>
          <button class="button primary" id="start-session" type="button">${state.menuReorderMode ? "この順番で開始" : "トレーニング開始"}</button>
          ${latestSession ? '<button class="button ghost" id="latest-summary" type="button">直近まとめ</button>' : ""}
        </div>
      </section>
      ${renderOverlayPanels()}
    `;

    document.getElementById("start-session").addEventListener("click", () => {
      if (activeSession && !window.confirm("進行中の記録を終了して、新しく開始しますか？")) {
        return;
      }
      state.session = createSession(state.menuOrder);
      saveSession(state.session);
      resetDraft();
      clearSummaryTools();
      setView("input");
    });

    document.getElementById("toggle-reorder").addEventListener("click", () => {
      state.menuReorderMode = !state.menuReorderMode;
      renderMenu();
    });

    document.querySelectorAll("[data-move-up]").forEach((button) => {
      button.addEventListener("click", () => moveMenuExercise(button.dataset.moveUp, -1));
    });
    document.querySelectorAll("[data-move-down]").forEach((button) => {
      button.addEventListener("click", () => moveMenuExercise(button.dataset.moveDown, 1));
    });
    document.querySelectorAll("[data-planned-weight]").forEach((input) => {
      input.addEventListener("input", () => updateMenuPlannedWeight(input.dataset.plannedWeight, input.value));
    });
    const continueButton = document.getElementById("continue-session");
    if (continueButton) {
      continueButton.addEventListener("click", () => {
        state.session = activeSession;
        resetDraft();
        clearSummaryTools();
        setView("input");
      });
    }

    const latestButton = document.getElementById("latest-summary");
    if (latestButton) {
      latestButton.addEventListener("click", () => {
        state.session = latestSession;
        clearSummaryTools();
        setView("summary");
      });
    }

    wireGlobalControls();
  }

  function selectCourse(courseId) {
    if (!COURSE_PLANS[courseId] || courseId === state.selectedCourseId) {
      state.coursePanelOpen = false;
      render();
      return;
    }

    const activeSession = loadActiveSession();
    if (activeSession && sessionCourseId(activeSession) !== courseId) {
      if (!window.confirm("現在の入力内容を破棄して、別コースを開始しますか？")) {
        return;
      }
      discardActiveSession(activeSession.id);
      state.session = null;
    }

    state.selectedCourseId = courseId;
    saveLastCourseId(courseId);
    resetWorkingMenu();
    clearSummaryTools();
    state.coursePanelOpen = false;
    state.settingsMessage = "";
    renderMenu();
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
        ${renderAppHeader()}
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

        ${renderPreviousRecordPanel(planned.exerciseId)}

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
          <button class="button ghost" id="defer-exercise" type="button">この種目を後回し</button>
          <button class="button warning" id="skip-exercise" type="button">今日はこの種目をスキップ</button>
          <button class="button danger" id="pain-button" type="button">痛みあり</button>
        </div>
      </section>
      ${renderOverlayPanels()}
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
    document.getElementById("defer-exercise").addEventListener("click", deferCurrentExercise);
    document.getElementById("skip-exercise").addEventListener("click", skipCurrentExercise);
    document.getElementById("pain-button").addEventListener("click", handlePain);

    const editButton = document.getElementById("edit-last-set");
    if (editButton) {
      editButton.addEventListener("click", editLastSet);
    }

    const deleteButton = document.getElementById("delete-last-set");
    if (deleteButton) {
      deleteButton.addEventListener("click", deleteLastSet);
    }
    wireGlobalControls();
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

  function renderPreviousRecordPanel(exerciseId) {
    const previous = findPreviousExerciseRecord(exerciseId);
    if (!previous) {
      return `
        <section class="mini-panel previous-record">
          <h3>前回</h3>
          <p class="helper-text">前回記録なし</p>
        </section>
      `;
    }

    const exercise = EXERCISES[exerciseId];
    const rows = previous.sets.map((set) => {
      if (set.painFlag) {
        return "<li>痛みあり</li>";
      }
      return `<li>${formatWeight(set.actualWeightKg, exercise.loadType)} x ${set.reps} RIR${set.rir}</li>`;
    }).join("");

    return `
      <section class="mini-panel previous-record">
        <h3>前回</h3>
        <ul class="compact-list">${rows}</ul>
      </section>
    `;
  }

  function findPreviousExerciseRecord(exerciseId) {
    const currentId = state.session?.id;
    const sessions = loadSessions()
      .filter((session) => session.id !== currentId)
      .sort((left, right) => new Date(left.startedAt || 0) - new Date(right.startedAt || 0));

    for (let index = sessions.length - 1; index >= 0; index -= 1) {
      const session = normalizeLoadedSession(sessions[index]);
      const sets = session.performedSets.filter((set) => set.exerciseId === exerciseId);
      if (sets.length) {
        return { session, sets };
      }
    }
    return null;
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
        ${renderAppHeader()}
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
      ${renderOverlayPanels()}
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
    wireGlobalControls();
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
        ${renderAppHeader()}
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
      ${renderOverlayPanels()}
    `;

    document.getElementById("next-primary").addEventListener("click", handleTransitionPrimaryFromNext);
    const addExtraButton = document.getElementById("add-extra-set");
    if (addExtraButton) {
      addExtraButton.addEventListener("click", addExtraSetFromLast);
    }
    wireGlobalControls();
  }

  function renderSummary() {
    if (!state.session) {
      setView("menu");
      return;
    }

    const session = state.session;
    normalizeLoadedSession(session);
    const orderSummary = renderOrderSummary(session);
    const cards = session.plannedSession.plannedExercises.map((planned) => {
      const exercise = EXERCISES[planned.exerciseId];
      const sets = session.performedSets.filter((set) => set.exerciseId === planned.exerciseId);
      const status = session.exerciseStatuses[planned.exerciseId] || "pending";
      const plannedRows = Array.from({ length: planned.sets }, (_, index) => {
        const setNumber = index + 1;
        return `<li>${setNumber}. ${formatWeight(planned.plannedWeightKg, exercise.loadType)} / ${formatRepRange(planned, exercise)} / RIR${targetRirFor(planned, setNumber)}</li>`;
      }).join("");
      const actualRows = status === "skipped"
        ? '<li class="muted">スキップ</li>'
        : sets.length
        ? sets.map((set) => `<li>${formatPerformedSet(set, exercise)}</li>`).join("")
        : '<li class="muted">記録なし</li>';
      const notes = summaryNotes(planned, exercise, sets, status);

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
        ${renderAppHeader()}
        <header class="screen-header">
          <div>
            <p class="eyebrow">${formatDateTime(session.startedAt)}</p>
            <h1>トレ後まとめ</h1>
          </div>
        </header>
        ${orderSummary}
        ${renderLogTools(session)}
        ${renderCoachMemoSummary(session)}
        <div class="stack">${cards}</div>
        <div class="action-row">
          <button class="button primary" id="new-session" type="button">新しく始める</button>
          <button class="button ghost" id="back-menu" type="button">メニューへ</button>
        </div>
      </section>
      ${renderOverlayPanels()}
    `;

    document.getElementById("new-session").addEventListener("click", () => {
      state.selectedCourseId = sessionCourseId(session);
      saveLastCourseId(state.selectedCourseId);
      resetWorkingMenu();
      state.session = createSession();
      saveSession(state.session);
      resetDraft();
      clearSummaryTools();
      setView("input");
    });
    document.getElementById("back-menu").addEventListener("click", () => {
      state.session = loadActiveSession();
      if (!state.session) {
        state.selectedCourseId = sessionCourseId(session);
        saveLastCourseId(state.selectedCourseId);
        resetWorkingMenu();
      }
      clearSummaryTools();
      setView("menu");
    });
    wireLogTools();
    wireGlobalControls();
  }

  function renderLogTools(session) {
    const fallback = state.markdownFallback
      ? `
        <textarea class="copy-fallback" readonly>${escapeHtml(state.markdownFallback)}</textarea>
        <p class="helper-text">自動コピーできないため、上の内容を手動でコピーしてください。</p>
      `
      : "";

    return `
      <section class="mini-panel log-tools">
        <h3>ChatGPTレビュー用</h3>
        <div class="settings-actions">
          <button class="button" id="copy-log" type="button">今日のログをコピー</button>
        </div>
        ${state.copyMessage ? `<p class="helper-text">${state.copyMessage}</p>` : ""}
        ${fallback}
      </section>
    `;
  }

  function wireLogTools() {
    const copyButton = document.getElementById("copy-log");
    if (copyButton) {
      copyButton.addEventListener("click", copyMarkdownLog);
    }
  }

  function copyMarkdownLog() {
    const session = state.session;
    if (!session) {
      return;
    }
    const markdown = buildMarkdownLog(session);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(markdown).then(() => {
        state.copyMessage = "コピーしました";
        state.markdownFallback = "";
        renderSummary();
      }).catch(() => showMarkdownFallback(markdown));
      return;
    }
    showMarkdownFallback(markdown);
  }

  function showMarkdownFallback(markdown) {
    state.copyMessage = "";
    state.markdownFallback = markdown;
    renderSummary();
  }

  function renderCoachMemoSummary(session) {
    if (!session.coachMemo) {
      return "";
    }
    return `
      <section class="mini-panel coach-memo-panel">
        <h3>コーチメモ</h3>
        <p class="memo-preview">${escapeHtml(session.coachMemo)}</p>
      </section>
    `;
  }

  function wireCoachMemoPanel(session) {
    if (!session) {
      return;
    }
    const input = document.getElementById("coach-memo-input");
    const saveButton = document.getElementById("save-coach-memo");
    const deleteButton = document.getElementById("delete-coach-memo");

    if (saveButton && input) {
      saveButton.addEventListener("click", () => {
        session.coachMemo = input.value;
        state.session = session;
        saveSession(session);
        state.settingsMessage = "コーチメモを保存しました";
        render();
      });
    }

    if (deleteButton && input) {
      deleteButton.addEventListener("click", () => {
        session.coachMemo = "";
        state.session = session;
        saveSession(session);
        state.settingsMessage = "コーチメモを削除しました";
        render();
      });
    }
  }

  function renderAppHeader() {
    const course = displayCoursePlan();
    return `
      <header class="app-header">
        <div class="brand-block">
          <p class="brand-name">Morning Gym Coach</p>
          <button class="course-trigger" id="open-course-panel" type="button">コース: ${courseLabel(course)} ▾</button>
        </div>
        <button class="settings-trigger" id="open-settings-panel" type="button" aria-label="設定">設定</button>
      </header>
    `;
  }

  function displayCourseId() {
    return state.session ? sessionCourseId(state.session) : state.selectedCourseId;
  }

  function displayCoursePlan() {
    return coursePlanById(displayCourseId());
  }

  function currentMemoSession() {
    if (state.session) {
      return state.session;
    }
    return loadActiveSession() || getLatestSession();
  }

  function renderOverlayPanels() {
    return `${renderCoursePanel()}${renderSettingsPanel()}`;
  }

  function renderCoursePanel() {
    if (!state.coursePanelOpen) {
      return "";
    }
    const selectedCourseId = displayCourseId();
    const buttons = Object.values(COURSE_PLANS).map((course) => {
      const selected = course.courseId === selectedCourseId;
      return `
        <button class="sheet-list-button${selected ? " selected" : ""}" type="button" data-panel-course-id="${course.courseId}">
          <span>${courseLabel(course)}</span>
          ${selected ? "<strong>選択中</strong>" : ""}
        </button>
      `;
    }).join("");

    return `
      <div class="sheet-backdrop" data-close-panel="course"></div>
      <section class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="course-panel-title">
        <div class="sheet-header">
          <h2 id="course-panel-title">コースを選択</h2>
          <button class="sheet-close" type="button" data-close-panel="course">閉じる</button>
        </div>
        <div class="sheet-list">${buttons}</div>
      </section>
    `;
  }

  function renderSettingsPanel() {
    if (!state.settingsPanelOpen) {
      return "";
    }
    const memoSession = currentMemoSession();
    const memoText = memoSession?.coachMemo || "";
    const memoControls = memoSession
      ? `
        <textarea id="coach-memo-input" class="coach-memo-input" rows="5" placeholder="ChatGPTの返答を貼り付け">${escapeHtml(memoText)}</textarea>
        <div class="compact-actions">
          <button class="button" id="save-coach-memo" type="button">コーチメモを保存</button>
          <button class="button ghost" id="delete-coach-memo" type="button">コーチメモを削除</button>
        </div>
      `
      : `
        <textarea id="coach-memo-input" class="coach-memo-input" rows="5" placeholder="セッション開始後に保存できます" disabled></textarea>
        <div class="compact-actions">
          <button class="button" type="button" disabled>コーチメモを保存</button>
          <button class="button ghost" type="button" disabled>コーチメモを削除</button>
        </div>
        <p class="helper-text">保存先のセッションがまだありません。</p>
      `;

    return `
      <div class="sheet-backdrop" data-close-panel="settings"></div>
      <section class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="settings-panel-title">
        <div class="sheet-header">
          <h2 id="settings-panel-title">設定</h2>
          <button class="sheet-close" type="button" data-close-panel="settings">閉じる</button>
        </div>
        <div class="settings-stack">
          ${notificationControlHtml()}
          <button class="button ghost" id="restart-today" type="button">今日のトレーニングをやり直す</button>
          <button class="button warning" id="delete-today-records" type="button">今日の記録だけ削除</button>
          <section class="settings-section">
            <h3>コーチメモ</h3>
            ${memoControls}
          </section>
          ${state.settingsMessage ? `<p class="helper-text">${state.settingsMessage}</p>` : ""}
          <section class="danger-zone">
            <h3>危険エリア</h3>
            <button class="button danger" id="delete-all-records" type="button">すべての記録を削除</button>
          </section>
        </div>
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

  function wireGlobalControls() {
    const courseButton = document.getElementById("open-course-panel");
    if (courseButton) {
      courseButton.addEventListener("click", () => {
        state.coursePanelOpen = true;
        state.settingsPanelOpen = false;
        render();
      });
    }

    const settingsButton = document.getElementById("open-settings-panel");
    if (settingsButton) {
      settingsButton.addEventListener("click", () => {
        state.settingsPanelOpen = true;
        state.coursePanelOpen = false;
        state.settingsMessage = "";
        render();
      });
    }

    document.querySelectorAll("[data-close-panel]").forEach((button) => {
      button.addEventListener("click", () => {
        const panel = button.dataset.closePanel;
        if (panel === "course") {
          state.coursePanelOpen = false;
        }
        if (panel === "settings") {
          state.settingsPanelOpen = false;
          state.settingsMessage = "";
        }
        render();
      });
    });

    document.querySelectorAll("[data-panel-course-id]").forEach((button) => {
      button.addEventListener("click", () => selectCourse(button.dataset.panelCourseId));
    });

    const allowButton = document.getElementById("allow-notifications");
    if (allowButton && "Notification" in window) {
      allowButton.addEventListener("click", () => {
        Promise.resolve(Notification.requestPermission()).finally(render);
      });
    }

    const restartButton = document.getElementById("restart-today");
    if (restartButton) {
      restartButton.addEventListener("click", restartTodayTraining);
    }

    const deleteTodayButton = document.getElementById("delete-today-records");
    if (deleteTodayButton) {
      deleteTodayButton.addEventListener("click", deleteTodayRecords);
    }

    const deleteAllButton = document.getElementById("delete-all-records");
    if (deleteAllButton) {
      deleteAllButton.addEventListener("click", deleteAllRecords);
    }

    wireCoachMemoPanel(currentMemoSession());
  }

  function recordSet() {
    const session = state.session;
    const planned = currentPlanned();
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

    if (rir === "0" && !planned.allOutAllowed && !window.confirm(RIR_ZERO_WARNING)) {
      return;
    }

    if (rir === "0" && planned.allOutAllowed && session.currentSetNumber < planned.sets) {
      window.alert("RIR0は最終セットのみ記録できます。");
      return;
    }

    if (rir === "0" && planned.allOutAllowed && !canUseAllOutAsPlanned(planned, session.currentSetNumber) && !window.confirm(LEG_EXTENSION_ALLOUT_WARNING)) {
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
    markExerciseStarted(planned.exerciseId);
    updateExerciseStatusAfterSet(planned.exerciseId, rir);
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
    markExerciseStarted(planned.exerciseId);
    session.exerciseStatuses[planned.exerciseId] = "completed";
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

    rebuildSessionProgress();
    const exerciseIndex = state.session.activeOrder.indexOf(set.exerciseId);
    state.session.currentExerciseIndex = Math.max(0, exerciseIndex);
    state.session.currentSetNumber = set.setNumber;
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

    rebuildSessionProgress();
    const exerciseIndex = state.session.activeOrder.indexOf(set.exerciseId);
    state.session.currentExerciseIndex = Math.max(0, exerciseIndex);
    state.session.currentSetNumber = set.setNumber;
    saveSession(state.session);
    resetDraft();
    setView("input");
  }

  function deleteAllRecords() {
    if (!window.confirm("過去の記録を含むすべての記録を削除します。この操作は元に戻せません。本当に削除しますか？")) {
      return;
    }

    stopTimer();
    window.localStorage.removeItem(STORAGE_SESSIONS_KEY);
    window.localStorage.removeItem(STORAGE_ACTIVE_KEY);
    window.localStorage.removeItem(STORAGE_LAST_COURSE_KEY);
    state.selectedCourseId = DEFAULT_COURSE_ID;
    state.coursePanelOpen = false;
    state.settingsPanelOpen = false;
    state.settingsMessage = "";
    resetWorkingMenu();
    state.session = null;
    state.coachNote = "";
    state.restFinished = false;
    state.restNotified = false;
    resetDraft();
    setView("menu");
  }

  function restartTodayTraining() {
    if (!window.confirm("今日の入力内容だけを削除して、最初からやり直します。過去の記録は残ります。よろしいですか？")) {
      return;
    }

    const activeSession = loadActiveSession();
    if (!activeSession || !isTodaySession(activeSession)) {
      window.alert("今日の進行中セッションはありません。");
      return;
    }

    const sessions = loadSessions().filter((session) => session.id !== activeSession.id);
    window.localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    window.localStorage.removeItem(STORAGE_ACTIVE_KEY);
    stopTimer();
    state.settingsPanelOpen = false;
    resetWorkingMenu();
    state.session = null;
    state.coachNote = "";
    state.copyMessage = "";
    state.markdownFallback = "";
    state.settingsMessage = "";
    state.restFinished = false;
    state.restNotified = false;
    resetDraft();
    setView("menu");
  }

  function deleteTodayRecords() {
    if (!window.confirm("今日の記録だけを削除します。過去の記録は残ります。よろしいですか？")) {
      return;
    }

    const today = todayKey();
    const sessions = loadSessions().filter((session) => sessionDate(session) !== today);
    window.localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    const activeSession = loadActiveSession();
    if (activeSession && sessionDate(activeSession) === today) {
      window.localStorage.removeItem(STORAGE_ACTIVE_KEY);
    }

    stopTimer();
    if (state.session && sessionDate(state.session) === today) {
      state.session = null;
    }
    state.settingsPanelOpen = false;
    state.coachNote = "";
    state.copyMessage = "";
    state.markdownFallback = "";
    state.settingsMessage = "";
    resetDraft();
    setView("menu");
  }

  function deferCurrentExercise() {
    const session = state.session;
    const planned = currentPlanned();
    if (!session || !planned) {
      return;
    }

    const recorded = performedSetsFor(planned.exerciseId).length;
    if (recorded > 0 && !window.confirm("この種目の残りセットを後回しにします。記録済みセットは残ります。よろしいですか？")) {
      return;
    }

    session.exerciseStatuses[planned.exerciseId] = "deferred";
    const currentIndex = session.activeOrder.indexOf(planned.exerciseId);
    if (currentIndex >= 0) {
      session.activeOrder.splice(currentIndex, 1);
      session.activeOrder.push(planned.exerciseId);
    }

    const nextTarget = firstAvailableTargetFrom(Math.max(0, currentIndex));
    if (nextTarget && nextTarget.exerciseId !== planned.exerciseId) {
      moveToTarget(nextTarget);
      saveSession(session);
      state.coachNote = `${EXERCISES[planned.exerciseId].name}を後回し。`;
      setView("input");
      return;
    }

    state.coachNote = "他に進める種目がありません。";
    saveSession(session);
    renderInput();
  }

  function skipCurrentExercise() {
    const session = state.session;
    const planned = currentPlanned();
    if (!session || !planned) {
      return;
    }

    if (!window.confirm("この種目を今日はスキップします。よろしいですか？")) {
      return;
    }

    session.exerciseStatuses[planned.exerciseId] = "skipped";
    const nextTarget = firstSetOfNextExercise(session.currentExerciseIndex);
    if (nextTarget) {
      moveToTarget(nextTarget);
      saveSession(session);
      state.coachNote = `${EXERCISES[planned.exerciseId].name}をスキップ。`;
      setView("input");
      return;
    }

    saveSession(session);
    completeSession();
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

    const exerciseIndex = state.session.activeOrder.indexOf(last.exerciseId);
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

    const exerciseIndex = state.session.activeOrder.indexOf(last.exerciseId);
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

  function createSession(order = defaultOrder()) {
    const now = new Date();
    const course = currentCoursePlan();
    const plannedOrder = defaultOrder();
    const activeOrder = order.length ? [...order] : [...plannedOrder];
    const plannedExercises = state.menuPlannedExercises.length
      ? clone(state.menuPlannedExercises)
      : clone(course.plannedExercises);
    saveLastCourseId(course.courseId);
    return {
      id: `session-${now.toISOString()}`,
      courseId: course.courseId,
      course_id: course.courseId,
      status: "active",
      startedAt: now.toISOString(),
      endedAt: null,
      allOutBanned: false,
      currentExerciseIndex: 0,
      currentSetNumber: 1,
      plannedOrder,
      activeOrder,
      actualOrder: [],
      exerciseStatuses: createExerciseStatuses(plannedOrder),
      plannedSession: {
        id: course.id,
        courseId: course.courseId,
        course_id: course.courseId,
        date: dateKey(now),
        name: course.name,
        durationMinutes: course.durationMinutes,
        plannedExercises,
      },
      performedSets: [],
      coachMemo: "",
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
    state.session.currentExerciseIndex = state.session.activeOrder.length;
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
    const exerciseId = state.session.activeOrder[state.session.currentExerciseIndex];
    return exerciseId ? plannedById(exerciseId, state.session.plannedSession.plannedExercises) : null;
  }

  function nextTargetAfter(exerciseIndex, setNumber, rir) {
    const exerciseId = state.session.activeOrder[exerciseIndex];
    const planned = plannedById(exerciseId, state.session.plannedSession.plannedExercises);
    if (rir !== "0" && setNumber < planned.sets) {
      return { exerciseIndex, setNumber: setNumber + 1, exerciseId };
    }
    return firstSetOfNextExercise(exerciseIndex);
  }

  function firstSetOfNextExercise(exerciseIndex) {
    return firstAvailableTargetFrom(exerciseIndex + 1);
  }

  function firstAvailableTargetFrom(startIndex) {
    const session = state.session;
    for (let index = startIndex; index < session.activeOrder.length; index += 1) {
      const exerciseId = session.activeOrder[index];
      const status = session.exerciseStatuses[exerciseId] || "pending";
      if (status !== "completed" && status !== "skipped") {
        return {
          exerciseIndex: index,
          setNumber: nextSetNumberForExercise(exerciseId),
          exerciseId,
        };
      }
    }
    return null;
  }

  function transitionInfo() {
    const last = lastPerformedSet();
    if (!state.session || !last) {
      return null;
    }

    const completedExerciseIndex = state.session.activeOrder.indexOf(last.exerciseId);
    const completedPlanned = plannedById(last.exerciseId, state.session.plannedSession.plannedExercises);
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
      const isDeferredReturn = state.session.exerciseStatuses[nextPlanned.exerciseId] === "deferred";
      return {
        kind: isDeferredReturn ? "deferred" : "nextExercise",
        title: isDeferredReturn ? "後回し種目" : "次の種目",
        eyebrow: `${completedExercise.name} 完了`,
        primaryLabel: `${isDeferredReturn ? "後回し種目へ" : "次の種目へ"}：${nextExercise.name}`,
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

  function defaultOrder() {
    return currentCoursePlan().plannedExercises.map((planned) => planned.exerciseId);
  }

  function plannedById(exerciseId, plannedExercises = currentCoursePlan().plannedExercises) {
    return plannedExercises.find((planned) => planned.exerciseId === exerciseId);
  }

  function currentCoursePlan() {
    return coursePlanById(state.selectedCourseId);
  }

  function coursePlanById(courseId) {
    return COURSE_PLANS[courseId] || COURSE_PLANS[DEFAULT_COURSE_ID];
  }

  function courseLabel(course) {
    return `${course.name} / ${course.durationMinutes}分`;
  }

  function createExerciseStatuses(order) {
    return order.reduce((statuses, exerciseId) => {
      statuses[exerciseId] = "pending";
      return statuses;
    }, {});
  }

  function moveMenuExercise(exerciseId, direction) {
    const index = state.menuOrder.indexOf(exerciseId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= state.menuOrder.length) {
      return;
    }
    const nextOrder = [...state.menuOrder];
    [nextOrder[index], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[index]];
    state.menuOrder = nextOrder;
    renderMenu();
  }

  function renderPlannedWeightEditor(planned, exercise) {
    const label = exercise.loadType === "dumbbell_each_hand"
      ? "予定重量 kg（片手）"
      : "予定重量 kg";
    return `
      <div class="weight-editor field">
        <label for="planned-weight-${exercise.id}">${label}</label>
        <input id="planned-weight-${exercise.id}" data-planned-weight="${exercise.id}" type="number" inputmode="decimal" min="0" step="${exercise.weightStepKg}" value="${planned.plannedWeightKg}">
      </div>
    `;
  }

  function updateMenuPlannedWeight(exerciseId, value) {
    const nextWeight = Number(value);
    if (!Number.isFinite(nextWeight) || nextWeight <= 0) {
      return;
    }
    const planned = plannedById(exerciseId, state.menuPlannedExercises);
    if (planned) {
      planned.plannedWeightKg = nextWeight;
    }
  }

  function resetWorkingMenu() {
    const course = currentCoursePlan();
    state.menuOrder = defaultOrder();
    state.menuPlannedExercises = clone(course.plannedExercises);
    state.menuReorderMode = false;
  }

  function clearSummaryTools() {
    state.copyMessage = "";
    state.markdownFallback = "";
  }

  function nextSetNumberForExercise(exerciseId) {
    const planned = plannedById(exerciseId, state.session.plannedSession.plannedExercises);
    const completedRegularSets = performedSetsFor(exerciseId).filter((set) => !set.painFlag && !set.isExtraSet).length;
    return Math.min(completedRegularSets + 1, planned.sets);
  }

  function markExerciseStarted(exerciseId) {
    const status = state.session.exerciseStatuses[exerciseId];
    if (status === "pending" || status === "deferred") {
      state.session.exerciseStatuses[exerciseId] = "in_progress";
    }
    if (!state.session.actualOrder.includes(exerciseId)) {
      state.session.actualOrder.push(exerciseId);
    }
  }

  function updateExerciseStatusAfterSet(exerciseId, rir) {
    const planned = plannedById(exerciseId, state.session.plannedSession.plannedExercises);
    const regularSets = performedSetsFor(exerciseId).filter((set) => !set.painFlag && !set.isExtraSet);
    if (rir === "0" || regularSets.length >= planned.sets) {
      state.session.exerciseStatuses[exerciseId] = "completed";
      return;
    }
    state.session.exerciseStatuses[exerciseId] = "in_progress";
  }

  function hasFollowingUnfinishedExercise(exerciseId) {
    const index = state.session.activeOrder.indexOf(exerciseId);
    return state.session.activeOrder.slice(index + 1).some((nextExerciseId) => {
      const status = state.session.exerciseStatuses[nextExerciseId] || "pending";
      return status !== "completed" && status !== "skipped";
    });
  }

  function isLastUnfinishedExercise(exerciseId) {
    const unfinished = state.session.activeOrder.filter((nextExerciseId) => {
      const status = state.session.exerciseStatuses[nextExerciseId] || "pending";
      return status !== "completed" && status !== "skipped";
    });
    return unfinished.length === 1 && unfinished[0] === exerciseId;
  }

  function rebuildSessionProgress() {
    const skipped = new Set(Object.entries(state.session.exerciseStatuses || {})
      .filter(([, status]) => status === "skipped")
      .map(([exerciseId]) => exerciseId));
    state.session.exerciseStatuses = createExerciseStatuses(state.session.plannedOrder || defaultOrder());
    skipped.forEach((exerciseId) => {
      state.session.exerciseStatuses[exerciseId] = "skipped";
    });
    state.session.actualOrder = [];
    state.session.performedSets.forEach((set) => {
      if (!state.session.actualOrder.includes(set.exerciseId)) {
        state.session.actualOrder.push(set.exerciseId);
      }
      if (set.painFlag) {
        state.session.exerciseStatuses[set.exerciseId] = "completed";
        return;
      }
      updateExerciseStatusAfterSet(set.exerciseId, set.rir);
    });
    recalculateAllOutBan();
  }

  function renderOrderSummary(session) {
    if (sameOrder(session.plannedOrder, session.actualOrder)) {
      return "";
    }

    const planned = formatOrder(session.plannedOrder);
    const actual = session.actualOrder.length ? formatOrder(session.actualOrder) : "記録なし";
    return `
      <section class="summary-card order-summary">
        <h2>実施順</h2>
        <p class="muted">予定順: ${planned}</p>
        <p class="muted">実施順: ${actual}</p>
      </section>
    `;
  }

  function formatOrder(order) {
    return order.map((exerciseId) => EXERCISES[exerciseId]?.name || exerciseId).join(" → ");
  }

  function sameOrder(left = [], right = []) {
    if (left.length !== right.length) {
      return false;
    }
    return left.every((exerciseId, index) => exerciseId === right[index]);
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
    const courseId = sessionCourseId(session);
    const plannedOrder = session.plannedOrder || session.plannedSession?.plannedExercises?.map((planned) => planned.exerciseId) || defaultOrder();
    session.courseId = courseId;
    session.course_id = courseId;
    if (session.plannedSession) {
      session.plannedSession.courseId = session.plannedSession.courseId || courseId;
      session.plannedSession.course_id = session.plannedSession.course_id || courseId;
    }
    session.plannedOrder = plannedOrder;
    session.activeOrder = session.activeOrder || [...plannedOrder];
    session.actualOrder = session.actualOrder || [];
    session.exerciseStatuses = {
      ...createExerciseStatuses(plannedOrder),
      ...(session.exerciseStatuses || {}),
    };
    session.performedSets = (session.performedSets || []).map((set) => ({
      isExtraSet: false,
      ...set,
    }));
    session.coachMemo = session.coachMemo || "";
    session.allOutBanned = Boolean(session.allOutBanned);
    return session;
  }

  function sessionCourseId(session) {
    const explicit = session?.courseId || session?.course_id || session?.plannedSession?.courseId || session?.plannedSession?.course_id;
    if (COURSE_PLANS[explicit]) {
      return explicit;
    }

    const legacyId = session?.plannedSession?.id || session?.id || "";
    if (legacyId.includes("back")) {
      return "back_45_v0.7";
    }
    if (legacyId.includes("chest")) {
      return "chest_45_v0.5";
    }
    const exerciseIds = (session?.plannedSession?.plannedExercises || []).map((planned) => planned.exerciseId);
    if (exerciseIds.some((exerciseId) => ["deadlift", "lat_pulldown", "seated_row", "machine_row"].includes(exerciseId))) {
      return "back_45_v0.7";
    }
    if (exerciseIds.some((exerciseId) => ["bench_press", "incline_dumbbell_fly", "dumbbell_fly", "pectoral_fly"].includes(exerciseId))) {
      return "chest_45_v0.5";
    }
    return DEFAULT_COURSE_ID;
  }

  function loadLastCourseId() {
    const saved = window.localStorage.getItem(STORAGE_LAST_COURSE_KEY);
    return COURSE_PLANS[saved] ? saved : DEFAULT_COURSE_ID;
  }

  function saveLastCourseId(courseId) {
    if (COURSE_PLANS[courseId]) {
      window.localStorage.setItem(STORAGE_LAST_COURSE_KEY, courseId);
    }
  }

  function discardActiveSession(sessionId) {
    if (sessionId) {
      const sessions = loadSessions().filter((session) => session.id !== sessionId);
      window.localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    }
    window.localStorage.removeItem(STORAGE_ACTIVE_KEY);
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

  function buildMarkdownLog(session) {
    normalizeLoadedSession(session);
    const lines = [
      "# Morning Gym Coach Log",
      "",
      `日付: ${sessionDate(session)}`,
      `メニュー: ${session.plannedSession.name} / ${session.plannedSession.durationMinutes}分`,
      "",
      "## 予定順",
      formatOrder(session.plannedOrder),
      "",
      "## 実施順",
      session.actualOrder.length ? formatOrder(session.actualOrder) : "記録なし",
      "",
    ];

    session.plannedSession.plannedExercises.forEach((planned) => {
      const exercise = EXERCISES[planned.exerciseId];
      const sets = session.performedSets.filter((set) => set.exerciseId === planned.exerciseId);
      const status = session.exerciseStatuses[planned.exerciseId] || "pending";
      lines.push(`## ${exercise.name}`);
      lines.push(`予定: ${formatWeight(planned.plannedWeightKg, exercise.loadType)} / ${planned.sets}セット / ${formatRepRange(planned, exercise)}`);
      lines.push("実績:");
      if (status === "skipped") {
        lines.push("- スキップ");
      } else if (sets.length) {
        sets.forEach((set) => lines.push(markdownPerformedSet(set, exercise)));
      } else {
        lines.push("- 記録なし");
      }
      lines.push("");
    });

    lines.push("## メモ");
    const notes = markdownNotes(session);
    if (notes.length) {
      notes.forEach((note) => lines.push(`- ${note}`));
    } else {
      lines.push("- 特記事項なし");
    }
    lines.push("");
    lines.push("## ChatGPTへの依頼");
    lines.push("次回の重量、種目順、オールアウト種目、必要なら推定1RMを見てください。");
    return lines.join("\n");
  }

  function markdownPerformedSet(set, exercise) {
    if (set.painFlag) {
      return `- ${set.isExtraSet ? "追加: " : ""}痛みあり`;
    }
    const prefix = set.isExtraSet ? "追加: " : "";
    return `- ${prefix}${formatWeight(set.actualWeightKg, exercise.loadType)} x ${set.reps}回 RIR${set.rir}`;
  }

  function markdownNotes(session) {
    const notes = [];
    const extraExercises = session.plannedSession.plannedExercises
      .filter((planned) => session.performedSets.some((set) => set.exerciseId === planned.exerciseId && set.isExtraSet))
      .map((planned) => EXERCISES[planned.exerciseId].name);
    const skippedExercises = Object.entries(session.exerciseStatuses || {})
      .filter(([, status]) => status === "skipped")
      .map(([exerciseId]) => EXERCISES[exerciseId]?.name || exerciseId);
    const painExercises = [...new Set(session.performedSets
      .filter((set) => set.painFlag)
      .map((set) => EXERCISES[set.exerciseId]?.name || set.exerciseId))];
    const warningRirZero = [...new Set(session.performedSets
      .filter((set) => {
        const planned = plannedById(set.exerciseId, session.plannedSession.plannedExercises);
        return set.rir === "0" && planned && !planned.allOutAllowed;
      })
      .map((set) => EXERCISES[set.exerciseId]?.name || set.exerciseId))];
    const allOutRirZero = [...new Set(session.performedSets
      .filter((set) => {
        const planned = plannedById(set.exerciseId, session.plannedSession.plannedExercises);
        return set.rir === "0" && planned?.allOutAllowed;
      })
      .map((set) => EXERCISES[set.exerciseId]?.name || set.exerciseId))];

    if (extraExercises.length) {
      notes.push(`追加セット: ${extraExercises.join("、")}`);
    }
    if (skippedExercises.length) {
      notes.push(`スキップ: ${skippedExercises.join("、")}`);
    }
    if (painExercises.length) {
      notes.push(`痛みあり: ${painExercises.join("、")}`);
    }
    if (warningRirZero.length) {
      notes.push(`RIR0記録あり。次回はフォーム確認: ${warningRirZero.join("、")}`);
    }
    if (allOutRirZero.length) {
      notes.push(`オールアウト記録: ${allOutRirZero.join("、")}`);
    }
    if (!sameOrder(session.plannedOrder, session.actualOrder)) {
      notes.push("予定順と実施順が違います");
    }
    return notes;
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
    if (!planned.allOutAllowed) {
      return "RIR0は非推奨。警告付きで記録可。";
    }
    if (planned.restPauseAllowed) {
      return "最終セットのみオールアウト可。レストポーズ可。";
    }
    return planned.allOutAllowed ? "RIR0可。" : "フォーム優先。";
  }

  function inputSafetyText(planned, setNumber) {
    if (state.session?.allOutBanned) {
      return "痛みあり後: RIR0とレストポーズは禁止。";
    }
    if (!planned.allOutAllowed) {
      return "RIR0は非推奨。記録前に確認します。";
    }
    if (setNumber < planned.sets) {
      return "RIR0は最終セットのみ。フォーム優先。";
    }
    if (!canUseAllOutAsPlanned(planned, setNumber)) {
      return "後続種目あり。RIR0は確認して記録。";
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
    return planned.restPauseAllowed
      && setNumber >= planned.sets
      && isLastUnfinishedExercise(planned.exerciseId);
  }

  function canUseAllOutAsPlanned(planned, setNumber) {
    if (state.session?.allOutBanned) {
      return false;
    }
    return planned.allOutAllowed
      && setNumber >= planned.sets
      && isLastUnfinishedExercise(planned.exerciseId);
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

  function summaryNotes(planned, exercise, sets, status) {
    const notes = [];
    if (status === "deferred" || wasDeferred(planned.exerciseId)) {
      notes.push("後回しあり");
    }
    if (status === "skipped") {
      notes.push("スキップ");
    }
    if (sets.some((set) => set.painFlag)) {
      notes.push("痛みあり");
    }
    if (!planned.allOutAllowed && sets.some((set) => set.rir === "0")) {
      notes.push("RIR0記録あり。次回はフォーム確認");
    }
    if (sets.some((set) => set.isExtraSet)) {
      notes.push("追加セットあり");
    }
    return notes.join(" / ");
  }

  function wasDeferred(exerciseId) {
    const plannedIndex = (state.session.plannedOrder || []).indexOf(exerciseId);
    const activeIndex = (state.session.activeOrder || []).indexOf(exerciseId);
    return plannedIndex >= 0 && activeIndex >= 0 && plannedIndex !== activeIndex;
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

    if (!planned.allOutAllowed && regularSets.some((set) => set.rir === "0")) {
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

  function todayKey() {
    return dateKey(new Date());
  }

  function sessionDate(session) {
    if (session?.plannedSession?.date) {
      return session.plannedSession.date;
    }
    return session?.startedAt ? dateKey(new Date(session.startedAt)) : "";
  }

  function isTodaySession(session) {
    return sessionDate(session) === todayKey();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
})();
