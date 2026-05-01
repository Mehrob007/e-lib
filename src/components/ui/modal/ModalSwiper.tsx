"use client";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { LuX, LuPlus, LuTrash2 } from "react-icons/lu";
import { postSwiper, getSwiperPresigned } from "@/api/swiper";
import { editElementById } from "@/api/element";
import { motion } from "framer-motion";
import axios from "axios";
import "./Modal.css";
import "./ModalSwiper.css";
import { ItemT } from "@/types/table";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  setDataTable: (v: ItemT[]) => void;
  editItem?: ItemT;
}

export default function ModalSwiper({
  onClose,
  onSuccess,
  setDataTable,
  editItem,
}: Props) {
  const { errors, data, setData, validate, setClear } = useFormStore();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData("photo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setData("photo_preview", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setData("photo", "");
    setData("photo_preview", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSend = async () => {
    const valid = validate({
      name: { required: true },
    });

    if (!valid) return;

    setLoading(true);
    try {
      let mime = editItem?.mime;
      let preview_key = editItem?.preview_key;

      if (data.photo instanceof File) {
        // 1. Get presigned URL
        const presignedRes = await getSwiperPresigned({
          filename: (data.photo as File).name,
        });
        if (!presignedRes) throw new Error("Failed to get presigned URL");

        const { upload_url, object_key, mime: newMime } = presignedRes;
        mime = newMime;
        preview_key = object_key;

        // 2. Upload file to S3
        await axios.put(upload_url, data.photo, {
          headers: {
            "Content-Type": (data.photo as File).type,
          },
        });
      } else if (!editItem && !data.photo) {
        alert("Выберите изображение для баннера");
        setLoading(false);
        return;
      }

      // 3. Save swiper
      const payload = {
        name: data.name as string,
        details: {
          link: data?.link as string,
          mime: mime as string,
          preview_key: preview_key as string,
        },
      };

      if (editItem?.id) {
        await editElementById(editItem.id as string, payload);
      } else {
        await postSwiper({
          _limit: 10,
          _offset: 0,
          data: payload,
        });
      }

      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Произошла ошибка при сохранении баннера");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editItem) {
      setData("name", editItem.name as string);
      setData("link", editItem.link as string);
      setData("photo_preview", editItem.preview_url as string);
    } else {
      setClear();
    }
  }, [setClear, editItem, setData]);

  console.log("data", data);
  

  return (
    <motion.div
      className="modal__overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal__card swiper-modal"
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
          <h2>{editItem ? "Изменение баннера" : "Добавление баннера"}</h2>
          <button className="modal__close" onClick={onClose}>
            <LuX size={18} />
          </button>
        </header>

        <div className="modal__form">
          <div className="modal__grid swiper-grid">
            <div
              className="swiper-upload-box"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              {data?.photo_preview ? (
                <>
                  <img
                    src={data.photo_preview as string}
                    alt="Banner Preview"
                    className="swiper-preview-img"
                  />
                  <button className="swiper-delete-btn" onClick={removeImage}>
                    <LuTrash2 size={16} />
                  </button>
                </>
              ) : (
                <div className="swiper-placeholder">
                  <LuPlus size={32} />
                  <span>Нажмите для загрузки изображения</span>
                </div>
              )}
            </div>

            <Input
              id="name"
              title="Название баннера"
              placeholder="Введите название"
              value={data?.name as string}
              onChange={(v) => setData("name", v)}
              errors={errors}
            />
            <Input
              id="link"
              title="Ссылка"
              placeholder="Введите ссылку"
              value={data?.link as string}
              onChange={(v) => setData("link", v)}
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
              {loading ? "Загрузка..." : "Сохранить"}
            </button>
          </footer>
        </div>
      </motion.div>
    </motion.div>
  );
}
