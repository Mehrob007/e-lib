"use client";
import Input from "@/components/elements/input/Input";
import { useFormStore } from "@/hooks/useFormStore";
import { useEffect, useState } from "react";
import "./Modal.css";
import { postElementREQ } from "@/api/element";
import { ItemT } from "@/types/table";

interface Props {
  stage: number;
  defPather?: ItemT;
}

export default function ModalELementStage({ stage, defPather }: Props) {
  const { errors, data, setData, validate, setClear } = useFormStore();
  const [loading, setLoading] = useState<string | null>("");

  useEffect(() => {
    setClear();
  }, [setClear]);

  const onSend = async () => {
    const valid = validate({
      // tj_name: { required: true },
    });

    if (!valid) return;
    setLoading("send");
    try {
      await postElementREQ(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  if (stage === 1) {
    return <div className="modal__stage"></div>;
  } else if (stage === 2) {
    return <div className="modal__stage"></div>;
  } else {
    return (
      <div className="modal__stage">
        <Input
          id="def_pather_id"
          title="Раздел"
          placeholder="Введите раздел"
          value={defPather?.name as string}
          onChange={() => {}}
          errors={errors}
        />
        <Input
          id="def_pather_id"
          title="Тип"
          placeholder="Введите тип"
          value={defPather?.name as string}
          onChange={() => {}}
          errors={errors}
        />
      </div>
    );
  }
}
