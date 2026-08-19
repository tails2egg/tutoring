defmodule IeltsWeb.ShellTest do
  use IeltsWeb.ConnCase, async: true

  import Phoenix.LiveViewTest

  defp tabs do
    [
      {~p"/", "Home"},
      {~p"/activities", "Activities"},
      {~p"/payment", "Payment"},
      {~p"/progress", "Progress"}
    ]
  end

  describe "the app shell" do
    test "every tab renders the navbar and the four footer tabs", %{conn: conn} do
      for {path, _label} <- tabs() do
        {:ok, view, _html} = live(conn, path)

        assert has_element?(view, ~s(header nav button[aria-label="Go back"]))
        assert has_element?(view, ~s(header nav button[aria-label="Account"]))

        for {tab_path, label} <- tabs() do
          assert has_element?(view, ~s(footer nav a[href="#{tab_path}"]), label),
                 "expected a #{label} tab on #{path}"
        end
      end
    end

    test "marks the current tab as active", %{conn: conn} do
      for {path, _label} <- tabs() do
        {:ok, view, _html} = live(conn, path)

        assert has_element?(view, ~s(footer nav a[href="#{path}"][aria-current="page"]))

        assert view |> element(~s(footer nav a[data-active="true"])) |> render() =~
                 ~s(href="#{path}")
      end
    end

    test "shows the flashcards task button on the home page", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/")

      assert has_element?(view, ~s(#flashcards-task-button[href="/vocabulary"]))
    end

    test "leaves non-home page areas between the bars empty", %{conn: conn} do
      for {path, _label} <- Enum.reject(tabs(), fn {path, _label} -> path == ~p"/" end) do
        {:ok, view, _html} = live(conn, path)

        assert view |> element("#page") |> render() =~ ~r/<main[^>]*>\s*<\/main>/
      end
    end
  end
end
