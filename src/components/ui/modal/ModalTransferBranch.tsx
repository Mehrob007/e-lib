"use client";
import { getCategorysREQ, editBranchPathREQ } from "@/api/category";
import { LIMIT_REQ } from "@/const/def";
import { useI18nStore } from "@/hooks/useI18nStore";
import { ItemT } from "@/types/table";
import { folderLine } from "@/types/category";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { LuX, LuChevronRight, LuFolder, LuFolderOpen, LuArrowRight } from "react-icons/lu";
import "./Modal.css";
import "./ModalTransfer.css";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  branchId: string;
  branchName: string;
}

export default function ModalTransferBranch({
  onClose,
  onSuccess,
  branchId,
  branchName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ItemT[]>([]);
  const [path, setPath] = useState<folderLine[]>([]);
  const lang = useI18nStore((s) => s.lang);

  const fetchCategories = useCallback(async (parentId?: string) => {
    setLoading(true);
    try {
      const res = await getCategorysREQ({
        lang,
        _limit: 100, // Load more for selection
        _offset: 0,
        _parent_id: parentId,
      });
      if (res) {
        // Filter out the branch we are moving to prevent circular references
        setCategories((res as ItemT[]).filter(c => c.id !== branchId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [lang, branchId]);

  useEffect(() => {
    const currentParentId = path[path.length - 1]?.id;
    fetchCategories(currentParentId);
  }, [path, fetchCategories]);

  const handleNavigate = (category: ItemT) => {
    setPath([...path, { id: category.id as string, name: category.name as string }]);
  };

  const handleBack = (index: number) => {
    setPath(path.slice(0, index + 1));
  };

  const handleGoRoot = () => {
    setPath([]);
  };

  const onConfirm = async () => {
    const targetId = path[path.length - 1]?.id || "0"; // "0" or empty for root
    
    setLoading(true);
    try {
      const res = await editBranchPathREQ(branchId, targetId);
      if (res) {
        onSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка при перемещении ветки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="modal__overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 1100 }}
    >
      <motion.div
        className="modal__card transfer-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ width: "500px", maxWidth: "90vw" }}
      >
        <header className="modal__header">
          <div className="transfer-header-info">
            <LuArrowRight size={20} color="#2962ff" />
            <h2>Перемещение ветки</h2>
          </div>
          <p className="transfer-sub">
            Перемещение: <strong>{branchName}</strong>
          </p>
          <button className="modal__close" onClick={onClose}>
            <LuX size={18} />
          </button>
        </header>

        <div className="transfer-body">
          <nav className="transfer-breadcrumb">
            <span onClick={handleGoRoot} className={path.length === 0 ? "active" : ""}>
              Корень
            </span>
            {path.map((p, i) => (
              <span key={p.id}>
                <LuChevronRight size={14} />
                <span onClick={() => handleBack(i)} className={i === path.length - 1 ? "active" : ""}>
                  {p.name}
                </span>
              </span>
            ))}
          </nav>

          <div className="transfer-list-container">
            {loading ? (
              <div className="transfer-loading">Загрузка...</div>
            ) : categories.length > 0 ? (
              <div className="transfer-list">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="transfer-item"
                    onClick={() => handleNavigate(cat)}
                  >
                    <LuFolder size={18} />
                    <span>{cat.name}</span>
                    <LuChevronRight size={16} className="item-arrow" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="transfer-empty">Здесь нет подпапок</div>
            )}
          </div>
        </div>

        <footer className="modal__footer">
          <div className="target-info">
            Переместить в: <strong>{path[path.length - 1]?.name || "Корень"}</strong>
          </div>
          <div className="transfer-actions">
            <button className="modal__btn-cancel" onClick={onClose}>
              Отмена
            </button>
            <button
              className="modal__btn-save"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Перемещение..." : "Переместить сюда"}
            </button>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
}
