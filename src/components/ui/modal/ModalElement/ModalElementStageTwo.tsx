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
      
      const sizeInBytes = file.size;
      let formattedSize = "";
      if (sizeInBytes < 1024) formattedSize = `${sizeInBytes} B`;
      else if (sizeInBytes < 1024 * 1024) formattedSize = `${(sizeInBytes / 1024).toFixed(1)} KB`;
      else formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      
      setData("file_size", formattedSize);
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

  const currentMime = (data?.mime || data?._mime || data?.type || "").toString().toLowerCase();
  const isAudio = currentMime.includes("audio");
  const isVideo = currentMime.includes("video");

  return (
    <div className="stage-two">
      <div className="stage-two__main">
        {/* Left Column: Cover Upload */}
        <div>
          <div
            className={`stage-two__upload-cover ${errors?.photo ? "error" : ""}`}
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
        {errors?.photo && <span className="stage-two__error-text">{errors.photo as string}</span>}
        </div>

        {/* Right Column: File Upload and Inputs */}
        <div className="stage-two__fields">
          <div className="stage-two__upload-file-row">
            <button
              className={`stage-two__upload-btn ${data?.file ? "uploaded" : ""} ${errors?.file ? "error" : ""}`}
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
                    : "application/pdf,.doc,.docx,.epub,.txt,application/epub+zip,text/plain"
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
          {errors?.file && <span className="stage-two__error-text">{errors.file as string}</span>}

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

          <div className={`stage-two__input-row ${errors?.name ? "error" : ""}`}>
            <label>Название:</label>
            <input
              type="text"
              value={(data?.name as string) || ""}
              onChange={(e) => setData("name", e.target.value)}
              autoComplete="off"
              placeholder={
                isAudio
                  ? "Например, Лунная соната"
                  : isVideo
                    ? "Например, Начало"
                    : "Например, Граф Монте-Кристо"
              }
            />
          </div>
          {errors?.name && <span className="stage-two__error-text">{errors.name as string}</span>}

          {!isVideo && (
            <>
              <div className={`stage-two__input-row ${errors?.author ? "error" : ""}`}>
                <label>{isAudio ? "Исполнитель/Автор:" : "Автор:"}</label>
              <input
                type="text"
                value={(data?.author as string) || ""}
                onChange={(e) => setData("author", e.target.value)}
                autoComplete="off"
                placeholder={isAudio ? "Бетховен" : "Александр Дюма"}
              />
              </div>
              {errors?.author && <span className="stage-two__error-text">{errors.author as string}</span>}
            </>
          )}

          {!isVideo && (
            <>
              <div className={`stage-two__input-row ${errors?.pages ? "error" : ""}`}>
                <label>{isAudio ? "Длительность:" : "Страницы:"}</label>
              <input
                type="text"
                value={(data?.pages as string) || ""}
                onChange={(e) => setData("pages", e.target.value)}
                autoComplete="off"
                placeholder={isAudio ? "Например, 1:30:00" : "544"}
              />
              </div>
              {errors?.pages && <span className="stage-two__error-text">{errors.pages as string}</span>}
            </>
          )}

         {!isVideo && (
            <>
              <div className={`stage-two__input-row ${errors?.created ? "error" : ""}`}>
                <label>{isVideo ? "Год выхода:" : "Год издания:"}</label>
            <input
              type="text"
              value={(data?.created as string) || ""}
              onChange={(e) => setData("created", e.target.value)}
              autoComplete="off"
              placeholder="2025"
              />
              </div>
              {errors?.created && <span className="stage-two__error-text">{errors.created as string}</span>}
            </>
          )}
        </div>
      </div>

      {!isVideo && (
        <div className={`stage-two__annotation ${errors?.annotation ? "error" : ""}`}>
          <label>Аннотация</label>
          <textarea
            className={errors?.annotation ? "error" : ""}
            value={(data?.annotation as string) || ""}
            onChange={(e) => setData("annotation", e.target.value)}
            autoComplete="off"
            placeholder="Введите аннотацию к материалу..."
          />
          {errors?.annotation && <span className="stage-two__error-text">{errors.annotation as string}</span>}
        </div>
      )}
    </div>
  );
}
