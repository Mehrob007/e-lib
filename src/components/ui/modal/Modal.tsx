"use client";
import { postUserREQ } from "@/api/user";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";
import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import "./Modal.css";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalUser({ onClose, onSuccess }: Props) {
  const { errors, data, setData, validate, setClear } = useFormStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setClear();
  }, [setClear]);

  const onSend = async () => {
    const valid = validate({
      username: { required: true },
      phone_number: { required: true },
      pussword: { required: true },
    });

    if (!valid) return;
    setLoading(true);
    try {
      await postUserREQ(data);
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>Добавление</h2>
          <button className="modal__close" onClick={onClose}>
            <LuX size={18} />
          </button>
        </header>

        <div className="modal__form">
          <div className="modal__grid">
            <Input
              id="username"
              title="Имя"
              placeholder="Введите имя"
              value={data?.name as string}
              onChange={(v) => setData("username", v)}
              errors={errors}
            />
            <Input
              id="phone_number"
              title="Логин"
              placeholder="Введите логин"
              value={data?.code as string}
              onChange={(v) => setData("phone_number", v)}
              errors={errors}
            />
            <Input
              id="password"
              title="Пароль"
              placeholder="Введите пароль"
              value={data?.code as string}
              onChange={(v) => setData("password", v)}
              errors={errors}
            />
          </div>

          <footer className="modal__footer">
            <button className="modal__btn-cancel" onClick={onClose}>
              Отмена
            </button>
            <button
              className="modal__btn-save"
              onClick={onSend}
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
