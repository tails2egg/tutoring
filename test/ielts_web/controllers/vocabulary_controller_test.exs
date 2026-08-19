defmodule IeltsWeb.VocabularyControllerTest do
  use IeltsWeb.ConnCase, async: true

  test "renders the shared vocabulary page with all CEFR levels", %{conn: conn} do
    conn = get(conn, ~p"/vocabulary")

    document =
      conn
      |> html_response(200)
      |> LazyHTML.from_fragment()

    for level <- ["A2", "B1", "B2", "C1", "C2"] do
      assert document
             |> LazyHTML.query(~s([data-vocab-level-tab="#{level}"]))
             |> Enum.count() == 1

      assert document
             |> LazyHTML.query(~s([data-vocab-grid="#{level}"] [data-vocab-card]))
             |> Enum.count() == 10

      assert document
             |> LazyHTML.query(~s([data-vocab-grid="#{level}"] [data-vocab-card-corner]))
             |> Enum.count() == 0

      assert document
             |> LazyHTML.query(
               ~s([data-vocab-grid="#{level}"] [data-vocabulary-quiz-button="#{level}"])
             )
             |> Enum.count() == 1

      score_bar = LazyHTML.query(document, ~s([data-level-exam-score="#{level}"]))

      assert Enum.count(score_bar) == 1
      assert score_bar |> LazyHTML.text() |> String.trim() == "%0"
      assert LazyHTML.attribute(score_bar, "data-exam-completed") == ["false"]
      assert LazyHTML.attribute(score_bar, "class") == ["level-exam-score"]
    end

    assert document
           |> LazyHTML.query_by_id("vocabulary-page")
           |> LazyHTML.attribute("data-default-level") == ["A2"]

    assert document
           |> LazyHTML.query_by_id("vocabulary-guide-banner")
           |> Enum.count() == 1

    assert document
           |> LazyHTML.query("#vocabulary-guide-banner .vocabulary-guide-guy")
           |> LazyHTML.attribute("src") == ["/guy1.png"]

    assert document
           |> LazyHTML.query_by_id("flashcard-overlay")
           |> Enum.count() == 1

    assert document
           |> LazyHTML.query_by_id("flashcard-inner")
           |> Enum.count() == 1

    assert document
           |> LazyHTML.query("[data-flashcard-close]")
           |> LazyHTML.attribute("class") == ["flashcard-popup-back"]

    assert document
           |> LazyHTML.query("#flashcard-inner .pronunciation-flag")
           |> LazyHTML.attribute("src") == ["/usa.png"]

    assert document
           |> LazyHTML.query_by_id("vocabulary-quiz-screen")
           |> Enum.count() == 1

    assert document
           |> LazyHTML.query_by_id("vocab-card-A2-1")
           |> LazyHTML.attribute("data-word") == ["Travel"]

    assert document
           |> LazyHTML.query("#vocab-card-A2-1 .vocabulary-card-word")
           |> LazyHTML.attribute("class") == ["vocabulary-card-word"]

    assert document
           |> LazyHTML.query("#vocab-card-B2-1 .vocabulary-card-word")
           |> LazyHTML.attribute("class") == ["vocabulary-card-word is-medium"]

    assert document
           |> LazyHTML.query("#vocab-card-C1-3 .vocabulary-card-word")
           |> LazyHTML.attribute("class") == ["vocabulary-card-word is-long"]

    travel_card = LazyHTML.query_by_id(document, "vocab-card-A2-1")

    assert LazyHTML.attribute(travel_card, "data-pronunciation") == ["tra.v"]

    document
    |> LazyHTML.query("[data-vocab-card]")
    |> Enum.each(fn card ->
      [pronunciation] = LazyHTML.attribute(card, "data-pronunciation")

      refute String.contains?(pronunciation, "/")
    end)

    assert document
           |> LazyHTML.query_by_id("vocab-card-C2-7")
           |> LazyHTML.attribute("data-word") == ["Pragmatic"]
  end
end
