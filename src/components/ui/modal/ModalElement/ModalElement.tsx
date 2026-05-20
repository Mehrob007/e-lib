"use client";
import { useFormStore } from "@/hooks/useFormStore";
import { useEffect, useState } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import {
  editElementById,
  getPresignedUrlREQ,
  postSaveContentREQ,
  putFileREQ,
} from "@/api/element";
import ModalELementStage from "./ModalElementStage";
import { ItemT } from "@/types/table";
import { motion, AnimatePresence } from "framer-motion";
import "../Modal.css";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  defPather?: ItemT;
  editItem?: ItemT;
}

export default function ModalELement({
  onClose,
  onSuccess,
  defPather,
  editItem,
}: Props) {
  const { data, setData, validate, setClear } = useFormStore();
  const [loading, setLoading] = useState<string | null>("");
  const [stage, setStage] = useState(0);
  const stages = [
    { id: 0, title: "Тип" },
    { id: 1, title: "Категория" },
    { id: 2, title: "Данные" },
  ];

  const handleClose = () => {
    setClear();
    onClose();
  };

  const next = () => {
    if (stage === 0) {
      const valid = validate(
        Object.fromEntries(
          Object.keys(data).map((key) => [key, { required: true }]),
        ),
      );
      if (!valid) return;
      setStage(1);
      // setData("defPatherId", defPather?.id as string);
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
    const currentMime = (data?.mime || data?._mime || data?.type || "")
      .toString()
      .toLowerCase();
    const isVideo = currentMime.includes("video");

    const valid = validate({
      name: { required: true },
      lang_id: { required: true },
      ...(!isVideo
        ? {
            author: { required: true },
            pages: { required: true },
            created: { required: true },
          }
        : {}),
      ...(!data.photo_preview && !data.photo
        ? { photo: { required: true } }
        : {}),
      ...(!data.file && !editItem ? { file: { required: true } } : {}),
    });

    if (!valid) return;

    let branchId = (editItem?.branch_id as string) || "";
    if (!branchId) {
      let highestIndex = 0;
      Object.keys(data).forEach((key) => {
        if (key.startsWith("branch")) {
          const index = parseInt(key.replace("branch", ""), 10);
          if (index > highestIndex && data[key]) {
            highestIndex = index;
            branchId = (data[key] as string).split("|")[0];
          }
        }
      });
    }

    if (!branchId && !editItem) {
      console.error("No branch selected");
      return;
    }

    const file = data.file as File;
    const coverFile = data.photo as File;

    setLoading("upload");
    try {
      const editDetails = (editItem?.details as Record<string, unknown>) || {};
      let fileUrl = editItem?.file_url as string;
      let previewUrl = editItem?.preview_url as string;
      let type = editDetails.type as string;

      if (file || coverFile) {
        setLoading("uploading");
        const presignedData = await getPresignedUrlREQ(
          crypto.randomUUID() as string,
          file?.name || "file",
        );
        if (!presignedData) throw new Error("Failed to get presigned URL");

        if (file) {
          await putFileREQ(presignedData.upload_url, file);
          fileUrl = presignedData.file_url;
          type = presignedData.type as string;
        }

        if (coverFile && presignedData.upload_preview_url) {
          setLoading("uploading_preview");
          await putFileREQ(presignedData.upload_preview_url, coverFile);
          previewUrl = presignedData.preview_url;
        }
      }

      setLoading("saving");

      const payload = {
        branch_id: branchId,
        name: data.name as string,
        details: {
          type: (type as string) || (editDetails.type as string) || "",
          author: (data.author as string) || "",
          pages: (data.pages as string) || "",
          created: (data.created as string) || "",
          annotation: (data.annotation as string) || "",
          lang_id: (data.lang_id as string) || "",
          file_url: (fileUrl as string) || "",
          preview_url: (previewUrl as string) || "",
          file_size:
            (data.file_size as string) ||
            (editDetails.file_size as string) ||
            "",
        },
      };

      if (editItem?.id) {
        await editElementById(editItem.id as string, payload);
      } else {
        await postSaveContentREQ(payload);
      }

      onSuccess();
      handleClose();
    } catch (e) {
      console.error(e);
      setLoading(null);
    }
  };

  useEffect(() => {
    if (editItem) {
      // Pre-fill form for editing
      const details = (editItem.details as ItemT) || {};
      setData("name", editItem.name as string);
      setData("author", (editItem.author || details.author || "") as string);
      setData("pages", (editItem.pages || details.pages || "") as string);
      setData("created", (editItem.created || details.created || "") as string);
      setData(
        "annotation",
        (editItem.annotation || details.annotation || "") as string,
      );
      setData("lang_id", (editItem.lang_id || details.lang_id || "") as string);
      setData(
        "photo_preview",
        (editItem.preview_url || details.preview_url || "") as string,
      );
      const type = (editItem.type || details.type || "") as string;
      const mime = details.type as string;

      setData("type", type);
      setData("mime", mime);
      setStage(2);
    } else {
      setClear();
      setData("type", "");
    }
  }, [editItem, setData, setClear]);

  return (
    <motion.div
      className="modal__overlay"
      onClick={handleClose}
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
          <button className="modal__close" onClick={handleClose}>
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
            <button className="modal__btn-cancel" onClick={handleClose}>
              Отмена
            </button>
            <button
              className="modal__btn-save"
              onClick={() => (stage === 2 ? onSend() : next())}
              disabled={!!loading}
            >
              {loading === "upload" || loading === "uploading"
                ? "Загрузка файла..."
                : loading === "saving"
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
