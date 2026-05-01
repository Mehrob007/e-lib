"use client";
import { getSwiper } from "@/api/swiper";
import { deleteElementById, getContentById } from "@/api/element";
import ModalSwiper from "@/components/ui/modal/ModalSwiper";
import { HeaderTableSwiper } from "@/const/table";
import TableItems from "@/modules/table/table/TableItems";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";
import "./SwiperAdmin.css";

import { motion } from "framer-motion";

export default function SwiperPage() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemT[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemT | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSwiper({
        _limit: 10,
        _offset: page * 10,
      });

      if (res) {
        // Flatten details into top-level fields for table display
        const items = (res as unknown as ItemT[]).map((item) => {
          const details =
            (item.details as { [key: string]: string | number }) || {};
          return {
            ...item,
            ...details,
            preview_url: details.file_url,
          } as ItemT;
        });
        setData(items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const deleteItem = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот баннер?")) {
      try {
        await deleteElementById(id);
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const editItem = async (id: string) => {
    try {
      const res = await getContentById(id);
      if (res) {
        // Prepare data for editing - ensure details are mapped if needed
        // getContentById should return the raw item, and ModalSwiper handles it
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
        className="elements__content swiper-admin-container"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <header>
          <h1>Управление баннерами</h1>
        </header>

        <TableItems
          loading={loading}
          styleHeader={{ gridTemplateColumns: "150px 1fr 100px" }}
          styleTable={{
            gridTemplateColumns: "150px 1fr 100px",
          }}
          styles={{ height: "calc(100vh - 198px)" }}
          header={HeaderTableSwiper}
          items={{
            data: data,
            keys: HeaderTableSwiper.map((e) => e.key),
          }}
          setPage={setPage}
          page={page}
          openModalAdd={() => setIsModalOpen(true)}
          deleteItem={deleteItem}
          editItem={editItem}
          personIcon={<div className="swiper-placeholder-icon" />}
        />
      </motion.div>

      {isModalOpen && (
        <ModalSwiper
          setDataTable={setData}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={fetchData}
          editItem={editingItem || undefined}
        />
      )}
    </>
  );
}
