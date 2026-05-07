"use client";
import {
  deleteElementById,
  getContentById,
  getCategoryContentREQ,
  searchElementsREQ,
} from "@/api/element";
import ModalELement from "@/components/ui/modal/ModalElement/ModalElement";
import { HeaderTableELement } from "@/const/table";
import TableItems from "@/modules/table/table/TableItems";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import { motion } from "framer-motion";
import { TbSearch, TbPlus, TbFilter } from "react-icons/tb";
import { SORT_TYPES } from "@/const/def";

export default function Page() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemT[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ItemT>();
  const [editingItem, setEditingItem] = useState<ItemT | null>(null);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (!category?.id) return null;
    if (search) return;

    setLoading(true);
    try {
      const res = await getCategoryContentREQ(category.id as string, {
        _limit: 25,
        _offset: page * 25,
        type: sortType || undefined,
      });
      const items = (res?.data as unknown as ItemT[])?.map((item) => {
        const details =
          (item.details as { [key: string]: string | number }) || {};
        const parent =
          (item.parent as { [key: string]: string | number }) || {};
        return {
          ...item,
          ...details,
          ...parent,
        } as ItemT;
      });
      setData(items || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, page, search, sortType]);

  const handleSearch = async (val: string) => {
    setSearch(val);
    if (!val) {
      fetchData();
      return;
    }
    setLoading(true);
    try {
      const res = await searchElementsREQ(val);
      const items = (res as ItemT[])?.map((item) => {
        const details = (item.details as Record<string, string | number>) || {};
        const parent = (item.parent as Record<string, string | number>) || {};

        return {
          ...item,
          ...details,
          ...parent,
        } as ItemT;
      });
      setData(items || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await deleteElementById(id);
      if (res) {
        if (search) {
          handleSearch(search);
        } else {
          fetchData();
        }
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
  }, [fetchData, sortType]);

  console.log("sortType", sortType);

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
            setSearch("");
          }}
          category={category}
        />
        <div className="elements__search">
          <div className="search-input-wrapper">
            <TbSearch className="search-icon" />
            <input
              type="text"
              placeholder="Поиск по названию, автору..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="category-select-wrapper"
          >
            <TbFilter className="filter-icon" />
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="category-select"
            >
              <option value="">Все типы</option>
              {SORT_TYPES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </motion.div>
          <button className="add-btn-main" onClick={() => setIsModalOpen(true)}>
            <TbPlus size={20} />
            Добавить контент
          </button>
        </div>
        <TableItems
          loading={loading}
          styleHeader={{
            gridTemplateColumns: "100px 2fr 120px 150px 1.5fr 80px 120px 100px",
          }}
          styleTable={{
            gridTemplateColumns: "100px 2fr 120px 150px 1.5fr 80px 120px 100px",
          }}
          styles={{ maxHeight: "calc(100vh - 360px)" }}
          header={HeaderTableELement}
          items={{
            data: data,
            keys: HeaderTableELement.map((e) => e.key),
          }}
          setPage={setPage}
          page={page}
          // openModalAdd={() => setIsModalOpen(true)}
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
          onSuccess={search ? () => handleSearch(search) : fetchData}
          defPather={category}
          editItem={editingItem || undefined}
        />
      )}
    </>
  );
}
