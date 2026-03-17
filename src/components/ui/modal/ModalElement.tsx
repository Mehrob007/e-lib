"use client";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";
import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import "./Modal.css";
import { postElementREQ } from "@/api/element";
import ModalELementStage from "./ModalElementStage";
import { ItemT } from "@/types/table";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  defPather?: ItemT;
}

export default function ModalELement({
  onClose,
  onSuccess,
  defPather,
}: Props) {
  const { errors, data, setData, validate, setClear } = useFormStore();
  const [loading, setLoading] = useState<string | null>("");
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setClear();
  }, [setClear]);

  const onSend = async () => {
    const valid = validate({
      // tj_name: { required: true },
    });

    if (!valid) return;
    setLoading("send");
    try {
      await postElementREQ(data);
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
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

        <ModalELementStage stage={stage} defPather={defPather} />

        <div className="modal__form">
          <div className="modal__grid">
            {/* <Input
              id="tj_name"
              title="Таджикский"
              placeholder="Введите таджикский"
              value={data?.name as string}
              onChange={(v) => setData("tj_name", v)}
              errors={errors}
            /> */}
          </div>

          <footer className="modal__footer">
            <button
              className="modal__btn-cancel"
              onClick={() => {
                onClose();
              }}
            >
              Отмена
            </button>
            <button
              className="modal__btn-save"
              onClick={() => setStage((prev) => (prev += 1))}
              disabled={loading?.includes("send")}
            >
              {/* {loading?.includes("send") ? "Сохранение..." : "Сохранить"} */}
              Далее
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
