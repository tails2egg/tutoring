// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//
// If you have dependencies that try to import CSS, esbuild will generate a separate `app.css` file.
// To load it, simply add a second `<link>` to your `root.html.heex` file.

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import {hooks as colocatedHooks} from "phoenix-colocated/ielts"
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max"
import topbar from "../vendor/topbar"

const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
const liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: {_csrf_token: csrfToken},
  hooks: {...colocatedHooks},
})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

const WELCOME_IMAGES = [
  "/welcome.png",
  "/welcome1.png",
  "/welcome2.png",
  "/welcome3.png",
  "/welcome4.png",
  "/welcome5.png",
  "/welcome6.png",
  "/welcome7.png",
  "/welcome8.png",
  "/welcome9.png",
]

const STARTUP_TRANSITION_MS = 700
const STARTUP_SPLASH_SCENE_MS = 1800
const STARTUP_SPLASH_FINISH_DELAY_MS = 600
const WELCOME_TRANSITION_MS = 350
const TRANSITION_LOADING_MIN_MS = 900
const TRANSITION_LOADING_LINK_DELAY_MS = 3000
const CONTACT_COMPLETE_KEY = "ielts_contact_complete"
const CONTACT_INFO_KEY = "ielts_contact_info"
const CONTACT_PENDING_ACTION_KEY = "ielts_contact_pending_action"
const STARTUP_SPLASH_COMPLETE_KEY = "ielts_startup_splash_complete"
const CONTACT_DEFAULT_COUNTRY = "SA"
const CONTACT_OTP_SEND_PATH = "/phone/otp"
const CONTACT_OTP_VERIFY_PATH = "/phone/verify"
const CONTACT_OTP_LENGTH = 6
const CONTACT_DEFAULT_RESEND_SECONDS = 30
const CONTACT_EMAIL_PATTERN = /^[^\s@]+@gmail\.com$/i
const CONTACT_PRIORITY_COUNTRIES = ["SA", "AE", "EG", "JO", "KW", "QA", "BH", "OM", "US", "GB"]
const CONTACT_COUNTRY_LABELS = {
  AE: "UAE",
  GB: "UK",
  US: "USA",
}
const GOAL_SELECTION_REQUEST_KEY = "ielts_open_goal_selection"
const SKILL_SETUP_KEY = "ielts_skill_setup"
const SKILL_KEYS = ["writing", "reading", "listening", "speaking"]
const SKILL_ROUTES = {
  writing: "/activities?skill=writing",
  reading: "/activities?skill=reading",
  listening: "/activities?skill=listening",
  speaking: "/activities?skill=speaking",
}
const SKILL_SETUP_TARGET_BANDS = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5+"]
const SKILL_SETUP_DAILY_MINUTES = [30, 60, 90, 120]
const LEARNING_ACTIVITY_DATES_KEY = "ielts_learning_activity_dates"
const LEARNING_PROGRESS_KEY = "ielts_learning_progress"
const LAST_LEARNING_ACTIVITY_KEY = "ielts_last_learning_activity"
const LAST_LEARNING_HREF_KEY = "ielts_last_learning_href"
const LAST_LEARNING_PATH_KEY = "ielts_last_learning_path"
const VOCAB_LEARNED_CARDS_KEY = "ielts_vocabulary_learned_cards"
const VOCAB_EXAM_SCORES_KEY = "ielts_vocabulary_exam_scores"
const VOCAB_LEVELS = ["A2", "B1", "B2", "C1", "C2"]
const VOCAB_TOTAL_CARDS = 50
const VOCAB_TOTAL_EXAMS = 5
const DASHBOARD_AVAILABLE_UNITS = VOCAB_TOTAL_CARDS + VOCAB_TOTAL_EXAMS + SKILL_KEYS.length + 1
const welcomeImagePreloads = WELCOME_IMAGES.map(src => {
  return new Promise(resolve => {
    const image = new Image()
    image.onload = resolve
    image.onerror = resolve
    image.src = src
  })
})
let welcomeReadyPromise = null
let transitionLoadingVisibleAt = 0
let contactGatePendingAction = null
let contactGateClickListenerReady = false
let contactGateSessionComplete = false
let transitionLoadingLinkListenerReady = false
let transitionLoadingNavigationPending = false
let splashFinished = startupSplashComplete()

function startupSplashComplete() {
  try {
    return window.sessionStorage.getItem(STARTUP_SPLASH_COMPLETE_KEY) === "true"
  } catch (_error) {
    return false
  }
}

function markStartupSplashComplete() {
  splashFinished = true

  try {
    window.sessionStorage.setItem(STARTUP_SPLASH_COMPLETE_KEY, "true")
  } catch (_error) {
    // Session storage is a performance hint here; the in-memory flag still guards this page.
  }
}

function welcomeOnboardingComplete() {
  return window.localStorage.getItem("ielts_onboarding_complete") === "true"
}

function afterOpacityTransition(element, duration, callback) {
  if (!element) {
    callback()
    return
  }

  let didFinish = false

  function finish() {
    if (didFinish) return

    didFinish = true
    element.removeEventListener("transitionend", handleTransitionEnd)
    callback()
  }

  function handleTransitionEnd(event) {
    if (event.target === element && event.propertyName === "opacity") {
      finish()
    }
  }

  element.addEventListener("transitionend", handleTransitionEnd)
  window.setTimeout(finish, duration + 120)
}

function onNextFrame(callback) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(callback)
  })
}

function waitForTransitionLoadingMinimum() {
  const elapsed = performance.now() - transitionLoadingVisibleAt
  const remaining = Math.max(0, TRANSITION_LOADING_MIN_MS - elapsed)

  return new Promise(resolve => window.setTimeout(resolve, remaining))
}

function readLocalStorageJson(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null

    return JSON.parse(raw)
  } catch (_error) {
    return null
  }
}

function writeLocalStorageJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (_error) {
    // Local storage is the app's current persistence layer; ignore quota/privacy failures.
  }
}

function readLocalStorageString(key) {
  try {
    return window.localStorage.getItem(key) || ""
  } catch (_error) {
    return ""
  }
}

function readSessionStorageJson(key) {
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null

    return JSON.parse(raw)
  } catch (_error) {
    return null
  }
}

function writeSessionStorageJson(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch (_error) {
    // Session storage only preserves a pending client-side action across a redirect.
  }
}

function removeSessionStorageItem(key) {
  try {
    window.sessionStorage.removeItem(key)
  } catch (_error) {
    // Ignore unavailable storage.
  }
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function dateFromKey(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) return null

  const [year, month, day] = key.split("-").map(value => Number.parseInt(value, 10))
  const date = new Date(year, month - 1, day)

  return Number.isNaN(date.getTime()) ? null : date
}

function addDays(date, offset) {
  const next = new Date(date)
  next.setDate(next.getDate() + offset)

  return next
}

function readActivityDates() {
  const dates = readLocalStorageJson(LEARNING_ACTIVITY_DATES_KEY)
  if (!Array.isArray(dates)) return []

  return Array.from(new Set(dates.filter(date => dateFromKey(date)))).sort()
}

function recordLearningActivity(detail = {}) {
  const dates = new Set(readActivityDates())
  dates.add(localDateKey())
  writeLocalStorageJson(LEARNING_ACTIVITY_DATES_KEY, Array.from(dates).sort())

  const activity = {
    ...detail,
    completed: detail.completed === true,
    updatedAt: new Date().toISOString(),
  }

  writeLocalStorageJson(LAST_LEARNING_ACTIVITY_KEY, activity)

  if (detail.href) {
    try {
      window.localStorage.setItem(LAST_LEARNING_HREF_KEY, detail.href)
      window.localStorage.setItem(LAST_LEARNING_PATH_KEY, detail.href)
    } catch (_error) {
      // Ignore local storage failures; navigation can still use its fallback.
    }
  }

  window.dispatchEvent(new CustomEvent("ielts:progress-updated", {detail}))
}

function saveLastLearningHref(href, options = {}) {
  if (!href) return

  try {
    window.localStorage.setItem(LAST_LEARNING_HREF_KEY, href)
    window.localStorage.setItem(LAST_LEARNING_PATH_KEY, href)
  } catch (_error) {
    // Ignore local storage failures.
  }

  const existing = readLocalStorageJson(LAST_LEARNING_ACTIVITY_KEY)
  const activity =
    existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {}
  const sameActivity = activity.href === href || activity.path === href
  const completed =
    options.preserveCompleted === true && sameActivity
      ? activity.completed === true
      : options.completed === true

  writeLocalStorageJson(LAST_LEARNING_ACTIVITY_KEY, {
    ...activity,
    href,
    completed,
    updatedAt: new Date().toISOString(),
  })
}

function normalizeBand(value) {
  const number = Number.parseFloat(value)
  if (!Number.isFinite(number)) return null

  return Math.min(9, Math.max(0, Math.round(number * 2) / 2))
}

function formatBand(value) {
  const band = normalizeBand(value)

  return band === null ? null : band.toFixed(1)
}

function averageBand(values) {
  const bands = values.map(normalizeBand).filter(value => value !== null)
  if (bands.length === 0) return null

  const average = bands.reduce((total, value) => total + value, 0) / bands.length

  return normalizeBand(average)
}

function safeProgress(value) {
  const number = Number.parseInt(value, 10)
  if (!Number.isFinite(number)) return null

  return Math.min(100, Math.max(0, number))
}

function goalSelections() {
  const goals = readLocalStorageJson("ielts_goal_selections")
  if (!goals || typeof goals !== "object") return null

  const normalized = {}
  SKILL_KEYS.forEach(skill => {
    const band = formatBand(goals[skill])
    if (band) normalized[skill] = band
  })

  return Object.keys(normalized).length > 0 ? normalized : null
}

function scoreValue(value) {
  if (value && typeof value === "object") {
    return (
      value.band ??
      value.score ??
      value.value ??
      value.overall ??
      value.overallBand ??
      value.overall_band ??
      value.latest
    )
  }

  return value
}

function readSkillScores() {
  const sources = [
    readLocalStorageJson("ielts_skill_scores"),
    readLocalStorageJson("ielts_latest_skill_scores"),
    readLocalStorageJson("ielts_skill_results"),
  ]
  const scores = {}

  sources.forEach(source => {
    if (!source || typeof source !== "object" || Array.isArray(source)) return

    SKILL_KEYS.forEach(skill => {
      if (scores[skill]) return

      const band = formatBand(scoreValue(source[skill]))
      if (band) scores[skill] = band
    })
  })

  return scores
}

function latestResultFrom(value) {
  if (Array.isArray(value)) {
    return value
      .filter(item => item && typeof item === "object")
      .sort((left, right) => {
        const leftTime = Date.parse(left.completedAt || left.completed_at || left.date || "")
        const rightTime = Date.parse(right.completedAt || right.completed_at || right.date || "")

        return (rightTime || 0) - (leftTime || 0)
      })[0]
  }

  return value && typeof value === "object" ? value : null
}

function latestMockOverallBand() {
  const keys = [
    "ielts_latest_mock_result",
    "ielts_mock_results",
    "ielts_mock_exam_results",
    "ielts_full_exam_results",
  ]

  for (const key of keys) {
    const result = latestResultFrom(readLocalStorageJson(key))
    const band = formatBand(scoreValue(result))
    if (band) return band
  }

  return null
}

function currentOverallBand(skillScores) {
  const mockBand = latestMockOverallBand()
  if (mockBand) return mockBand

  const skillBands = SKILL_KEYS.map(skill => skillScores[skill])
  const hasEverySkill = skillBands.every(value => normalizeBand(value) !== null)

  return hasEverySkill ? formatBand(averageBand(skillBands)) : null
}

