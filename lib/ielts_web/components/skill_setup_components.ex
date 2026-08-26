defmodule IeltsWeb.SkillSetupComponents do
  @moduledoc false
  use IeltsWeb, :html

  attr :flash, :map, required: true

  def writing_setup_page(assigns) do
    assigns =
      assign(assigns, :skill, %{
        key: "writing",
        name: "Writing",
        icon: "hero-pencil-square-solid",
        color: "#35A7DF",
        soft_color: "#EAF7FD",
        destination: ~p"/activities?skill=writing"
      })

    ~H"""
    <.skill_setup_page flash={@flash} skill={@skill} />
    """
  end

  attr :flash, :map, required: true

  def reading_setup_page(assigns) do
    assigns =
      assign(assigns, :skill, %{
        key: "reading",
        name: "Reading",
        icon: "hero-book-open-solid",
        color: "#79C698",
        soft_color: "#EEF9F2",
        destination: ~p"/activities?skill=reading"
      })

    ~H"""
    <.skill_setup_page flash={@flash} skill={@skill} />
    """
  end

  attr :flash, :map, required: true

  def listening_setup_page(assigns) do
    assigns =
      assign(assigns, :skill, %{
        key: "listening",
        name: "Listening",
        icon: "hero-speaker-wave-solid",
        color: "#647FE8",
        soft_color: "#EEF2FF",
        destination: ~p"/activities?skill=listening"
      })

    ~H"""
    <.skill_setup_page flash={@flash} skill={@skill} />
    """
  end

  attr :flash, :map, required: true

  def speaking_setup_page(assigns) do
    assigns =
      assign(assigns, :skill, %{
        key: "speaking",
        name: "Speaking",
        icon: "hero-chat-bubble-left-right-solid",
        color: "#8E81F2",
        soft_color: "#F3F0FF",
        destination: ~p"/activities?skill=speaking"
      })

    ~H"""
    <.skill_setup_page flash={@flash} skill={@skill} />
    """
  end

  attr :flash, :map, required: true
  attr :skill, :map, required: true

  defp skill_setup_page(assigns) do
    ~H"""
    <Layouts.app flash={@flash} active_tab={:home} hide_chrome={true}>
      <section
        id={"#{@skill.key}-setup-page"}
        class="skill-setup-page"
        style={"--skill-color: #{@skill.color}; --skill-soft: #{@skill.soft_color};"}
        data-skill-setup-root
        data-skill={@skill.key}
        data-continue-destination={@skill.destination}
        aria-labelledby={"#{@skill.key}-setup-title"}
      >
        <div class="skill-setup-shell">
          <header class="skill-setup-header">
            <.link
              id={"#{@skill.key}-setup-back"}
              navigate={~p"/"}
              class="skill-setup-back"
              aria-label="Back to Main"
            >
              <.icon name="hero-arrow-left" class="size-6" />
            </.link>

            <div class="skill-setup-title-block">
              <span class="skill-setup-icon" aria-hidden="true">
                <.icon name={@skill.icon} class="size-7" />
              </span>
              <div>
                <h1 id={"#{@skill.key}-setup-title"}>{@skill.name}</h1>
                <p>Set up your {@skill.name} practice</p>
              </div>
            </div>
          </header>

          <div class="skill-setup-card">
            <section class="skill-setup-section" aria-labelledby={"#{@skill.key}-setup-type-title"}>
              <h2 id={"#{@skill.key}-setup-type-title"}>
                1. Which IELTS type are you preparing for?
              </h2>
              <div class="skill-setup-choice-grid skill-setup-choice-grid-two">
                <.setup_choice skill={@skill} field="type" value="academic" label="Academic" />
                <.setup_choice
                  skill={@skill}
                  field="type"
                  value="general"
                  label="General Training"
                />
              </div>
            </section>

            <section class="skill-setup-section" aria-labelledby={"#{@skill.key}-setup-date-title"}>
              <h2 id={"#{@skill.key}-setup-date-title"}>2. When is your exam?</h2>
              <div class="skill-setup-date-field" data-skill-setup-date-field>
                <.icon name="hero-calendar-days" class="skill-setup-date-icon size-5" />
                <.input
                  id={"#{@skill.key}-exam-date"}
                  name={"#{@skill.key}_exam_date"}
                  type="date"
                  value=""
                  class="skill-setup-date-input"
                  data-skill-setup-date
                  aria-label="Select exam date"
                />
                <span class="skill-setup-check" data-skill-setup-date-check hidden>✓</span>
              </div>

              <button
                id={"#{@skill.key}-no-exam-date"}
                type="button"
                class="skill-setup-option skill-setup-wide-option"
                data-skill-setup-field="noExamDate"
                data-skill-setup-value="true"
                aria-pressed="false"
              >
                <span class="skill-setup-radio" aria-hidden="true"></span>
                <span>I haven't booked it yet</span>
                <span class="skill-setup-check" aria-hidden="true">✓</span>
              </button>
            </section>

            <section class="skill-setup-section" aria-labelledby={"#{@skill.key}-setup-band-title"}>
              <h2 id={"#{@skill.key}-setup-band-title"}>
                3. What's your target {@skill.name} band?
              </h2>
              <div class="skill-setup-choice-grid skill-setup-band-grid">
                <.setup_choice
                  :for={band <- bands()}
                  skill={@skill}
                  field="targetBand"
                  value={band}
                  label={band}
                />
              </div>
            </section>

            <section class="skill-setup-section" aria-labelledby={"#{@skill.key}-setup-time-title"}>
              <h2 id={"#{@skill.key}-setup-time-title"}>
                4. How much time can you study {@skill.name} each day?
              </h2>
              <div class="skill-setup-choice-grid skill-setup-time-grid">
                <.setup_choice skill={@skill} field="dailyStudyMinutes" value="30" label="30 min" />
                <.setup_choice skill={@skill} field="dailyStudyMinutes" value="60" label="1 hour" />
                <.setup_choice skill={@skill} field="dailyStudyMinutes" value="90" label="1.5 hr" />
                <.setup_choice skill={@skill} field="dailyStudyMinutes" value="120" label="2+ hrs" />
              </div>
            </section>

            <button
              id={"#{@skill.key}-setup-continue"}
              type="button"
              class="skill-setup-continue"
              data-skill-setup-continue
              disabled
              aria-disabled="true"
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    </Layouts.app>
    """
  end

  attr :skill, :map, required: true
  attr :field, :string, required: true
  attr :value, :string, required: true
  attr :label, :string, required: true

  defp setup_choice(assigns) do
    ~H"""
    <button
      id={"#{@skill.key}-#{@field}-#{dom_value(@value)}"}
      type="button"
      class="skill-setup-option"
      data-skill-setup-field={@field}
      data-skill-setup-value={@value}
      aria-pressed="false"
    >
      <span>{@label}</span>
      <span class="skill-setup-check" aria-hidden="true">✓</span>
    </button>
    """
  end

  defp bands, do: ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5+"]

  defp dom_value(value) do
    value
    |> String.replace(".", "-")
    |> String.replace("+", "plus")
  end
end
