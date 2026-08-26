defmodule Ielts.PhoneVerification do
  @moduledoc """
  Server-side phone verification code lifecycle.

  The default non-production delivery logs the generated code so the UI can be
  exercised without pretending that SMS delivery exists. Configure
  `:phone_verification_delivery` with a delivery module in production.
  """

  use GenServer

  require Logger

  @code_length 6
  @code_ttl_seconds 300
  @resend_seconds 30
  @max_attempts 5

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, %{}, Keyword.put_new(opts, :name, __MODULE__))
  end

  def send_code(phone, opts \\ []) when is_binary(phone) do
    GenServer.call(__MODULE__, {:send_code, phone, opts})
  end

  def verify_code(phone, code) when is_binary(phone) and is_binary(code) do
    GenServer.call(__MODULE__, {:verify_code, phone, code})
  end

  def current_test_code(phone) when is_binary(phone) do
    GenServer.call(__MODULE__, {:current_test_code, phone})
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def handle_call({:send_code, phone, opts}, _from, state) do
    now = now_ms()

    with :ok <- validate_phone(phone),
         :ok <- validate_rate_limit(state[phone], now) do
      code = Keyword.get_lazy(opts, :code, &generate_code/0)
      salt = :crypto.strong_rand_bytes(16)

      record = %{
        code_hash: hash_code(salt, code),
        salt: salt,
        test_code: test_code(code),
        attempts: 0,
        expires_at: now + seconds_to_ms(@code_ttl_seconds),
        resend_after: now + seconds_to_ms(@resend_seconds)
      }

      case deliver_code(phone, code) do
        :ok ->
          result =
            %{
              expires_in_seconds: @code_ttl_seconds,
              resend_after_seconds: @resend_seconds
            }
            |> maybe_put_test_code(code)

          {:reply, {:ok, result}, Map.put(state, phone, record)}

        {:error, reason} ->
          {:reply, {:error, reason}, state}
      end
    else
      {:error, :rate_limited, seconds} ->
        {:reply, {:error, :rate_limited, seconds}, state}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  def handle_call({:current_test_code, phone}, _from, state) do
    result =
      with true <- show_test_code?(),
           :ok <- validate_phone(phone),
           {:ok, %{test_code: code}} when is_binary(code) <- fetch_record(state, phone) do
        {:ok, code}
      else
        _ -> :error
      end

    {:reply, result, state}
  end

  def handle_call({:verify_code, phone, code}, _from, state) do
    now = now_ms()

    with :ok <- validate_phone(phone),
         :ok <- validate_code(code),
         {:ok, record} <- fetch_record(state, phone),
         :ok <- validate_expiration(record, now),
         :ok <- validate_attempts(record) do
      if secure_code_match?(record, code) do
        {:reply, :ok, Map.delete(state, phone)}
      else
        updated_state = update_in(state, [phone, :attempts], &(&1 + 1))
        {:reply, {:error, :invalid}, updated_state}
      end
    else
      {:error, :expired} ->
        {:reply, {:error, :expired}, Map.delete(state, phone)}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  defp validate_phone(phone) do
    if Regex.match?(~r/^\+[1-9]\d{7,14}$/, phone) do
      :ok
    else
      {:error, :invalid_phone}
    end
  end

  defp validate_code(code) do
    if Regex.match?(~r/^\d{6}$/, code) do
      :ok
    else
      {:error, :invalid}
    end
  end

  defp validate_rate_limit(nil, _now), do: :ok

  defp validate_rate_limit(%{resend_after: resend_after}, now) when now < resend_after do
    {:error, :rate_limited, seconds_remaining(resend_after, now)}
  end

  defp validate_rate_limit(_record, _now), do: :ok

  defp fetch_record(state, phone) do
    case Map.fetch(state, phone) do
      {:ok, record} -> {:ok, record}
      :error -> {:error, :invalid}
    end
  end

  defp validate_expiration(%{expires_at: expires_at}, now) when now > expires_at do
    {:error, :expired}
  end

  defp validate_expiration(_record, _now), do: :ok

  defp validate_attempts(%{attempts: attempts}) when attempts >= @max_attempts do
    {:error, :expired}
  end

  defp validate_attempts(_record), do: :ok

  defp secure_code_match?(record, code) do
    Plug.Crypto.secure_compare(record.code_hash, hash_code(record.salt, code))
  end

  defp hash_code(salt, code), do: :crypto.hash(:sha256, salt <> code)

  defp test_code(code) do
    if show_test_code?(), do: code
  end

  defp maybe_put_test_code(result, code) do
    if show_test_code?(), do: Map.put(result, :test_code, code), else: result
  end

  defp show_test_code? do
    Application.get_env(:ielts, :phone_verification_show_code, false)
  end

  defp generate_code do
    :crypto.strong_rand_bytes(4)
    |> :binary.decode_unsigned()
    |> rem(1_000_000)
    |> Integer.to_string()
    |> String.pad_leading(@code_length, "0")
  end

  defp deliver_code(phone, code) do
    case Application.get_env(:ielts, :phone_verification_delivery, :logger) do
      :logger ->
        Logger.info("Phone verification code for #{phone}: #{code}")
        :ok

      :disabled ->
        {:error, :delivery_unavailable}

      module when is_atom(module) ->
        module.deliver(phone, code)

      {module, function, args} when is_atom(module) and is_atom(function) and is_list(args) ->
        apply(module, function, [phone, code | args])
    end
  rescue
    exception ->
      Logger.error("Phone verification delivery failed: #{Exception.message(exception)}")
      {:error, :delivery_failed}
  end

  defp seconds_to_ms(seconds), do: seconds * 1000
  defp now_ms, do: System.monotonic_time(:millisecond)

  defp seconds_remaining(deadline, now) do
    max(0, ceil((deadline - now) / 1000))
  end
end