function progressMessage(progress) {
  if (progress >= 100) return "Goal completed! 🎉"
  if (progress >= 75) return "You're almost there!"
  if (progress >= 50) return "Great progress — keep going!"
  if (progress >= 21) return "You're building momentum."

  return "Let's get started!"
}

function skillComparisons(skillScores, goals) {
  return SKILL_KEYS.map(skill => {
    const current = normalizeBand(skillScores[skill])
    const goal = goals ? normalizeBand(goals[skill]) : null

    if (current === null || goal === null) return null

    return {skill, current, goal, gap: goal - current}
  }).filter(Boolean)
}

function overallMessageState(skillScores, goals) {
  const hasAnyResult = SKILL_KEYS.some(skill => normalizeBand(skillScores[skill]) !== null)
  if (!hasAnyResult) {
    return {
      title: "Ready to start?",
      message: "Complete an activity to see your progress.",
      extra: "",
    }
  }

  const comparisons = skillComparisons(skillScores, goals)
  if (comparisons.length > 0 && comparisons.every(item => item.current >= item.goal)) {
    return {
      title: "Amazing! 🎉",
      message: "You've reached your IELTS targets!",
      extra: "",
    }
  }

  if (comparisons.some(item => item.gap > 0 && item.gap <= 0.5)) {
    return {
      title: "Almost there!",
      message: "You're getting closer to your target bands.",
      extra: "",
    }
  }

  return {
    title: "Good start!",
    message: "Keep practicing to move closer to your goals.",
    extra: "",
  }
}

function skillMessage(score, goal) {
  const current = normalizeBand(score)
  const target = normalizeBand(goal)

  if (current === null) return "Not started"
  if (target === null) return "Set a goal"
  if (target !== null && current >= target) return "Goal reached!"
  if (target - current <= 0.5) return "Almost there!"
  if (target - current <= 1) return "Good progress!"

  return "Keep going!"
}

function calculateStreak() {
  const activeSet = new Set(readActivityDates())
  const today = new Date()
  const todayKey = localDateKey(today)
  const yesterday = addDays(today, -1)
  const yesterdayKey = localDateKey(yesterday)
  const startDate = activeSet.has(todayKey) ? today : activeSet.has(yesterdayKey) ? yesterday : null
  let count = 0

  if (startDate) {
    let cursor = new Date(startDate)

    while (activeSet.has(localDateKey(cursor))) {
      count += 1
      cursor = addDays(cursor, -1)
    }
  }

  const monday = addDays(today, -((today.getDay() + 6) % 7))
  const week = Array.from({length: 7}, (_item, index) => {
    const date = addDays(monday, index)
    const key = localDateKey(date)

    return {
      key,
      active: activeSet.has(key),
      current: key === todayKey,
    }
  })

  return {count, week}
}

function vocabularyProgress() {
  const learnedCards = readLocalStorageJson(VOCAB_LEARNED_CARDS_KEY)
  const examScores = readLocalStorageJson(VOCAB_EXAM_SCORES_KEY)
  const learnedCount = Array.isArray(learnedCards) ? new Set(learnedCards).size : 0
  const completedExams =
    examScores && typeof examScores === "object"
      ? VOCAB_LEVELS.filter(level => Number.isFinite(Number.parseInt(examScores[level], 10))).length
      : 0

  return {
    learnedCount: Math.min(VOCAB_TOTAL_CARDS, learnedCount),
    completedExams: Math.min(VOCAB_TOTAL_EXAMS, completedExams),
  }
}

function calculatedProgress(skillScores) {
  const stored = readLocalStorageJson(LEARNING_PROGRESS_KEY)
  if (
    stored &&
    Number.isFinite(Number(stored.completedUnits)) &&
    Number.isFinite(Number(stored.availableUnits)) &&
    Number(stored.availableUnits) > 0
  ) {
    return safeProgress((Number(stored.completedUnits) / Number(stored.availableUnits)) * 100) ?? 0
  }

  const vocab = vocabularyProgress()
  const skillCompletions = SKILL_KEYS.filter(skill => normalizeBand(skillScores[skill]) !== null).length
  const mockCompletions = latestMockOverallBand() ? 1 : 0
  const completedUnits = vocab.learnedCount + vocab.completedExams + skillCompletions + mockCompletions

  return Math.round((completedUnits / DASHBOARD_AVAILABLE_UNITS) * 100)
}

function localAppHref(value, fallback) {
  if (!value || typeof value !== "string") return fallback

  try {
    const url = new URL(value, window.location.origin)
    if (url.origin !== window.location.origin) return fallback

    return `${url.pathname}${url.search}${url.hash}`
  } catch (_error) {
    return fallback
  }
}

function lastLearningActivity() {
  const stored = readLocalStorageJson(LAST_LEARNING_ACTIVITY_KEY)
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    return stored
  }

  const href =
    readLocalStorageString(LAST_LEARNING_HREF_KEY) ||
    readLocalStorageString(LAST_LEARNING_PATH_KEY)

  return href ? {href, completed: false} : null
}

function learningCtaState(progress, link) {
  const fallback = link?.dataset.defaultHref || "/vocabulary"
  const nextHref = link?.dataset.nextHref || "/activities"
  const reviewHref = link?.dataset.reviewHref || "/progress"
  const activity = lastLearningActivity()

  if (progress >= 100) {
    return {href: reviewHref, label: "Review Your Progress", state: "review"}
  }

  if (activity && activity.completed !== true) {
    return {
      href: localAppHref(activity.href || activity.path || fallback, fallback),
      label: "Continue Learning",
      state: "continue",
    }
  }

  if (progress === 0 && !activity) {
    return {href: fallback, label: "Start Learning", state: "start"}
  }

  return {href: nextHref, label: "Start Next Activity", state: "next"}
}

function syncLearningCta(link, progress) {
  if (!link) return

  const state = learningCtaState(progress, link)
  const label = link.querySelector("[data-continue-learning-label]")

  link.href = localAppHref(state.href, link.dataset.defaultHref || "/vocabulary")
  link.dataset.learningCtaState = state.state
  link.setAttribute("aria-label", state.label)
  if (label) label.textContent = state.label
}

function initMainDashboard() {
  const root = document.querySelector("[data-main-dashboard]")
  if (!root) return

  if (root.dataset.mainDashboardReady !== "true") {
    root.dataset.mainDashboardReady = "true"
    bindMainDashboardActions(root)
  }

  refreshMainDashboard(root)
}

function refreshMainDashboard(root) {
  const name = readLocalStorageString("ielts_user_name").trim()
  const greeting = name ? `Hello, ${name}! 👋` : "Hello! 👋"
  const goals = goalSelections()
  const scoreState = readSkillScores()
  const currentBand = currentOverallBand(scoreState)
  const goalBand = goals ? formatBand(averageBand(SKILL_KEYS.map(skill => goals[skill]))) : null
  const progress = calculatedProgress(scoreState)
  const streak = calculateStreak()

  root.querySelectorAll("[data-main-user-greeting]").forEach(target => {
    target.textContent = greeting
    target.classList.toggle("is-long-name", greeting.length > 18)
    target.classList.toggle("is-very-long-name", greeting.length > 26)
    fitDashboardGreeting(target)
  })
  root.querySelectorAll("[data-current-band]").forEach(target => {
    target.textContent = currentBand || "—"
  })
  root.querySelectorAll("[data-goal-band]").forEach(target => {
    target.textContent = goalBand || "Set goal"
    const card = target.closest("#main-goal-band-card")
    if (card) card.classList.toggle("is-empty-goal", !goalBand)
  })
  root.querySelectorAll("[data-overall-band]").forEach(target => {
    target.textContent = currentBand ? `${currentBand}/9` : "—/9"
  })
  root.querySelectorAll(".main-band-card small").forEach(target => {
    target.hidden = target.closest("#main-goal-band-card") && !goalBand
  })

  const progressLabel = root.querySelector("[data-progress-label]")
  const progressBar = root.querySelector("[data-progress-bar]")
  const progressFill = root.querySelector("[data-progress-fill]")
  const progressCopy = root.querySelector("[data-progress-message]")
  if (progressLabel) progressLabel.textContent = `${progress}%`
  if (progressBar) progressBar.setAttribute("aria-valuenow", String(progress))
  if (progressFill) progressFill.style.width = `${progress}%`
  if (progressCopy) progressCopy.textContent = progressMessage(progress)
  root.querySelectorAll("[data-continue-learning]").forEach(link => syncLearningCta(link, progress))

  const streakCountTarget = root.querySelector("[data-streak-count]")
  const streakMessageTarget = root.querySelector("[data-streak-message]")
  if (streakCountTarget) streakCountTarget.textContent = String(streak.count)
  if (streakMessageTarget) {
    streakMessageTarget.textContent =
      streak.count > 0 ? "Great consistency!" : "Start your streak today!"
  }
  root.querySelectorAll("[data-streak-day]").forEach((day, index) => {
    const state = streak.week[index] || {active: false, current: false}
    const active = Boolean(state.active)
    const current = Boolean(state.current)
    day.dataset.active = String(active)
    day.dataset.current = String(current)
    day.classList.toggle("is-active", active)
    day.classList.toggle("is-current", current)
    const marker = day.querySelector("span")
    if (marker) marker.textContent = current && active ? "🔥" : active ? "✓" : "○"
  })

  const overallTitleTarget = root.querySelector("[data-overall-message-title]")
  const overallMessageTarget = root.querySelector("[data-overall-message]")
  const messageState = overallMessageState(scoreState, goals)
  if (overallTitleTarget) overallTitleTarget.textContent = messageState.title
  if (overallMessageTarget) overallMessageTarget.textContent = messageState.message

  SKILL_KEYS.forEach(skill => {
    const score = scoreState[skill] || null
    const goal = goals && goals[skill] ? goals[skill] : null
    const target = root.querySelector(`[data-skill-score="${skill}"]`)
    const goalTarget = root.querySelector(`[data-skill-goal="${skill}"]`)
    const messageTarget = root.querySelector(`[data-skill-message="${skill}"]`)

    if (target) target.textContent = score || "—"
    if (goalTarget) {
      const reached =
        goal && normalizeBand(score) !== null && normalizeBand(score) >= normalizeBand(goal)
      goalTarget.textContent = goal ? `${goal}${reached ? " ✓" : ""}` : "—"
    }
    if (messageTarget) messageTarget.textContent = skillMessage(score, goal)
  })
}

function bindMainDashboardActions(root) {
  root.querySelectorAll("[data-continue-learning]").forEach(link => {
    link.addEventListener(
      "click",
      () => {
        syncLearningCta(link, calculatedProgress(readSkillScores()))
      },
      {capture: true}
    )
  })

  root.querySelectorAll("[data-study-plan-action]").forEach(button => {
    button.addEventListener("click", event => {
      if (!contactStepComplete()) return

      const scores = readSkillScores()
      const goals = goalSelections()
      const progress = calculatedProgress(scores)
      writeLocalStorageJson("ielts_study_plan_context", {
        goals,
        skillScores: scores,
        currentBand: currentOverallBand(scores),
        progress,
        updatedAt: new Date().toISOString(),
      })

      const status = root.querySelector("[data-study-plan-status]")
      if (status) {
        status.hidden = false
        status.textContent = "Study plan context saved. Opening Practice..."
      }

      event.preventDefault()
      window.setTimeout(() => window.location.assign("/activities"), 450)
    })
  })

  root.querySelectorAll("[data-goal-band-action]").forEach(button => {
    button.addEventListener("click", () => {
      try {
        window.sessionStorage.setItem(GOAL_SELECTION_REQUEST_KEY, "true")
        window.localStorage.removeItem("ielts_onboarding_complete")
      } catch (_error) {
        // If storage is unavailable, falling back to the home page is still harmless.
      }

      window.location.assign("/")
    })
  })
}

function validSkillSetupDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "")
}

function skillSetupHref(skill) {
  return SKILL_KEYS.includes(skill) ? `/${skill}/setup` : null
}

function validSkillSetupTarget(value) {
  return SKILL_SETUP_TARGET_BANDS.includes(value)
}

function normalizeSkillSetupTarget(value) {
  if (validSkillSetupTarget(value)) return value

  const band = formatBand(value)
  if (band === "8.5") return "8.5+"

  return validSkillSetupTarget(band) ? band : null
}

function validSkillSetupMinutes(value) {
  const minutes = Number.parseInt(value, 10)

  return SKILL_SETUP_DAILY_MINUTES.includes(minutes) ? minutes : null
}

function readAllSkillSetup() {
  const setup = readLocalStorageJson(SKILL_SETUP_KEY)

  return setup && typeof setup === "object" && !Array.isArray(setup) ? setup : {}
}

function defaultSkillSetupState(skill) {
  const goals = readLocalStorageJson("ielts_goal_selections")
  const targetBand =
    goals && typeof goals === "object" && !Array.isArray(goals)
      ? normalizeSkillSetupTarget(goals[skill])
      : null

  return {
    type: null,
    examDate: null,
    noExamDate: false,
    targetBand,
    dailyStudyMinutes: null,
  }
}

function normalizeSkillSetupState(skill, value) {
  const state = defaultSkillSetupState(skill)

  if (!value || typeof value !== "object" || Array.isArray(value)) return state

  if (value.type === "academic" || value.type === "general") state.type = value.type

  if (validSkillSetupDate(value.examDate)) {
    state.examDate = value.examDate
    state.noExamDate = false
  }

  if (value.noExamDate === true) {
    state.examDate = null
    state.noExamDate = true
  }

  state.targetBand = normalizeSkillSetupTarget(value.targetBand) || state.targetBand

  const minutes = validSkillSetupMinutes(value.dailyStudyMinutes)
  if (minutes !== null) state.dailyStudyMinutes = minutes

  return state
}

function readSkillSetupState(skill) {
  return normalizeSkillSetupState(skill, readAllSkillSetup()[skill])
}

function saveSkillSetupState(skill, state) {
  if (!SKILL_KEYS.includes(skill)) return

  const setup = readAllSkillSetup()
  setup[skill] = {
    type: state.type,
    examDate: state.noExamDate ? null : state.examDate,
    noExamDate: state.noExamDate === true,
    targetBand: state.targetBand,
    dailyStudyMinutes: state.dailyStudyMinutes,
  }

  writeLocalStorageJson(SKILL_SETUP_KEY, setup)
}

function saveSkillSetupTarget(skill, targetBand) {
  if (!SKILL_KEYS.includes(skill) || !validSkillSetupTarget(targetBand)) return

  const savedGoals = readLocalStorageJson("ielts_goal_selections")
  const goals = savedGoals && typeof savedGoals === "object" && !Array.isArray(savedGoals)
    ? savedGoals
    : {}

  goals[skill] = targetBand
  writeLocalStorageJson("ielts_goal_selections", goals)
  window.dispatchEvent(new CustomEvent("ielts:progress-updated"))
}

function skillSetupComplete(state) {
  return Boolean(
    state.type &&
      (state.noExamDate === true || validSkillSetupDate(state.examDate)) &&
      validSkillSetupTarget(state.targetBand) &&
      validSkillSetupMinutes(state.dailyStudyMinutes) !== null
  )
}

function setSkillSetupOptionState(root, state) {
  root.querySelectorAll("[data-skill-setup-field][data-skill-setup-value]").forEach(button => {
    const field = button.dataset.skillSetupField
    const value = button.dataset.skillSetupValue
    let selected = false

    if (field === "noExamDate") selected = state.noExamDate === true
    if (field === "dailyStudyMinutes") selected = state.dailyStudyMinutes === Number.parseInt(value, 10)
    if (field === "type" || field === "targetBand") selected = state[field] === value

    button.classList.toggle("is-selected", selected)
    button.setAttribute("aria-pressed", String(selected))
  })
}

function syncSkillSetup(root, state) {
  const dateInput = root.querySelector("[data-skill-setup-date]")
  const dateField = root.querySelector("[data-skill-setup-date-field]")
  const dateCheck = root.querySelector("[data-skill-setup-date-check]")
  const continueButton = root.querySelector("[data-skill-setup-continue]")
  const dateSelected = !state.noExamDate && validSkillSetupDate(state.examDate)
  const complete = skillSetupComplete(state)

  setSkillSetupOptionState(root, state)

  if (dateInput && dateInput.value !== (state.examDate || "")) {
    dateInput.value = state.examDate || ""
  }

  if (dateField) dateField.classList.toggle("is-selected", dateSelected)
  if (dateCheck) dateCheck.hidden = !dateSelected

  if (continueButton) {
    continueButton.disabled = !complete
    continueButton.setAttribute("aria-disabled", String(!complete))
    continueButton.classList.toggle("is-active", complete)
  }
}

function initSkillSetupPages() {
  document.querySelectorAll("[data-skill-setup-root]").forEach(root => {
    const skill = root.dataset.skill
    if (!SKILL_KEYS.includes(skill)) return

    if (!contactStepComplete()) {
      writeSessionStorageJson(CONTACT_PENDING_ACTION_KEY, {type: "skill_setup", skill})
      window.location.replace("/")
      return
    }

    if (root.dataset.skillSetupReady === "true") {
      syncSkillSetup(root, readSkillSetupState(skill))
      return
    }

    root.dataset.skillSetupReady = "true"
    let state = readSkillSetupState(skill)
    const dateInput = root.querySelector("[data-skill-setup-date]")
    const continueButton = root.querySelector("[data-skill-setup-continue]")

    root.querySelectorAll("[data-skill-setup-field][data-skill-setup-value]").forEach(button => {
      button.addEventListener("click", () => {
        const field = button.dataset.skillSetupField
        const value = button.dataset.skillSetupValue

        if (field === "type" && (value === "academic" || value === "general")) {
          state.type = value
        }

        if (field === "noExamDate") {
          state.noExamDate = true
          state.examDate = null
        }

        if (field === "targetBand" && validSkillSetupTarget(value)) {
          state.targetBand = value
          saveSkillSetupTarget(skill, value)
        }

        if (field === "dailyStudyMinutes") {
          const minutes = validSkillSetupMinutes(value)
          if (minutes !== null) state.dailyStudyMinutes = minutes
        }

        saveSkillSetupState(skill, state)
        syncSkillSetup(root, state)
      })
    })

    if (dateInput) {
      dateInput.addEventListener("input", () => {
        state.examDate = validSkillSetupDate(dateInput.value) ? dateInput.value : null
        state.noExamDate = false
        saveSkillSetupState(skill, state)
        syncSkillSetup(root, state)
      })
    }

    if (continueButton) {
      continueButton.addEventListener("click", () => {
        if (!skillSetupComplete(state)) return

        saveSkillSetupState(skill, state)
        const destination = root.dataset.continueDestination || SKILL_ROUTES[skill]
        window.location.assign(destination)
      })
    }

    syncSkillSetup(root, state)
  })
}

function fitDashboardGreeting(target) {
  if (!target) return

  window.requestAnimationFrame(() => {
    target.style.fontSize = ""
    target.style.whiteSpace = "nowrap"

    const computed = window.getComputedStyle(target)
    const initialSize = Number.parseFloat(computed.fontSize)
    const minSize = 21
    let nextSize = initialSize

    while (target.scrollWidth > target.clientWidth && nextSize > minSize) {
      nextSize -= 1
      target.style.fontSize = `${nextSize}px`
    }

    if (target.scrollWidth > target.clientWidth) {
      target.style.whiteSpace = "normal"
    }
  })
}

function contactStepComplete() {
  if (contactGateSessionComplete) return true

  try {
    return window.localStorage.getItem(CONTACT_COMPLETE_KEY) === "true"
  } catch (_error) {
    return false
  }
}

function countryFlag(country) {
  return country
    .toUpperCase()
    .replace(/./g, character => String.fromCodePoint(127397 + character.charCodeAt(0)))
}

function buildContactCountries() {
  const displayNames =
    typeof Intl !== "undefined" && Intl.DisplayNames
      ? new Intl.DisplayNames(["en"], {type: "region"})
      : null

  return getCountries()
    .map(country => {
      try {
        const dialCode = `+${getCountryCallingCode(country)}`
        const label = CONTACT_COUNTRY_LABELS[country] || displayNames?.of(country) || country
        const priorityIndex = CONTACT_PRIORITY_COUNTRIES.indexOf(country)

        return {
          country,
          dialCode,
          flag: countryFlag(country),
          label,
          priority: priorityIndex === -1 ? 1000 : priorityIndex,
        }
      } catch (_error) {
        return null
      }
    })
    .filter(Boolean)
    .sort((first, second) => {
      if (first.priority !== second.priority) return first.priority - second.priority
      return first.label.localeCompare(second.label)
    })
}

function normalizeContactPhone(rawPhone, country) {
  const value = rawPhone.trim()
  if (!value) return null

  const phoneNumber = parsePhoneNumberFromString(value, country)

  if (!phoneNumber || !phoneNumber.isValid()) return null

  return phoneNumber.number
}

function validContactEmail(rawEmail) {
  const value = rawEmail.trim()
  if (!value) return false

  const emailInput = document.createElement("input")
  emailInput.type = "email"
  emailInput.required = true
  emailInput.value = value

  return emailInput.checkValidity() && CONTACT_EMAIL_PATTERN.test(value)
}

function formatContactCountdown(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
}

function normalizeOtpCode(value) {
  const code = String(value || "").trim()

  return /^\d{6}$/.test(code) ? code : null
}

async function contactJsonRequest(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify(payload),
  })
  let data = {}

  try {
    data = await response.json()
  } catch (_error) {
    data = {}
  }

  return {data, ok: response.ok, status: response.status}
}

function resumeContactPendingAction() {
  const pendingAction = contactGatePendingAction
  contactGatePendingAction = null
  removeSessionStorageItem(CONTACT_PENDING_ACTION_KEY)

  if (!pendingAction) return

  if (pendingAction.type === "skill_setup") {
    const href = skillSetupHref(pendingAction.skill)
    if (href) window.location.assign(href)
    return
  }

  if (
    pendingAction.element &&
    pendingAction.element.isConnected &&
    typeof pendingAction.element.click === "function"
  ) {
    pendingAction.element.click()
    return
  }

  if (pendingAction.href) {
    window.location.assign(pendingAction.href)
  }
}

function pendingContactActionFromTrigger(trigger) {
  const skill = trigger.dataset.contactSkill

  if (trigger.dataset.contactAction === "skill_setup" && SKILL_KEYS.includes(skill)) {
    return {
      type: "skill_setup",
      skill,
      href: skillSetupHref(skill),
    }
  }

  return {
    href: trigger.href || trigger.dataset.contactHref || null,
    element: trigger,
  }
}

function pendingContactActionFromSession() {
  const action = readSessionStorageJson(CONTACT_PENDING_ACTION_KEY)

  if (action?.type === "skill_setup" && SKILL_KEYS.includes(action.skill)) {
    return {
      type: "skill_setup",
      skill: action.skill,
      href: skillSetupHref(action.skill),
    }
  }

  removeSessionStorageItem(CONTACT_PENDING_ACTION_KEY)
  return null
}

