defmodule IeltsWeb.ReadingSetupLive do
  use IeltsWeb, :live_view

  import IeltsWeb.SkillSetupComponents, only: [reading_setup_page: 1]

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, :page_title, "Reading Setup")}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <.reading_setup_page flash={@flash} />
    """
  end
end
