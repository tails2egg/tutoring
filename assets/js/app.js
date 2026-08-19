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

  function updateLevelExamScore(level, score) {
    const scoreBar = levelExamScores.find(item => item.dataset.levelExamScore === level)
    if (!scoreBar) return

    examScoresByLevel.set(level, score)
    scoreBar.dataset.examCompleted = "true"
    scoreBar.textContent = `%${score * 10}`
    scoreBar.classList.toggle("is-zero", score === 0)
    scoreBar.classList.toggle("has-score", score > 0)
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

  function switchLevel(level) {
    closeCard()
    activeLevel = level
    activeIndex = 0

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
    switchLevel(completedLevel)
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

  syncAllQuizButtons()
}

window.addEventListener("DOMContentLoaded", initVocabularyFlashcards)
window.addEventListener("phx:page-loading-stop", initVocabularyFlashcards)

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
