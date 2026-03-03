"use client";

import LoginIcon from "@/../public/icons/login-icon.svg";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";

export default function Login() {
  const { data, errors, setData } = useFormStore();

  return (
    <div className="login__page">
      <main>
        <div className="login__content">
          <div>
            <LoginIcon aria-label="login-icon" />
          </div>

          <div className="login__form">
            <Input
              id="login"
              value={String(data.login ?? "")}
              onChange={(e) => setData("login", e)}
              errors={errors}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
