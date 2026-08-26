defmodule IeltsWeb.WritingSetupLive do
  use IeltsWeb, :live_view

  import IeltsWeb.SkillSetupComponents, only: [writing_setup_page: 1]

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, :page_title, "Writing Setup")}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <.writing_setup_page flash={@flash} />
    """
  end
end
