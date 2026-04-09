import { getCategorysREQ } from "@/api/category";
import Loading from "@/components/ui/loading/Loading";
import { useI18nStore } from "@/hooks/useI18nStore";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";

interface Props {
  setCategory: (v: ItemT) => void;
  category?: ItemT;
}

export default function Header({ setCategory, category }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemT[] | null>(null);
  const lang = useI18nStore(s => s.lang);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategorysREQ({ lang });
      return res as unknown as ItemT[];
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [lang]);

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
        <Loading styles={{ width: "35px", height: "35px", borderWidth: "5px" }} />
      )}
    </header>
  );
}
