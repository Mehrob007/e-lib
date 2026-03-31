"use client";
import { getElementsREQ } from "@/api/element";
import ModalELement from "@/components/ui/modal/ModalElement/ModalElement";
import { HeaderTableELement } from "@/const/table";
import TableItems from "@/modules/table/table/TableItems";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";
import Header from "./Header";

export default function Page() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemT[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ItemT>();

  const fetchData = useCallback(async () => {
    if (!category?.id) return null;
    setLoading(true);
    try {
      const res = await getElementsREQ(category.id as string);
      // Flatten details into top-level fields for table display
      const items = (res as unknown as ItemT[])?.map((item) => {
        const details =
          (item.details as { [key: string]: string | number }) || {};
        return {
          ...item,
          author: details.author || "—",
          year: details.year || "—",
          pages: details.pages || "—",
        } as ItemT;
      });
      return items || null;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (category) {
      fetchData().then((d) => {
        if (d) setData(d);
      });
    }
  }, [page, fetchData, category]);
  return (
    <>
      <div className="elements__content">
        <Header setCategory={setCategory} category={category} />
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
          defPather={category}
        />
      )}
    </>
  );
}
