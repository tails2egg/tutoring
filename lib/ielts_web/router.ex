defmodule IeltsWeb.Router do
  use IeltsWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {IeltsWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :json_api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  scope "/", IeltsWeb do
    pipe_through :browser

    get "/.well-known/appspecific/com.chrome.devtools.json", WellKnownController, :chrome_devtools

    live "/", PageLive, :home
    live "/writing/setup", WritingSetupLive, :setup
    live "/reading/setup", ReadingSetupLive, :setup
    live "/listening/setup", ListeningSetupLive, :setup
    live "/speaking/setup", SpeakingSetupLive, :setup
    live "/activities", PageLive, :activities
    live "/payment", PageLive, :payment
    live "/progress", PageLive, :progress
    live "/privacy-policy", PageLive, :privacy_policy
    get "/vocabulary", VocabularyController, :index
  end

  scope "/", IeltsWeb do
    pipe_through :json_api

    post "/phone/otp", PhoneVerificationController, :create
    post "/phone/verify", PhoneVerificationController, :verify
  end

  # Enable LiveDashboard in development
  if Application.compile_env(:ielts, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: IeltsWeb.Telemetry
    end
  end
end
