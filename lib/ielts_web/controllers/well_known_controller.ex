defmodule IeltsWeb.WellKnownController do
  use IeltsWeb, :controller

  def chrome_devtools(conn, _params) do
    json(conn, %{})
  end
end
