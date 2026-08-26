defmodule IeltsWeb.PhoneVerificationControllerTest do
  use IeltsWeb.ConnCase, async: false

  test "the displayed development OTP verifies successfully", %{conn: conn} do
    phone = "+15550123456"

    conn = post(conn, ~p"/phone/otp", %{phone: phone})
    response = json_response(conn, 200)

    assert %{"test_code" => test_code} = response
    assert test_code =~ ~r/^\d{6}$/

    conn = post(build_conn(), ~p"/phone/verify", %{phone: phone, code: test_code})

    assert %{"status" => "verified"} = json_response(conn, 200)
  end

  test "resend rate limit returns the same current development OTP", %{conn: conn} do
    phone = "+15550123457"

    first_code =
      conn
      |> post(~p"/phone/otp", %{phone: phone})
      |> json_response(200)
      |> Map.fetch!("test_code")

    response =
      build_conn()
      |> post(~p"/phone/otp", %{phone: phone})
      |> json_response(429)

    assert response["test_code"] == first_code

    conn = post(build_conn(), ~p"/phone/verify", %{phone: phone, code: first_code})

    assert %{"status" => "verified"} = json_response(conn, 200)
  end
end
