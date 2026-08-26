defmodule IeltsWeb.PageLive do
  @moduledoc """
  The one page behind every tab: the app shell with an empty page area.

  Each tab of the bottom bar is a route into this LiveView, so the shell is
  navigable while the screens themselves are still to be built.
  """
  use IeltsWeb, :live_view

  @titles %{
    home: "Home",
    activities: "Activities",
    payment: "Payment",
    progress: "Progress",
    privacy_policy: "Privacy Policy"
  }

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:page_title, @titles[socket.assigns.live_action])
     |> assign(:dashboard, dashboard_data())}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash} active_tab={@live_action}>
      <%= if @live_action == :home do %>
        <section
          id="home-task-panel"
          class="main-page"
          data-main-dashboard
        >
          <div id="main-dashboard-content" class="main-dashboard">
            <section id="main-hero" class="main-hero" aria-labelledby="main-user-greeting">
              <div class="main-hero-main">
                <img class="main-hero-mascot" src={~p"/guy1.png"} alt="" draggable="false" />
                <div class="main-hero-text">
                  <h1 id="main-user-greeting" data-main-user-greeting>Hello! 👋</h1>
                  <p>
                    Keep learning, keep improving.<br />You're closer to your target!
                  </p>
                </div>
              </div>

              <div class="main-band-stack" aria-label="Current IELTS band and goal">
                <article id="main-current-band-card" class="main-band-card">
                  <span>Current Band</span>
                  <strong>
                    <span data-current-band>{@dashboard.current_band}</span>
                    <small>/ 9</small>
                  </strong>
                </article>

                <button
                  id="main-goal-band-card"
                  type="button"
                  class="main-band-card main-band-card-goal"
                  data-goal-band-action="true"
                  aria-label="Set IELTS band goal"
                >
                  <span>Band Goal</span>
                  <strong>
                    <span data-goal-band>{@dashboard.goal_band}</span>
                    <small>/ 9</small>
                  </strong>
                </button>
              </div>
            </section>

            <section id="main-streak-card" class="main-card main-streak-card">
              <div class="streak-summary">
                <span class="streak-medal" aria-hidden="true">🔥</span>
                <div>
                  <p>
                    <strong data-streak-count>{@dashboard.streak.count}</strong>
                    <span>Day Streak</span>
                  </p>
                  <small data-streak-message>Start your streak today!</small>
                </div>
              </div>

              <div class="streak-week" aria-label="Weekly learning streak">
                <div
                  :for={day <- @dashboard.streak.days}
                  class={[
                    "streak-day",
                    day.active? && "is-active",
                    day.current? && "is-current"
                  ]}
                  data-streak-day={day.key}
                  data-active={to_string(day.active?)}
                  data-current={to_string(day.current?)}
                >
                  <span>{if day.fire?, do: "🔥", else: "✓"}</span>
                  <small>{day.label}</small>
                </div>
              </div>
            </section>

            <section id="main-progress-card" class="main-card main-progress-card">
              <header class="progress-header">
                <h2>Progress</h2>
                <strong data-progress-label>{@dashboard.progress}%</strong>
              </header>

              <div
                class="progress-track"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={@dashboard.progress}
                data-progress-bar
              >
                <span style={"width: #{@dashboard.progress}%"} data-progress-fill></span>
              </div>

              <p class="progress-note" data-progress-message>Let's get started!</p>
            </section>

            <.link
              id="continue-learning-button"
              href={~p"/vocabulary"}
              data-contact-gated="true"
              data-transition-loading-link="true"
              data-continue-learning="true"
              data-default-href={~p"/vocabulary"}
              data-next-href={~p"/activities"}
              data-review-href={~p"/progress"}
              class="continue-learning-button"
            >
              <span class="continue-learning-icon">
                <.icon name="hero-rocket-launch-solid" class="size-8" />
              </span>
              <span data-continue-learning-label>Start Learning</span>
              <span class="continue-learning-arrow">
                <.icon name="hero-arrow-right" class="size-7" />
              </span>
            </.link>

            <section id="main-overall-band-card" class="main-card overall-card">
              <h2 class="overall-section-title">Your Progress</h2>

              <div class="overall-summary">
                <div class="overall-score-block">
                  <div
                    class="overall-ring"
                    aria-label={"#{@dashboard.current_band} out of 9 overall band"}
                  >
                    <div class="overall-ring-inner">
                      <strong data-overall-band>{@dashboard.current_band}/9</strong>
                      <span>Overall Band</span>
                    </div>
                  </div>
                </div>

                <div class="overall-message">
                  <strong data-overall-message-title>Ready to start?</strong>
                  <span data-overall-message>Complete an activity to see your progress.</span>
                </div>
              </div>

              <div class="skill-grid" aria-label="IELTS skill results">
                <.link
                  :for={skill <- @dashboard.skills}
                  id={"main-skill-#{skill.key}"}
                  navigate={skill.path}
                  data-contact-gated="true"
                  data-contact-action="skill_setup"
                  data-contact-skill={skill.key}
                  data-main-skill={skill.key}
                  class="skill-card"
                  style={"--skill-color: #{skill.color}; --skill-soft: #{skill.soft_color};"}
                >
                  <span class="skill-card-header">
                    <span class="skill-icon">
                      <.icon name={skill.icon} class="size-5" />
                    </span>
                    <strong>{skill.name}</strong>
                  </span>
                  <span class="skill-card-body">
                    <span class="skill-metric">
                      <small>Current</small>
                      <strong class="skill-score" data-skill-score={skill.key}>{skill.score}</strong>
                    </span>
                    <span class="skill-metric">
                      <small>Goal</small>
                      <strong class="skill-goal" data-skill-goal={skill.key}>—</strong>
                    </span>
                  </span>
                  <span class="skill-card-bottom">
                    <small data-skill-message={skill.key}>{skill.message}</small>
                    <span class="skill-arrow">
                      <.icon name="hero-arrow-right" class="size-4" />
                    </span>
                  </span>
                </.link>
              </div>
            </section>

            <button
              id="personalize-study-plan-button"
              type="button"
              class="study-plan-button"
              data-contact-gated="true"
              data-study-plan-action="true"
              aria-label="Personalize your study plan"
            >
              <span class="study-plan-icon">
                <.icon name="hero-cursor-arrow-rays-solid" class="size-9" />
              </span>
              <span class="study-plan-copy">
                <strong>Personalize Your Study Plan</strong>
                <small>Get a smart plan tailored to your goals</small>
              </span>
              <span class="study-plan-arrow">
                <.icon name="hero-chevron-right" class="size-7" />
              </span>
            </button>

            <.link
              id="flashcards-task-button"
              href={~p"/vocabulary"}
              data-contact-gated="true"
              data-transition-loading-link="true"
              class="sr-only"
            >
              Flashcards
            </.link>
          </div>

          <div class="study-plan-status" data-study-plan-status hidden aria-live="polite"></div>

          <div
            id="ielts-contact-modal"
            class="contact-modal"
            data-contact-modal
            role="dialog"
            aria-modal="true"
            aria-labelledby="ielts-contact-title"
            aria-describedby="ielts-contact-description"
            aria-hidden="true"
            hidden
          >
            <div class="contact-modal-backdrop" aria-hidden="true"></div>
            <div class="contact-modal-scroll">
              <section class="contact-modal-panel" dir="rtl">
                <button
                  id="contact-modal-close"
                  class="contact-close-button"
                  type="button"
                  aria-label="إغلاق"
                  data-contact-close
                >
                  <.icon name="hero-x-mark" class="size-9" />
                </button>

                <div class="contact-flow" data-contact-flow>
                  <div class="contact-step contact-step-active" data-contact-step="contact">
                    <div class="contact-copy">
                      <h2 id="ielts-contact-title">أدخل رقم هاتفك وبريدك الإلكتروني</h2>
                      <p id="ielts-contact-description">
                        أدخل رقم هاتفك وبريدك الإلكتروني لإنشاء حساب جديد أو تسجيل الدخول إلى حسابك.
                      </p>
                    </div>

                    <form id="ielts-contact-form" class="contact-form" data-contact-form novalidate>
                      <div class="contact-phone-row">
                        <div class="contact-country-picker" data-contact-country-picker>
                          <button
                            id="contact-country-button"
                            class="contact-country-button"
                            type="button"
                            aria-haspopup="listbox"
                            aria-expanded="false"
                            data-contact-country-button
                          >
                            <span class="contact-country-flag" data-contact-country-flag>🇸🇦</span>
                            <span class="contact-country-code" data-contact-country-code>+966</span>
                            <.icon name="hero-chevron-down-mini" class="size-5" />
                          </button>

                          <div class="contact-country-menu" data-contact-country-menu hidden>
                            <input
                              id="contact-country-search"
                              class="contact-country-search"
                              type="search"
                              placeholder="Search country..."
                              autocomplete="off"
                              data-contact-country-search
                            />
                            <div
                              id="contact-country-list"
                              class="contact-country-list"
                              role="listbox"
                              aria-label="Country"
                              data-contact-country-list
                            >
                            </div>
                          </div>
                        </div>

                        <input
                          id="contact-phone-input"
                          class="contact-text-input contact-phone-input"
                          type="tel"
                          inputmode="tel"
                          autocomplete="tel-national"
                          placeholder="05XXXXXXXX"
                          required
                          data-contact-phone
                        />
                      </div>
                      <p
                        id="contact-phone-error"
                        class="contact-error"
                        data-contact-phone-error
                        hidden
                      >
                        يرجى إدخال رقم هاتف صحيح
                      </p>

                      <input
                        id="contact-email-input"
                        class="contact-text-input contact-email-input"
                        type="email"
                        inputmode="email"
                        autocomplete="email"
                        placeholder="example@gmail.com"
                        pattern="[^\s@]+@gmail\.com"
                        title="Use a Gmail address ending in @gmail.com"
                        required
                        data-contact-email
                      />
                      <p
                        id="contact-email-error"
                        class="contact-error"
                        data-contact-email-error
                        hidden
                      >
                        يرجى إدخال بريد Gmail ينتهي بـ @gmail.com
                      </p>

                      <p
                        id="contact-send-error"
                        class="contact-status contact-status-error"
                        data-contact-send-error
                        hidden
                      >
                        <.icon name="hero-x-mark-mini" class="size-4" />
                        <span>تعذر إرسال رمز التحقق، حاول مرة أخرى</span>
                      </p>

                      <button
                        id="contact-submit-button"
                        class="contact-submit-button"
                        type="submit"
                        disabled
                        data-contact-submit
                      >
                        <.icon name="hero-arrow-left" class="size-8" />
                        <span>متابعة</span>
                      </button>
                    </form>
                  </div>

                  <div class="contact-step contact-verification-step" data-contact-step="otp" hidden>
                    <div class="contact-copy contact-verification-copy">
                      <h2 id="ielts-phone-verification-title">تحقق من رقم الهاتف</h2>
                      <p>
                        <span>لقد قمنا بإرسال رمز التحقق إلى هاتفك</span>
                        <span class="contact-otp-phone" data-contact-otp-phone></span>
                      </p>
                    </div>

                    <form
                      id="ielts-otp-form"
                      class="contact-otp-form"
                      data-contact-otp-form
                      novalidate
                    >
                      <div
                        id="contact-otp-inputs"
                        class="contact-otp-inputs"
                        role="group"
                        aria-label="رمز التحقق"
                        data-contact-otp-inputs
                      >
                        <input
                          :for={index <- 0..5}
                          id={"contact-otp-digit-#{index + 1}"}
                          class="contact-otp-input"
                          type="text"
                          inputmode="numeric"
                          autocomplete="one-time-code"
                          pattern="[0-9]*"
                          maxlength="1"
                          aria-label={"OTP digit #{index + 1}"}
                          data-contact-otp-input
                          data-otp-index={index}
                        />
                      </div>

                      <p
                        id="contact-otp-test-code"
                        class="contact-otp-test-code"
                        data-contact-otp-test-code
                        hidden
                      >
                        <span>رمز التحقق:</span>
                        <strong data-contact-otp-test-code-value></strong>
                      </p>

                      <p class="contact-otp-loading" data-contact-otp-loading hidden>
                        جار التحقق...
                      </p>

                      <p
                        id="contact-otp-status"
                        class="contact-status"
                        data-contact-otp-status
                        hidden
                      >
                        <span data-contact-status-error-icon>
                          <.icon name="hero-x-mark-mini" class="size-4" />
                        </span>
                        <span data-contact-status-success-icon hidden>
                          <.icon name="hero-check-mini" class="size-4" />
                        </span>
                        <span data-contact-otp-status-text></span>
                      </p>

                      <p class="contact-otp-countdown" data-contact-resend-wait>
                        <span>سيتم إرسال كود جديد خلال</span>
                        <span class="contact-countdown-value" data-contact-countdown>00:30</span>
                      </p>

                      <button
                        id="contact-resend-button"
                        class="contact-resend-button"
                        type="button"
                        data-contact-resend
                        hidden
                      >
                        إعادة إرسال الرمز
                      </button>

                      <label
                        id="contact-privacy-row"
                        class="contact-privacy-row"
                        data-contact-privacy-row
                        hidden
                      >
                        <input
                          id="privacy-consent"
                          class="contact-privacy-checkbox"
                          type="checkbox"
                          data-contact-privacy
                        />
                        <span>
                          مع الاستمرار أنت توافق على
                          <a href="/privacy-policy" target="_blank" rel="noopener">
                            سياسة الخصوصية
                          </a>
                        </span>
                      </label>

                      <button
                        id="contact-verification-submit-button"
                        class="contact-submit-button"
                        type="submit"
                        disabled
                        data-contact-verified-submit
                      >
                        <.icon name="hero-arrow-left" class="size-8" />
                        <span>متابعة</span>
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      <% end %>

      <%= if @live_action == :privacy_policy do %>
        <section
          id="privacy-policy-page"
          dir="rtl"
          class="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-xl flex-col justify-start px-5 py-8 text-right"
        >
          <h1 class="text-xl font-bold text-slate-900">سياسة الخصوصية</h1>
          <p class="mt-4 text-sm font-medium leading-7 text-slate-700">
            نستخدم بيانات التواصل التي تقدمها للتحقق من رقم الهاتف وإكمال الوصول إلى ميزات التطبيق.
          </p>
        </section>
      <% end %>
    </Layouts.app>
    """
  end

  defp dashboard_data do
    %{
      current_band: "—",
      goal_band: "Set goal",
      progress: 0,
      streak: %{
        count: 0,
        days: [
          %{key: "mon", label: "M", active?: false, current?: false, fire?: false},
          %{key: "tue", label: "T", active?: false, current?: false, fire?: false},
          %{key: "wed", label: "W", active?: false, current?: false, fire?: false},
          %{key: "thu", label: "T", active?: false, current?: false, fire?: false},
          %{key: "fri", label: "F", active?: false, current?: false, fire?: false},
          %{key: "sat", label: "S", active?: false, current?: false, fire?: false},
          %{key: "sun", label: "S", active?: false, current?: false, fire?: false}
        ]
      },
      skills: [
        %{
          key: "writing",
          name: "Writing",
          score: "—",
          message: "No result yet",
          color: "#35A7DF",
          soft_color: "#E8F7FD",
          icon: "hero-pencil-square-solid",
          path: ~p"/writing/setup"
        },
        %{
          key: "reading",
          name: "Reading",
          score: "—",
          message: "No result yet",
          color: "#79C698",
          soft_color: "#EEF9F2",
          icon: "hero-book-open-solid",
          path: ~p"/reading/setup"
        },
        %{
          key: "listening",
          name: "Listening",
          score: "—",
          message: "No result yet",
          color: "#647FE8",
          soft_color: "#EEF2FF",
          icon: "hero-speaker-wave-solid",
          path: ~p"/listening/setup"
        },
        %{
          key: "speaking",
          name: "Speaking",
          score: "—",
          message: "No result yet",
          color: "#8E81F2",
          soft_color: "#F3F0FF",
          icon: "hero-chat-bubble-left-right-solid",
          path: ~p"/speaking/setup"
        }
      ]
    }
  end
end
