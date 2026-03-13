"use client";
import { getCategorysREQ } from "@/api/category";
import ModalCategory from "@/components/ui/modal/ModalCategory";
import { LIMIT_REQ, LONG_GET_ADMIN } from "@/const/def";
import { HeaderTableCategory } from "@/const/table";
import TableItems from "@/modules/table/table/TableItems";
import { folderLine } from "@/types/category";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";
import { IoFolderOpen } from "react-icons/io5";

export default function Page() {
  const [page, setPage] = useState(1);
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
  const [parentId, setParentId] = useState("");
  const [data, setData] = useState<ItemT[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(
    async (
      setLoading: (v: boolean) => void,
      page?: number,
      parentId?: string,
    ) => {
      setLoading(true);
      try {
        const res = await getCategorysREQ({
          lang: LONG_GET_ADMIN,
          _limit: LIMIT_REQ,
          _offset: page,
          _parent_id: parentId,
        });
        if (res) setLoading(false);
        return res as unknown as ItemT[];
      } catch (e) {
        console.error(e);
        setLoading(false);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    fetchData(setLoading, page, parentId).then((d) => {
      if (d) setData(d);
    });
  }, [page, parentId, fetchData]);
  return (
    <>
      <div className="category__content">
        <header>
          <IoFolderOpen
            className="table__cell-folder"
            onClick={() => {
              setParentId("");
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
                    setParentId(e.id);
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
            setParentId(data?.id);
            setFolderLine([...(folderLine ?? []), data]);
          }}
          personIcon={<IoFolderOpen size={30} className="table__cell-folder" />}
        />
      </div>

      {isModalOpen && (
        <ModalCategory
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}
