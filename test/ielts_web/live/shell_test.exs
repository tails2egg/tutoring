defmodule IeltsWeb.ShellTest do
  use IeltsWeb.ConnCase, async: true

  import Phoenix.LiveViewTest

  defp tabs do
    [
      {~p"/", "Home"},
      {~p"/activities", "Practice"},
      {~p"/vocabulary", "Courses"},
      {~p"/progress", "Mock Tests"},
      {~p"/payment", "Profile"}
    ]
  end

  defp live_tabs do
    [
      {~p"/", "Home"},
      {~p"/activities", "Practice"},
      {~p"/progress", "Mock Tests"},
      {~p"/payment", "Profile"}
    ]
  end

  describe "the app shell" do
    test "every live tab renders the footer navigation", %{conn: conn} do
      for {path, _label} <- live_tabs() do
        {:ok, view, _html} = live(conn, path)

        if path == ~p"/" do
          refute has_element?(view, ~s(header nav button[aria-label="Go back"]))
        else
          assert has_element?(view, ~s(header nav button[aria-label="Go back"]))
          assert has_element?(view, ~s(header nav button[aria-label="Account"]))
        end

        for {tab_path, label} <- tabs() do
          assert has_element?(view, ~s(footer nav a[href="#{tab_path}"]), label),
                 "expected a #{label} tab on #{path}"
        end
      end
    end

    test "marks the current tab as active", %{conn: conn} do
      for {path, _label} <- live_tabs() do
        {:ok, view, _html} = live(conn, path)

        assert has_element?(view, ~s(footer nav a[href="#{path}"][aria-current="page"]))

        assert view |> element(~s(footer nav a[data-active="true"])) |> render() =~
                 ~s(href="#{path}")
      end
    end

    test "renders the redesigned main dashboard actions on the home page", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/")

      assert has_element?(view, "#home-task-panel[data-main-dashboard]")
      assert has_element?(view, "#main-hero")
      assert has_element?(view, ~s(#main-user-greeting[data-main-user-greeting]), "Hello!")
      assert has_element?(view, "#main-current-band-card [data-current-band]", "—")
      assert has_element?(view, "#main-goal-band-card [data-goal-band]", "Set goal")
      assert has_element?(view, "#main-streak-card [data-streak-count]", "0")
      assert has_element?(view, "#main-progress-card [data-progress-label]", "0%")

      assert has_element?(
               view,
               ~s(#continue-learning-button[href="/vocabulary"][data-contact-gated="true"])
             )

      assert has_element?(view, "#continue-learning-button", "Start Learning")

      for skill <- ~w(writing reading listening speaking) do
        assert has_element?(
                 view,
                 ~s(#main-skill-#{skill}[href="/#{skill}/setup"][data-contact-gated="true"][data-contact-action="skill_setup"][data-contact-skill="#{skill}"])
               )
      end

      assert has_element?(
               view,
               ~s(#personalize-study-plan-button[data-contact-gated="true"][data-study-plan-action="true"])
             )
    end

    test "renders the hidden contact gate modal on the home page", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/")

      assert has_element?(view, "#ielts-contact-modal[hidden][data-contact-modal]")
      assert has_element?(view, "#ielts-contact-title", "أدخل رقم هاتفك وبريدك الإلكتروني")
      assert has_element?(view, "#contact-country-button[data-contact-country-button]")
      assert has_element?(view, "#contact-phone-input[type=\"tel\"][data-contact-phone]")

      email_input =
        view
        |> render()
        |> LazyHTML.from_fragment()
        |> LazyHTML.query_by_id("contact-email-input")

      assert LazyHTML.attribute(email_input, "type") == ["email"]
      assert LazyHTML.attribute(email_input, "pattern") == [~S([^\s@]+@gmail\.com)]

      assert LazyHTML.attribute(email_input, "title") == [
               "Use a Gmail address ending in @gmail.com"
             ]

      assert LazyHTML.attribute(email_input, "data-contact-email") == [""]

      assert has_element?(view, "#contact-submit-button[disabled][data-contact-submit]", "متابعة")
      assert has_element?(view, ~s([data-contact-step="otp"][hidden]))
      assert has_element?(view, "#ielts-phone-verification-title", "تحقق من رقم الهاتف")

      for index <- 1..6 do
        assert has_element?(view, "#contact-otp-digit-#{index}[data-contact-otp-input]")
      end

      assert has_element?(
               view,
               "#contact-resend-button[data-contact-resend]",
               "إعادة إرسال الرمز"
             )

      assert has_element?(view, "#contact-otp-test-code[data-contact-otp-test-code][hidden]")
      assert has_element?(view, "#privacy-consent[data-contact-privacy]")

      assert has_element?(
               view,
               ~s(#contact-privacy-row a[href="/privacy-policy"]),
               "سياسة الخصوصية"
             )

      assert has_element?(view, "#contact-verification-submit-button[disabled]", "متابعة")
    end

    test "gates bottom navigation only while the user is on the home page", %{conn: conn} do
      {:ok, home_view, _html} = live(conn, ~p"/")

      assert has_element?(
               home_view,
               ~s(footer nav a[href="/activities"][data-contact-gated="true"])
             )

      {:ok, activities_view, _html} = live(conn, ~p"/activities")

      refute has_element?(
               activities_view,
               ~s(footer nav a[href="/"][data-contact-gated="true"])
             )
    end

    test "renders the privacy policy route used by the OTP agreement", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/privacy-policy")

      assert has_element?(view, "#privacy-policy-page", "سياسة الخصوصية")
    end

    test "renders separate skill setup pages with their own destinations", %{conn: conn} do
      cases = [
        {~p"/writing/setup", "writing", "Writing", "/activities?skill=writing", "#35A7DF"},
        {~p"/reading/setup", "reading", "Reading", "/activities?skill=reading", "#79C698"},
        {~p"/listening/setup", "listening", "Listening", "/activities?skill=listening",
         "#647FE8"},
        {~p"/speaking/setup", "speaking", "Speaking", "/activities?skill=speaking", "#8E81F2"}
      ]

      for {path, key, title, destination, color} <- cases do
        {:ok, view, _html} = live(conn, path)

        assert has_element?(
                 view,
                 ~s(##{key}-setup-page[data-skill-setup-root][data-skill="#{key}"][data-continue-destination="#{destination}"])
               )

        assert has_element?(view, "##{key}-setup-title", title)
        assert has_element?(view, "##{key}-setup-page[style*=\"#{color}\"]")
        assert has_element?(view, "##{key}-setup-back[href=\"/\"]")
        assert has_element?(view, "##{key}-type-academic")
        assert has_element?(view, "##{key}-type-general")
        assert has_element?(view, "##{key}-exam-date[type=\"date\"][data-skill-setup-date]")
        assert has_element?(view, "##{key}-targetBand-8-0")
        assert has_element?(view, "##{key}-dailyStudyMinutes-60")
        assert has_element?(view, "##{key}-setup-continue[disabled][data-skill-setup-continue]")
      end
    end

    test "leaves non-home page areas between the bars empty", %{conn: conn} do
      for {path, _label} <- Enum.reject(live_tabs(), fn {path, _label} -> path == ~p"/" end) do
        {:ok, view, _html} = live(conn, path)

        assert view |> element("#page") |> render() =~ ~r/<main[^>]*>\s*<\/main>/
      end
    end
  end
end
