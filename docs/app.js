(() => {
  "use strict";

  const STORAGE_SESSIONS_KEY = "morning-gym-coach:v0.1:sessions";
  const STORAGE_ACTIVE_KEY = "morning-gym-coach:v0.1:activeSession";
  const STORAGE_LAST_COURSE_KEY = "morning-gym-coach:v0.5:lastCourse";
  const STORAGE_BASELINE_WEIGHTS_KEY = "morning-gym-coach:v0.8:baselineWeights";
  const STORAGE_BASELINE_SET_COUNTS_KEY = "morning-gym-coach:vNext:baselineSetCounts";
  const APP_VERSION = "vNext";
  const DEFAULT_COURSE_ID = "legs_45_v0.5";
  const RIR_ZERO_WARNING = "この種目でRIR0は非推奨です。フォームが崩れていない場合のみ記録してください。";
  const LEG_EXTENSION_ALLOUT_WARNING = "まだ後続種目があります。ここでオールアウトすると後の種目に影響します。記録しますか？";
  const SAME_EXERCISE_ALLOUT_WARNING = "まだこの種目の予定セットが残っています。ここでRIR0にすると後続セットに影響します。記録しますか？";

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
    smith_shoulder_press: {
      id: "smith_shoulder_press",
      name: "スミスショルダープレス",
      type: "heavy_compound",
      loadType: "smith_machine_total",
      weightStepKg: 2.5,
      defaultRepRange: "6〜10",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    side_raise: {
      id: "side_raise",
      name: "サイドレイズ",
      type: "isolation",
      loadType: "dumbbell_each_hand",
      weightStepKg: 2.5,
      defaultRepRange: "12〜20",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    machine_shoulder_press: {
      id: "machine_shoulder_press",
      name: "マシンショルダープレス",
      type: "machine",
      loadType: "machine_stack",
      weightStepKg: 2.5,
      defaultRepRange: "8〜12",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    face_pull: {
      id: "face_pull",
      name: "フェイスプル",
      type: "isolation",
      loadType: "cable_stack",
      weightStepKg: 2.5,
      defaultRepRange: "12〜20",
      allOutAllowed: true,
      restPauseAllowed: true,
    },
    ez_bar_curl: {
      id: "ez_bar_curl",
      name: "EZバーカール",
      type: "isolation",
      loadType: "ez_bar_total",
      weightStepKg: 2.5,
      defaultRepRange: "8〜12",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    french_press: {
      id: "french_press",
      name: "フレンチプレス",
      type: "isolation",
      loadType: "dumbbell_total",
      weightStepKg: 2.5,
      defaultRepRange: "10〜15",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    incline_dumbbell_curl: {
      id: "incline_dumbbell_curl",
      name: "インクラインダンベルカール",
      type: "isolation",
      loadType: "dumbbell_each_hand",
      weightStepKg: 2.5,
      defaultRepRange: "10〜12",
      allOutAllowed: false,
      restPauseAllowed: false,
    },
    cable_pressdown: {
      id: "cable_pressdown",
      name: "ケーブルプレスダウン",
      type: "isolation",
      loadType: "cable_stack",
      weightStepKg: 2.5,
      defaultRepRange: "12〜15",
      allOutAllowed: true,
      restPauseAllowed: true,
    },
  };

  const COURSE_PLANS = {
    "legs_45_v0.5": {
      courseId: "legs_45_v0.5",
      id: "legs_45_v0.5",
      courseGroup: "legs",
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
          sets: 3,
          repRange: "8〜10",
          targetRir: [3, 2, 1],
          restSeconds: 120,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "leg_extension",
          plannedWeightKg: 30,
          sets: 3,
          repRange: "12〜15",
          targetRir: [2, 1, 0],
          restSeconds: 60,
          allOutAllowed: true,
          restPauseAllowed: true,
        },
      ],
    },
    "chest_45_v0.5": {
      courseId: "chest_45_v0.5",
      id: "chest_45_v0.5",
      courseGroup: "chest",
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
          sets: 3,
          repRange: "10〜12",
          targetRir: [2, 1, 1],
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
          sets: 3,
          repRange: "12〜15",
          targetRir: [2, 1, 0],
          restSeconds: 60,
          allOutAllowed: true,
          restPauseAllowed: true,
        },
      ],
    },
    "back_45_v0.7": {
      courseId: "back_45_v0.7",
      id: "back_45_v0.7",
      courseGroup: "back",
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
          sets: 3,
          repRange: "8〜12",
          targetRir: [2, 1, 1],
          restSeconds: 120,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "machine_row",
          plannedWeightKg: 35,
          sets: 3,
          repRange: "10〜12",
          targetRir: [2, 1, 0],
          restSeconds: 90,
          allOutAllowed: true,
          restPauseAllowed: true,
        },
      ],
    },
    "shoulder_45_v0.10": {
      courseId: "shoulder_45_v0.10",
      id: "shoulder_45_v0.10",
      courseGroup: "shoulder",
      name: "肩",
      durationMinutes: 45,
      plannedExercises: [
        {
          exerciseId: "smith_shoulder_press",
          plannedWeightKg: 30,
          sets: 3,
          repRange: "6〜10",
          targetRir: [3, 2, 1],
          restSeconds: 150,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "side_raise",
          plannedWeightKg: 7.5,
          sets: 3,
          repRange: "12〜20",
          targetRir: [2, 1, 1],
          restSeconds: 75,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "machine_shoulder_press",
          plannedWeightKg: 25,
          sets: 2,
          repRange: "8〜12",
          targetRir: [2, 1],
          restSeconds: 120,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "face_pull",
          plannedWeightKg: 20,
          sets: 2,
          repRange: "12〜20",
          targetRir: [1, 0],
          restSeconds: 60,
          allOutAllowed: true,
          restPauseAllowed: true,
        },
      ],
    },
    "arms_45_v0.10": {
      courseId: "arms_45_v0.10",
      id: "arms_45_v0.10",
      courseGroup: "arms",
      name: "腕",
      durationMinutes: 45,
      plannedExercises: [
        {
          exerciseId: "ez_bar_curl",
          plannedWeightKg: 20,
          sets: 3,
          repRange: "8〜12",
          targetRir: [2, 1, 1],
          restSeconds: 90,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "french_press",
          plannedWeightKg: 15,
          sets: 3,
          repRange: "10〜15",
          targetRir: [2, 1, 1],
          restSeconds: 90,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "incline_dumbbell_curl",
          plannedWeightKg: 7.5,
          sets: 2,
          repRange: "10〜12",
          targetRir: [2, 1],
          restSeconds: 90,
          allOutAllowed: false,
          restPauseAllowed: false,
        },
        {
          exerciseId: "cable_pressdown",
          plannedWeightKg: 25,
          sets: 2,
          repRange: "12〜15",
          targetRir: [1, 0],
          restSeconds: 60,
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
    warmupMode: false,
    warmupDraft: {
      actualWeightKg: "",
      reps: "",
    },
    warmupSelectedRir: null,
    timerId: null,
    timerTotal: 0,
    timerPlannedSeconds: 0,
    timerRemaining: 0,
    timerStartedAt: null,
    timerSetIndex: null,
    restFinished: false,
    restNotified: false,
    coachNote: "",
    copyMessage: "",
    markdownFallback: "",
    settingsMessage: "",
    coachUpdateOpen: false,
    coachUpdateRaw: "",
    coachUpdatePreview: null,
    coachUpdateError: "",
    summaryMessage: "",
    editingSet: null,
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

    if (state.view === "history") {
      renderHistory();
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
    const coursePreviousText = courseLastWorkoutText(course);
    if (!state.menuOrder.length) {
      state.menuOrder = defaultOrder();
    }
    if (!state.menuPlannedExercises.length) {
      state.menuPlannedExercises = applyMenuBaselines(clone(course.plannedExercises), course.courseId);
    }
    const estimateMinutes = estimateMenuDurationMinutes(state.menuPlannedExercises);
    const estimateWarning = estimateMinutes > 45
      ? '<p class="helper-text warning-text">セット数が多く、45分を超える可能性があります。</p>'
      : "";
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
          ${renderPlannedSetCountEditor(planned, exercise)}
          <p class="helper-text">${menuSafetyText(planned, exercise)}</p>
          <p class="helper-text">${exercise.name}: ${previousExerciseText(exercise.id)}</p>
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
            <p class="helper-text">前回: ${coursePreviousText}</p>
          </div>
        </header>
        <div class="estimate-card">
          <strong>推定: 約${estimateMinutes}分</strong>
          ${estimateWarning}
        </div>
        <div class="stack">${cards}</div>
        <div class="action-row">
          ${activeSession ? '<button class="button" id="continue-session" type="button">続きから</button>' : ""}
          <button class="button ghost" id="toggle-reorder" type="button">${state.menuReorderMode ? "順番変更を閉じる" : "順番を変更"}</button>
          <button class="button ghost" id="save-baseline-set-counts" type="button">このセット数を次回の基準にする</button>
          <button class="button ghost" id="open-history" type="button">履歴</button>
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
    document.querySelectorAll("[data-set-count-minus]").forEach((button) => {
      button.addEventListener("click", () => adjustMenuSetCount(button.dataset.setCountMinus, -1));
    });
    document.querySelectorAll("[data-set-count-plus]").forEach((button) => {
      button.addEventListener("click", () => adjustMenuSetCount(button.dataset.setCountPlus, 1));
    });
    document.getElementById("save-baseline-set-counts").addEventListener("click", saveBaselineSetCountsFromMenu);
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

    document.getElementById("open-history").addEventListener("click", () => {
      clearSummaryTools();
      setView("history");
    });

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
    const inputBody = state.warmupMode
      ? renderWarmupInput(planned, exercise)
      : renderWorkSetInput(planned, exercise, setNumber, isExtraSet, targetRir, lastSet);

    app.innerHTML = `
      <section class="screen">
        ${renderAppHeader()}
        <header class="screen-header">
          <div>
            <p class="eyebrow">${state.session.plannedSession.name} / ${state.session.plannedSession.durationMinutes}分</p>
            <h1>${exercise.name} ${state.warmupMode ? "ウォームアップ" : isExtraSet ? "追加セット" : `${setNumber}セット目`}</h1>
          </div>
        </header>
        ${inputBody}
      </section>
      ${renderOverlayPanels()}
    `;

    wireInputControls();
    wireGlobalControls();
  }

  function renderWorkSetInput(planned, exercise, setNumber, isExtraSet, targetRir, lastSet) {
    const rirButtons = RIR_OPTIONS.map((rir) => {
      const disabled = rir === "0" && state.session.allOutBanned;
      const selected = state.selectedRir === rir ? " selected" : "";
      return `<button class="rir-button${selected}" type="button" data-rir="${rir}" ${disabled ? "disabled" : ""}>${rir}</button>`;
    }).join("");

    return `
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
          <button class="button ghost" id="open-warmup" type="button">ウォームアップを追加</button>
          <button class="button ghost" id="defer-exercise" type="button">この種目を後回し</button>
          <button class="button warning" id="skip-exercise" type="button">今日はこの種目をスキップ</button>
          <button class="button danger" id="pain-button" type="button">痛みあり</button>
        </div>
    `;
  }

  function renderWarmupInput(planned, exercise) {
    ensureWarmupDraft(planned);
    const rirButtons = RIR_OPTIONS.map((rir) => {
      const disabled = rir === "0" && state.session.allOutBanned;
      const selected = state.warmupSelectedRir === rir ? " selected" : "";
      return `<button class="rir-button${selected}" type="button" data-warmup-rir="${rir}" ${disabled ? "disabled" : ""}>${rir}</button>`;
    }).join("");

    return `
        <section class="mini-panel">
          <h3>ウォームアップ</h3>
          <p class="helper-text">本番セット数にはカウントしません。RIRは未入力でも保存できます。</p>
        </section>
        <section class="panel">
          <h2>実際</h2>
          <div class="input-grid">
            <div class="field">
              <label for="warmup-weight">重量 kg</label>
              <input id="warmup-weight" type="number" inputmode="decimal" min="0" step="${exercise.weightStepKg}" value="${state.warmupDraft.actualWeightKg}">
            </div>
            <div class="field">
              <label for="warmup-reps">回数</label>
              <input id="warmup-reps" type="number" inputmode="numeric" min="0" step="1" value="${state.warmupDraft.reps}">
            </div>
          </div>
          <h3>RIR（任意）</h3>
          <div class="rir-grid">${rirButtons}</div>
          <p class="helper-text">未選択のままでも記録できます。</p>
        </section>
        <div class="action-row">
          <button class="button primary" id="record-warmup" type="button">ウォームアップを記録</button>
          <button class="button ghost" id="close-warmup" type="button">本番セットへ</button>
        </div>
    `;
  }

  function wireInputControls() {
    const actualWeight = document.getElementById("actual-weight");
    if (actualWeight) {
      actualWeight.addEventListener("input", (event) => {
        state.draft.actualWeightKg = event.target.value;
      });
    }
    const actualReps = document.getElementById("actual-reps");
    if (actualReps) {
      actualReps.addEventListener("input", (event) => {
        state.draft.reps = event.target.value;
      });
    }
    document.querySelectorAll("[data-rir]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedRir = button.dataset.rir;
        renderInput();
      });
    });
    document.querySelectorAll("[data-warmup-rir]").forEach((button) => {
      button.addEventListener("click", () => {
        state.warmupSelectedRir = button.dataset.warmupRir;
        renderInput();
      });
    });

    const warmupWeight = document.getElementById("warmup-weight");
    if (warmupWeight) {
      warmupWeight.addEventListener("input", (event) => {
        state.warmupDraft.actualWeightKg = event.target.value;
      });
    }
    const warmupReps = document.getElementById("warmup-reps");
    if (warmupReps) {
      warmupReps.addEventListener("input", (event) => {
        state.warmupDraft.reps = event.target.value;
      });
    }

    const openWarmupButton = document.getElementById("open-warmup");
    if (openWarmupButton) {
      openWarmupButton.addEventListener("click", () => {
        state.warmupMode = true;
        ensureWarmupDraft(currentPlanned());
        renderInput();
      });
    }
    const closeWarmupButton = document.getElementById("close-warmup");
    if (closeWarmupButton) {
      closeWarmupButton.addEventListener("click", () => {
        state.warmupMode = false;
        resetWarmupDraft();
        renderInput();
      });
    }
    const recordWarmupButton = document.getElementById("record-warmup");
    if (recordWarmupButton) {
      recordWarmupButton.addEventListener("click", recordWarmupSet);
    }

    const recordSetButton = document.getElementById("record-set");
    if (recordSetButton) {
      recordSetButton.addEventListener("click", recordSet);
    }
    const deferButton = document.getElementById("defer-exercise");
    if (deferButton) {
      deferButton.addEventListener("click", deferCurrentExercise);
    }
    const skipButton = document.getElementById("skip-exercise");
    if (skipButton) {
      skipButton.addEventListener("click", skipCurrentExercise);
    }
    const painButton = document.getElementById("pain-button");
    if (painButton) {
      painButton.addEventListener("click", handlePain);
    }

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
      : `${exercise.name} ${set.isWarmup ? "ウォームアップ" : set.isExtraSet ? "追加セット" : `${set.setNumber}セット目`}`;
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
          <p class="helper-text">前回なし</p>
        </section>
      `;
    }

    const exercise = EXERCISES[exerciseId];
    const previousText = previousSessionText(previous.session, state.session);
    const rows = previous.sets.map((set) => {
      if (set.painFlag) {
        return "<li>痛みあり</li>";
      }
      return `<li>${formatWeight(set.actualWeightKg, exercise.loadType)} x ${set.reps} RIR${set.rir}</li>`;
    }).join("");

    return `
      <section class="mini-panel previous-record">
        <h3>前回</h3>
        <p class="helper-text">${exercise.name}: ${previousText}</p>
        <ul class="compact-list">${rows}</ul>
      </section>
    `;
  }

  function findPreviousExerciseRecord(exerciseId) {
    const currentId = state.session?.id;
    const sessions = loadSessions()
      .map(normalizeLoadedSession)
      .filter((session) => session.id !== currentId)
      .filter((session) => session.status !== "active")
      .filter((session) => isBeforeReferenceSession(session, state.session))
      .sort(sortBySessionStart);

    for (let index = sessions.length - 1; index >= 0; index -= 1) {
      const session = sessions[index];
      const sets = session.performedSets.filter((set) => set.exerciseId === exerciseId && !set.isWarmup);
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
    const timerLabel = restTimerLabel(info);
    const interExerciseRestLine = !state.restFinished && isInterExerciseTransition(info)
      ? `<p class="helper-text">休憩 ${state.timerTotal}秒</p>`
      : "";
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
          <p class="timer-label">${state.restFinished ? "休憩終了" : timerLabel}</p>
          <div class="timer-count ${state.restFinished ? "rest-ended" : ""}">${state.timerRemaining}</div>
          ${state.restFinished ? '<p class="notice-pill">休憩終了</p>' : ""}
          ${interExerciseRestLine}
          <div class="next-lines">${nextLines}</div>
        </div>
        <div class="timer-actions">
          <button class="button ghost" id="subtract-rest" type="button">-30秒</button>
          <button class="button ghost" id="add-rest" type="button">+30秒</button>
          <button class="button warning" id="finish-rest-now" type="button">休憩終了</button>
          <button class="button ghost" id="reset-rest" type="button">規定秒数に戻す</button>
          <button class="button primary timer-primary" id="rest-primary" type="button">${info.primaryLabel}</button>
          ${extraButton || endExerciseButton}
        </div>
      </section>
      ${renderOverlayPanels()}
    `;

    document.getElementById("subtract-rest").addEventListener("click", () => {
      state.timerRemaining = Math.max(0, state.timerRemaining - 30);
      if (state.timerRemaining === 0) {
        finishRestTimer({ manual: true });
        return;
      }
      state.restFinished = false;
      renderRest();
      startTimerInterval();
    });
    document.getElementById("add-rest").addEventListener("click", () => {
      state.timerRemaining += 30;
      state.restFinished = false;
      state.restNotified = false;
      renderRest();
      startTimerInterval();
    });
    document.getElementById("finish-rest-now").addEventListener("click", () => finishRestTimer({ manual: true }));
    document.getElementById("reset-rest").addEventListener("click", resetRestTimerToPlanned);
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

  function isInterExerciseTransition(info) {
    return info?.kind === "nextExercise" || info?.kind === "deferred";
  }

  function restTimerLabel(info) {
    return isInterExerciseTransition(info) ? "種目間休憩" : `休憩 ${state.timerTotal}秒`;
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
    const sessionMeta = renderSessionMetaSummary(session);
    const orderSummary = renderOrderSummary(session);
    const cards = session.plannedSession.plannedExercises.map((planned) => {
      const exercise = EXERCISES[planned.exerciseId];
      const setEntries = session.performedSets
        .map((set, index) => ({ set, index }))
        .filter((entry) => entry.set.exerciseId === planned.exerciseId);
      const sets = setEntries.map((entry) => entry.set);
      const warmupEntries = setEntries.filter((entry) => entry.set.isWarmup);
      const workEntries = setEntries.filter((entry) => !entry.set.isWarmup);
      const workSets = workEntries.map((entry) => entry.set);
      const status = session.exerciseStatuses[planned.exerciseId] || "pending";
      const plannedRows = Array.from({ length: planned.sets }, (_, index) => {
        const setNumber = index + 1;
        return `<li>${setNumber}. ${formatWeight(planned.plannedWeightKg, exercise.loadType)} / ${formatRepRange(planned, exercise)} / RIR${targetRirFor(planned, setNumber)}</li>`;
      }).join("");
      const warmupRows = warmupEntries.length
        ? warmupEntries.map((entry) => renderPerformedSetRow(entry.set, exercise, entry.index)).join("")
        : '<li class="muted">なし</li>';
      const actualRows = status === "skipped" && !workEntries.length
        ? '<li class="muted">スキップ</li>'
        : workEntries.length
        ? workEntries.map((entry) => renderPerformedSetRow(entry.set, exercise, entry.index)).join("")
        : '<li class="muted">記録なし</li>';
      const notes = summaryNotes(planned, exercise, sets, status);
      const baselineButton = renderBaselineSaveButton(planned, exercise, workSets);

      return `
        <section class="summary-card">
          <h2>${exercise.name}</h2>
          <h3 class="summary-section-title">予定セット</h3>
          <ul class="summary-list">${plannedRows}</ul>
          <h3 class="summary-section-title">ウォームアップ</h3>
          <ul class="summary-list">${warmupRows}</ul>
          <h3 class="summary-section-title">本番セット</h3>
          <ul class="summary-list">${actualRows}</ul>
          ${notes ? `<p class="summary-note">${notes}</p>` : ""}
          <p class="judge">判定: ${judgeExercise(planned, exercise, workSets)}</p>
          ${baselineButton}
        </section>
      `;
    }).join("");

    app.innerHTML = `
      <section class="screen">
        ${renderAppHeader()}
        <header class="screen-header">
          <div>
            <p class="eyebrow">${sessionDateLabel(session)}</p>
            <h1>トレ後まとめ</h1>
          </div>
        </header>
        ${sessionMeta}
        ${orderSummary}
        ${renderLogTools(session)}
        ${renderCoachMemoSummary(session)}
        ${state.summaryMessage ? `<p class="notice-pill inline-notice">${state.summaryMessage}</p>` : ""}
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
    wireSummarySetControls();
    wireBaselineSaveButtons();
    wireGlobalControls();
  }

  function renderPerformedSetRow(set, exercise, setIndex) {
    const editing = state.editingSet
      && state.editingSet.sessionId === state.session.id
      && state.editingSet.setIndex === setIndex;
    const editor = editing ? renderSetEditor(set, exercise, setIndex) : "";
    return `
      <li>
        <div class="set-row">
          <span>${formatPerformedSet(set, exercise)}</span>
          <div class="set-actions">
            <button class="button ghost mini-button" type="button" data-edit-set="${setIndex}">修正</button>
            <button class="button warning mini-button" type="button" data-delete-set="${setIndex}">削除</button>
          </div>
        </div>
        ${editor}
      </li>
    `;
  }

  function renderSetEditor(set, exercise, setIndex) {
    const rirOptions = ["", ...RIR_OPTIONS].map((rir) => {
      const selected = String(set.rir ?? "") === rir ? " selected" : "";
      const label = rir || "未入力";
      return `<option value="${rir}"${selected}>${label}</option>`;
    }).join("");
    const reps = set.reps ?? "";
    const note = set.note || "";

    return `
      <div class="set-editor" data-set-editor="${setIndex}">
        <div class="input-grid">
          <div class="field">
            <label for="edit-weight-${setIndex}">重量 kg</label>
            <input id="edit-weight-${setIndex}" type="number" inputmode="decimal" min="0" step="${exercise.weightStepKg}" value="${set.actualWeightKg ?? ""}">
          </div>
          <div class="field">
            <label for="edit-reps-${setIndex}">回数</label>
            <input id="edit-reps-${setIndex}" type="number" inputmode="numeric" min="0" step="1" value="${reps}">
          </div>
        </div>
        <div class="field">
          <label for="edit-rir-${setIndex}">RIR</label>
          <select id="edit-rir-${setIndex}">${rirOptions}</select>
        </div>
        <div class="field">
          <label for="edit-note-${setIndex}">メモ</label>
          <textarea id="edit-note-${setIndex}" rows="3">${escapeHtml(note)}</textarea>
        </div>
        <div class="compact-actions">
          <button class="button" type="button" data-save-set="${setIndex}">保存</button>
          <button class="button ghost" type="button" data-cancel-set-edit="${setIndex}">キャンセル</button>
        </div>
      </div>
    `;
  }

  function renderBaselineSaveButton(planned, exercise, sets) {
    const latestSet = [...sets].reverse().find((set) => !set.painFlag && Number.isFinite(Number(set.actualWeightKg)));
    if (!latestSet) {
      return "";
    }
    const weight = Number(latestSet.actualWeightKg);
    return `
      <button class="button ghost baseline-save-button" type="button" data-save-baseline="${planned.exerciseId}" data-baseline-weight="${weight}">
        ${formatWeight(weight, exercise.loadType)}を次回基準にする
      </button>
    `;
  }

  function wireSummarySetControls() {
    document.querySelectorAll("[data-edit-set]").forEach((button) => {
      button.addEventListener("click", () => {
        state.editingSet = {
          sessionId: state.session.id,
          setIndex: Number(button.dataset.editSet),
        };
        renderSummary();
      });
    });

    document.querySelectorAll("[data-cancel-set-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        state.editingSet = null;
        renderSummary();
      });
    });

    document.querySelectorAll("[data-save-set]").forEach((button) => {
      button.addEventListener("click", () => saveEditedSet(Number(button.dataset.saveSet)));
    });

    document.querySelectorAll("[data-delete-set]").forEach((button) => {
      button.addEventListener("click", () => deleteSummarySet(Number(button.dataset.deleteSet)));
    });
  }

  function wireBaselineSaveButtons() {
    document.querySelectorAll("[data-save-baseline]").forEach((button) => {
      button.addEventListener("click", () => {
        saveBaselineWeight(button.dataset.saveBaseline, Number(button.dataset.baselineWeight));
      });
    });
  }

  function renderHistory() {
    const sessions = loadSessions()
      .map(normalizeLoadedSession)
      .sort((left, right) => sortBySessionStart(right, left));
    const rows = sessions.length
      ? sessions.map((session) => `
        <button class="history-row" type="button" data-history-session="${session.id}">
          <span>
            <strong>${sessionDateLabel(session)} ${sessionStartTimeLabel(session)}</strong>
            <em>${courseLabelForSession(session)}</em>
            <small>所要時間: ${sessionDurationLabel(session)}</small>
          </span>
          <small>${session.status === "active" ? "進行中" : "まとめ"}</small>
        </button>
      `).join("")
      : '<p class="helper-text">履歴はまだありません。</p>';

    app.innerHTML = `
      <section class="screen">
        ${renderAppHeader()}
        <header class="screen-header">
          <div>
            <p class="eyebrow">過去ログ</p>
            <h1>履歴</h1>
          </div>
        </header>
        <div class="history-list">${rows}</div>
        <div class="action-row">
          <button class="button ghost" id="history-back-menu" type="button">メニューへ</button>
        </div>
      </section>
      ${renderOverlayPanels()}
    `;

    document.querySelectorAll("[data-history-session]").forEach((button) => {
      button.addEventListener("click", () => {
        const session = loadSessions().map(normalizeLoadedSession).find((item) => item.id === button.dataset.historySession);
        if (!session) {
          state.settingsMessage = "履歴を読み込めませんでした。";
          renderHistory();
          return;
        }
        state.session = session;
        clearSummaryTools();
        state.summaryMessage = "";
        state.editingSet = null;
        setView("summary");
      });
    });

    document.getElementById("history-back-menu").addEventListener("click", () => {
      state.session = loadActiveSession();
      setView("menu");
    });
    wireGlobalControls();
  }

  function courseLabelForSession(session) {
    return `${session.plannedSession?.name || coursePlanById(sessionCourseId(session)).name} / ${session.plannedSession?.durationMinutes || 45}分`;
  }

  function saveEditedSet(setIndex) {
    const session = state.session;
    const set = session?.performedSets?.[setIndex];
    if (!session || !set) {
      return;
    }

    const actualWeightKg = Number(document.getElementById(`edit-weight-${setIndex}`)?.value);
    const repsInput = document.getElementById(`edit-reps-${setIndex}`)?.value || "";
    const rir = document.getElementById(`edit-rir-${setIndex}`)?.value || null;
    const note = document.getElementById(`edit-note-${setIndex}`)?.value || "";

    if (!Number.isFinite(actualWeightKg) || actualWeightKg <= 0) {
      window.alert("重量を入力してください。");
      return;
    }

    const reps = repsInput === "" ? null : Number.parseInt(repsInput, 10);
    if (repsInput !== "" && (!Number.isInteger(reps) || reps < 0)) {
      window.alert("回数を入力してください。");
      return;
    }

    set.actualWeightKg = actualWeightKg;
    set.reps = reps;
    set.rir = rir;
    set.rpe = rir ? rirToRpe(rir) : null;
    set.isAllOut = rir === "0";
    set.note = note;
    session.performedSets[setIndex] = set;
    state.session = session;
    rebuildSessionProgress();
    saveSession(session);
    state.editingSet = null;
    state.summaryMessage = "セットを修正しました";
    renderSummary();
  }

  function deleteSummarySet(setIndex) {
    const session = state.session;
    if (!session?.performedSets?.[setIndex]) {
      return;
    }
    if (!window.confirm("このセットを削除します。よろしいですか？")) {
      return;
    }
    session.performedSets.splice(setIndex, 1);
    state.session = session;
    rebuildSessionProgress();
    saveSession(session);
    state.editingSet = null;
    state.summaryMessage = "セットを削除しました";
    renderSummary();
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
          <p class="brand-name">Morning Gym Coach ${APP_VERSION}</p>
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
      const previous = courseLastWorkoutDetails(course);
      const previousText = previous
        ? `${previous.shortDate}・${previous.relativeText}`
        : "前回なし";
      const durationText = previous?.durationText ? `<small>前回所要: ${previous.durationText}</small>` : "";
      const badge = previous ? courseRecommendationLabel(previous.days) : "未実施";
      const badgeHtml = badge ? `<em>${badge}</em>` : "";
      return `
        <button class="sheet-list-button course-card-button${selected ? " selected" : ""}" type="button" data-panel-course-id="${course.courseId}">
          <span class="course-card-main">
            <strong>${courseLabel(course)}</strong>
            <small>前回: ${previousText}</small>
            ${durationText}
          </span>
          <span class="course-card-side">
            ${badgeHtml}
            ${selected ? "<strong>選択中</strong>" : ""}
          </span>
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
    const baselineList = renderBaselineWeightsSettings();
    const baselineSetCountList = renderBaselineSetCountsSettings();
    const coachUpdateControls = renderCoachUpdateImport();
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
          <button class="button ghost" id="open-history-from-settings" type="button">履歴</button>
          <button class="button ghost" id="refresh-app" type="button">最新版に更新</button>
          <button class="button ghost" id="backup-records" type="button">記録をバックアップ</button>
          <button class="button ghost" id="restore-records" type="button">記録を復元</button>
          <input class="hidden-file-input" id="restore-file-input" type="file" accept="application/json,.json">
          <section class="settings-section">
            <h3>コーチ更新</h3>
            ${coachUpdateControls}
          </section>
          <button class="button ghost" id="restart-today" type="button">今日のトレーニングをやり直す</button>
          <button class="button warning" id="delete-today-records" type="button">今日の記録だけ削除</button>
          <section class="settings-section">
            <h3>次回基準重量</h3>
            ${baselineList}
          </section>
          <section class="settings-section">
            <h3>基準セット数</h3>
            ${baselineSetCountList}
          </section>
          <section class="settings-section">
            <h3>コーチメモ</h3>
            ${memoControls}
          </section>
          ${state.settingsMessage ? `<p class="helper-text">${state.settingsMessage}</p>` : ""}
          <p class="helper-text app-version-label">Morning Gym Coach ${APP_VERSION}</p>
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

  function renderBaselineWeightsSettings() {
    const baselineWeights = loadBaselineWeights();
    const entries = Object.entries(baselineWeights)
      .filter(([exerciseId, weight]) => EXERCISES[exerciseId] && Number.isFinite(Number(weight)))
      .sort(([leftId], [rightId]) => EXERCISES[leftId].name.localeCompare(EXERCISES[rightId].name, "ja"));

    if (!entries.length) {
      return '<p class="helper-text">保存済みの基準重量はありません。</p>';
    }

    const rows = entries.map(([exerciseId, weight]) => {
      const exercise = EXERCISES[exerciseId];
      return `
        <div class="baseline-row">
          <span>${exercise.name}: ${formatWeight(Number(weight), exercise.loadType)}</span>
          <button class="button ghost mini-button" type="button" data-delete-baseline="${exerciseId}">削除</button>
        </div>
      `;
    }).join("");

    return `<div class="baseline-list">${rows}</div>`;
  }

  function renderBaselineSetCountsSettings() {
    const baselineSetCounts = loadBaselineSetCounts();
    const entries = Object.entries(baselineSetCounts)
      .map(([key, value]) => {
        const [courseId, exerciseId] = key.split(":");
        const course = COURSE_PLANS[courseId];
        const exercise = EXERCISES[exerciseId];
        const count = Number(value);
        if (!course || !exercise || !Number.isFinite(count)) {
          return null;
        }
        return { key, course, exercise, count: clampSetCount(count, exercise) };
      })
      .filter(Boolean)
      .sort((left, right) => {
        const courseCompare = left.course.name.localeCompare(right.course.name, "ja");
        return courseCompare || left.exercise.name.localeCompare(right.exercise.name, "ja");
      });

    if (!entries.length) {
      return '<p class="helper-text">保存済みの基準セット数はありません。</p>';
    }

    const rows = entries.map((entry) => `
      <div class="baseline-row">
        <span>${entry.course.name} / ${entry.exercise.name}: ${entry.count}セット</span>
        <button class="button ghost mini-button" type="button" data-delete-baseline-sets="${entry.key}">削除</button>
      </div>
    `).join("");

    return `<div class="baseline-list">${rows}</div>`;
  }

  function renderCoachUpdateImport() {
    if (!state.coachUpdateOpen) {
      return '<button class="button ghost" id="open-coach-update" type="button">コーチ更新を貼り付け</button>';
    }

    const preview = state.coachUpdatePreview ? renderCoachUpdatePreview(state.coachUpdatePreview) : "";
    const error = state.coachUpdateError ? `<p class="helper-text danger-text">${state.coachUpdateError}</p>` : "";

    return `
      <div class="coach-update-stack">
        <textarea id="coach-update-input" class="coach-update-input" rows="8" placeholder='{"type":"coach_update","version":"1.0",...}'>${escapeHtml(state.coachUpdateRaw)}</textarea>
        <div class="compact-actions">
          <button class="button" id="preview-coach-update" type="button">内容を確認</button>
          <button class="button ghost" id="cancel-coach-update" type="button">キャンセル</button>
        </div>
        ${error}
        ${preview}
      </div>
    `;
  }

  function renderCoachUpdatePreview(preview) {
    const changes = preview.baselineUpdates.length
      ? preview.baselineUpdates.map((update) => `
        <li>${EXERCISES[update.exerciseId].name}: ${formatWeight(update.currentWeight, EXERCISES[update.exerciseId].loadType)} → ${formatWeight(update.weight, EXERCISES[update.exerciseId].loadType)}${update.rounded ? "（丸め）" : ""}</li>
      `).join("")
      : '<li class="muted">基準重量の変更なし</li>';
    const ignored = preview.warnings.length
      ? `<ul class="compact-list warning-list">${preview.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`
      : "";
    const memo = preview.coachMemo ? '<li>コーチメモを更新</li>' : "";
    const summary = preview.summary ? `<p class="helper-text">${escapeHtml(preview.summary)}</p>` : "";

    return `
      <div class="coach-update-preview">
        <h4>変更プレビュー</h4>
        ${summary}
        <ul class="summary-list">${changes}${memo}</ul>
        ${ignored}
        <div class="compact-actions">
          <button class="button primary" id="apply-coach-update" type="button">反映する</button>
          <button class="button ghost" id="clear-coach-update" type="button">キャンセル</button>
        </div>
      </div>
    `;
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

    const historyButton = document.getElementById("open-history-from-settings");
    if (historyButton) {
      historyButton.addEventListener("click", () => {
        state.settingsPanelOpen = false;
        clearSummaryTools();
        setView("history");
      });
    }

    const refreshButton = document.getElementById("refresh-app");
    if (refreshButton) {
      refreshButton.addEventListener("click", refreshApp);
    }

    const backupButton = document.getElementById("backup-records");
    if (backupButton) {
      backupButton.addEventListener("click", backupRecords);
    }

    const restoreButton = document.getElementById("restore-records");
    const restoreInput = document.getElementById("restore-file-input");
    if (restoreButton && restoreInput) {
      restoreButton.addEventListener("click", () => restoreInput.click());
      restoreInput.addEventListener("change", restoreRecordsFromFile);
    }

    const openCoachUpdateButton = document.getElementById("open-coach-update");
    if (openCoachUpdateButton) {
      openCoachUpdateButton.addEventListener("click", () => {
        state.coachUpdateOpen = true;
        state.coachUpdateError = "";
        state.coachUpdatePreview = null;
        render();
      });
    }

    const coachUpdateInput = document.getElementById("coach-update-input");
    if (coachUpdateInput) {
      coachUpdateInput.addEventListener("input", (event) => {
        state.coachUpdateRaw = event.target.value;
      });
    }

    const previewCoachUpdateButton = document.getElementById("preview-coach-update");
    if (previewCoachUpdateButton) {
      previewCoachUpdateButton.addEventListener("click", previewCoachUpdate);
    }

    const cancelCoachUpdateButton = document.getElementById("cancel-coach-update");
    if (cancelCoachUpdateButton) {
      cancelCoachUpdateButton.addEventListener("click", () => {
        closeCoachUpdateImport();
        render();
      });
    }

    const clearCoachUpdateButton = document.getElementById("clear-coach-update");
    if (clearCoachUpdateButton) {
      clearCoachUpdateButton.addEventListener("click", () => {
        closeCoachUpdateImport();
        render();
      });
    }

    const applyCoachUpdateButton = document.getElementById("apply-coach-update");
    if (applyCoachUpdateButton) {
      applyCoachUpdateButton.addEventListener("click", applyCoachUpdate);
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

    document.querySelectorAll("[data-delete-baseline]").forEach((button) => {
      button.addEventListener("click", () => deleteBaselineWeight(button.dataset.deleteBaseline));
    });

    document.querySelectorAll("[data-delete-baseline-sets]").forEach((button) => {
      button.addEventListener("click", () => deleteBaselineSetCount(button.dataset.deleteBaselineSets));
    });

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
    const finalSetOfExercise = isFinalSetOfExercise(planned, session.currentSetNumber);
    const finalSetOfFinalExercise = isFinalSetOfFinalExercise(planned, session.currentSetNumber);
    if (rir === "0" && session.allOutBanned) {
      window.alert("痛みあり後はRIR0を記録できません。");
      return;
    }

    if (rir === "0" && !planned.allOutAllowed && !window.confirm(RIR_ZERO_WARNING)) {
      return;
    }

    if (rir === "0" && planned.allOutAllowed && !finalSetOfExercise && !window.confirm(SAME_EXERCISE_ALLOUT_WARNING)) {
      return;
    }

    if (rir === "0" && planned.allOutAllowed && finalSetOfExercise && !finalSetOfFinalExercise && !window.confirm(LEG_EXTENSION_ALLOUT_WARNING)) {
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
      plannedRestSeconds: planned.restSeconds,
      actualRestSeconds: null,
      painFlag: false,
      isAllOut: rir === "0",
      isWarmup: false,
      isExtraSet,
      note: rirJudgment(rir),
    };

    session.performedSets.push(performedSet);
    const setIndex = session.performedSets.length - 1;
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
    if (finalSetOfFinalExercise) {
      clearRestTimerState();
      setView("next");
      return;
    }
    startRest(performedSet.plannedRestSeconds, setIndex);
  }

  function recordWarmupSet() {
    const session = state.session;
    const planned = currentPlanned();
    const exercise = EXERCISES[planned.exerciseId];
    const actualWeightKg = Number(state.warmupDraft.actualWeightKg);
    const reps = Number.parseInt(state.warmupDraft.reps, 10);
    const rir = state.warmupSelectedRir;

    if (!Number.isFinite(actualWeightKg) || actualWeightKg <= 0) {
      window.alert("重量を入力してください。");
      return;
    }

    if (!Number.isInteger(reps) || reps <= 0) {
      window.alert("回数を入力してください。");
      return;
    }

    if (rir === "0" && session.allOutBanned) {
      window.alert("痛みあり後はRIR0を記録できません。");
      return;
    }

    if (rir === "0" && !planned.allOutAllowed && !window.confirm(RIR_ZERO_WARNING)) {
      return;
    }

    const plannedRestSeconds = warmupRestSeconds(exercise);
    const performedSet = {
      sessionId: session.id,
      exerciseId: planned.exerciseId,
      setNumber: warmupSetsFor(planned.exerciseId).length + 1,
      plannedWeightKg: planned.plannedWeightKg,
      actualWeightKg,
      reps,
      rir,
      rpe: rir ? rirToRpe(rir) : null,
      restSeconds: plannedRestSeconds,
      plannedRestSeconds,
      actualRestSeconds: null,
      painFlag: false,
      isAllOut: rir === "0",
      isWarmup: true,
      isExtraSet: false,
      note: rir ? rirJudgment(rir) : "",
    };

    session.performedSets.push(performedSet);
    const setIndex = session.performedSets.length - 1;
    markExerciseStarted(planned.exerciseId);
    state.coachNote = "ウォームアップ記録。";
    state.warmupMode = false;
    resetWarmupDraft();
    resetDraft();
    saveSession(session);
    startRest(plannedRestSeconds, setIndex);
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
      plannedRestSeconds: 0,
      actualRestSeconds: null,
      painFlag: true,
      isAllOut: false,
      isWarmup: false,
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
    state.session.currentSetNumber = set.isWarmup ? nextSetNumberForExercise(set.exerciseId) : set.setNumber;
    saveSession(state.session);

    const planned = currentPlanned();
    state.draftKey = makeDraftKey(planned);
    state.draft = {
      plannedWeightKg: set.plannedWeightKg || planned.plannedWeightKg,
      actualWeightKg: set.actualWeightKg || planned.plannedWeightKg,
      reps: set.reps || "",
    };
    state.selectedRir = set.rir;
    state.warmupMode = Boolean(set.isWarmup);
    if (set.isWarmup) {
      state.warmupDraft = {
        actualWeightKg: set.actualWeightKg || planned.plannedWeightKg,
        reps: set.reps || "",
      };
      state.warmupSelectedRir = set.rir;
    }
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
    state.session.currentSetNumber = set.isWarmup ? nextSetNumberForExercise(set.exerciseId) : set.setNumber;
    saveSession(state.session);
    resetDraft();
    setView("input");
  }

  function deleteAllRecords() {
    if (!window.confirm("過去の記録を含むすべての記録を削除します。この操作は元に戻せません。本当に削除しますか？")) {
      return;
    }

    stopTimer();
    removeMorningGymStorage();
    state.selectedCourseId = DEFAULT_COURSE_ID;
    state.coursePanelOpen = false;
    state.settingsPanelOpen = false;
    state.settingsMessage = "";
    state.summaryMessage = "";
    resetWorkingMenu();
    state.session = null;
    state.coachNote = "";
    state.restFinished = false;
    state.restNotified = false;
    resetDraft();
    setView("menu");
  }

  function backupRecords() {
    const today = todayKey();
    const payload = {
      appName: "Morning Gym Coach",
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      sessions: loadSessions(),
      activeSession: loadActiveSession(),
      lastCourse: window.localStorage.getItem(STORAGE_LAST_COURSE_KEY),
      baselineWeights: loadBaselineWeights(),
      baselineSetCounts: loadBaselineSetCounts(),
      storage: morningGymStorageSnapshot(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `morning-gym-coach-backup-${today}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    state.settingsMessage = "バックアップJSONを作成しました";
    render();
  }

  function restoreRecordsFromFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || ""));
        if (!isValidBackupPayload(payload)) {
          throw new Error("Invalid backup payload");
        }
        if (!window.confirm("現在の記録をバックアップ内容で上書きします。よろしいですか？")) {
          return;
        }
        restoreBackupPayload(payload);
        state.settingsMessage = "バックアップから復元しました";
        resetAppStateAfterStorageChange();
      } catch (error) {
        console.warn("Restore failed", error);
        state.settingsMessage = "復元できません。不正なJSONまたは形式違いです。";
        render();
      }
    };
    reader.onerror = () => {
      state.settingsMessage = "復元できません。ファイルを読み込めませんでした。";
      render();
    };
    reader.readAsText(file);
  }

  function previewCoachUpdate() {
    try {
      const payload = parseCoachUpdateJson(state.coachUpdateRaw);
      const preview = validateCoachUpdate(payload);
      if (!preview.baselineUpdates.length && !preview.coachMemo) {
        state.coachUpdatePreview = null;
        state.coachUpdateError = "反映できる基準重量またはコーチメモがありません。";
        render();
        return;
      }
      state.coachUpdatePreview = preview;
      state.coachUpdateError = "";
      state.settingsMessage = "";
      render();
    } catch (error) {
      console.warn("Coach update preview failed", error);
      state.coachUpdatePreview = null;
      state.coachUpdateError = "不正JSONまたは対応していない形式です。";
      render();
    }
  }

  function parseCoachUpdateJson(raw) {
    const trimmed = String(raw || "").trim();
    if (!trimmed) {
      throw new Error("Empty coach update");
    }
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    return JSON.parse(fenced ? fenced[1] : trimmed);
  }

  function validateCoachUpdate(payload) {
    if (!payload || typeof payload !== "object" || payload.type !== "coach_update") {
      throw new Error("Unsupported coach update type");
    }

    const warnings = [];
    if (payload.courseId && !COURSE_PLANS[payload.courseId]) {
      warnings.push(`未対応コースIDを無視: ${payload.courseId}`);
    }

    const baselineWeights = payload.baselineWeights && typeof payload.baselineWeights === "object" && !Array.isArray(payload.baselineWeights)
      ? payload.baselineWeights
      : {};
    const existing = loadBaselineWeights();
    const baselineUpdates = [];

    Object.entries(baselineWeights).forEach(([exerciseId, rawWeight]) => {
      const exercise = EXERCISES[exerciseId];
      if (!exercise) {
        warnings.push(`未対応種目を無視: ${exerciseId}`);
        return;
      }

      const numericWeight = Number(rawWeight);
      if (!Number.isFinite(numericWeight)) {
        warnings.push(`${exercise.name}: 数値ではない重量を無視`);
        return;
      }
      if (numericWeight <= 0) {
        warnings.push(`${exercise.name}: 0以下の重量を拒否`);
        return;
      }

      const roundedWeight = roundToWeightStep(numericWeight, exercise.weightStepKg);
      if (roundedWeight <= 0) {
        warnings.push(`${exercise.name}: 丸め後に0以下の重量を拒否`);
        return;
      }

      baselineUpdates.push({
        exerciseId,
        weight: roundedWeight,
        requestedWeight: numericWeight,
        rounded: roundedWeight !== numericWeight,
        currentWeight: Number(existing[exerciseId]) || defaultWeightForExercise(exerciseId) || roundedWeight,
      });
    });

    return {
      type: payload.type,
      version: String(payload.version || ""),
      courseId: payload.courseId || "",
      summary: typeof payload.summary === "string" ? payload.summary.trim() : "",
      baselineUpdates,
      coachMemo: typeof payload.coachMemo === "string" ? payload.coachMemo.trim() : "",
      warnings,
    };
  }

  function roundToWeightStep(weight, step) {
    const safeStep = Number(step) || 2.5;
    return Number((Math.round(weight / safeStep) * safeStep).toFixed(2));
  }

  function defaultWeightForExercise(exerciseId) {
    for (const course of Object.values(COURSE_PLANS)) {
      const planned = course.plannedExercises.find((item) => item.exerciseId === exerciseId);
      if (planned) {
        return planned.plannedWeightKg;
      }
    }
    return null;
  }

  function applyCoachUpdate() {
    const preview = state.coachUpdatePreview;
    if (!preview) {
      return;
    }

    const baselineWeights = loadBaselineWeights();
    preview.baselineUpdates.forEach((update) => {
      baselineWeights[update.exerciseId] = update.weight;
    });
    saveBaselineWeights(baselineWeights);

    let memoSaved = false;
    if (preview.coachMemo) {
      memoSaved = saveCoachMemoFromUpdate(preview.coachMemo);
    }

    state.settingsMessage = memoSaved || !preview.coachMemo
      ? "コーチ更新を反映しました"
      : "基準重量を反映しました。コーチメモの保存先がありません。";
    closeCoachUpdateImport({ keepMessage: true });
    resetWorkingMenu();
    render();
  }

  function saveCoachMemoFromUpdate(coachMemo) {
    const session = currentMemoSession();
    if (!session) {
      return false;
    }
    const normalized = normalizeLoadedSession(session);
    normalized.coachMemo = coachMemo;
    if (state.session && state.session.id === normalized.id) {
      state.session = normalized;
    }
    saveSession(normalized);
    return true;
  }

  function closeCoachUpdateImport({ keepMessage = false } = {}) {
    state.coachUpdateOpen = false;
    state.coachUpdateRaw = "";
    state.coachUpdatePreview = null;
    state.coachUpdateError = "";
    if (!keepMessage) {
      state.settingsMessage = "";
    }
  }

  function isValidBackupPayload(payload) {
    return payload
      && typeof payload === "object"
      && (payload.storage && typeof payload.storage === "object" || Array.isArray(payload.sessions));
  }

  function restoreBackupPayload(payload) {
    removeMorningGymStorage();
    if (payload.storage && typeof payload.storage === "object") {
      Object.entries(payload.storage).forEach(([key, value]) => {
        if (key.startsWith("morning-gym-coach:")) {
          window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
        }
      });
      return;
    }

    window.localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(payload.sessions || []));
    if (payload.activeSession) {
      window.localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(payload.activeSession));
    }
    if (payload.lastCourse && COURSE_PLANS[payload.lastCourse]) {
      window.localStorage.setItem(STORAGE_LAST_COURSE_KEY, payload.lastCourse);
    }
    if (payload.baselineWeights && typeof payload.baselineWeights === "object") {
      window.localStorage.setItem(STORAGE_BASELINE_WEIGHTS_KEY, JSON.stringify(payload.baselineWeights));
    }
    if (payload.baselineSetCounts && typeof payload.baselineSetCounts === "object") {
      window.localStorage.setItem(STORAGE_BASELINE_SET_COUNTS_KEY, JSON.stringify(payload.baselineSetCounts));
    }
  }

  function resetAppStateAfterStorageChange() {
    stopTimer();
    state.session = loadActiveSession();
    state.selectedCourseId = state.session ? sessionCourseId(state.session) : loadLastCourseId();
    state.coursePanelOpen = false;
    state.settingsPanelOpen = false;
    state.summaryMessage = "";
    state.editingSet = null;
    state.coachNote = "";
    clearSummaryTools();
    resetDraft();
    resetWorkingMenu();
    setView("menu");
  }

  async function refreshApp() {
    if (!window.confirm("最新版を読み込み直します。よろしいですか？")) {
      return;
    }
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.update()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys
          .filter((key) => key.startsWith("morning-gym-coach"))
          .map((key) => caches.delete(key)));
      }
    } catch (error) {
      console.warn("Refresh failed", error);
    } finally {
      window.location.reload();
    }
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
    session.deferredExercises = session.deferredExercises || [];
    if (!session.deferredExercises.includes(planned.exerciseId)) {
      session.deferredExercises.push(planned.exerciseId);
    }
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

  function startRest(seconds, setIndex = null) {
    state.timerTotal = seconds;
    state.timerPlannedSeconds = seconds;
    state.timerRemaining = seconds;
    state.timerStartedAt = Date.now();
    state.timerSetIndex = setIndex;
    state.restFinished = false;
    state.restNotified = false;
    state.view = "rest";
    renderRest();
    startTimerInterval();
  }

  function clearRestTimerState() {
    stopTimer();
    state.timerTotal = 0;
    state.timerPlannedSeconds = 0;
    state.timerRemaining = 0;
    state.timerStartedAt = null;
    state.timerSetIndex = null;
    state.restFinished = false;
    state.restNotified = false;
  }

  function startTimerInterval() {
    stopTimer();
    state.timerId = window.setInterval(() => {
      state.timerRemaining -= 1;
      if (state.timerRemaining <= 0) {
        finishRestTimer({ manual: false });
        return;
      }
      renderRest();
    }, 1000);
  }

  function finishRestTimer({ manual = false } = {}) {
    stopTimer();
    state.timerRemaining = 0;
    state.restFinished = true;
    if (manual) {
      updateActualRestSeconds();
    }
    renderRest();
    notifyRestFinished();
  }

  function stopTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function resetRestTimerToPlanned() {
    state.timerTotal = state.timerPlannedSeconds;
    state.timerRemaining = state.timerPlannedSeconds;
    state.timerStartedAt = Date.now();
    state.restFinished = false;
    state.restNotified = false;
    clearActualRestSeconds();
    renderRest();
    startTimerInterval();
  }

  function updateActualRestSeconds() {
    if (!state.session || state.timerSetIndex === null || !state.timerStartedAt) {
      return;
    }
    const set = state.session.performedSets[state.timerSetIndex];
    if (!set || set.actualRestSeconds !== null && set.actualRestSeconds !== undefined) {
      return;
    }
    set.actualRestSeconds = Math.max(0, Math.round((Date.now() - state.timerStartedAt) / 1000));
    set.plannedRestSeconds = set.plannedRestSeconds ?? set.restSeconds ?? state.timerPlannedSeconds;
    state.session.performedSets[state.timerSetIndex] = set;
    saveSession(state.session);
  }

  function clearActualRestSeconds() {
    if (!state.session || state.timerSetIndex === null) {
      return;
    }
    const set = state.session.performedSets[state.timerSetIndex];
    if (!set) {
      return;
    }
    set.actualRestSeconds = null;
    state.session.performedSets[state.timerSetIndex] = set;
    saveSession(state.session);
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
    updateActualRestSeconds();
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
    updateActualRestSeconds();
    const last = lastPerformedSet();
    if (!last || last.painFlag || last.isWarmup) {
      return;
    }

    const exerciseIndex = state.session.activeOrder.indexOf(last.exerciseId);
    if (exerciseIndex < 0) {
      return;
    }

    state.session.currentExerciseIndex = exerciseIndex;
    state.session.currentSetNumber = workSetsFor(last.exerciseId).filter((set) => !set.painFlag).length + 1;
    state.coachNote = "追加セット。フォーム優先。";
    resetDraft();
    saveSession(state.session);
    setView("input");
  }

  function endExerciseFromRest() {
    updateActualRestSeconds();
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
    const startedAt = now.toISOString();
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
      courseGroup: course.courseGroup,
      status: "active",
      startedAt,
      finishedAt: null,
      endedAt: null,
      durationMinutes: null,
      localDate: dateKey(now),
      weekday: weekdayLabel(now),
      allOutBanned: false,
      currentExerciseIndex: 0,
      currentSetNumber: 1,
      plannedOrder,
      activeOrder,
      actualOrder: [],
      deferredExercises: [],
      exerciseStatuses: createExerciseStatuses(plannedOrder),
      plannedSession: {
        id: course.id,
        courseId: course.courseId,
        course_id: course.courseId,
        courseGroup: course.courseGroup,
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
    const finishedAt = new Date();
    state.session.finishedAt = finishedAt.toISOString();
    state.session.endedAt = state.session.finishedAt;
    state.session.durationMinutes = calculateDurationMinutes(state.session.startedAt, state.session.finishedAt);
    const startDate = parseDateOrNull(state.session.startedAt) || finishedAt;
    state.session.localDate = state.session.localDate || dateKey(startDate);
    state.session.weekday = state.session.weekday || weekdayLabel(startDate);
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
    const regularCompleted = performedSetsFor(last.exerciseId).filter((set) => !set.painFlag && !set.isExtraSet && !set.isWarmup).length;
    const canAddExtra = !last.painFlag && !last.isWarmup && regularCompleted >= completedPlanned.sets;
    const endRecommended = last.rir === "0";

    if (last.isWarmup) {
      return {
        kind: "warmup",
        title: "本番セット",
        eyebrow: `${completedExercise.name} ウォームアップ完了`,
        primaryLabel: "本番セットへ",
        planned: completedPlanned,
        exercise: completedExercise,
        setNumber: state.session.currentSetNumber,
        canAddExtra: false,
        endRecommended: false,
      };
    }

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
      title: "すべて完了",
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
        <p>すべての種目が完了しました。</p>
        <p>まとめを確認。</p>
        <p>${info.endRecommended ? "この種目は終了推奨。" : "追加も選べます。"}</p>
      `;
    }

    if (info.kind === "warmup") {
      return `
        <p>ウォームアップ完了。</p>
        <p>${formatWeight(info.planned.plannedWeightKg, info.exercise.loadType)} / ${formatRepRange(info.planned, info.exercise)}。</p>
        <p>本番セットへ。</p>
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

  function renderPlannedSetCountEditor(planned, exercise) {
    const minSets = 1;
    const maxSets = maxSetsForExercise(exercise);
    return `
      <div class="set-count-editor">
        <span>予定セット数</span>
        <div class="stepper" aria-label="${exercise.name}の予定セット数">
          <button class="button ghost mini-button" type="button" data-set-count-minus="${exercise.id}" ${planned.sets <= minSets ? "disabled" : ""}>-</button>
          <strong>${planned.sets}セット</strong>
          <button class="button ghost mini-button" type="button" data-set-count-plus="${exercise.id}" ${planned.sets >= maxSets ? "disabled" : ""}>+</button>
        </div>
        <small>最大${maxSets}セット</small>
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

  function adjustMenuSetCount(exerciseId, delta) {
    const planned = plannedById(exerciseId, state.menuPlannedExercises);
    const exercise = EXERCISES[exerciseId];
    if (!planned || !exercise) {
      return;
    }
    updatePlannedSetCount(planned, exercise, planned.sets + delta);
    renderMenu();
  }

  function updatePlannedSetCount(planned, exercise, setCount) {
    const nextSetCount = clampSetCount(setCount, exercise);
    planned.sets = nextSetCount;
    planned.targetRir = targetRirPlanFor(planned, exercise, nextSetCount);
    return planned;
  }

  function estimateMenuDurationMinutes(plannedExercises) {
    const totalSeconds = plannedExercises.reduce((total, planned) => {
      const sets = Number(planned.sets) || 0;
      return total + sets * (45 + Number(planned.restSeconds || 0));
    }, plannedExercises.length * 120);
    return Math.max(1, Math.round(totalSeconds / 60));
  }

  function resetWorkingMenu() {
    const course = currentCoursePlan();
    state.menuOrder = defaultOrder();
    state.menuPlannedExercises = applyMenuBaselines(clone(course.plannedExercises), course.courseId);
    state.menuReorderMode = false;
  }

  function clearSummaryTools() {
    state.copyMessage = "";
    state.markdownFallback = "";
    state.summaryMessage = "";
    state.editingSet = null;
  }

  function nextSetNumberForExercise(exerciseId) {
    const planned = plannedById(exerciseId, state.session.plannedSession.plannedExercises);
    const completedRegularSets = performedSetsFor(exerciseId).filter((set) => !set.painFlag && !set.isExtraSet && !set.isWarmup).length;
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
    const regularSets = performedSetsFor(exerciseId).filter((set) => !set.painFlag && !set.isExtraSet && !set.isWarmup);
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

  function isFinalSetOfExercise(planned, setNumber) {
    return Number(setNumber) >= Number(planned.sets);
  }

  function isFinalExerciseInSession(exerciseId) {
    return !hasFollowingUnfinishedExercise(exerciseId);
  }

  function isFinalSetOfFinalExercise(planned, setNumber) {
    return isFinalSetOfExercise(planned, setNumber) && isFinalExerciseInSession(planned.exerciseId);
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
      if (set.isWarmup) {
        if (state.session.exerciseStatuses[set.exerciseId] === "pending") {
          state.session.exerciseStatuses[set.exerciseId] = "in_progress";
        }
        return;
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
    const planned = formatOrder(session.plannedOrder);
    const actualOrder = effectiveActualOrder(session);
    const actual = actualOrder.length ? formatOrder(actualOrder) : "記録なし";
    const notes = orderChangeNotes(session, actualOrder);
    return `
      <section class="summary-card order-summary">
        <h2>予定順と実施順</h2>
        <p class="muted">予定順: ${planned}</p>
        <p class="muted">実施順: ${actual}</p>
        ${notes ? `<p class="summary-note">${notes}</p>` : ""}
      </section>
    `;
  }

  function renderSessionMetaSummary(session) {
    return `
      <section class="summary-card session-meta-card">
        <h2>セッション</h2>
        <dl class="session-meta-grid">
          <div><dt>日付</dt><dd>${sessionDateLabel(session)}</dd></div>
          <div><dt>時間</dt><dd>${sessionTimeRangeLabel(session)}</dd></div>
          <div><dt>所要時間</dt><dd>${sessionDurationLabel(session)}</dd></div>
          <div><dt>メニュー</dt><dd>${courseLabelForSession(session)}</dd></div>
          <div><dt>前回同コース</dt><dd>${previousCourseText(sessionCourseId(session), session)}</dd></div>
        </dl>
      </section>
    `;
  }

  function orderChangeNotes(session, actualOrder = effectiveActualOrder(session)) {
    const notes = [];
    if (!sameOrder(session.plannedOrder, actualOrder)) {
      notes.push("予定順と実施順が違います");
    }
    const skipped = Object.entries(session.exerciseStatuses || {})
      .filter(([, status]) => status === "skipped")
      .map(([exerciseId]) => EXERCISES[exerciseId]?.name || exerciseId);
    if (skipped.length) {
      notes.push(`スキップ: ${skipped.join("、")}`);
    }
    const deferred = [...new Set([
      ...(session.deferredExercises || []),
      ...Object.entries(session.exerciseStatuses || {})
        .filter(([, status]) => status === "deferred")
        .map(([exerciseId]) => exerciseId),
    ])].map((exerciseId) => EXERCISES[exerciseId]?.name || exerciseId);
    if (deferred.length) {
      notes.push(`後回し: ${deferred.join("、")}`);
    }
    return notes.join(" / ");
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

  function effectiveActualOrder(session) {
    return session.actualOrder?.length ? session.actualOrder : inferActualOrderFromSets(session);
  }

  function inferActualOrderFromSets(session) {
    const order = [];
    (session.performedSets || []).forEach((set) => {
      if (set.exerciseId && !order.includes(set.exerciseId)) {
        order.push(set.exerciseId);
      }
    });
    return order;
  }

  function sortBySessionStart(left, right) {
    return sessionSortTime(left) - sessionSortTime(right);
  }

  function sortBySessionOccurrence(left, right) {
    return sessionOccurrenceTime(left) - sessionOccurrenceTime(right);
  }

  function sessionSortTime(session) {
    const parsed = parseDateOrNull(session?.startedAt);
    if (parsed) {
      return parsed.getTime();
    }
    const local = session?.localDate || session?.plannedSession?.date;
    return local ? dateFromLocalDate(local).getTime() : 0;
  }

  function sessionOccurrenceTime(session) {
    const finished = parseDateOrNull(session?.finishedAt || session?.endedAt);
    if (finished) {
      return finished.getTime();
    }
    return sessionSortTime(session);
  }

  function findPreviousCourseSession(courseId, referenceSession = null) {
    const currentId = referenceSession?.id || null;
    const courseGroup = courseGroupForCourseId(courseId);
    const sessions = loadSessions()
      .map(normalizeLoadedSession)
      .filter((session) => session.id !== currentId)
      .filter((session) => session.status !== "active")
      .filter((session) => sessionCourseGroup(session) === courseGroup)
      .filter((session) => isBeforeReferenceSession(session, referenceSession))
      .sort(sortBySessionOccurrence);
    return sessions[sessions.length - 1] || null;
  }

  function findPreviousExerciseSession(exerciseId, referenceSession = null) {
    const currentId = referenceSession?.id || null;
    const sessions = loadSessions()
      .map(normalizeLoadedSession)
      .filter((session) => session.id !== currentId)
      .filter((session) => session.status !== "active")
      .filter((session) => isBeforeReferenceSession(session, referenceSession))
      .filter((session) => session.performedSets.some((set) => set.exerciseId === exerciseId && !set.isWarmup))
      .sort(sortBySessionOccurrence);
    return sessions[sessions.length - 1] || null;
  }

  function isBeforeReferenceSession(session, referenceSession = null) {
    if (!referenceSession) {
      return true;
    }
    return sessionSortTime(session) < sessionSortTime(referenceSession);
  }

  function previousCourseText(courseId, referenceSession = null) {
    return courseLastWorkoutText(coursePlanById(courseId), referenceSession);
  }

  function previousExerciseText(exerciseId, referenceSession = null) {
    return previousSessionText(findPreviousExerciseSession(exerciseId, referenceSession), referenceSession);
  }

  function previousSessionText(previousSession, referenceSession = null) {
    if (!previousSession) {
      return "前回なし";
    }
    const days = daysSinceSession(previousSession, referenceSession);
    return Number.isFinite(days) ? `前回から${days}日` : "前回あり";
  }

  function previousCourseMarkdownText(session) {
    return courseLastWorkoutText(coursePlanById(sessionCourseId(session)), session);
  }

  function courseLastWorkoutText(course, referenceSession = null) {
    const details = courseLastWorkoutDetails(course, referenceSession);
    if (!details) {
      return "前回なし";
    }
    return `${details.shortDate}・${details.relativeText}${details.durationText ? `・所要${details.durationText}` : ""}`;
  }

  function courseLastWorkoutDetails(course, referenceSession = null) {
    if (!course) {
      return null;
    }
    const previousSession = findPreviousCourseSession(course.courseId, referenceSession);
    if (!previousSession) {
      return null;
    }
    const localDate = sessionLocalDateKey(previousSession);
    const days = daysSinceSession(previousSession, referenceSession);
    return {
      session: previousSession,
      shortDate: localDate ? formatShortLocalDate(localDate, previousSession.weekday) : "不明",
      relativeText: relativeDaysText(days),
      durationText: Number.isFinite(Number(previousSession.durationMinutes)) ? `${Number(previousSession.durationMinutes)}分` : "",
      days,
    };
  }

  function courseRecommendationLabel(days) {
    if (!Number.isFinite(days)) {
      return "不明";
    }
    if (days >= 5) {
      return "そろそろ";
    }
    if (days <= 1) {
      return "直近実施";
    }
    return "";
  }

  function formatShortLocalDate(localDate, weekday = "") {
    if (!localDate) {
      return "不明";
    }
    const date = dateFromLocalDate(localDate);
    if (Number.isNaN(date.getTime())) {
      return "不明";
    }
    const day = weekday || weekdayLabel(date);
    return `${date.getMonth() + 1}/${date.getDate()} ${day}`;
  }

  function relativeDaysText(days) {
    if (!Number.isFinite(days) || days < 0) {
      return "不明";
    }
    if (days === 0) {
      return "今日";
    }
    if (days === 1) {
      return "昨日";
    }
    return `${days}日前`;
  }

  function daysSinceSession(previousSession, referenceSession = null) {
    const previousDate = sessionLocalDateKey(previousSession);
    const referenceDate = referenceSession ? sessionLocalDateKey(referenceSession) : todayKey();
    if (!previousDate || !referenceDate) {
      return NaN;
    }
    const diff = dateFromLocalDate(referenceDate).getTime() - dateFromLocalDate(previousDate).getTime();
    const days = Math.round(diff / 86400000);
    return days < 0 ? NaN : days;
  }

  function sessionLocalDateKey(session) {
    if (session?.localDate) {
      return session.localDate;
    }
    if (session?.plannedSession?.date) {
      return session.plannedSession.date;
    }
    const parsed = parseDateOrNull(session?.startedAt);
    return parsed ? dateKey(parsed) : "";
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

  function ensureWarmupDraft(planned) {
    if (state.warmupDraft.actualWeightKg !== "" || state.warmupDraft.reps !== "") {
      return;
    }
    state.warmupDraft = {
      actualWeightKg: planned?.plannedWeightKg || "",
      reps: "",
    };
    state.warmupSelectedRir = null;
  }

  function resetDraft() {
    state.draftKey = "";
    state.draft = {
      plannedWeightKg: "",
      actualWeightKg: "",
      reps: "",
    };
    state.selectedRir = null;
    state.warmupMode = false;
  }

  function resetWarmupDraft() {
    state.warmupDraft = {
      actualWeightKg: "",
      reps: "",
    };
    state.warmupSelectedRir = null;
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
    const sets = performedSetsFor(exerciseId).filter((set) => !set.painFlag && !set.isWarmup);
    return sets[sets.length - 1] || null;
  }

  function warmupSetsFor(exerciseId) {
    return performedSetsFor(exerciseId).filter((set) => set.isWarmup);
  }

  function workSetsFor(exerciseId) {
    return performedSetsFor(exerciseId).filter((set) => !set.isWarmup);
  }

  function warmupRestSeconds(exercise) {
    if (exercise.type === "heavy_compound") {
      return 90;
    }
    if (exercise.type === "machine") {
      return 60;
    }
    return 45;
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

  function loadBaselineWeights() {
    try {
      const raw = window.localStorage.getItem(STORAGE_BASELINE_WEIGHTS_KEY);
      const baselineWeights = raw ? JSON.parse(raw) : {};
      return baselineWeights && typeof baselineWeights === "object" && !Array.isArray(baselineWeights)
        ? baselineWeights
        : {};
    } catch (error) {
      console.warn("Could not load baseline weights", error);
      return {};
    }
  }

  function loadBaselineSetCounts() {
    try {
      const raw = window.localStorage.getItem(STORAGE_BASELINE_SET_COUNTS_KEY);
      const baselineSetCounts = raw ? JSON.parse(raw) : {};
      return baselineSetCounts && typeof baselineSetCounts === "object" && !Array.isArray(baselineSetCounts)
        ? baselineSetCounts
        : {};
    } catch (error) {
      console.warn("Could not load baseline set counts", error);
      return {};
    }
  }

  function saveBaselineWeights(baselineWeights) {
    window.localStorage.setItem(STORAGE_BASELINE_WEIGHTS_KEY, JSON.stringify(baselineWeights));
  }

  function saveBaselineSetCounts(baselineSetCounts) {
    window.localStorage.setItem(STORAGE_BASELINE_SET_COUNTS_KEY, JSON.stringify(baselineSetCounts));
  }

  function baselineSetCountKey(courseId, exerciseId) {
    return `${courseId}:${exerciseId}`;
  }

  function applyMenuBaselines(plannedExercises, courseId = currentCoursePlan().courseId) {
    return applyBaselineSetCounts(applyBaselineWeights(plannedExercises), courseId);
  }

  function applyBaselineWeights(plannedExercises) {
    const baselineWeights = loadBaselineWeights();
    return plannedExercises.map((planned) => {
      const baselineWeight = Number(baselineWeights[planned.exerciseId]);
      if (Number.isFinite(baselineWeight) && baselineWeight > 0) {
        return {
          ...planned,
          plannedWeightKg: baselineWeight,
        };
      }
      return planned;
    });
  }

  function applyBaselineSetCounts(plannedExercises, courseId = currentCoursePlan().courseId) {
    const baselineSetCounts = loadBaselineSetCounts();
    return plannedExercises.map((planned) => {
      const exercise = EXERCISES[planned.exerciseId];
      if (!exercise) {
        return planned;
      }
      const storedSetCount = Number(baselineSetCounts[baselineSetCountKey(courseId, planned.exerciseId)]);
      if (!Number.isFinite(storedSetCount)) {
        return updatePlannedSetCount({ ...planned }, exercise, planned.sets);
      }
      return updatePlannedSetCount({ ...planned }, exercise, storedSetCount);
    });
  }

  function saveBaselineWeight(exerciseId, weight) {
    if (!EXERCISES[exerciseId] || !Number.isFinite(weight) || weight <= 0) {
      return;
    }
    const baselineWeights = loadBaselineWeights();
    baselineWeights[exerciseId] = weight;
    saveBaselineWeights(baselineWeights);
    state.summaryMessage = "次回基準重量を保存しました";
    state.settingsMessage = "次回基準重量を保存しました";
    render();
  }

  function saveBaselineSetCountsFromMenu() {
    if (!window.confirm("現在のセット数を次回以降の基準にします。よろしいですか？")) {
      return;
    }
    const course = currentCoursePlan();
    const baselineSetCounts = loadBaselineSetCounts();
    state.menuPlannedExercises.forEach((planned) => {
      const exercise = EXERCISES[planned.exerciseId];
      if (!exercise) {
        return;
      }
      baselineSetCounts[baselineSetCountKey(course.courseId, planned.exerciseId)] = clampSetCount(planned.sets, exercise);
    });
    saveBaselineSetCounts(baselineSetCounts);
    state.settingsMessage = "基準セット数を保存しました";
    render();
  }

  function deleteBaselineSetCount(key) {
    const baselineSetCounts = loadBaselineSetCounts();
    delete baselineSetCounts[key];
    saveBaselineSetCounts(baselineSetCounts);
    state.settingsMessage = "基準セット数を削除しました";
    resetWorkingMenu();
    render();
  }

  function deleteBaselineWeight(exerciseId) {
    const baselineWeights = loadBaselineWeights();
    delete baselineWeights[exerciseId];
    saveBaselineWeights(baselineWeights);
    state.settingsMessage = "次回基準重量を削除しました";
    resetWorkingMenu();
    render();
  }

  function morningGymStorageSnapshot() {
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith("morning-gym-coach:"))
      .sort()
      .reduce((snapshot, key) => {
        snapshot[key] = window.localStorage.getItem(key);
        return snapshot;
      }, {});
  }

  function removeMorningGymStorage() {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("morning-gym-coach:"))
      .forEach((key) => window.localStorage.removeItem(key));
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
    session.courseGroup = sessionCourseGroup(session);
    if (session.plannedSession) {
      session.plannedSession.courseId = session.plannedSession.courseId || courseId;
      session.plannedSession.course_id = session.plannedSession.course_id || courseId;
      session.plannedSession.courseGroup = session.plannedSession.courseGroup || session.courseGroup;
    }
    session.startedAt = inferSessionStartedAt(session);
    session.finishedAt = inferSessionFinishedAt(session);
    if (session.finishedAt && !session.endedAt) {
      session.endedAt = session.finishedAt;
    }
    const sessionStartDate = parseDateOrNull(session.startedAt);
    session.localDate = session.localDate || session.plannedSession?.date || (sessionStartDate ? dateKey(sessionStartDate) : "");
    session.weekday = session.weekday || (session.localDate ? weekdayLabel(dateFromLocalDate(session.localDate)) : sessionStartDate ? weekdayLabel(sessionStartDate) : "");
    const calculatedDuration = calculateDurationMinutes(session.startedAt, session.finishedAt || session.endedAt);
    session.durationMinutes = Number.isFinite(Number(session.durationMinutes))
      ? Number(session.durationMinutes)
      : calculatedDuration;
    session.plannedOrder = plannedOrder;
    session.activeOrder = session.activeOrder || [...plannedOrder];
    session.actualOrder = session.actualOrder || [];
    session.deferredExercises = session.deferredExercises || [];
    session.exerciseStatuses = {
      ...createExerciseStatuses(plannedOrder),
      ...(session.exerciseStatuses || {}),
    };
    session.performedSets = (session.performedSets || []).map((set) => ({
      isWarmup: false,
      isExtraSet: false,
      plannedRestSeconds: set.plannedRestSeconds ?? set.restSeconds ?? null,
      actualRestSeconds: set.actualRestSeconds ?? null,
      ...set,
    }));
    if (!session.actualOrder.length) {
      session.actualOrder = inferActualOrderFromSets(session);
    }
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
    if (legacyId.includes("shoulder")) {
      return "shoulder_45_v0.10";
    }
    if (legacyId.includes("arms")) {
      return "arms_45_v0.10";
    }
    if (legacyId.includes("back")) {
      return "back_45_v0.7";
    }
    if (legacyId.includes("chest")) {
      return "chest_45_v0.5";
    }
    const exerciseIds = (session?.plannedSession?.plannedExercises || []).map((planned) => planned.exerciseId);
    if (exerciseIds.some((exerciseId) => ["smith_shoulder_press", "side_raise", "machine_shoulder_press", "face_pull"].includes(exerciseId))) {
      return "shoulder_45_v0.10";
    }
    if (exerciseIds.some((exerciseId) => ["ez_bar_curl", "french_press", "incline_dumbbell_curl", "cable_pressdown"].includes(exerciseId))) {
      return "arms_45_v0.10";
    }
    if (exerciseIds.some((exerciseId) => ["deadlift", "lat_pulldown", "seated_row", "machine_row"].includes(exerciseId))) {
      return "back_45_v0.7";
    }
    if (exerciseIds.some((exerciseId) => ["bench_press", "incline_dumbbell_fly", "dumbbell_fly", "pectoral_fly"].includes(exerciseId))) {
      return "chest_45_v0.5";
    }
    return DEFAULT_COURSE_ID;
  }

  function sessionCourseGroup(session) {
    const explicit = session?.courseGroup || session?.plannedSession?.courseGroup;
    if (explicit) {
      return explicit;
    }
    return inferCourseGroup(sessionCourseId(session), session?.plannedSession?.name, session?.plannedSession?.plannedExercises || []);
  }

  function courseGroupForCourseId(courseId) {
    const course = COURSE_PLANS[courseId];
    return course?.courseGroup || inferCourseGroup(courseId);
  }

  function inferCourseGroup(courseId = "", courseName = "", plannedExercises = []) {
    const id = String(courseId);
    const name = String(courseName);
    if (id.includes("legs") || name.includes("脚")) {
      return "legs";
    }
    if (id.includes("chest") || name.includes("胸")) {
      return "chest";
    }
    if (id.includes("back") || name.includes("背中")) {
      return "back";
    }
    if (id.includes("shoulder") || name.includes("肩")) {
      return "shoulder";
    }
    if (id.includes("arms") || name.includes("腕")) {
      return "arms";
    }
    const exerciseIds = plannedExercises.map((planned) => planned.exerciseId);
    if (exerciseIds.some((exerciseId) => ["squat", "bulgarian_split_squat", "leg_extension"].includes(exerciseId))) {
      return "legs";
    }
    if (exerciseIds.some((exerciseId) => ["bench_press", "incline_dumbbell_fly", "dumbbell_fly", "pectoral_fly"].includes(exerciseId))) {
      return "chest";
    }
    if (exerciseIds.some((exerciseId) => ["deadlift", "lat_pulldown", "seated_row", "machine_row"].includes(exerciseId))) {
      return "back";
    }
    if (exerciseIds.some((exerciseId) => ["smith_shoulder_press", "side_raise", "machine_shoulder_press", "face_pull"].includes(exerciseId))) {
      return "shoulder";
    }
    if (exerciseIds.some((exerciseId) => ["ez_bar_curl", "french_press", "incline_dumbbell_curl", "cable_pressdown"].includes(exerciseId))) {
      return "arms";
    }
    return "legs";
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

    window.localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    if (session.status === "active") {
      window.localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(snapshot));
    } else {
      window.localStorage.removeItem(STORAGE_ACTIVE_KEY);
    }
  }

  function buildMarkdownLog(session) {
    normalizeLoadedSession(session);
    const actualOrder = effectiveActualOrder(session);
    const lines = [
      "# Morning Gym Coach Log",
      "",
      `日付: ${sessionLocalDateKey(session) || "不明"}`,
      `曜日: ${session.weekday || "不明"}`,
      `開始: ${formatTime(session.startedAt)}`,
      `終了: ${formatTime(session.finishedAt || session.endedAt)}`,
      `所要時間: ${sessionDurationLabel(session)}`,
      `メニュー: ${session.plannedSession.name} / ${session.plannedSession.durationMinutes}分`,
      `前回同コース: ${previousCourseMarkdownText(session)}`,
      "",
      "## 予定順",
      formatOrder(session.plannedOrder),
      "",
      "## 実施順",
      actualOrder.length ? formatOrder(actualOrder) : "記録なし",
      "",
      "## 種目ログ",
      "",
    ];

    session.plannedSession.plannedExercises.forEach((planned) => {
      const exercise = EXERCISES[planned.exerciseId];
      const sets = session.performedSets.filter((set) => set.exerciseId === planned.exerciseId);
      const warmupSets = sets.filter((set) => set.isWarmup);
      const workSets = sets.filter((set) => !set.isWarmup);
      const status = session.exerciseStatuses[planned.exerciseId] || "pending";
      lines.push(`## ${exercise.name}`);
      lines.push(`予定: ${formatWeight(planned.plannedWeightKg, exercise.loadType)} / ${planned.sets}セット / ${formatRepRange(planned, exercise)}`);
      lines.push("");
      lines.push("ウォームアップ:");
      if (warmupSets.length) {
        warmupSets.forEach((set) => lines.push(markdownPerformedSet(set, exercise)));
      } else {
        lines.push("- なし");
      }
      lines.push("");
      lines.push("本番:");
      if (status === "skipped" && !workSets.length) {
        lines.push("- スキップ");
      } else if (workSets.length) {
        workSets.forEach((set) => lines.push(markdownPerformedSet(set, exercise)));
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
    lines.push("次回の重量、RIR目標、種目順、オールアウト方針を見てください。");
    lines.push("前回からの日数、実施順、実際の休憩時間も考慮してください。");
    lines.push("次回方針を出してください。最後に、アプリ反映用の coach_update JSON をコードブロックで出してください。");
    return lines.join("\n");
  }

  function markdownPerformedSet(set, exercise) {
    if (set.painFlag) {
      const note = set.note ? ` / ${set.note}` : "";
      return `- ${set.isWarmup ? "ウォームアップ: " : set.isExtraSet ? "追加: " : ""}痛みあり${markdownRestText(set)}${note}`;
    }
    const prefix = set.isWarmup ? "" : set.isExtraSet ? "追加: " : "";
    const effort = set.rir ? ` RIR${set.rir}` : "";
    const note = set.note ? ` / ${set.note}` : "";
    return `- ${prefix}${formatWeight(set.actualWeightKg, exercise.loadType)} x ${set.reps}回${effort}${markdownRestText(set)}${note}`;
  }

  function markdownRestText(set) {
    const actual = set.actualRestSeconds;
    const planned = set.plannedRestSeconds ?? set.restSeconds;
    if (set.isWarmup) {
      return actual === null || actual === undefined ? "" : ` / 休憩: 実際${actual}秒`;
    }
    if ((planned === null || planned === undefined) && (actual === null || actual === undefined)) {
      return "";
    }
    const actualText = actual === null || actual === undefined ? "未記録" : `${actual}秒`;
    return ` / 休憩: 予定${planned}秒・実際${actualText}`;
  }

  function markdownNotes(session) {
    const notes = [];
    const extraExercises = session.plannedSession.plannedExercises
      .filter((planned) => session.performedSets.some((set) => set.exerciseId === planned.exerciseId && set.isExtraSet && !set.isWarmup))
      .map((planned) => EXERCISES[planned.exerciseId].name);
    const skippedExercises = Object.entries(session.exerciseStatuses || {})
      .filter(([, status]) => status === "skipped")
      .map(([exerciseId]) => EXERCISES[exerciseId]?.name || exerciseId);
    const deferredExercises = [...new Set(session.deferredExercises || [])]
      .map((exerciseId) => EXERCISES[exerciseId]?.name || exerciseId);
    const painExercises = [...new Set(session.performedSets
      .filter((set) => set.painFlag)
      .map((set) => EXERCISES[set.exerciseId]?.name || set.exerciseId))];
    const warningRirZero = [...new Set(session.performedSets
      .filter((set) => {
        const planned = plannedById(set.exerciseId, session.plannedSession.plannedExercises);
        return !set.isWarmup && set.rir === "0" && planned && !planned.allOutAllowed;
      })
      .map((set) => EXERCISES[set.exerciseId]?.name || set.exerciseId))];
    const allOutRirZero = [...new Set(session.performedSets
      .filter((set) => {
        const planned = plannedById(set.exerciseId, session.plannedSession.plannedExercises);
        return !set.isWarmup && set.rir === "0" && planned?.allOutAllowed;
      })
      .map((set) => EXERCISES[set.exerciseId]?.name || set.exerciseId))];

    if (extraExercises.length) {
      notes.push(`追加セット: ${extraExercises.join("、")}`);
    }
    if (skippedExercises.length) {
      notes.push(`スキップ: ${skippedExercises.join("、")}`);
    }
    if (deferredExercises.length) {
      notes.push(`後回し: ${deferredExercises.join("、")}`);
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
    if (!sameOrder(session.plannedOrder, effectiveActualOrder(session))) {
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
      && isFinalSetOfFinalExercise(planned, setNumber);
  }

  function canUseAllOutAsPlanned(planned, setNumber) {
    if (state.session?.allOutBanned) {
      return false;
    }
    return planned.allOutAllowed
      && isFinalSetOfFinalExercise(planned, setNumber);
  }

  function maxSetsForExercise(exercise) {
    if (exercise.id === "deadlift") {
      return 3;
    }
    if (exercise.type === "heavy_compound") {
      return 4;
    }
    return 5;
  }

  function clampSetCount(setCount, exercise) {
    const count = Number.parseInt(setCount, 10);
    const safeCount = Number.isInteger(count) ? count : 1;
    return Math.min(maxSetsForExercise(exercise), Math.max(1, safeCount));
  }

  function targetRirPlanFor(planned, exercise, setCount) {
    const count = clampSetCount(setCount, exercise);
    if (planned.allOutAllowed) {
      const allOutPlans = {
        1: [0],
        2: [1, 0],
        3: [2, 1, 0],
        4: [2, 1, 1, 0],
        5: [3, 2, 1, 1, 0],
      };
      return allOutPlans[count] || allOutPlans[5];
    }
    if (exercise.type === "heavy_compound") {
      const heavyPlans = {
        1: [2],
        2: [3, 2],
        3: [3, 2, 1],
        4: [3, 2, 1, 1],
      };
      return heavyPlans[count] || heavyPlans[4];
    }
    const nonHeavyPlans = {
      1: [2],
      2: [2, 1],
      3: [2, 1, 1],
      4: [3, 2, 1, 1],
      5: [3, 2, 2, 1, 1],
    };
    return nonHeavyPlans[count] || nonHeavyPlans[5];
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
      const note = set.note ? ` / ${escapeHtml(set.note)}` : "";
      return `${set.isWarmup ? "ウォームアップ " : set.isExtraSet ? "追加 " : `${set.setNumber}. `}痛みあり: 種目終了${note}`;
    }
    const actual = formatWeight(set.actualWeightKg, exercise.loadType);
    const planned = formatWeight(set.plannedWeightKg, exercise.loadType);
    const diff = set.actualWeightKg === set.plannedWeightKg ? "" : ` (予定${planned})`;
    const prefix = set.isWarmup ? `ウォームアップ ${set.setNumber}. ` : set.isExtraSet ? `追加 ${set.setNumber}. ` : `${set.setNumber}. `;
    const effort = set.rir ? ` RIR${set.rir} / RPE${set.rpe}` : "";
    const note = set.note ? ` / ${escapeHtml(set.note)}` : "";
    return `${prefix}${actual} x ${set.reps}回${effort}${set.isWarmup ? "" : diff}${note}`;
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
    if (!planned.allOutAllowed && sets.some((set) => !set.isWarmup && set.rir === "0")) {
      notes.push("RIR0記録あり。次回はフォーム確認");
    }
    if (sets.some((set) => set.isExtraSet && !set.isWarmup)) {
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

  function parseDateOrNull(value) {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function toIsoOrNull(value) {
    const date = parseDateOrNull(value);
    return date ? date.toISOString() : null;
  }

  function inferSessionStartedAt(session) {
    const direct = toIsoOrNull(session?.startedAt || session?.createdAt);
    if (direct) {
      return direct;
    }
    const id = String(session?.id || "");
    if (id.startsWith("session-")) {
      return toIsoOrNull(id.replace(/^session-/, ""));
    }
    return null;
  }

  function inferSessionFinishedAt(session) {
    return toIsoOrNull(session?.finishedAt || session?.endedAt || session?.completedAt);
  }

  function calculateDurationMinutes(startedAt, finishedAt) {
    const started = parseDateOrNull(startedAt);
    const finished = parseDateOrNull(finishedAt);
    if (!started || !finished || finished < started) {
      return null;
    }
    return Math.max(1, Math.round((finished.getTime() - started.getTime()) / 60000));
  }

  function dateFromLocalDate(localDate) {
    return new Date(`${localDate}T00:00:00`);
  }

  function weekdayLabel(date) {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return weekdays[date.getDay()] || "";
  }

  function formatTime(value) {
    const date = parseDateOrNull(value);
    if (!date) {
      return "不明";
    }
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function sessionDateLabel(session) {
    const localDate = sessionLocalDateKey(session);
    if (!localDate) {
      return "不明";
    }
    const weekday = session.weekday || weekdayLabel(dateFromLocalDate(localDate));
    return `${localDate} ${weekday}`;
  }

  function sessionStartTimeLabel(session) {
    return formatTime(session.startedAt);
  }

  function sessionTimeRangeLabel(session) {
    return `${formatTime(session.startedAt)}〜${formatTime(session.finishedAt || session.endedAt)}`;
  }

  function sessionDurationLabel(session) {
    const duration = Number(session.durationMinutes);
    return Number.isFinite(duration) && duration > 0 ? `${duration}分` : "不明";
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function sessionDate(session) {
    if (session?.localDate) {
      return session.localDate;
    }
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
