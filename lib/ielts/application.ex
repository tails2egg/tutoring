defmodule Ielts.Application do
  # See https://elixir.hexdocs.pm/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      IeltsWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:ielts, :dns_cluster_query) || :ignore},
      Ielts.PhoneVerification,
      {Phoenix.PubSub, name: Ielts.PubSub},
      # Start a worker by calling: Ielts.Worker.start_link(arg)
      # {Ielts.Worker, arg},
      # Start to serve requests, typically the last entry
      IeltsWeb.Endpoint
    ]

    # See https://elixir.hexdocs.pm/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Ielts.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    IeltsWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
