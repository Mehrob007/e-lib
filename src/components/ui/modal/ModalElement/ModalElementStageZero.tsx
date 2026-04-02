import { getCategorysREQ } from "@/api/category";
import Input from "@/components/elements/input/Input";
import Select from "@/components/elements/select/Select";
import { LANG_GET_ADMIN } from "@/const/def";
import { useFormStore } from "@/hooks/useFormStore";
import { SelectT } from "@/types/input";
import { ItemT } from "@/types/table";
import { useCallback, useEffect, useState } from "react";

interface Props {
  defPather?: ItemT;
}

export default function ModalElementStageZero({ defPather }: Props) {
  const { errors, data, setData, validate } = useFormStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategorysREQ({
        lang: LANG_GET_ADMIN,
        _parent_id: defPather?.id as string,
      });
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
        setOptions(
          d?.map((e) => ({
            value: e.id as string,
            label: e.name as string,
          })),
        );
      }
    });
  }, [fetchData]);
  return (
    <div className="modal__stage">
      <Input
        id="def_pather_id"
        title="Раздел"
        placeholder="Введите раздел"
        value={defPather?.name as string}
        errors={errors}
      />

      <Select
        id="type"
        title="Тип"
        value={(data?.type as string) || ""}
        onChange={(e) => {
          setData("defPatherId", e);
          setTimeout(() => setData("type", e), 10);
        }}
        options={options}
        placeholder="Выберите тип"
        errors={errors}
      />
    </div>
  );
}
