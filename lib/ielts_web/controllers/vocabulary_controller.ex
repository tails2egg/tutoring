defmodule IeltsWeb.VocabularyController do
  use IeltsWeb, :controller

  alias Ielts.Vocabulary

  def index(conn, _params) do
    render(conn, :index,
      page_title: "Vocabulary",
      level_order: Vocabulary.level_order(),
      levels: Vocabulary.levels()
    )
  end
end
