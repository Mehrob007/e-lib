import { useFormStore } from "@/hooks/useFormStore";
import { ItemT } from "@/types/table";
import ModalElementStageZero from "./ModalElementStageZero";
import ModalElementStageOne from "./ModalElementStageOne";
import ModalElementStageTwo from "./ModalElementStageTwo";

interface Props {
  stage: number;
  defPather?: ItemT;
}

export default function ModalELementStage({ stage, defPather }: Props) {
  const { errors } = useFormStore();

  console.log("errors", errors);

  switch (stage) {
    case 0:
      return <ModalElementStageZero defPather={defPather} />;
    case 1:
      return <ModalElementStageOne />;
    case 2:
      return <ModalElementStageTwo />;
    default:
      return null;
  }
}
