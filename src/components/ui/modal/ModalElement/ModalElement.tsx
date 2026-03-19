"use client";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";
import { useEffect, useState } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import { postElementREQ } from "@/api/element";
import ModalELementStage from "./ModalElementStage";
import { ItemT } from "@/types/table";
import { motion, AnimatePresence } from "framer-motion";
import "../Modal.css";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  defPather?: ItemT;
}

export default function ModalELement({ onClose, onSuccess, defPather }: Props) {
  const { data, setData, validate, setClear } = useFormStore();
  const [loading, setLoading] = useState<string | null>("");
  const [stage, setStage] = useState(0);
  const stages = [
    { id: 0, title: "Тип" },
    { id: 1, title: "Категория" },
    { id: 2, title: "Данные" },
  ];

  const next = () => {
    if (stage === 0) {
      const valid = validate(
        Object.fromEntries(
          Object.keys(data).map((key) => [key, { required: true }]),
        ),
      );
      if (!valid) return;
      setStage(1);
      setData("defPatherId", defPather?.id as string);
    } else if (stage === 1) {
      setStage(2);
    }
  };

  const handleStageClick = (s: number) => {
    if (s < stage) {
      setStage(s);
    } else if (s > stage) {
      if (stage === 0) {
        const valid = validate({
          type: { required: true },
        });
        if (!valid) return;
      }
      setStage(s);
    }
  };

  const onSend = async () => {
    const valid = validate({
      name: { required: true },
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

  useEffect(() => {
    setClear();
  }, [setClear]);

  useEffect(() => {
    setData("type", "");
  }, []);

  return (
    <motion.div
      className="modal__overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal__card"
        onClick={(e) => e.stopPropagation()}
        layout
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          layout: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
      >
        <header className="modal__header">
          <h2>Добавление</h2>
          <button className="modal__close" onClick={onClose}>
            <LuX size={18} />
          </button>
        </header>

        <nav className="modal__nav">
          {stages.map((s, i) => (
            <div
              key={s.id}
              className={`modal__nav-item ${stage === s.id ? "active" : ""} ${
                stage > s.id ? "completed" : ""
              }`}
              onClick={() => handleStageClick(s.id)}
            >
              <div className="modal__nav-circle">
                {stage > s.id ? <LuCheck size={18} /> : i + 1}
              </div>
              <span className="modal__nav-title">{s.title}</span>
              {i < stages.length - 1 && <div className="modal__nav-line" />}
            </div>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ModalELementStage stage={stage} defPather={defPather} />
          </motion.div>
        </AnimatePresence>

        <div className="modal__form">
          <div className="modal__grid"></div>

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
              onClick={() => (stage === 2 ? onSend() : next())}
              disabled={loading?.includes("send")}
            >
              {loading?.includes("send")
                ? "Сохранение..."
                : stage === 2
                  ? "Сохранить"
                  : "Далее"}
            </button>
          </footer>
        </div>
      </motion.div>
    </motion.div>
  );
}
