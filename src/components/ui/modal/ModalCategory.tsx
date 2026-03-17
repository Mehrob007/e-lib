"use client";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";
import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import { postCategoryREQ } from "@/api/category";
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

  useEffect(() => {
    setClear();
  }, [setClear]);

  const onSend = async () => {
    const valid = validate({
      tj_name: { required: true },
    });

    if (!valid) return;
    setLoading(true);
    try {
      await postCategoryREQ({
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
      </div>
    </div>
  );
}
