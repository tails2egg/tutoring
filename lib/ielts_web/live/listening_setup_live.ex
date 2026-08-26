defmodule IeltsWeb.ListeningSetupLive do
  use IeltsWeb, :live_view

  import IeltsWeb.SkillSetupComponents, only: [listening_setup_page: 1]

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, :page_title, "Listening Setup")}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <.listening_setup_page flash={@flash} />
    """
  end
end