function openContactModal(modal) {
  modal.hidden = false
  modal.setAttribute("aria-hidden", "false")
  document.body.classList.add("contact-modal-open")
  modal.querySelector("[data-contact-phone]")?.focus({preventScroll: true})
}

function closeContactModal(modal, options = {}) {
  modal.dispatchEvent(new CustomEvent("contact-modal:closing", {detail: options}))
  modal.setAttribute("aria-hidden", "true")
  document.body.classList.remove("contact-modal-open")

  window.setTimeout(() => {
    if (modal.getAttribute("aria-hidden") === "true") modal.hidden = true
  }, 180)

  if (!options.resume) {
    contactGatePendingAction = null
    return
  }

  window.setTimeout(resumeContactPendingAction, 190)
}

function initContactGate() {
  const modal = document.querySelector("[data-contact-modal]")

  if (!contactGateClickListenerReady) {
    contactGateClickListenerReady = true

    document.addEventListener(
      "click",
      event => {
        const trigger = event.target.closest('[data-contact-gated="true"]')
        if (!trigger || contactStepComplete()) return

        const modalTarget = document.querySelector("[data-contact-modal]")
        if (!modalTarget) return

        event.preventDefault()
        event.stopImmediatePropagation()

        contactGatePendingAction = pendingContactActionFromTrigger(trigger)
        openContactModal(modalTarget)
      },
      true
    )
  }

  if (!modal || modal.dataset.contactGateReady === "true") return

  modal.dataset.contactGateReady = "true"

  const countries = buildContactCountries()
  const selectedCountry = {
    value: CONTACT_DEFAULT_COUNTRY,
  }
  const contactStep = modal.querySelector('[data-contact-step="contact"]')
  const otpStep = modal.querySelector('[data-contact-step="otp"]')
  const countryButton = modal.querySelector("[data-contact-country-button]")
  const countryMenu = modal.querySelector("[data-contact-country-menu]")
  const countryList = modal.querySelector("[data-contact-country-list]")
  const countrySearch = modal.querySelector("[data-contact-country-search]")
  const countryFlagTarget = modal.querySelector("[data-contact-country-flag]")
  const countryCodeTarget = modal.querySelector("[data-contact-country-code]")
  const phoneInput = modal.querySelector("[data-contact-phone]")
  const emailInput = modal.querySelector("[data-contact-email]")
  const form = modal.querySelector("[data-contact-form]")
  const submitButton = modal.querySelector("[data-contact-submit]")
  const closeButton = modal.querySelector("[data-contact-close]")
  const phoneError = modal.querySelector("[data-contact-phone-error]")
  const emailError = modal.querySelector("[data-contact-email-error]")
  const sendError = modal.querySelector("[data-contact-send-error]")
  const otpPhoneTarget = modal.querySelector("[data-contact-otp-phone]")
  const otpInputs = Array.from(modal.querySelectorAll("[data-contact-otp-input]"))
  const otpForm = modal.querySelector("[data-contact-otp-form]")
  const otpLoading = modal.querySelector("[data-contact-otp-loading]")
  const otpStatus = modal.querySelector("[data-contact-otp-status]")
  const otpStatusText = modal.querySelector("[data-contact-otp-status-text]")
  const otpStatusErrorIcon = modal.querySelector("[data-contact-status-error-icon]")
  const otpStatusSuccessIcon = modal.querySelector("[data-contact-status-success-icon]")
  const otpTestCode = modal.querySelector("[data-contact-otp-test-code]")
  const otpTestCodeValue = modal.querySelector("[data-contact-otp-test-code-value]")
  const resendWait = modal.querySelector("[data-contact-resend-wait]")
  const countdownValue = modal.querySelector("[data-contact-countdown]")
  const resendButton = modal.querySelector("[data-contact-resend]")
  const privacyRow = modal.querySelector("[data-contact-privacy-row]")
  const privacyInput = modal.querySelector("[data-contact-privacy]")
  const verifiedSubmitButton = modal.querySelector("[data-contact-verified-submit]")
  const touched = {
    phone: false,
    email: false,
    submitted: false,
  }
  let contactFormBusy = false
  let resendBusy = false
  let verifyBusy = false
  let flowState = "CONTACT_FORM"
  let contactInfo = null
  let phoneVerified = false
  let resendTimer = null
  let resendRemaining = 0
  let otpValues = Array(CONTACT_OTP_LENGTH).fill("")
  let currentOtp = null
  let currentOtpExpiresAt = 0

  function selectedCountryData() {
    return countries.find(item => item.country === selectedCountry.value) || countries[0]
  }

  function syncSelectedCountry() {
    const country = selectedCountryData()
    if (!country) return

    countryFlagTarget.textContent = country.flag
    countryCodeTarget.textContent = country.dialCode
    validateContactForm()
  }

  function setCountry(country) {
    if (!countries.some(item => item.country === country)) return

    selectedCountry.value = country
    syncSelectedCountry()
    closeCountryMenu()
    phoneInput.focus()
  }

  function renderCountries(filter = "") {
    const query = filter.trim().toLocaleLowerCase()
    const visibleCountries = countries.filter(country => {
      if (!query) return true

      return (
        country.label.toLocaleLowerCase().includes(query) ||
        country.country.toLocaleLowerCase().includes(query) ||
        country.dialCode.includes(query)
      )
    })

    countryList.replaceChildren()

    visibleCountries.forEach(country => {
      const option = document.createElement("button")
      option.type = "button"
      option.className = "contact-country-option"
      option.setAttribute("role", "option")
      option.setAttribute("aria-selected", String(country.country === selectedCountry.value))
      option.dataset.country = country.country
      option.innerHTML = `
        <span class="contact-country-option-main">
          <span>${country.flag}</span>
          <span>${country.label}</span>
        </span>
        <span class="contact-country-option-code">${country.dialCode}</span>
      `
      option.addEventListener("click", () => setCountry(country.country))
      countryList.append(option)
    })
  }

  function openCountryMenu() {
    countryMenu.hidden = false
    countryButton.setAttribute("aria-expanded", "true")
    renderCountries(countrySearch.value)
    window.requestAnimationFrame(() => countrySearch.focus())
  }

  function closeCountryMenu() {
    countryMenu.hidden = true
    countryButton.setAttribute("aria-expanded", "false")
  }

  function countryMenuOpen() {
    return !countryMenu.hidden
  }

  function validateContactForm() {
    const normalizedPhone = normalizeContactPhone(phoneInput.value, selectedCountry.value)
    const phoneValid = Boolean(normalizedPhone)
    const emailValid = validContactEmail(emailInput.value)
    const canSubmit = phoneValid && emailValid

    submitButton.disabled = contactFormBusy || !canSubmit
    phoneError.hidden = phoneValid || (!touched.phone && !touched.submitted)
    emailError.hidden = emailValid || (!touched.email && !touched.submitted)

    return {
      canSubmit,
      email: emailInput.value.trim(),
      normalizedPhone,
    }
  }

  function setFlowState(nextState) {
    flowState = nextState
    modal.dataset.contactFlowState = nextState
  }

  function showContactStep() {
    contactStep.hidden = false
    otpStep.hidden = true
    contactStep.classList.add("contact-step-active")
    otpStep.classList.remove("contact-step-active")
    setFlowState("CONTACT_FORM")
  }

  function showOtpStep() {
    contactStep.hidden = true
    otpStep.hidden = false
    contactStep.classList.remove("contact-step-active")
    otpStep.classList.add("contact-step-active")
    setFlowState("OTP_ENTRY")

    if (contactInfo) otpPhoneTarget.textContent = contactInfo.phone

    window.requestAnimationFrame(() => otpInputs[0]?.focus({preventScroll: true}))
  }

  function stopResendCountdown() {
    if (resendTimer) {
      window.clearInterval(resendTimer)
      resendTimer = null
    }
  }

  function setResendAvailable(available) {
    resendWait.hidden = available
    resendButton.hidden = !available
    resendButton.disabled = resendBusy
  }

  function updateCountdownDisplay() {
    countdownValue.textContent = formatContactCountdown(resendRemaining)

    if (resendRemaining <= 0) {
      stopResendCountdown()
      setResendAvailable(true)
    } else {
      setResendAvailable(false)
    }
  }

  function startResendCountdown(seconds = CONTACT_DEFAULT_RESEND_SECONDS) {
    stopResendCountdown()
    resendRemaining = Math.max(0, Number(seconds) || CONTACT_DEFAULT_RESEND_SECONDS)
    updateCountdownDisplay()

    if (resendRemaining <= 0) return

    resendTimer = window.setInterval(() => {
      resendRemaining -= 1
      updateCountdownDisplay()
    }, 1000)
  }

  function clearOtpStatus() {
    otpStatus.hidden = true
    otpStatus.classList.remove("contact-status-error", "contact-status-success")
    otpStatusText.textContent = ""
    otpStatusErrorIcon.hidden = false
    otpStatusSuccessIcon.hidden = true
  }

  function setOtpStatus(kind, message) {
    otpStatus.hidden = false
    otpStatus.classList.toggle("contact-status-error", kind === "error")
    otpStatus.classList.toggle("contact-status-success", kind === "success")
    otpStatusText.textContent = message
    otpStatusErrorIcon.hidden = kind !== "error"
    otpStatusSuccessIcon.hidden = kind !== "success"
  }

  function setOtpInputsDisabled(disabled) {
    otpInputs.forEach(input => {
      input.disabled = disabled
    })
  }

  function setOtpTestCode(code) {
    if (!otpTestCode || !otpTestCodeValue) return

    const normalizedCode = normalizeOtpCode(code)

    if (normalizedCode) {
      otpTestCodeValue.textContent = normalizedCode
      otpTestCode.hidden = false
    } else {
      otpTestCodeValue.textContent = ""
      otpTestCode.hidden = true
    }
  }

  function setCurrentOtp(code, expiresInSeconds) {
    const normalizedCode = normalizeOtpCode(code)

    if (!normalizedCode) {
      currentOtp = null
      currentOtpExpiresAt = 0
      setOtpTestCode(null)
      return
    }

    currentOtp = normalizedCode

    if (Number.isFinite(Number(expiresInSeconds)) && Number(expiresInSeconds) > 0) {
      currentOtpExpiresAt = Date.now() + Number(expiresInSeconds) * 1000
    }

    setOtpTestCode(currentOtp)
  }

  function syncCurrentOtpFromResponse(data) {
    if (!data || !Object.prototype.hasOwnProperty.call(data, "test_code")) return

    setCurrentOtp(data.test_code, data.expires_in_seconds)
  }

  function currentOtpExpired() {
    return Boolean(currentOtp && currentOtpExpiresAt > 0 && Date.now() > currentOtpExpiresAt)
  }

  function enteredOtpCode() {
    return otpValues.join("").trim()
  }

  function syncOtpInputs() {
    otpInputs.forEach((input, index) => {
      input.value = otpValues[index] || ""
    })
  }

  function clearOtpInputs() {
    otpValues = Array(CONTACT_OTP_LENGTH).fill("")
    syncOtpInputs()
  }

  function otpCodeComplete() {
    return otpValues.every(value => /^\d$/.test(value))
  }

  function updateVerifiedSubmit() {
    verifiedSubmitButton.disabled = !(phoneVerified && privacyInput.checked)
  }

  function resetVerificationFlow() {
    stopResendCountdown()
    clearOtpInputs()
    clearOtpStatus()
    setOtpInputsDisabled(false)
    otpLoading.hidden = true
    privacyRow.hidden = false
    privacyInput.checked = false
    phoneVerified = false
    resendBusy = false
    verifyBusy = false
    contactFormBusy = false
    sendError.hidden = true
    resendButton.hidden = true
    resendButton.disabled = false
    resendWait.hidden = false
    setCurrentOtp(null)
    updateVerifiedSubmit()
    showContactStep()
    validateContactForm()
  }

  function focusOtpInput(index) {
    const input = otpInputs[Math.max(0, Math.min(CONTACT_OTP_LENGTH - 1, index))]
    input?.focus({preventScroll: true})
    input?.select()
  }

  function maybeVerifyOtp() {
    if (!otpCodeComplete() || verifyBusy || phoneVerified) return

    window.setTimeout(verifyOtp, 0)
  }

  function fillOtpDigits(rawValue, startIndex = 0) {
    const digits = rawValue.replace(/\D/g, "").slice(0, CONTACT_OTP_LENGTH - startIndex).split("")
    if (digits.length === 0) return

    for (let index = startIndex; index < CONTACT_OTP_LENGTH; index += 1) {
      otpValues[index] = ""
    }

    digits.forEach((digit, offset) => {
      otpValues[startIndex + offset] = digit
    })

    syncOtpInputs()

    const emptyIndex = otpValues.findIndex(value => !value)
    if (emptyIndex === -1) {
      focusOtpInput(CONTACT_OTP_LENGTH - 1)
    } else {
      focusOtpInput(emptyIndex)
    }

    maybeVerifyOtp()
  }

  function markPhoneVerified() {
    phoneVerified = true
    stopResendCountdown()
    setResendAvailable(false)
    resendWait.hidden = true
    resendButton.hidden = true
    setOtpStatus("success", "تم التحقق من رقم هاتفك")
    privacyRow.hidden = false
    setFlowState("VERIFIED")
    updateVerifiedSubmit()
  }

  function rejectEnteredOtp(message) {
    setOtpInputsDisabled(false)
    setOtpStatus("error", message)
    setFlowState("ERROR")
    focusOtpInput(CONTACT_OTP_LENGTH - 1)
  }

  async function sendVerificationCode({resend = false} = {}) {
    if (!contactInfo || contactFormBusy || resendBusy) return

    if (resend) {
      resendBusy = true
      resendButton.disabled = true
      clearOtpStatus()
    } else {
      contactFormBusy = true
      sendError.hidden = true
      validateContactForm()
    }

    setFlowState("SENDING_OTP")

    try {
      const result = await contactJsonRequest(CONTACT_OTP_SEND_PATH, {
        country: contactInfo.country,
        email: contactInfo.email,
        phone: contactInfo.phone,
      })

      if (result.ok || result.data.error === "rate_limited") {
        phoneVerified = false
        privacyInput.checked = false
        privacyRow.hidden = false
        updateVerifiedSubmit()
        setOtpInputsDisabled(false)
        clearOtpInputs()
        clearOtpStatus()
        syncCurrentOtpFromResponse(result.data)
        showOtpStep()
        startResendCountdown(result.data.resend_after_seconds || CONTACT_DEFAULT_RESEND_SECONDS)
        return
      }

      if (resend) {
        setOtpStatus("error", "تعذر إرسال رمز التحقق، حاول مرة أخرى")
        setResendAvailable(true)
      } else {
        sendError.hidden = false
        setFlowState("CONTACT_FORM")
      }
    } catch (_error) {
      if (resend) {
        setOtpStatus("error", "تعذر إرسال رمز التحقق، حاول مرة أخرى")
        setResendAvailable(true)
      } else {
        sendError.hidden = false
        setFlowState("CONTACT_FORM")
      }
    } finally {
      if (resend) {
        resendBusy = false
        resendButton.disabled = false
      } else {
        contactFormBusy = false
        validateContactForm()
      }
    }
  }

  async function verifyOtp() {
    if (!contactInfo || verifyBusy || phoneVerified || !otpCodeComplete()) return

    verifyBusy = true
    otpLoading.hidden = false
    setOtpInputsDisabled(true)
    setFlowState("VERIFYING")

    try {
      const enteredOtp = enteredOtpCode()

      if (currentOtp) {
        if (currentOtpExpired()) {
          stopResendCountdown()
          setResendAvailable(true)
          rejectEnteredOtp("انتهت صلاحية الرمز، يرجى طلب رمز جديد")
          return
        }

        if (String(enteredOtp) === String(currentOtp)) {
          markPhoneVerified()
          return
        }

        rejectEnteredOtp("الرمز خاطئ، يرجى التأكد من الرمز الصحيح")
        if (resendRemaining <= 0) setResendAvailable(true)
        return
      }

      const result = await contactJsonRequest(CONTACT_OTP_VERIFY_PATH, {
        code: enteredOtp,
        phone: contactInfo.phone,
      })

      if (result.ok) {
        markPhoneVerified()
        return
      }

      if (result.data.error === "expired") {
        stopResendCountdown()
        setResendAvailable(true)
        rejectEnteredOtp("انتهت صلاحية الرمز، يرجى طلب رمز جديد")
      } else {
        rejectEnteredOtp("الرمز خاطئ، يرجى التأكد من الرمز الصحيح")
        if (resendRemaining <= 0) setResendAvailable(true)
      }
    } catch (_error) {
      rejectEnteredOtp("الرمز خاطئ، يرجى التأكد من الرمز الصحيح")
    } finally {
      verifyBusy = false
      otpLoading.hidden = true
    }
  }

  countryButton.addEventListener("click", () => {
    if (countryMenuOpen()) {
      closeCountryMenu()
    } else {
      openCountryMenu()
    }
  })

  countrySearch.addEventListener("input", () => renderCountries(countrySearch.value))
  phoneInput.addEventListener("input", validateContactForm)
  phoneInput.addEventListener("blur", () => {
    touched.phone = true
    validateContactForm()
  })
  emailInput.addEventListener("input", validateContactForm)
  emailInput.addEventListener("blur", () => {
    touched.email = true
    validateContactForm()
  })
  closeButton.addEventListener("click", () => closeContactModal(modal))
  privacyInput.addEventListener("change", updateVerifiedSubmit)
  resendButton.addEventListener("click", () => sendVerificationCode({resend: true}))

  otpInputs.forEach((input, index) => {
    input.addEventListener("keydown", event => {
      if (phoneVerified) return

      if (event.key === "Backspace" && input.value === "" && index > 0) {
        event.preventDefault()
        focusOtpInput(index - 1)
        return
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        focusOtpInput(index + 1)
        return
      }

      if (event.key === "ArrowRight") {
        event.preventDefault()
        focusOtpInput(index - 1)
      }
    })

    input.addEventListener("input", () => {
      if (phoneVerified) return

      if (otpStatus.classList.contains("contact-status-error")) clearOtpStatus()

      const digits = input.value.replace(/\D/g, "")

      if (digits.length === 0) {
        otpValues[index] = ""
        syncOtpInputs()
        return
      }

      fillOtpDigits(digits, index)
    })

    input.addEventListener("paste", event => {
      if (phoneVerified) return

      event.preventDefault()
      if (otpStatus.classList.contains("contact-status-error")) clearOtpStatus()
      fillOtpDigits(event.clipboardData.getData("text"), index)
    })
  })

  document.addEventListener("click", event => {
    if (!countryMenuOpen()) return
    if (event.target.closest("[data-contact-country-picker]")) return

    closeCountryMenu()
  })

  document.addEventListener("keydown", event => {
    if (modal.hidden) return

    if (event.key === "Escape") {
      closeContactModal(modal)
      return
    }

    if (event.key === "Tab") {
      const focusable = Array.from(
        modal.querySelectorAll("button:not([disabled]), input:not([disabled])")
      ).filter(element => element.offsetParent !== null)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  })

  form.addEventListener("submit", event => {
    event.preventDefault()
    touched.submitted = true

    const result = validateContactForm()
    if (!result.canSubmit || contactFormBusy) return

    const country = selectedCountryData()

    contactInfo = {
      country: country.country,
      dialCode: country.dialCode,
      email: result.email,
      phone: result.normalizedPhone,
    }

    sendVerificationCode()
  })

  otpForm.addEventListener("submit", event => {
    event.preventDefault()
    if (!phoneVerified || !privacyInput.checked || !contactInfo) return

    contactGateSessionComplete = true

    try {
      window.localStorage.setItem(
        CONTACT_INFO_KEY,
        JSON.stringify({
          country: contactInfo.country,
          dial_code: contactInfo.dialCode,
          email: contactInfo.email,
          phone: contactInfo.phone,
          phone_verified: true,
        })
      )
      window.localStorage.setItem(CONTACT_COMPLETE_KEY, "true")
    } catch (_error) {
      // Keep the current session moving even if persistent storage is unavailable.
    }

    closeContactModal(modal, {resume: true})
  })

  modal.addEventListener("contact-modal:closing", event => {
    stopResendCountdown()
    closeCountryMenu()

    if (!event.detail?.resume) resetVerificationFlow()
  })

  renderCountries()
  syncSelectedCountry()
  resetVerificationFlow()

  if (!contactStepComplete()) {
    const sessionAction = pendingContactActionFromSession()
    if (sessionAction) {
      contactGatePendingAction = sessionAction
      openContactModal(modal)
    }
  } else {
    removeSessionStorageItem(CONTACT_PENDING_ACTION_KEY)
  }
}

function prepareMainApp() {
  const app = document.getElementById("main-app-content")

  document.documentElement.classList.add("main-app-ready")
  document.body.classList.add("main-app-ready")

  if (app) {
    app.classList.add("is-ready")
    app.removeAttribute("aria-hidden")
    void app.offsetHeight
  }
}

function showMainApp() {
  prepareMainApp()
  initMainDashboard()

  document.documentElement.classList.add("main-app-visible")
  document.body.classList.add("main-app-visible")

  const app = document.getElementById("main-app-content")
  if (app) app.classList.add("is-visible")
}

function clearStartupLocks() {
  document.documentElement.classList.remove("splash-active")
  document.documentElement.classList.remove("transition-loading-active")
  document.documentElement.classList.remove("welcome-active")
  document.body.classList.remove("splash-active")
  document.body.classList.remove("splash-pending")
  document.body.classList.remove("transition-loading-active")
  document.body.classList.remove("welcome-active")
}

function removeStartupSplash() {
  const root = document.getElementById("app-splash-screen")

  if (root) root.remove()

  document.documentElement.classList.remove("splash-active")
  document.body.classList.remove("splash-active")
  document.body.classList.remove("splash-pending")
}

function showWelcomeOnboarding(welcomeRoot) {
  if (!welcomeRoot) {
    showMainApp()
    clearStartupLocks()
    return
  }

  document.documentElement.classList.add("welcome-active")
  document.body.classList.add("welcome-active")

  onNextFrame(() => {
    welcomeRoot.classList.add("is-visible")
    welcomeRoot.setAttribute("aria-hidden", "false")
  })
}

function showTransitionLoading() {
  const root = document.getElementById("app-transition-loading")
  if (!root) return null

  root.hidden = false
  root.classList.remove("is-leaving")
  root.classList.remove("is-finishing")
  root.classList.add("is-ready")
  root.setAttribute("aria-hidden", "false")
  document.documentElement.classList.add("transition-loading-active")
  document.body.classList.add("transition-loading-active")
  void root.offsetHeight
  transitionLoadingVisibleAt = performance.now()

  onNextFrame(() => {
    root.classList.add("is-visible")
  })

  return root
}

function hideTransitionLoading(root) {
  if (!root) {
    document.documentElement.classList.remove("transition-loading-active")
    document.body.classList.remove("transition-loading-active")
    return
  }

  afterOpacityTransition(root, STARTUP_TRANSITION_MS, () => {
    root.hidden = true
    root.classList.remove("is-ready")
    root.classList.remove("is-visible")
    root.classList.remove("is-leaving")
    root.setAttribute("aria-hidden", "true")
    document.documentElement.classList.remove("transition-loading-active")
    document.body.classList.remove("transition-loading-active")
  })

  onNextFrame(() => {
    root.classList.add("is-leaving")
    root.classList.remove("is-visible")
  })
}

function initTransitionLoadingLinks() {
  if (transitionLoadingLinkListenerReady) return

  transitionLoadingLinkListenerReady = true

  document.addEventListener("click", event => {
    if (event.defaultPrevented) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const link = event.target.closest("[data-transition-loading-link]")
    if (!link) return
    if (link.target && link.target !== "_self") return
    if (link.dataset.contactGated === "true" && !contactStepComplete()) return
    if (transitionLoadingNavigationPending) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    transitionLoadingNavigationPending = true
    showTransitionLoading()

    window.setTimeout(() => {
      window.location.assign(link.href)
    }, TRANSITION_LOADING_LINK_DELAY_MS)
  })
}

function fadeSplashAway(root) {
  markStartupSplashComplete()

  return new Promise(resolve => {
    afterOpacityTransition(root, STARTUP_TRANSITION_MS, () => {
      removeStartupSplash()
      resolve()
    })

    onNextFrame(() => {
      if (root) root.classList.add("is-leaving")
    })
  })
}

function transitionLoadingToMain(loadingRoot) {
  prepareMainApp()

  onNextFrame(() => {
    showMainApp()
    hideTransitionLoading(loadingRoot)
    document.documentElement.classList.remove("welcome-active")
    document.body.classList.remove("welcome-active")
  })
}

function transitionLoadingToWelcome(loadingRoot, welcomeRoot) {
  document.documentElement.classList.add("welcome-active")
  document.body.classList.add("welcome-active")

  onNextFrame(() => {
    showWelcomeOnboarding(welcomeRoot)
    hideTransitionLoading(loadingRoot)
  })
}

function continueAfterSplash(root) {
  const loadingRoot = showTransitionLoading()
  const splashDone = fadeSplashAway(root)
  const nextScreenReady = welcomeOnboardingComplete()
    ? Promise.resolve({type: "main"})
    : initWelcomeOnboarding().then(welcomeRoot => {
        return welcomeRoot ? {type: "welcome", root: welcomeRoot} : {type: "main"}
      })

  Promise.all([splashDone, nextScreenReady, waitForTransitionLoadingMinimum()]).then(results => {
    const nextScreen = results[1]

    if (nextScreen.type === "welcome") {
      transitionLoadingToWelcome(loadingRoot, nextScreen.root)
    } else {
      transitionLoadingToMain(loadingRoot)
    }
  })
}

function continueWithoutStartupSplash() {
  markStartupSplashComplete()
  removeStartupSplash()

  if (welcomeOnboardingComplete()) {
    showMainApp()
    clearStartupLocks()
    return
  }

  initWelcomeOnboarding().then(showWelcomeOnboarding)
}

function initWelcomeOnboarding() {
  const root = document.getElementById("app-welcome-onboarding")
  if (!root) return Promise.resolve(null)
  if (welcomeReadyPromise) return welcomeReadyPromise

  root.dataset.welcomeReady = "true"

  welcomeReadyPromise = Promise.allSettled(welcomeImagePreloads).then(() => {
    const screens = Array.from(root.querySelectorAll("[data-welcome-screen]"))
    const goalScreen = root.querySelector("[data-ielts-goal-screen]")
    const goalScoreButtons = Array.from(root.querySelectorAll("[data-goal-skill][data-goal-score]"))
    const goalStartButton = root.querySelector("#ielts-goal-start")
    const goalSkipButton = root.querySelector("#ielts-goal-skip")
    const nameInput = root.querySelector("#welcome-name-input")
    const nameHint = root.querySelector("#welcome-name-hint")
    let currentIndex = 0
    let isTransitioning = false
    let didFinish = false
    let isGoalVisible = false
    const goals = {
      writing: null,
      reading: null,
      speaking: null,
      listening: null,
    }
    const goalSkills = Object.keys(goals)

    root.hidden = false
    root.classList.add("is-ready")
    root.setAttribute("aria-hidden", "true")
    screens.forEach((screen, index) => {
      screen.classList.toggle("is-active", index === currentIndex)
    })

    function saveName() {
      const name = nameInput ? nameInput.value.trim() : ""

      if (!name) return false

      window.localStorage.setItem("ielts_user_name", name)
      return true
    }

    function syncNameHint() {
      if (!nameInput || !nameHint) return

      nameHint.hidden = nameInput.value.trim().length > 0
    }

    function canStartGoal() {
      return (
        goals.writing !== null &&
        goals.reading !== null &&
        goals.speaking !== null &&
        goals.listening !== null
      )
    }

    function syncGoalStartButton() {
      if (!goalStartButton) return

      const isReady = canStartGoal()
      goalStartButton.disabled = !isReady
      goalStartButton.setAttribute("aria-disabled", String(!isReady))
      goalStartButton.classList.toggle("is-active", isReady)
    }

    function hasGoalScore(skill, score) {
      return goalScoreButtons.some(button => {
        return button.dataset.goalSkill === skill && button.dataset.goalScore === score
      })
    }

    function restoreSavedGoals() {
      const saved = window.localStorage.getItem("ielts_goal_selections")
      if (!saved) return

      try {
        const parsed = JSON.parse(saved)

        if (!parsed || typeof parsed !== "object") return

        goalSkills.forEach(skill => {
          const score = parsed[skill]

          if (typeof score === "string" && hasGoalScore(skill, score)) {
            goals[skill] = score
          }
        })
      } catch (_error) {
        // Ignore invalid client-side state and keep the screen usable.
      }
    }

    function syncGoalSelections() {
      goalScoreButtons.forEach(button => {
        const skill = button.dataset.goalSkill
        const isSelected = goals[skill] === button.dataset.goalScore

        button.classList.toggle("is-selected", isSelected)
        button.setAttribute("aria-pressed", String(isSelected))
      })

      syncGoalStartButton()
    }

    function selectGoal(skill, score) {
      if (!goalSkills.includes(skill) || !hasGoalScore(skill, score)) return

      goals[skill] = score
      syncGoalSelections()
    }

    function finishOnboarding(options = {}) {
      if (didFinish) return

      didFinish = true
      isTransitioning = true
      if (options.saveGoals) {
        window.localStorage.setItem("ielts_goal_selections", JSON.stringify(goals))
      }
      window.localStorage.setItem("ielts_onboarding_complete", "true")
      const loadingRoot = showTransitionLoading()

      prepareMainApp()
      afterOpacityTransition(loadingRoot, STARTUP_TRANSITION_MS, () => {
        root.remove()
        document.documentElement.classList.remove("welcome-active")
        document.body.classList.remove("welcome-active")
        waitForTransitionLoadingMinimum().then(() => transitionLoadingToMain(loadingRoot))
      })

      onNextFrame(() => {
        root.setAttribute("aria-hidden", "true")
        root.classList.remove("is-visible")
      })
    }

    function showGoalSelection() {
      if (isTransitioning || isGoalVisible) return

      if (!goalScreen) {
        finishOnboarding()
        return
      }

      const currentScreen = screens[currentIndex]
      isTransitioning = true
      isGoalVisible = true
      goalScreen.hidden = false
      goalScreen.setAttribute("aria-hidden", "false")
      syncGoalSelections()

      currentScreen.classList.remove("is-active")

      onNextFrame(() => {
        goalScreen.classList.add("is-active")
      })

      window.setTimeout(() => {
        isTransitioning = false
      }, WELCOME_TRANSITION_MS)
    }

    function showNextWelcome() {
      if (isTransitioning) return
      if (isGoalVisible) return

      if (currentIndex === 4 && !saveName()) return

      if (currentIndex >= screens.length - 1) {
        showGoalSelection()
        return
      }

      const currentScreen = screens[currentIndex]
      const nextScreen = screens[currentIndex + 1]
      isTransitioning = true

      currentScreen.classList.remove("is-active")
      nextScreen.classList.add("is-active")
      currentIndex += 1

      window.setTimeout(() => {
        isTransitioning = false
      }, WELCOME_TRANSITION_MS)
    }

    function stopInputAdvance(event) {
      event.stopPropagation()
    }

    restoreSavedGoals()
    syncGoalSelections()

    try {
      if (window.sessionStorage.getItem(GOAL_SELECTION_REQUEST_KEY) === "true") {
        window.sessionStorage.removeItem(GOAL_SELECTION_REQUEST_KEY)
        showGoalSelection()
      }
    } catch (_error) {
      // Ignore session storage failures; normal onboarding remains available.
    }

    goalScoreButtons.forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation()
        selectGoal(button.dataset.goalSkill, button.dataset.goalScore)
      })
    })

    if (goalStartButton) {
      goalStartButton.addEventListener("click", event => {
        event.stopPropagation()
        if (!canStartGoal()) return

        finishOnboarding({saveGoals: true})
      })
    }

    if (goalSkipButton) {
      goalSkipButton.addEventListener("click", event => {
        event.stopPropagation()
        finishOnboarding()
      })
    }

    if (goalScreen) {
      goalScreen.addEventListener("pointerup", event => event.stopPropagation())
      goalScreen.addEventListener("click", event => event.stopPropagation())
      goalScreen.addEventListener("touchend", event => event.stopPropagation())
    }

    if (nameInput) {
      syncNameHint()
      nameInput.addEventListener("input", syncNameHint)
      nameInput.addEventListener("pointerdown", stopInputAdvance)
      nameInput.addEventListener("pointerup", stopInputAdvance)
      nameInput.addEventListener("click", stopInputAdvance)
      nameInput.addEventListener("touchstart", stopInputAdvance)
      nameInput.addEventListener("touchend", stopInputAdvance)
      nameInput.addEventListener("keydown", event => {
        event.stopPropagation()

        if (event.key !== "Enter") return

        event.preventDefault()
        if (saveName()) showNextWelcome()
      })
    }

    if (window.PointerEvent) {
      root.addEventListener("pointerup", showNextWelcome)
    } else {
      root.addEventListener("touchend", showNextWelcome)
      root.addEventListener("click", showNextWelcome)
    }

    void root.offsetHeight
    return root
  })

  return welcomeReadyPromise
}

