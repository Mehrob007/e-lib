"use client";
// import { getSpecialtysREQ } from "@/api/specialty";
import Button from "@/components/elements/button/Button";
// import DashboardLayout from "@/components/ui/sidebar/DashboardLayout";
import Input from "@/components/elements/input/Input";
import { HeaderTableUser } from "@/const/table";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";
import TableItems from "@/modules/table/table/TableItems";
import Modal from "@/components/ui/modal/Modal";
import { getUsersREQ } from "@/api/user";
// import "./specialty.css";

export default function Specialty() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ItemT[] | null>(null);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getUsersREQ();
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
  }, [page, fetchData, search]);

  useEffect(() => {
    if (!isModalOpen) {
      fetchData().then((d) => {
        if (d) setData(d);
      });
    }
  }, [isModalOpen, fetchData]);

  return (
    <>
      <div className="specialty__content">
        <TableItems
          styleHeader={{ gridTemplateColumns: "repeat(var(--cols, 3), 1fr)" }}
          styleTable={{ gridTemplateColumns: "repeat(var(--cols, 3), 1fr)" }}
          header={HeaderTableUser}
          items={{
            data: [
              { username: "test", phone_number: "test", password: "test" },
            ],
            keys: HeaderTableUser.map((e) => e.key),
          }}
          setPage={setPage}
          page={page}
          openModalAdd={() => setIsModalOpen(true)}
          personIcon={true}
        />
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
      )}
    </>
  );
}
