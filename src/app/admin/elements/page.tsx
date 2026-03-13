"use client";
import { getElementsREQ } from "@/api/element";
import ModalCatalog from "@/components/ui/modal/ModalCatalog";
import { HeaderTableELement } from "@/const/table";
import TableItems from "@/modules/table/table/TableItems";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
  const [page, setPage] = useState(1);
  //   const [folderLine, setFolderLine] = useState<folderLine | null>(null);
  const [data, setData] = useState<ItemT[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getElementsREQ();
      return res as unknown as ItemT[];
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchData().then((d) => {
      if (d) setData(d);
    });
  }, [page, fetchData]);
  return (
    <>
      <div className="elements__content">
        <header></header>
        <TableItems
          styleHeader={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 100px" }}
          styleTable={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 100px",
          }}
          styles={{ height: "calc(100vh - 198px)" }}
          header={HeaderTableELement}
          items={{
            data: data,
            keys: HeaderTableELement.map((e) => e.key),
          }}
          setPage={setPage}
          page={page}
          openModalAdd={() => setIsModalOpen(true)}
        />
      </div>

      {isModalOpen && (
        <ModalCatalog
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}
