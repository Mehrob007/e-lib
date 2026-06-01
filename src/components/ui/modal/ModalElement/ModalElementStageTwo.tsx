import Select from "@/components/elements/select/Select";
import { useFormStore } from "@/hooks/useFormStore";
import { ChangeEvent, useRef, useState } from "react";
import { LuPlus, LuTrash2, LuCheck } from "react-icons/lu";
import "./ModalElementStageTwo.css";
import apiClient from "@/utils/apiClient";

export default function ModalElementStageTwo() {
  const { data, setData, errors } = useFormStore();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressError, setCompressError] = useState<string | null>(null);

  const stripMetadata = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const cleanFile = new File([blob], file.name, {
                  type: outType,
                  lastModified: Date.now(),
                });
                resolve(cleanFile);
              } else {
                reject(new Error("Canvas toBlob failed"));
              }
            },
            outType,
            1.0
          );
        };
        img.onerror = (error) => reject(error);
        if (event.target?.result) {
          img.src = event.target.result as string;
        } else {
          reject(new Error("FileReader failed"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const cleanFile = await stripMetadata(file);
        setData("photo", cleanFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setData("photo_preview", reader.result as string);
        };
        reader.readAsDataURL(cleanFile);
      } catch (error) {
        console.error("Metadata stripping error:", error);
        // Fallback to original file
        setData("photo", file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setData("photo_preview", reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCompressPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentFile = data?.file as File;
    if (!currentFile) return;

    setIsCompressing(true);
    setCompressError(null);

    try {
      const formData = new FormData();
      formData.append("file", currentFile);

      const response = await apiClient.post("/file_routes/file/compress-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      if (response.status === 200) {
        const compressedBlob = response.data;
        const compressedFile = new File([compressedBlob], `compressed_${currentFile.name}`, {
          type: "application/pdf",
          lastModified: Date.now(),
        });

        setData("file", compressedFile);
        
        const sizeInBytes = compressedFile.size;
        let formattedSize = "";
        if (sizeInBytes < 1024) formattedSize = `${sizeInBytes} B`;
        else if (sizeInBytes < 1024 * 1024) formattedSize = `${(sizeInBytes / 1024).toFixed(1)} KB`;
        else formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
        
        setData("file_size", formattedSize);
      }
    } catch (error: any) {
      console.error("PDF compression error:", error);
      if (error.response?.status === 400) {
        setCompressError("Допускаются только файлы формата PDF");
      } else {
        setCompressError("Произошла ошибка при обработке файла. Попробуйте загрузить другой документ");
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let finalFile = file;

      
      // Check if it's a PDF
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        // finalFile = await compressPDF(file);
      }

      setData("file", finalFile);
      
      const sizeInBytes = finalFile.size;
      let formattedSize = "";
      if (sizeInBytes < 1024) formattedSize = `${sizeInBytes} B`;
      else if (sizeInBytes < 1024 * 1024) formattedSize = `${(sizeInBytes / 1024).toFixed(1)} KB`;
      else formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      
      setData("file_size", formattedSize);
      setCompressError(null);
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

  console.log("data", data);
  
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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

        <div className="stage-two__fields">
          <div className="stage-two__upload-file-row">
            <button
              className={`stage-two__upload-btn ${data?.file ? "uploaded" : ""} ${errors?.file ? "error" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
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
                disabled={isCompressing}
              />
              {data?.file || data?.file_url ? (
                <>
                  <LuCheck size={16} style={{ color: "#4caf50" }} />
                  <span>Загружено {data?.file_size ? `(${data.file_size})` : ""}</span>
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
              <>
                <button className="stage-two__delete-file" onClick={removeFile} disabled={isCompressing}>
                  <LuTrash2 size={18} />
                </button>
                {data.file instanceof File && (data.file.type === "application/pdf" || data.file.name.toLowerCase().endsWith(".pdf")) && (
                  <button 
                    className="stage-two__compress-file-btn" 
                    onClick={handleCompressPDF}
                    disabled={isCompressing}
                    style={{ marginLeft: "10px", padding: "5px 15px", cursor: isCompressing ? "not-allowed" : "pointer", background: isCompressing ? "#e0e0e0" : "#4caf50", color: "#fff", border: "none", borderRadius: "4px", fontSize: "14px", fontWeight: "bold" }}
                  >
                    {isCompressing ? "Сжатие..." : "Сжать"}
                  </button>
                )}
              </>
            )}
          </div>
          {compressError && <span className="stage-two__error-text" style={{ display: 'block', marginTop: '5px' }}>{compressError}</span>}
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
