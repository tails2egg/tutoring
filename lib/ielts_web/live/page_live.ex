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
    progress: "Progress"
  }

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, :page_title, @titles[socket.assigns.live_action])}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash} active_tab={@live_action}>
      <%= if @live_action == :home do %>
        <section
          id="home-task-panel"
          class="flex min-h-[calc(100dvh-8rem)] items-center justify-center px-5 py-10"
        >
          <.link
            id="flashcards-task-button"
            navigate={~p"/vocabulary"}
            class="group flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-white px-6 py-5 text-lg font-semibold text-slate-800 shadow-main ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:text-brand hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <span class="flex size-12 items-center justify-center rounded-2xl bg-brand text-white transition group-hover:scale-105">
              <.icon name="hero-rectangle-stack-solid" class="size-6" />
            </span>
            <span>Flashcards Task</span>
            <.icon
              name="hero-arrow-right-mini"
              class="size-5 text-muted transition group-hover:translate-x-1 group-hover:text-brand"
            />
          </.link>
        </section>
      <% end %>
    </Layouts.app>
    """
  end
end
