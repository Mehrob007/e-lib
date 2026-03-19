import { getCategorysREQ } from "@/api/category";
import Input from "@/components/elements/input/Input";
import Select from "@/components/elements/select/Select";
import { LANG_GET_ADMIN } from "@/const/def";
import { useFormStore } from "@/hooks/useFormStore";
import { ItemT } from "@/types/table";
import { useState } from "react";

interface Props {
  defPather?: ItemT;
}

export default function ModalElementStageZero({ defPather }: Props) {
  const { errors, data, setData, validate } = useFormStore();
  const [loading, setLoading] = useState<boolean>(false);

  const onSend = async () => {
    const valid = validate({
      // tj_name: { required: true },
    });
    if (!valid) return;
    setLoading(true);
    try {
      await getCategorysREQ({ lang: LANG_GET_ADMIN });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
        onChange={(e) => setData("type", e)}
        options={[
          { value: "1", label: "Видео" },
          { value: "2", label: "Аудио" },
          { value: "3", label: "Текст" },
        ]}
        placeholder="Выберите тип"
        errors={errors}
      />
    </div>
  );
}
