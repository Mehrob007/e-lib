"use client";
import {
  deleteElementById,
  getContentById,
  getCategoryContentREQ,
} from "@/api/element";
import ModalELement from "@/components/ui/modal/ModalElement/ModalElement";
import { HeaderTableELement } from "@/const/table";
import TableItems from "@/modules/table/table/TableItems";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
export default function Page() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemT[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ItemT>();
  const [editingItem, setEditingItem] = useState<ItemT | null>(null);

  const fetchData = useCallback(async () => {
    if (!category?.id) return null;
    setLoading(true);
    try {
      const res = await getCategoryContentREQ(category.id as string, {
        _limit: 25,
        _offset: page * 25,
      });
      // Flatten details into top-level fields for table display
      const items = (res as unknown as ItemT[])?.map((item) => {
        const details =
          (item.details as { [key: string]: string | number }) || {};
        return {
          ...item,
          ...details,
        } as ItemT;
      });
      return items || null;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  const deleteItem = async (id: string) => {
    try {
      const res = await deleteElementById(id);
      if (res) {
        fetchData().then((d) => {
          if (d) setData(d);
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const editItem = async (id: string) => {
    try {
      const res = await getContentById(id);
      if (res) {
        setEditingItem(res);
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (category) {
      fetchData().then((d) => {
        if (d) setData(d);
      });
    }
  }, [page, fetchData, category]);

  console.log("data", data);

  return (
    <>
      <div className="elements__content">
        <Header
          setCategory={(c) => {
            setCategory(c);
            setPage(0);
          }}
          category={category}
        />
        <TableItems
          loading={loading}
          styleHeader={{
            gridTemplateColumns: "200px 1.5fr 1fr 100px 100px 100px",
          }}
          styleTable={{
            gridTemplateColumns: "200px 1.5fr 1fr 100px 100px 100px",
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
          deleteItem={deleteItem}
          editItem={editItem}
        />
      </div>

      {isModalOpen && (
        <ModalELement
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={fetchData}
          defPather={category}
          editItem={editingItem || undefined}
        />
      )}
    </>
  );
}
