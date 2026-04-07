"use client";
import { HeaderTableUser } from "@/const/table";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";
import TableItems from "@/modules/table/table/TableItems";
import { getUsersREQ } from "@/api/user";
import ModalUser from "@/components/ui/modal/Modal";
import { FaUserCircle } from "react-icons/fa";

export default function Specialty() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemT[] | null>(null);
  // const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsersREQ();
      return res as unknown as ItemT[];
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData().then((d) => {
      if (d) setData(d);
    });
  }, [page, fetchData]);

  return (
    <>
      <div className="user__content">
        {
          <TableItems
            loading={loading}
            styleHeader={{ gridTemplateColumns: "1fr 1fr 1fr 100px" }}
            styleTable={{ gridTemplateColumns: "1fr 1fr 1fr 100px" }}
            header={HeaderTableUser}
            items={{
              data: data,
              keys: HeaderTableUser.map((e) => e.key),
            }}
            setPage={setPage}
            page={page}
            openModalAdd={() => setIsModalOpen(true)}
            personIcon={<FaUserCircle className="table__cell-avatar" />}
          />
        }
      </div>

      {isModalOpen && (
        <ModalUser
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}