function initStartupSplash() {
  const root = document.getElementById("app-splash-screen")
  if (!root || root.dataset.splashReady === "true") return

  if (splashFinished || startupSplashComplete()) {
    continueWithoutStartupSplash()
    return
  }

  root.dataset.splashReady = "true"
  root.classList.add("is-running")
  document.documentElement.classList.add("splash-active")
  document.body.classList.add("splash-active")

  const scenes = Array.from(root.querySelectorAll("[data-splash-scene]"))
  const sceneLayer = root.querySelector(".splash-scenes")
  const percentTarget = root.querySelector("[data-splash-percent]")
  const fillTarget = root.querySelector("[data-splash-fill]")
  const captionTarget = root.querySelector("[data-splash-caption]")
  const captions = [
    "From preparation to celebration!",
    "Learning your way, step by step...",
    "Preparing your path to IELTS success...",
    "Unlocking your IELTS potential...",
    "Prepare for a real IELTS experience...",
    "Paving the way for your next achievement...",
    "Study smart, achieve more!",
    "Consistency today, success tomorrow!",
    "Explore opportunities with IELTS!",
    "Your journey. Your success. Your future!",
  ]
  const randomizedScenes = shuffle(
    scenes.map(scene => ({
      element: scene,
      captionIndex: Number.parseInt(scene.dataset.splashScene, 10),
    }))
  )
  const sceneCount = randomizedScenes.length
  const duration = sceneCount * STARTUP_SPLASH_SCENE_MS
  const finishDelay = STARTUP_SPLASH_FINISH_DELAY_MS
  let activeScene = 0
  let complete = false

  function shuffle(array) {
    const copy = [...array]

    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }

    return copy
  }

  randomizedScenes.forEach(({element}, index) => {
    element.classList.toggle("is-active", index === 0)
    if (sceneLayer) sceneLayer.append(element)
  })

  function setProgress(percent) {
    const nextScene = Math.min(sceneCount - 1, Math.floor((percent * sceneCount) / 101))

    if (nextScene !== activeScene) {
      randomizedScenes[activeScene].element.classList.remove("is-active")
      randomizedScenes[nextScene].element.classList.add("is-active")
      activeScene = nextScene
    }

    if (percentTarget) percentTarget.textContent = `${percent}%`
    if (fillTarget) fillTarget.style.width = `${percent}%`
    if (captionTarget) {
      captionTarget.textContent = captions[randomizedScenes[activeScene].captionIndex] || captions[0]
    }
  }

  function finish() {
    if (complete) return

    complete = true
    setProgress(100)

    window.setTimeout(() => {
      continueAfterSplash(root)
    }, finishDelay)
  }

  const startedAt = performance.now()
  setProgress(0)

  function tick(now) {
    const elapsed = now - startedAt
    const percent = Math.min(100, Math.round((elapsed / duration) * 100))

    setProgress(percent)

    if (percent >= 100) {
      finish()
      return
    }

    window.requestAnimationFrame(tick)
  }

  window.requestAnimationFrame(tick)
}

