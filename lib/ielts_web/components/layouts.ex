defmodule IeltsWeb.Layouts do
  @moduledoc """
  This module holds layouts and related functionality
  used by your application.
  """
  use IeltsWeb, :html

  # Embed all files in layouts/* within this module.
  # The default root.html.heex file contains the HTML
  # skeleton of your application, namely HTML headers
  # and other static content.
  embed_templates "layouts/*"

  @doc """
  Renders the app shell: the gradient top bar, the page, and the bottom tab bar.

  The shell is the whole app for now — the page area between the two bars is
  deliberately empty. It stretches from a phone to a laptop: the bars stay
  edge-to-edge and square on small screens, and become centred, rounded cards
  once there is room beside them.

  ## Examples

      <Layouts.app flash={@flash} active_tab={:home}>
        <h1>Content</h1>
      </Layouts.app>

  """
  attr :flash, :map, required: true, doc: "the map of flash messages"

  attr :active_tab, :atom,
    default: nil,
    doc: "the id of the current tab, used to highlight the bottom tab bar"

  attr :class, :any, default: nil, doc: "extra classes for the content section"
  attr :hide_chrome, :boolean, default: false, doc: "hide the app header and footer"

  slot :inner_block

  def app(assigns) do
    assigns = assign(assigns, :nav_items, nav_items())

    ~H"""
    <div class="flex min-h-dvh flex-col bg-background">
      <header
        :if={!@hide_chrome && @active_tab != :home}
        class="sticky top-0 z-50 w-full sm:pt-3 md:pt-4"
      >
        <div class="mx-auto w-full max-w-3xl lg:max-w-5xl sm:px-4">
          <nav class="flex h-14 items-center justify-between gap-3 rounded-b-2xl bg-[linear-gradient(to_right,#7f60ea,#647fe8,#34a6dd,#39acad)] px-4 shadow-main backdrop-blur-md sm:rounded-2xl sm:px-6 md:h-16">
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick="history.back()"
                aria-label="Go back"
                class="flex size-9 items-center justify-center rounded-full bg-white/95 text-slate-700 transition hover:bg-white hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:size-10"
              >
                <.icon name="hero-arrow-left-mini" class="size-5" />
              </button>
              <button
                type="button"
                aria-label="Assistant"
                class="flex size-9 items-center justify-center rounded-full bg-white/95 text-slate-700 transition hover:bg-white hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:size-10"
              >
                <.icon name="hero-chat-bubble-oval-left-ellipsis-mini" class="size-5" />
              </button>
            </div>

            <button
              type="button"
              aria-label="Account"
              class="flex size-9 items-center justify-center rounded-full bg-white/95 text-slate-700 transition hover:bg-white hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:size-10"
            >
              <.icon name="hero-user-mini" class="size-5" />
            </button>
          </nav>
        </div>
      </header>

      <main id="page" class={["mx-auto w-full max-w-3xl flex-1 lg:max-w-5xl", @class]}>
        {render_slot(@inner_block)}
      </main>

      <footer
        :if={!@hide_chrome}
        class="bottom-nav sticky bottom-0 z-40 w-full"
        style="padding-bottom: env(safe-area-inset-bottom, 0px);"
      >
        <div class="mx-auto w-full max-w-[430px]">
          <nav
            aria-label="Main"
            class="flex min-h-18 items-stretch justify-around overflow-hidden rounded-t-[1.6rem] border border-slate-100 bg-white px-1 shadow-[0_-8px_28px_rgba(15,23,42,0.10)]"
          >
            <.link
              :for={item <- @nav_items}
              href={if(item.kind == :href, do: item.path)}
              navigate={if(item.kind == :navigate, do: item.path)}
              aria-current={item.id == @active_tab && "page"}
              data-contact-gated={if(@active_tab == :home && item.id != :home, do: "true")}
              data-active={to_string(item.id == @active_tab)}
              class="group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[#8B91A7] transition-colors data-[active=true]:text-[#0A84FF] hover:text-[#0A84FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A84FF]"
            >
              <span class="absolute inset-x-5 top-0 hidden h-1 rounded-full bg-[#0A84FF] group-data-[active=true]:block"></span>
              <.icon
                name={if(item.id == @active_tab, do: item.icon_active, else: item.icon)}
                class="size-6"
              />
              <span class="max-w-full truncate text-[11px] font-medium leading-none">{item.label}</span>
            </.link>
          </nav>
        </div>
      </footer>

      <.flash_group flash={@flash} />
    </div>
    """
  end

  # The four tabs of the bottom bar, in reading order. Both icon names are
  # spelled out because Tailwind only emits the `hero-*` classes it can see in
  # the source — a name built at runtime would come out unstyled.
  defp nav_items do
    [
      %{
        id: :home,
        path: ~p"/",
        label: "Home",
        icon: "hero-home",
        icon_active: "hero-home-solid",
        kind: :navigate
      },
      %{
        id: :activities,
        path: ~p"/activities",
        label: "Practice",
        icon: "hero-pencil-square",
        icon_active: "hero-pencil-square-solid",
        kind: :navigate
      },
      %{
        id: :courses,
        path: ~p"/vocabulary",
        label: "Courses",
        icon: "hero-book-open",
        icon_active: "hero-book-open-solid",
        kind: :href
      },
      %{
        id: :progress,
        path: ~p"/progress",
        label: "Mock Tests",
        icon: "hero-clipboard-document-check",
        icon_active: "hero-clipboard-document-check-solid",
        kind: :navigate
      },
      %{
        id: :payment,
        path: ~p"/payment",
        label: "Profile",
        icon: "hero-user",
        icon_active: "hero-user-solid",
        kind: :navigate
      }
    ]
  end

  @doc """
  Shows the flash group with standard titles and content.

  ## Examples

      <.flash_group flash={@flash} />
  """
  attr :flash, :map, required: true, doc: "the map of flash messages"
  attr :id, :string, default: "flash-group", doc: "the optional id of flash container"

  def flash_group(assigns) do
    ~H"""
    <div id={@id} aria-live="polite">
      <.flash kind={:info} flash={@flash} />
      <.flash kind={:error} flash={@flash} />

      <.flash
        id="client-error"
        kind={:error}
        title={gettext("We can't find the internet")}
        phx-disconnected={
          show(".phx-client-error #client-error")
          |> JS.remove_attribute("hidden", to: ".phx-client-error #client-error")
        }
        phx-connected={hide("#client-error") |> JS.set_attribute({"hidden", ""})}
        hidden
      >
        {gettext("Attempting to reconnect")}
        <.icon name="hero-arrow-path" class="ml-1 size-3 motion-safe:animate-spin" />
      </.flash>

      <.flash
        id="server-error"
        kind={:error}
        title={gettext("Something went wrong!")}
        phx-disconnected={
          show(".phx-server-error #server-error")
          |> JS.remove_attribute("hidden", to: ".phx-server-error #server-error")
        }
        phx-connected={hide("#server-error") |> JS.set_attribute({"hidden", ""})}
        hidden
      >
        {gettext("Attempting to reconnect")}
        <.icon name="hero-arrow-path" class="ml-1 size-3 motion-safe:animate-spin" />
      </.flash>
    </div>
    """
  end
end
