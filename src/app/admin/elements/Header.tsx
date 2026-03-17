import { getCategorysREQ } from "@/api/category";
import Loading from "@/components/ui/loading/Loading";
import { LONG_GET_ADMIN } from "@/const/def";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";

interface Props {
  setCategory: (v: ItemT) => void;
  category?: ItemT;
}

export default function Header({ setCategory, category }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemT[] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategorysREQ({ lang: LONG_GET_ADMIN });
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
      if (d) {
        setData(d);
        setCategory(d?.[0]);
      }
    });
  }, [fetchData]);
  return (
    <header className="header-elements-page">
      {!loading ? (
        data?.map((e, i) => (
          <div
            key={i}
            className={
              (category?.id as string) == (e.id as string) ? "active" : ""
            }
            onClick={() => setCategory(e)}
          >
            {e.name as string}
          </div>
        ))
      ) : (
        <Loading styles={{ width: "35px", height: "35px" }} />
      )}
    </header>
  );
}