function initVocabularyFlashcards() {
  const root = document.querySelector("[data-vocabulary-root]")
  if (!root || root.dataset.vocabularyReady === "true") return

  root.dataset.vocabularyReady = "true"

  const overlay = root.querySelector("[data-flashcard-overlay]")
  const inner = root.querySelector("[data-flashcard-inner]")
  const levelTarget = root.querySelector("[data-flashcard-level]")
  const wordTarget = root.querySelector("[data-flashcard-word]")
  const pronunciationTarget = root.querySelector("[data-flashcard-pronunciation]")
  const typeTarget = root.querySelector("[data-flashcard-type]")
  const definitionTarget = root.querySelector("[data-flashcard-definition]")
  const arabicTarget = root.querySelector("[data-flashcard-arabic]")
  const exampleTarget = root.querySelector("[data-flashcard-example]")
  const counterTarget = root.querySelector("[data-flashcard-counter]")
  const prevButton = root.querySelector("[data-flashcard-prev]")
  const nextButton = root.querySelector("[data-flashcard-next]")
  const closeButton = root.querySelector("[data-flashcard-close]")
  const speakButton = root.querySelector("[data-flashcard-speak]")
  const learnedToggleButtons = Array.from(root.querySelectorAll("[data-flashcard-learned-toggle]"))
  const levelTabs = Array.from(root.querySelectorAll("[data-vocab-level-tab]"))
  const grids = Array.from(root.querySelectorAll("[data-vocab-grid]"))
  const vocabHeader = root.querySelector(".vocab-header")
  const vocabGridRegion = root.querySelector(".vocab-grid-region")
  const quizScreen = root.querySelector("[data-vocabulary-quiz-screen]")
  const quizTitle = root.querySelector("[data-vocabulary-quiz-title]")
  const quizBackButton = root.querySelector("[data-vocabulary-quiz-back]")
  const quizQuestionList = root.querySelector("[data-quiz-question-list]")
  const quizSubmitButton = root.querySelector("[data-quiz-submit]")
  const quizResult = root.querySelector("[data-quiz-result]")
  const quizRequiredMessage = root.querySelector("[data-quiz-required-message]")
  const quizButtons = Array.from(root.querySelectorAll("[data-vocabulary-quiz-button]"))
  const levelExamScores = Array.from(root.querySelectorAll("[data-level-exam-score]"))

  let activeLevel = root.dataset.defaultLevel || "A2"
  let activeIndex = 0
  let selectedCard = null
  let activeQuiz = null
  const learnedCards = new Set()
  const examScoresByLevel = new Map()
  const answerLabels = ["A", "B", "C", "D"]
  const urlParams = new URLSearchParams(window.location.search)
  const requestedLevel = urlParams.get("level")
  const requestedCard = Number.parseInt(urlParams.get("card"), 10)
  if (VOCAB_LEVELS.includes(requestedLevel)) activeLevel = requestedLevel

  function cardsForActiveLevel() {
    return cardsForLevel(activeLevel)
  }

  function cardsForLevel(level) {
    const grid = grids.find(item => item.dataset.vocabGrid === level)
    return grid ? Array.from(grid.querySelectorAll("[data-vocab-card]")) : []
  }

  function cardKey(card) {
    return card ? `${card.dataset.level}:${card.dataset.index}` : ""
  }

  function isCardLearned(card) {
    return learnedCards.has(cardKey(card))
  }

  function setCardLearned(card, isLearned) {
    if (!card) return

    const key = cardKey(card)
    if (isLearned) {
      learnedCards.add(key)
    } else {
      learnedCards.delete(key)
    }

    card.classList.toggle("is-learned", isLearned)
    writeLocalStorageJson(VOCAB_LEARNED_CARDS_KEY, Array.from(learnedCards).sort())
    saveLastLearningHref(`/vocabulary?level=${encodeURIComponent(card.dataset.level)}&card=${card.dataset.index}`)
    if (isLearned) {
      recordLearningActivity({
        type: "flashcard",
        level: card.dataset.level,
        href: `/vocabulary?level=${encodeURIComponent(card.dataset.level)}&card=${card.dataset.index}`,
      })
    }
    syncQuizButton(card.dataset.level)
  }

  function syncModalLearnedState() {
    const isLearned = Boolean(selectedCard && isCardLearned(selectedCard))
    inner.classList.toggle("is-learned", isLearned)
    learnedToggleButtons.forEach(button => {
      button.setAttribute("aria-pressed", String(isLearned))
      button.setAttribute(
        "aria-label",
        selectedCard
          ? `${isLearned ? "Unmark" : "Mark"} ${selectedCard.dataset.word} as learned`
          : "Mark word as learned"
      )
    })
  }

  function toggleLearnedCard(card) {
    if (!card) return

    setCardLearned(card, !isCardLearned(card))
    if (card === selectedCard) syncModalLearnedState()
  }

  function syncQuizButton(level) {
    const cards = cardsForLevel(level)
    const allLearned = cards.length > 0 && cards.every(card => isCardLearned(card))
    const button = root.querySelector(`[data-vocabulary-quiz-button="${level}"]`)
    const cta = root.querySelector(`[data-vocabulary-quiz-cta="${level}"]`)
    const message = cta && cta.querySelector("[data-quiz-unlock-message]")

    if (!button || !message) return

    button.disabled = !allLearned
    button.setAttribute("aria-disabled", String(!allLearned))
    button.classList.toggle("is-locked", !allLearned)
    button.classList.toggle("is-unlocked", allLearned)
    message.hidden = allLearned
  }

  function syncAllQuizButtons() {
    grids.forEach(grid => syncQuizButton(grid.dataset.vocabGrid))
  }

  function updateLevelExamScore(level, score, options = {}) {
    const scoreBar = levelExamScores.find(item => item.dataset.levelExamScore === level)
    if (!scoreBar) return

    examScoresByLevel.set(level, score)
    scoreBar.dataset.examCompleted = "true"
    scoreBar.textContent = `%${score * 10}`
    scoreBar.classList.toggle("is-zero", score === 0)
    scoreBar.classList.toggle("has-score", score > 0)

    if (options.persist !== false) {
      writeLocalStorageJson(VOCAB_EXAM_SCORES_KEY, Object.fromEntries(examScoresByLevel))
      recordLearningActivity({
        type: "vocabulary_quiz",
        level,
        score,
        completed: true,
        href: `/vocabulary?level=${encodeURIComponent(level)}`,
      })
    }
  }

  function restoreVocabularyProgress() {
    const savedLearned = readLocalStorageJson(VOCAB_LEARNED_CARDS_KEY)
    const savedScores = readLocalStorageJson(VOCAB_EXAM_SCORES_KEY)

    if (Array.isArray(savedLearned)) {
      savedLearned.forEach(key => learnedCards.add(key))
    }

    root.querySelectorAll("[data-vocab-card]").forEach(card => {
      card.classList.toggle("is-learned", isCardLearned(card))
    })

    if (savedScores && typeof savedScores === "object") {
      Object.entries(savedScores).forEach(([level, score]) => {
        const normalizedScore = Number.parseInt(score, 10)
        if (VOCAB_LEVELS.includes(level) && Number.isFinite(normalizedScore)) {
          updateLevelExamScore(level, Math.max(0, Math.min(10, normalizedScore)), {persist: false})
        }
      })
    }
  }

  function setText(target, value) {
    if (target) target.textContent = value || ""
  }

  function renderExample(sentence, boldWord) {
    if (!exampleTarget) return

    exampleTarget.replaceChildren()

    if (!sentence) return

    const needle = (boldWord || "").trim()
    if (!needle) {
      exampleTarget.textContent = sentence
      return
    }

    const start = sentence.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase())
    if (start === -1) {
      exampleTarget.textContent = sentence
      return
    }

    const before = sentence.slice(0, start)
    const match = sentence.slice(start, start + needle.length)
    const after = sentence.slice(start + needle.length)
    const strong = document.createElement("strong")
    strong.textContent = match

    exampleTarget.append(document.createTextNode(before), strong, document.createTextNode(after))
  }

  function fitFlashcardWord() {
    if (!wordTarget) return

    requestAnimationFrame(() => {
      if (!wordTarget.clientWidth) return

      let size = 48
      wordTarget.style.fontSize = `${size}px`

      while (wordTarget.scrollWidth > wordTarget.clientWidth && size > 26) {
        size -= 2
        wordTarget.style.fontSize = `${size}px`
      }
    })
  }

  function updateNavState(total) {
    setText(counterTarget, `${activeIndex + 1}/${total}`)
    prevButton.disabled = activeIndex === 0
    nextButton.disabled = activeIndex === total - 1
  }

  function clearSelectedCard() {
    if (selectedCard) selectedCard.dataset.selected = "false"
  }

  function showCard(card) {
    const total = cardsForActiveLevel().length
    clearSelectedCard()
    selectedCard = card
    selectedCard.dataset.selected = "true"
    activeIndex = Number.parseInt(card.dataset.index, 10)

    setText(levelTarget, card.dataset.level)
    setText(wordTarget, card.dataset.word)
    setText(pronunciationTarget, card.dataset.pronunciation)
    setText(typeTarget, card.dataset.type)
    setText(definitionTarget, card.dataset.definition)
    setText(arabicTarget, card.dataset.arabic)
    renderExample(card.dataset.example, card.dataset.boldWord)
    updateNavState(total)
    syncModalLearnedState()
    inner.classList.remove("is-flipped")
    fitFlashcardWord()
  }

  function openCard(card) {
    showCard(card)
    saveLastLearningHref(`/vocabulary?level=${encodeURIComponent(card.dataset.level)}&card=${card.dataset.index}`)
    overlay.hidden = false
    overlay.setAttribute("aria-hidden", "false")
    document.body.classList.add("flashcard-modal-open")
    fitFlashcardWord()
  }

  function closeCard() {
    overlay.hidden = true
    overlay.setAttribute("aria-hidden", "true")
    document.body.classList.remove("flashcard-modal-open")
    inner.classList.remove("is-flipped")
    inner.classList.remove("is-learned")
    clearSelectedCard()
    selectedCard = null
    syncModalLearnedState()
  }

  function switchLevel(level, options = {}) {
    closeCard()
    activeLevel = level
    activeIndex = 0
    saveLastLearningHref(`/vocabulary?level=${encodeURIComponent(level)}`, {
      preserveCompleted: options.preserveCompletedActivity === true,
    })

    levelTabs.forEach(tab => {
      const isActive = tab.dataset.vocabLevelTab === level
      tab.dataset.active = String(isActive)
      tab.setAttribute("aria-pressed", String(isActive))
    })

    grids.forEach(grid => {
      grid.hidden = grid.dataset.vocabGrid !== level
    })

    syncQuizButton(level)
  }

  function moveCard(direction) {
    const cards = cardsForActiveLevel()
    const nextIndex = activeIndex + direction

    if (nextIndex < 0 || nextIndex >= cards.length) return

    showCard(cards[nextIndex])
    if (selectedCard) {
      saveLastLearningHref(
        `/vocabulary?level=${encodeURIComponent(selectedCard.dataset.level)}&card=${selectedCard.dataset.index}`
      )
    }
  }

  function speakWord(word) {
    if (!("speechSynthesis" in window) || !word) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = "en-GB"

    window.speechSynthesis.speak(utterance)
  }

  function normalizeDefinition(definition) {
    return (definition || "").replace(/\.$/, "").trim()
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  function blankExample(card) {
    const example = card.dataset.example || ""
    const target = card.dataset.boldWord || card.dataset.word || ""

    if (!example || !target) return example

    const expression = new RegExp(`\\b${escapeRegExp(target)}\\b`, "i")
    if (expression.test(example)) return example.replace(expression, "_____")

    return example
  }

  function buildOptions(cards, correctValue, valueForCard, index) {
    const distractors = cards
      .map(valueForCard)
      .filter(value => value !== correctValue)
    const chosen = []
    let offset = index + 1

    while (chosen.length < 3 && chosen.length < distractors.length) {
      const value = distractors[offset % distractors.length]
      if (!chosen.includes(value)) chosen.push(value)
      offset += 2
    }

    const slot = [1, 3, 0, 2][index % 4]
    const values = [...chosen]
    values.splice(slot, 0, correctValue)

    return values.map((value, optionIndex) => ({
      label: answerLabels[optionIndex],
      text: value,
      correct: value === correctValue,
    }))
  }

  function buildQuestion(card, cards, index) {
    const word = card.dataset.word
    const definition = card.dataset.definition
    const arabic = card.dataset.arabic
    const example = blankExample(card)

    if (index % 5 === 2) {
      return {
        prompt: `What does "${word}" mean?`,
        options: buildOptions(cards, definition, item => item.dataset.definition, index),
      }
    }

    if (index % 5 === 1) {
      return {
        prompt: `Choose the correct word:\n"${example}"`,
        options: buildOptions(cards, word, item => item.dataset.word, index),
      }
    }

    if (index % 5 === 3) {
      return {
        prompt: `Which word matches this Arabic meaning?\n"${arabic}"`,
        options: buildOptions(cards, word, item => item.dataset.word, index),
      }
    }

    if (index % 5 === 4) {
      return {
        prompt: `Which word best completes the sentence?\n"${example}"`,
        options: buildOptions(cards, word, item => item.dataset.word, index),
      }
    }

    return {
      prompt: `Which word means "${normalizeDefinition(definition)}"?`,
      options: buildOptions(cards, word, item => item.dataset.word, index),
    }
  }

  function renderQuizQuestion(question, index) {
    const article = document.createElement("article")
    article.className = "quiz-question-card"
    article.dataset.quizQuestionIndex = String(index)

    const prompt = document.createElement("h3")
    prompt.className = "quiz-question-text"
    prompt.textContent = question.prompt

    const divider = document.createElement("div")
    divider.className = "quiz-question-divider"
    divider.setAttribute("aria-hidden", "true")

    const answers = document.createElement("div")
    answers.className = "quiz-answer-list"

    question.options.forEach((option, optionIndex) => {
      const answer = document.createElement("button")
      answer.type = "button"
      answer.className = "quiz-answer"
      answer.dataset.quizAnswerIndex = String(optionIndex)

      const letter = document.createElement("span")
      letter.className = "quiz-letter"
      letter.textContent = option.label

      const text = document.createElement("span")
      text.className = "quiz-answer-text"
      text.textContent = option.text

      answer.append(letter, text)
      answer.addEventListener("click", () => selectQuizAnswer(index, optionIndex))
      answers.append(answer)
    })

    const counter = document.createElement("div")
    counter.className = "quiz-question-counter"
    counter.textContent = `${index + 1}/10`

    article.append(prompt, divider, answers, counter)
    return article
  }

  function selectQuizAnswer(questionIndex, answerIndex) {
    if (!activeQuiz) return

    activeQuiz.answers[questionIndex] = answerIndex
    quizRequiredMessage.hidden = true

    const card = quizQuestionList.querySelector(`[data-quiz-question-index="${questionIndex}"]`)
    if (!card) return

    card.classList.remove("is-unanswered")
    card.querySelectorAll("[data-quiz-answer-index]").forEach(button => {
      button.classList.toggle(
        "is-selected",
        Number.parseInt(button.dataset.quizAnswerIndex, 10) === answerIndex
      )
    })
  }

  function showVocabularyView() {
    vocabHeader.hidden = false
    vocabGridRegion.hidden = false
    quizScreen.hidden = true
    activeQuiz = null
    quizResult.hidden = true
    quizRequiredMessage.hidden = true
  }

  function openQuiz(level) {
    const cards = cardsForLevel(level)
    if (cards.length !== 10 || !cards.every(card => isCardLearned(card))) return

    activeQuiz = {
      level,
      questions: cards.map((card, index) => buildQuestion(card, cards, index)),
      answers: Array(cards.length).fill(null),
    }

    quizTitle.textContent = `${level} Quiz`
    quizResult.hidden = true
    quizRequiredMessage.hidden = true
    quizQuestionList.replaceChildren(
      ...activeQuiz.questions.map((question, index) => renderQuizQuestion(question, index))
    )

    vocabHeader.hidden = true
    vocabGridRegion.hidden = true
    quizScreen.hidden = false
    window.scrollTo({top: 0, behavior: "smooth"})
  }

  function submitQuiz() {
    if (!activeQuiz) return

    const unanswered = activeQuiz.answers
      .map((answer, index) => (answer === null ? index : null))
      .filter(index => index !== null)

    quizQuestionList.querySelectorAll("[data-quiz-question-index]").forEach(card => {
      const index = Number.parseInt(card.dataset.quizQuestionIndex, 10)
      card.classList.toggle("is-unanswered", unanswered.includes(index))
    })

    if (unanswered.length > 0) {
      quizRequiredMessage.hidden = false
      const firstUnanswered = quizQuestionList.querySelector(
        `[data-quiz-question-index="${unanswered[0]}"]`
      )
      if (firstUnanswered) firstUnanswered.scrollIntoView({behavior: "smooth", block: "center"})
      return
    }

    const score = activeQuiz.questions.reduce((total, question, index) => {
      const selected = activeQuiz.answers[index]
      return question.options[selected].correct ? total + 1 : total
    }, 0)
    const completedLevel = activeQuiz.level

    quizRequiredMessage.hidden = true
    updateLevelExamScore(completedLevel, score)
    showVocabularyView()
    switchLevel(completedLevel, {preserveCompletedActivity: true})
    window.scrollTo({top: 0, behavior: "smooth"})
  }

  levelTabs.forEach(tab => {
    tab.addEventListener("click", () => switchLevel(tab.dataset.vocabLevelTab))
  })

  quizButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return

      openQuiz(button.dataset.vocabularyQuizButton)
    })
  })

  quizBackButton.addEventListener("click", showVocabularyView)
  quizSubmitButton.addEventListener("click", submitQuiz)

  root.querySelectorAll("[data-vocab-card]").forEach(card => {
    card.addEventListener("click", () => openCard(card))
    card.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return

      event.preventDefault()
      openCard(card)
    })
  })

  root.querySelectorAll("[data-flashcard-rotate]").forEach(button => {
    button.addEventListener("click", () => inner.classList.toggle("is-flipped"))
  })

  learnedToggleButtons.forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault()
      event.stopPropagation()
      toggleLearnedCard(selectedCard)
    })
  })

  prevButton.addEventListener("click", () => moveCard(-1))
  nextButton.addEventListener("click", () => moveCard(1))
  closeButton.addEventListener("click", closeCard)
  speakButton.addEventListener("click", () => speakWord(selectedCard && selectedCard.dataset.word))

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeCard()
  })

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.hidden) closeCard()
  })

  restoreVocabularyProgress()
  switchLevel(activeLevel)
  syncAllQuizButtons()

  if (Number.isFinite(requestedCard)) {
    const cards = cardsForActiveLevel()
    const card = cards[Math.max(0, Math.min(cards.length - 1, requestedCard))]
    if (card) window.setTimeout(() => openCard(card), 0)
  }
}

