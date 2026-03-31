"use client";

import LoginIcon from "@/../public/icons/login-icon.svg";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";

import Button from "@/components/elements/button/Button";
import { useState } from "react";
import { postAuthREQ } from "@/api/auth";
import { useRouter } from "next/navigation";

export default function Login() {
  const { data, errors, validate, setData } = useFormStore();
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const onSend = async () => {
    const dataValid = {
      login: { required: true },
      password: { required: true, maxLength: 6 }, // typical max length, matching user's intent but fixing typo
    };

    setLoading(true);
    try {
      const valid = validate(dataValid);
      if (!valid) return;
      const res = await postAuthREQ({
        phone_number: String(data.login),
        password: String(data.password),
      });
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      router.push("./admin");
      // console.log("Login result:", res);
      // Handle success (e.g., redirect or store token)
    } catch (e) {
      console.error(e);
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
              // placeholder="Ведите логин"
              title="Логин:"
            />
            <Input
              id="password"
              type="password"
              value={String(data.password ?? "")}
              onChange={(e) => setData("password", e)}
              errors={errors}
              title="Пароль:"
              placeholder="Ведите пароль"
            />

            <Button title="Войти" onClick={() => onSend()} />
          </div>
        </div>
      </main>
    </div>
  );
}
