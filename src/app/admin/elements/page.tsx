"use client";
import { getElementsREQ } from "@/api/element";
import ModalELement from "@/components/ui/modal/ModalElement";
import { HeaderTableELement } from "@/const/table";
import TableItems from "@/modules/table/table/TableItems";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemT[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async (setLoading: (v: boolean) => void) => {
    setLoading(true);
    try {
      const res = await getElementsREQ();
      if (res) setLoading(false);
      return res as unknown as ItemT[];
    } catch (e) {
      setLoading(false);
      console.error(e);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchData(setLoading).then((d) => {
      if (d) setData(d);
    });
  }, [page, fetchData]);
  return (
    <>
      <div className="elements__content">
        <header></header>
        <TableItems
          loading={loading}
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
        <ModalELement
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}
