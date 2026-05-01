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
import { motion } from "framer-motion";

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
      const items = (res?.data as unknown as ItemT[])?.map((item) => {
        const details =
          (item.details as { [key: string]: string | number }) || {};
        return {
          ...item,
          ...details,
        } as ItemT;
      });
      setData(items || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  const deleteItem = async (id: string) => {
    try {
      const res = await deleteElementById(id);
      if (res) {
        fetchData();
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
    fetchData();
  }, [fetchData]);

  return (
    <>
      <motion.div
        className="elements__content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <header style={{ marginBottom: "20px" }}>
          <h1 className="title">Управление контентом</h1>
        </header>
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
            gridTemplateColumns:
              "200px 1.5fr 200px 200px 1fr  100px 100px 100px",
          }}
          styleTable={{
            gridTemplateColumns:
              "200px 1.5fr 200px 200px 1fr  100px 100px 100px",
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
      </motion.div>

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
