"use client";
import { deleteBranchREQ, getCategorysREQ } from "@/api/category";
import ModalCategory from "@/components/ui/modal/ModalCategory";
import { LIMIT_REQ } from "@/const/def";
import { useI18nStore } from "@/hooks/useI18nStore";
import { HeaderTableCategory } from "@/const/table";
import TableItems from "@/modules/table/table/TableItems";
import { folderLine } from "@/types/category";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";
import { IoFolderOpen } from "react-icons/io5";

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
        console.log("res", res);
        if (res) {
          return res as ItemT[];
        } else return null;
      } catch (e) {
        console.error(e);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [page, lang],
  );

  const deleteItem = async (id: string) => {
    try {
      const res = await deleteBranchREQ(id);
      console.log("delete category: ", res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const parentId = folderLine?.[folderLine?.length - 1]?.id;
    fetchData(parentId).then((d) => {
      setData(d);
    });
  }, [page, folderLine, fetchData]);
  return (
    <>
      <div className="category__content">
        <header>
          <IoFolderOpen
            className="table__cell-folder"
            onClick={() => {
              setFolderLine(null);
            }}
          />
          <h1>/ </h1>
          <div>
            {folderLine?.map((e, i) => (
              <>
                <span
                  key={i}
                  onClick={() => {
                    setFolderLine(folderLine.slice(0, i + 1));
                  }}
                >
                  {e.name}
                </span>{" "}
                {">"}
              </>
            ))}
          </div>
        </header>
        <TableItems
          deleteItem={deleteItem}
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
      </div>

      {isModalOpen && (
        <ModalCategory
          setDataTable={setData}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
          parentId={folderLine?.[folderLine?.length - 1]?.id}
        />
      )}
    </>
  );
}
