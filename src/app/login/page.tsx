"use client";

import LoginIcon from "@/../public/icons/login-icon.svg";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";

import Button from "@/components/elements/button/Button";
import { useState } from "react";
import { postAuthREQ } from "@/api/auth";
import { useRouter } from "next/navigation";
import { decodeJwt } from "jose";

export default function Login() {
  const { data, errors, validate, setData } = useFormStore();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const router = useRouter();

  const onSend = async () => {
    const dataValid = {
      login: { required: true },
      password: { required: true, maxLength: 6 },
    };

    setLoading(true);
    setAuthError(null);
    try {
      const valid = validate(dataValid);
      if (!valid) return;
      const res = await postAuthREQ({
        phone_number: String(data.login),
        password: String(data.password),
      });

      if (res) {
        const { access_token, refresh_token } = res;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        document.cookie = `access_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `refresh_token=${refresh_token}; path=/; max-age=604800; SameSite=Lax`;
        const payload = decodeJwt(access_token);
        const role = payload.role as string;
        localStorage.setItem("user-role", role);
        setTimeout(() => {
          if (role === "Admin" || role === "Superadmin") {
            router.push("/admin/elements");
          } else {
            router.push("/");
          }
        }, 100);
      } else {
        setAuthError("Неверный логин или пароль");
      }
    } catch (e) {
      console.error("Login error:", e);
      setAuthError("Произошла ошибка при входе");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login__page">
      <main>
        <div className="login__content">
          <div className="login__header">
            <LoginIcon aria-label="login-icon" className="login-icon" />
          </div>

          <div className="login__form">
            <Input
              id="login"
              type="phone"
              value={String(data.login ?? "")}
              onChange={(e) => setData("login", e)}
              errors={errors}
              title="Логин:"
              autoComplete="off"
            />
            <Input
              id="password"
              type="password"
              value={String(data.password ?? "")}
              onChange={(e) => setData("password", e)}
              errors={errors}
              title="Пароль:"
              autoComplete="new-password"
            />

            {authError && <p className="login__error-msg">{authError}</p>}

            <Button title="Войти" onClick={() => onSend()} />
          </div>
        </div>
      </main>
    </div>
  );
}
