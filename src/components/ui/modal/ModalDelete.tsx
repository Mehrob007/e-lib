"use client";
import { motion } from "framer-motion";
import { LuX, LuTriangleAlert } from "react-icons/lu";
import "./Modal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function ModalDelete({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтверждение удаления",
  message = "Вы уверены, что хотите удалить этот элемент? Это действие нельзя будет отменить.",
}: Props) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="modal__overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 1000 }}
    >
      <motion.div
        className="modal__card delete-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ maxWidth: "400px" }}
      >
        <header className="modal__header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <LuTriangleAlert color="#ff4d4f" size={24} />
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{title}</h2>
          </div>
          <button className="modal__close" onClick={onClose}>
            <LuX size={18} />
          </button>
        </header>

        <div className="modal__form" style={{ padding: "20px 0" }}>
          <p style={{ color: "#666", lineHeight: 1.5, margin: 0 }}>{message}</p>
        </div>

        <footer className="modal__footer" style={{ borderTop: "1px solid #eee", paddingTop: "15px" }}>
          <button className="modal__btn-cancel" onClick={onClose}>
            Отмена
          </button>
          <button
            className="modal__btn-save"
            onClick={onConfirm}
            style={{ backgroundColor: "#ff4d4f" }}
          >
            Удалить
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
}
