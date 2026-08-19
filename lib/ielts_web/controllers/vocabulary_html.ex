defmodule IeltsWeb.VocabularyHTML do
  use IeltsWeb, :html

  embed_templates "vocabulary_html/*"

  attr :active_level, :string, default: "A2"

  def vocabulary_guide_banner(assigns) do
    ~H"""
    <div
      id="vocabulary-guide-banner"
      class="vocabulary-guide-banner"
      data-vocab-guide-banner="true"
    >
      <button
        id="vocabulary-guide-back"
        type="button"
        class="vocabulary-guide-back"
        onclick="history.back()"
        aria-label="Go back"
      >
        <.icon name="hero-chevron-left" class="vocabulary-guide-back-icon" />
      </button>
      <img
        src={~p"/guy1.png"}
        class="vocabulary-guide-guy"
        alt=""
        aria-hidden="true"
      />
      <div class="vocabulary-guide-content">
        <p class="vocabulary-guide-text">
          • تتضمن كل بطاقة الكلمة، تعريفها، جملة مثال،<br /> والنطق الصوتي لتسهيل التعلم.
        </p>
        <p class="vocabulary-guide-text">
          • في نهاية كل مستوى، ستخوض اختباراً سريعاً<br /> لاختبار فهمك وتعزيز معرفتك.
        </p>
        <p class="vocabulary-guide-grammar">صفة = ADJ ، فعل = V</p>
      </div>
    </div>
    """
  end

  attr :item, :map, required: true
  attr :index, :integer, required: true

  def vocabulary_card(assigns) do
    ~H"""
    <div
      id={"vocab-card-#{@item.level}-#{@index + 1}"}
      class="vocab-card vocabulary-card"
      role="button"
      tabindex="0"
      data-vocab-card="true"
      data-index={@index}
      data-level={@item.level}
      data-word={@item.word}
      data-type={@item.type}
      data-pronunciation={@item.pronunciation}
      data-definition={@item.definition}
      data-arabic={@item.arabic}
      data-example={@item.example}
      data-bold-word={@item.bold_word}
      aria-label={"Open #{@item.word} flashcard"}
    >
      <img class="vocabulary-card-frame" src={~p"/pic/roundb.png"} alt="" aria-hidden="true" />
      <span class={vocabulary_card_word_classes(@item.word)}>
        {@item.word}
      </span>
    </div>
    """
  end

  defp vocabulary_card_word_classes(word) when byte_size(word) >= 12,
    do: ["vocabulary-card-word", "is-long"]

  defp vocabulary_card_word_classes(word) when byte_size(word) >= 9,
    do: ["vocabulary-card-word", "is-medium"]

  defp vocabulary_card_word_classes(_word), do: ["vocabulary-card-word"]

  attr :level, :string, required: true

  def vocabulary_quiz_button(assigns) do
    ~H"""
    <div class="vocabulary-quiz-cta" data-vocabulary-quiz-cta={@level}>
      <p class="quiz-unlock-message" data-quiz-unlock-message="true">
        لما تفتح كل الكلمات يتفعل زر الاختبار
      </p>
      <button
        type="button"
        class="vocabulary-quiz-button is-locked"
        data-vocabulary-quiz-button={@level}
        disabled
        aria-disabled="true"
      >
        <span class="vocabulary-quiz-level">{@level}</span>
        <span class="vocabulary-quiz-divider" aria-hidden="true"></span>
        <span class="vocabulary-quiz-copy">اختبر فهمك للكلمات من خلال اختبار قصير!</span>
      </button>
    </div>
    """
  end

  def vocabulary_quiz_screen(assigns) do
    ~H"""
    <section
      id="vocabulary-quiz-screen"
      class="vocabulary-quiz-screen"
      data-vocabulary-quiz-screen="true"
      hidden
    >
      <button
        id="vocabulary-quiz-back"
        type="button"
        class="vocabulary-quiz-back"
        data-vocabulary-quiz-back="true"
        aria-label="Back to vocabulary"
      >
        <.icon name="hero-chevron-left" class="vocabulary-quiz-back-icon" />
      </button>

      <header class="vocabulary-quiz-header">
        <h2 data-vocabulary-quiz-title="true">A2 Quiz</h2>
      </header>

      <div class="quiz-result" data-quiz-result="true" hidden></div>
      <div class="quiz-required-message" data-quiz-required-message="true" hidden>
        أجب عن كل الأسئلة قبل التحقق
      </div>

      <div class="quiz-question-list" data-quiz-question-list="true"></div>

      <button type="button" class="quiz-submit-button" data-quiz-submit="true">
        تحقق
      </button>
    </section>
    """
  end

  def flashcard_modal(assigns) do
    ~H"""
    <div
      id="flashcard-overlay"
      class="flashcard-overlay"
      data-flashcard-overlay="true"
      aria-hidden="true"
      hidden
    >
      <div class="flashcard-stage" role="dialog" aria-modal="true" aria-label="Vocabulary flashcard">
        <div class="flashcard-shell">
          <button
            type="button"
            class="flashcard-popup-back"
            data-flashcard-close="true"
            aria-label="Back to vocabulary grid"
          >
            <.icon name="hero-arrow-left" class="flashcard-popup-back-icon" />
          </button>

          <div id="flashcard-inner" class="flashcard-inner" data-flashcard-inner="true">
            <article class="flashcard-face flashcard-front">
              <div class="flashcard-level" data-flashcard-level="true">A2</div>

              <div class="flashcard-main">
                <div class="flashcard-word" data-flashcard-word="true">Travel</div>
                <div class="flashcard-pronunciation-row pronunciation-row">
                  <button
                    type="button"
                    class="flashcard-icon-button flashcard-speak-button"
                    data-flashcard-speak="true"
                    aria-label="Pronounce word"
                  >
                    <.icon name="hero-speaker-wave" class="pronunciation-speaker" />
                  </button>
                  <span class="flashcard-pronunciation" data-flashcard-pronunciation="true">
                    tra.v
                  </span>
                  <img
                    src={~p"/usa.png"}
                    class="pronunciation-flag"
                    alt=""
                    aria-hidden="true"
                  />
                </div>
              </div>

              <button
                type="button"
                class="flashcard-icon-button flashcard-rotate-button flashcard-flip"
                data-flashcard-rotate="true"
                aria-label="Rotate card"
              >
                <img src={~p"/loop.png"} class="flashcard-flip-icon" alt="" />
              </button>
              <button
                type="button"
                class="flashcard-icon-button flashcard-corner-arrow"
                data-flashcard-learned-toggle="true"
                aria-label="Mark word as learned"
                aria-pressed="false"
              >
                <.icon name="hero-arrow-up-left" class="flashcard-corner-icon" />
              </button>
            </article>

            <article class="flashcard-face flashcard-back">
              <div class="flashcard-back-copy">
                <p class="flashcard-definition-line">
                  <span class="flashcard-type" data-flashcard-type="true">V.</span>
                  <span data-flashcard-definition="true">
                    To go from one place to another, usually for pleasure or work.
                  </span>
                </p>

                <div class="flashcard-divider" aria-hidden="true"></div>

                <p class="flashcard-arabic" dir="rtl" data-flashcard-arabic="true">
                  الانتقال من مكان إلى آخر عادةً من أجل المتعة أو العمل.
                </p>

                <div class="flashcard-divider" aria-hidden="true"></div>

                <p class="flashcard-example" data-flashcard-example="true"></p>
              </div>

              <button
                type="button"
                class="flashcard-icon-button flashcard-rotate-button flashcard-flip"
                data-flashcard-rotate="true"
                aria-label="Rotate card"
              >
                <img src={~p"/loop.png"} class="flashcard-flip-icon" alt="" />
              </button>
            </article>
          </div>
        </div>

        <div class="flashcard-nav" aria-label="Flashcard navigation">
          <button
            type="button"
            class="flashcard-nav-button"
            data-flashcard-prev="true"
            aria-label="Previous card"
          >
            <.icon name="hero-arrow-left" class="size-5" />
          </button>
          <span class="flashcard-counter" data-flashcard-counter="true">1/10</span>
          <button
            type="button"
            class="flashcard-nav-button"
            data-flashcard-next="true"
            aria-label="Next card"
          >
            <.icon name="hero-arrow-right" class="size-5" />
          </button>
        </div>
      </div>
    </div>
    """
  end
end
