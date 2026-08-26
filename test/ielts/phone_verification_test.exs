defmodule Ielts.PhoneVerificationTest do
  use ExUnit.Case, async: false

  alias Ielts.PhoneVerification

  defp phone do
    suffix =
      System.unique_integer([:positive])
      |> rem(10_000)
      |> Integer.to_string()
      |> String.pad_leading(4, "0")

    "+1555000#{suffix}"
  end

  test "verifies a matching six digit code and rejects reuse" do
    phone = phone()

    assert {:ok, %{resend_after_seconds: 30}} =
             PhoneVerification.send_code(phone, code: "650671")

    assert {:ok, "650671"} = PhoneVerification.current_test_code(phone)
    assert {:error, :invalid} = PhoneVerification.verify_code(phone, "650670")
    assert :ok = PhoneVerification.verify_code(phone, "650671")
    assert :error = PhoneVerification.current_test_code(phone)
    assert {:error, :invalid} = PhoneVerification.verify_code(phone, "650671")
  end

  test "rate limits repeated sends inside the resend window" do
    phone = phone()

    assert {:ok, %{test_code: "123456"}} = PhoneVerification.send_code(phone, code: "123456")
    assert {:error, :rate_limited, seconds} = PhoneVerification.send_code(phone, code: "654321")
    assert seconds in 1..30
    assert {:ok, "123456"} = PhoneVerification.current_test_code(phone)
  end
end
