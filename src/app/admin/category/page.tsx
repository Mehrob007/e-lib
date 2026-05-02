"use client";
import { deleteBranchREQ, getCategorysREQ } from "@/api/category";
import ModalCategory from "@/components/ui/modal/ModalCategory";
import ModalTransferBranch from "@/components/ui/modal/ModalTransferBranch";
import { LIMIT_REQ } from "@/const/def";
import { useI18nStore } from "@/hooks/useI18nStore";
import { HeaderTableCategory } from "@/const/table";
import TableItems from "@/modules/table/table/TableItems";
import { folderLine } from "@/types/category";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";
import { IoFolderOpen } from "react-icons/io5";

import { motion } from "framer-motion";
import { RiGitBranchFill } from "react-icons/ri";

export default function Page() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [folderLine, _setFolderLine] = useState<folderLine[] | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("folderLine");
    return saved ? JSON.parse(saved) : null;
  });
  const setFolderLine = (value: folderLine[] | null) => {
    _setFolderLine(value);
    if (value === null) {
      localStorage.removeItem("folderLine");
    } else {
      localStorage.setItem("folderLine", JSON.stringify(value));
    }
  };
  const [data, setData] = useState<ItemT[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemT | null>(null);
  const lang = useI18nStore((s) => s.lang);

  const fetchData = useCallback(
    async (parentId?: string) => {
      setLoading(true);
      try {
        const res = await getCategorysREQ({
          lang,
          _limit: LIMIT_REQ,
          _offset: page,
          _parent_id: parentId,
        });
        if (res) {
          setData(res as ItemT[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [page, lang],
  );

  const deleteItem = async (id: string) => {
    try {
      const res = await deleteBranchREQ(id);
      if (res) {
        const parentId = folderLine?.[folderLine?.length - 1]?.id;
        fetchData(parentId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const editItem = async (id: string) => {
    try {
      const parentId = folderLine?.[folderLine?.length - 1]?.id;
      const res = await getCategorysREQ({
        _parent_id: parentId,
      });

      if (res) {
        const item = (res as ItemT[]).find((c) => c.id === id);
        if (item) {
          setEditingItem(item);
          setIsModalOpen(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const parentId = folderLine?.[folderLine?.length - 1]?.id;
    fetchData(parentId);
  }, [page, folderLine, fetchData]);

  return (
    <>
      <motion.div
        className="category__content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        >
        <h1 className="title">Управление категориями</h1>
        <header>
          <div className="breadcrumb-path">
          <IoFolderOpen
            className="table__cell-folder"
            onClick={() => {
              setFolderLine(null);
            }}
          />
            <h1>/ </h1>
            <div>
              {folderLine?.map((e, i) => (
                <span key={i}>
                  <span
                    onClick={() => {
                      setFolderLine(folderLine.slice(0, i + 1));
                    }}
                  >
                    {e.name}
                  </span>{" "}
                  {">"}
                </span>
              ))}
            </div>
          </div>

          {folderLine && folderLine.length > 0 && (
            <div
              className="transfer-branch"
              onClick={() => setIsTransferModalOpen(true)}
              title="Переместить эту ветку"
            >
              <RiGitBranchFill />
            </div>
          )}
        </header>
        <TableItems
          deleteItem={deleteItem}
          editItem={editItem}
          loading={loading}
          styleHeader={{ gridTemplateColumns: "1fr 100px" }}
          styleTable={{
            gridTemplateColumns: "1fr 100px",
            cursor: "pointer",
          }}
          styles={{ height: "calc(100vh - 198px)" }}
          header={HeaderTableCategory}
          items={{
            data: data,
            keys: HeaderTableCategory.map((e) => e.key),
          }}
          setPage={setPage}
          page={page}
          openModalAdd={() => setIsModalOpen(true)}
          onClick={(data) => {
            setFolderLine([...(folderLine ?? []), data]);
          }}
          personIcon={<IoFolderOpen size={30} className="table__cell-folder" />}
        />
      </motion.div>
      {isModalOpen && (
        <ModalCategory
          setDataTable={setData}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            const parentId = folderLine?.[folderLine?.length - 1]?.id;
            fetchData(parentId);
          }}
          parentId={folderLine?.[folderLine?.length - 1]?.id}
          editItem={editingItem || undefined}
        />
      )}
      {isTransferModalOpen && folderLine && folderLine.length > 0 && (
        <ModalTransferBranch
          onClose={() => setIsTransferModalOpen(false)}
          onSuccess={() => {
            // After transfer, go back to root as the current branch moved
            setFolderLine(null);
          }}
          branchId={folderLine[folderLine.length - 1].id}
          branchName={folderLine[folderLine.length - 1].name}
        />
      )}
    </>
  );
}