initStartupSplash()
initMainDashboard()
initSkillSetupPages()
initContactGate()
initTransitionLoadingLinks()
window.addEventListener("DOMContentLoaded", initStartupSplash)
window.addEventListener("DOMContentLoaded", initMainDashboard)
window.addEventListener("DOMContentLoaded", initSkillSetupPages)
window.addEventListener("DOMContentLoaded", initContactGate)
window.addEventListener("DOMContentLoaded", initTransitionLoadingLinks)
window.addEventListener("DOMContentLoaded", initVocabularyFlashcards)
window.addEventListener("phx:page-loading-stop", initMainDashboard)
window.addEventListener("phx:page-loading-stop", initSkillSetupPages)
window.addEventListener("phx:page-loading-stop", initContactGate)
window.addEventListener("phx:page-loading-stop", initTransitionLoadingLinks)
window.addEventListener("phx:page-loading-stop", initVocabularyFlashcards)
window.addEventListener("ielts:progress-updated", initMainDashboard)
window.addEventListener("pageshow", initMainDashboard)
window.addEventListener("focus", initMainDashboard)

// The lines below enable quality of life phoenix_live_reload
// development features:
//
//     1. stream server logs to the browser console
//     2. click on elements to jump to their definitions in your code editor
//
if (process.env.NODE_ENV === "development") {
  window.addEventListener("phx:live_reload:attached", ({detail: reloader}) => {
    // Enable server log streaming to client.
    // Disable with reloader.disableServerLogs()
    reloader.enableServerLogs()

    // Open configured PLUG_EDITOR at file:line of the clicked element's HEEx component
    //
    //   * click with "c" key pressed to open at caller location
    //   * click with "d" key pressed to open at function component definition location
    let keyDown
    window.addEventListener("keydown", e => keyDown = e.key)
    window.addEventListener("keyup", _e => keyDown = null)
    window.addEventListener("click", e => {
      if(keyDown === "c"){
        e.preventDefault()
        e.stopImmediatePropagation()
        reloader.openEditorAtCaller(e.target)
      } else if(keyDown === "d"){
        e.preventDefault()
        e.stopImmediatePropagation()
        reloader.openEditorAtDef(e.target)
      }
    }, true)

    window.liveReloader = reloader
  })
}
