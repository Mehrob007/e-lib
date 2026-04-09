import Select from "@/components/elements/select/Select";
import { useFormStore } from "@/hooks/useFormStore";
import { ChangeEvent, useRef } from "react";
import { LuPlus, LuTrash2, LuCheck } from "react-icons/lu";
import "./ModalElementStageTwo.css";

export default function ModalElementStageTwo() {
  const { data, setData, errors } = useFormStore();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData("photo", file);
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setData("photo_preview", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData("file", file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setData("photo", "");
    setData("photo_preview", "");
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setData("file", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isAudio = data?.mime === "audio";
  const isVideo = data?.mime === "video";

  console.log("data?.mime", data?.mime);

  return (
    <div className="stage-two">
      <div className="stage-two__main">
        {/* Left Column: Cover Upload */}
        <div
          className="stage-two__upload-cover"
          onClick={() => coverInputRef.current?.click()}
        >
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          {data?.photo_preview ? (
            <>
              <img src={data.photo_preview as string} alt="Cover Preview" />
              <button className="stage-two__delete-cover" onClick={removeImage}>
                <LuTrash2 size={16} />
              </button>
            </>
          ) : (
            <div className="stage-two__upload-placeholder">
              <LuPlus size={32} />
              <span>
                Загрузить
                <br />
                Обложку
              </span>
            </div>
          )}
        </div>

        {/* Right Column: File Upload and Inputs */}
        <div className="stage-two__fields">
          <div className="stage-two__upload-file-row">
            <button
              className={`stage-two__upload-btn ${data?.file ? "uploaded" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={
                  isAudio
                    ? "audio/*"
                    : isVideo
                      ? "video/*"
                      : "application/pdf,.doc,.docx"
                }
                style={{ display: "none" }}
              />
              {data?.file ? (
                <>
                  <LuCheck size={16} style={{ color: "#4caf50" }} />
                  <span>Загружено</span>
                </>
              ) : (
                <>
                  <LuPlus size={16} />
                  <span>
                    {isAudio
                      ? "Загрузить аудио"
                      : isVideo
                        ? "Загрузить видео"
                        : "Загрузить книгу"}
                  </span>
                </>
              )}
            </button>
            {data?.file && (
              <button className="stage-two__delete-file" onClick={removeFile}>
                <LuTrash2 size={18} />
              </button>
            )}
          </div>

          <div style={{ width: "100%", maxWidth: "200px" }}>
            <Select
              id="lang_id"
              title="Язык"
              value={(data?.lang_id as string) || ""}
              onChange={(e) => setData("lang_id", e)}
              options={[
                { value: "1", label: "Таджикский язык" },
                { value: "2", label: "Русский язык" },
                { value: "3", label: "Английский язык" },
              ]}
              placeholder="Язык"
              errors={errors}
            />
          </div>

          <div className="stage-two__input-row">
            <label>Название:</label>
            <input
              type="text"
              value={(data?.name as string) || ""}
              onChange={(e) => setData("name", e.target.value)}
              placeholder={
                isAudio
                  ? "Например, Лунная соната"
                  : isVideo
                    ? "Например, Начало"
                    : "Например, Граф Монте-Кристо"
              }
            />
          </div>

          <div className="stage-two__input-row">
            <label>
              {isAudio
                ? "Исполнитель/Автор:"
                : isVideo
                  ? "Режиссер/Автор:"
                  : "Автор:"}
            </label>
            <input
              type="text"
              value={(data?.author as string) || ""}
              onChange={(e) => setData("author", e.target.value)}
              placeholder={
                isAudio
                  ? "Бетховен"
                  : isVideo
                    ? "Кристофер Нолан"
                    : "Александр Дюма"
              }
            />
          </div>

          <div className="stage-two__input-row">
            <label>{isAudio || isVideo ? "Длительность:" : "Страницы:"}</label>
            <input
              type="text"
              value={(data?.pages as string) || ""}
              onChange={(e) => setData("pages", e.target.value)}
              placeholder={isAudio || isVideo ? "Например, 1:30:00" : "544"}
            />
          </div>

          <div className="stage-two__input-row">
            <label>{isVideo ? "Год выхода:" : "Год издания:"}</label>
            <input
              type="text"
              value={(data?.created as string) || ""}
              onChange={(e) => setData("created", e.target.value)}
              placeholder="2025"
            />
          </div>
        </div>
      </div>

      <div className="stage-two__annotation">
        <label>Аннотация</label>
        <textarea
          value={(data?.annotation as string) || ""}
          onChange={(e) => setData("annotation", e.target.value)}
          placeholder="Введите аннотацию к материалу..."
        />
      </div>
    </div>
  );
}
