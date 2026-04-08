"use client";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";
import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import { postCategoryREQ } from "@/api/category";
import { motion } from "framer-motion";
import "./Modal.css";
import { ItemT } from "@/types/table";

interface Props {
  onClose: () => void;
  onSuccess: (parentId?: string) => Promise<ItemT[] | null>;
  parentId?: string;
  setDataTable: (v: ItemT[]) => void;
}

export default function ModalCategory({
  onClose,
  onSuccess,
  parentId,
  setDataTable,
}: Props) {
  const { errors, data, setData, validate, setClear } = useFormStore();
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    const valid = validate({
      tj_name: { required: true },
    });

    if (!valid) return;
    setLoading(true);
    try {
      await postCategoryREQ({
        mime: data?.mime || 'branch',
        ...data,
        ...(parentId && { _parent_id: parentId }),
      });
      // onSuccess(parentId);
      onSuccess(parentId).then((d) => {
        if (d) setDataTable(d);
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setClear();
  }, [setClear]);

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

        <div className="modal__form">
          <div className="modal__grid">
            <div className="modal__mime">
              <span>Тип категории</span>
              <div className="modal__mime-btns">
                <button
                  type="button"
                  className={`modal__mime-btn ${(!data?.mime || data?.mime === 'branch') ? 'active' : ''}`}
                  onClick={() => setData("mime", "branch")}
                >
                  Проводник
                </button>
                <button
                  type="button"
                  className={`modal__mime-btn ${data?.mime === 'book' ? 'active' : ''}`}
                  onClick={() => setData("mime", "book")}
                >
                  Книга
                </button>
                <button
                  type="button"
                  className={`modal__mime-btn ${data?.mime === 'video' ? 'active' : ''}`}
                  onClick={() => setData("mime", "video")}
                >
                  Видео
                </button>
                <button
                  type="button"
                  className={`modal__mime-btn ${data?.mime === 'audio' ? 'active' : ''}`}
                  onClick={() => setData("mime", "audio")}
                >
                  Аудио
                </button>
              </div>
            </div>
            <Input
              id="tj_name"
              title="Таджикский"
              placeholder="Введите таджикский"
              value={data?.name as string}
              onChange={(v) => setData("tj_name", v)}
              errors={errors}
            />
            <Input
              id="ru_name"
              title="Русский"
              placeholder="Введите русский"
              value={data?.code as string}
              onChange={(v) => setData("ru_name", v)}
              errors={errors}
            />
            <Input
              id="en_name"
              title="Английский"
              placeholder="Введите английский"
              value={data?.code as string}
              onChange={(v) => setData("en_name", v)}
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
      </motion.div>
    </motion.div>
  );
}
