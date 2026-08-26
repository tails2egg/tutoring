defmodule IeltsWeb.PhoneVerificationController do
  use IeltsWeb, :controller

  alias Ielts.PhoneVerification

  def create(conn, %{"phone" => phone}) do
    case PhoneVerification.send_code(phone) do
      {:ok, result} ->
        payload =
          %{
            status: "sent",
            expires_in_seconds: result.expires_in_seconds,
            resend_after_seconds: result.resend_after_seconds
          }
          |> maybe_put_test_code(result)

        json(conn, payload)

      {:error, :rate_limited, seconds} ->
        payload =
          %{error: "rate_limited", resend_after_seconds: seconds}
          |> maybe_put_current_test_code(phone)

        conn
        |> put_status(:too_many_requests)
        |> json(payload)

      {:error, :invalid_phone} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "invalid_phone"})

      {:error, _reason} ->
        conn
        |> put_status(:bad_gateway)
        |> json(%{error: "delivery_failed"})
    end
  end

  def create(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{error: "invalid_phone"})
  end

  def verify(conn, %{"phone" => phone, "code" => code}) do
    case PhoneVerification.verify_code(phone, code) do
      :ok ->
        json(conn, %{status: "verified"})

      {:error, :expired} ->
        conn
        |> put_status(:gone)
        |> json(%{error: "expired"})

      {:error, :invalid_phone} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "invalid_phone"})

      {:error, _reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "invalid"})
    end
  end

  def verify(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{error: "invalid"})
  end

  defp maybe_put_test_code(payload, %{test_code: code}) when is_binary(code) do
    Map.put(payload, :test_code, code)
  end

  defp maybe_put_test_code(payload, _result), do: payload

  defp maybe_put_current_test_code(payload, phone) do
    case PhoneVerification.current_test_code(phone) do
      {:ok, code} -> Map.put(payload, :test_code, code)
      :error -> payload
    end
  end
end
