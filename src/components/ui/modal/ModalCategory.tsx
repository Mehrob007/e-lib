"use client";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";
import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import { postCategoryREQ } from "@/api/category";
import { editElementById } from "@/api/element";
import { motion } from "framer-motion";
import "./Modal.css";
import { ItemT } from "@/types/table";

interface Props {
  onClose: () => void;
  onSuccess: (parentId?: string) => void;
  parentId?: string;
  setDataTable: (v: ItemT[]) => void;
  editItem?: ItemT;
}

export default function ModalCategory({
  onClose,
  onSuccess,
  parentId,
  setDataTable,
  editItem,
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
      if (editItem?.id) {
        const updatePayload = {
          translations: [
            {
              language_code: "tj",
              name: data?.tj_name,
              details: {},
            },
            {
              language_code: "ru",
              name: data?.ru_name,
              details: {},
            },
            {
              language_code: "en",
              name: data?.en_name,
              details: {},
            },
          ],
        };
        await editElementById(editItem.id as string, updatePayload);
      } else {
        const createPayload = {
          tj_name: data?.tj_name,
          ru_name: data?.ru_name,
          en_name: data?.en_name,
          _mime: data?.mime || "branch",
          ...(parentId && { _parent_id: parentId }),
        };
        await postCategoryREQ(createPayload as any);
      }

      onSuccess(parentId);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editItem) {
      setData("mime", (editItem.mime as string) || "branch");
      // Use the name object from the new API structure
      const names = editItem.name as any;
      if (typeof names === "object" && names !== null) {
        setData("tj_name", names.tj || "");
        setData("ru_name", names.ru || "");
        setData("en_name", names.en || "");
      } else {
        setData("tj_name", editItem.name as string);
      }
    } else {
      setClear();
    }
  }, [setClear, editItem, setData]);

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
          <h2>{editItem ? "Изменение" : "Добавление"}</h2>
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
                  className={`modal__mime-btn ${!data?.mime || data?.mime === "branch" ? "active" : ""}`}
                  onClick={() => setData("mime", "branch")}
                >
                  Проводник
                </button>
                <button
                  type="button"
                  className={`modal__mime-btn ${data?.mime === "book" ? "active" : ""}`}
                  onClick={() => setData("mime", "book")}
                >
                  Книга
                </button>
                <button
                  type="button"
                  className={`modal__mime-btn ${data?.mime === "video" ? "active" : ""}`}
                  onClick={() => setData("mime", "video")}
                >
                  Видео
                </button>
                <button
                  type="button"
                  className={`modal__mime-btn ${data?.mime === "audio" ? "active" : ""}`}
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
              value={data?.tj_name as string}
              onChange={(v) => setData("tj_name", v)}
              errors={errors}
            />
            <Input
              id="ru_name"
              title="Русский"
              placeholder="Введите русский"
              value={data?.ru_name as string}
              onChange={(v) => setData("ru_name", v)}
              errors={errors}
            />
            <Input
              id="en_name"
              title="Английский"
              placeholder="Введите английский"
              value={data?.en_name as string}
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
