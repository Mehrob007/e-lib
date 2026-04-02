import { getCategorysREQ } from "@/api/category";
import Select from "@/components/elements/select/Select";
import { categoryT } from "@/const/api";
import { LANG_GET_ADMIN } from "@/const/def";
import { useFormStore } from "@/hooks/useFormStore";
import { SelectT } from "@/types/input";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useRef, useState } from "react";
import Loading from "../../loading/Loading";
import Forbidden from "../../forbidden/Forbidden";

export default function ModalElementStageOne() {
  const { errors, data, setData } = useFormStore();
  const [loading, setLoading] = useState<boolean>(false);
  //   const [category, setCategory] = useState<ItemT[] | null>(null);
  const [elements, setElements] = useState<SelectT[]>([]);
  const [paramsREQ, setParamsREQ] = useState<categoryT>({
    lang: LANG_GET_ADMIN,
    _parent_id: data?.defPatherId as string,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategorysREQ({ ...paramsREQ });
      return res as unknown as ItemT[];
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [paramsREQ]);

  const lastFetchedId = useRef<string | null>(null);

  useEffect(() => {
    if (
      !fetchData ||
      !paramsREQ?._parent_id ||
      lastFetchedId.current === paramsREQ._parent_id
    ) {
      return;
    }
    lastFetchedId.current = paramsREQ._parent_id;

    fetchData().then((d) => {
      if (d) {
        setElements((prev) => {
          const i = prev.length + 1;
          const key = "branch" + i;
          if (prev.find((el) => el.id === key)) return prev;
          const label = "Ветка " + i;
          return [
            ...prev,
            {
              id: key,
              options: d.map((e) => ({
                label: e?.name as string,
                value: `${e?.id}|${e?.has_children ? 1 : 0}` as string,
              })),
              title: label,
              value: key || "",
              onChange: () => {},
              placeholder: label,
            } as SelectT,
          ];
        });
      }
    });
  }, [fetchData, paramsREQ]);

  return (
    <div className="modal__stage">
      <>
        {
          <>
            {elements.map((e, i) => (
              <Select
                key={i}
                id={e.id}
                title={e.title}
                value={(data?.[e.value] as string) || ""}
                onChange={(value) => {
                  const v = value.split("|")[0];
                  const hasChildren = value.split("|")[1];
                  setData(e.id, value);
                  if (i < elements.length - 1) {
                    const remainingElements = elements.slice(0, i + 1);
                    setElements(remainingElements);
                    for (let j = i + 1; j < elements.length; j++) {
                      setData(elements[j].id, "");
                    }
                  }

                  if (+hasChildren) {
                    setParamsREQ((prev) => ({ ...prev, _parent_id: v }));
                  } else {
                    lastFetchedId.current = null;
                  }
                }}
                options={e.options}
                placeholder={e.placeholder}
                errors={errors}
              />
            ))}
            {loading ? (
              <Loading
                styles={{
                  width: "40px",
                  height: "40px",
                  borderWidth: "5px",
                }}
              />
            ) : (
              ""
            )}
            {!loading && !elements?.length ? <Forbidden /> : ""}
          </>
        }
      </>
    </div>
  );
}
