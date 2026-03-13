import { create } from "zustand";

export const globalState = create<{
  modal: boolean;
  setModal: (value: boolean) => void;
  toast: { active: boolean; type: "error" | "success" };
  setToast: (value: { active: boolean; type: "error" | "success" }) => void;
  openModalKey: string;
  setOpenModalKey: (key: string) => void;
  checkKeyModal: (key: string) => boolean;
}>((set, get) => ({
  modal: false,
  setModal: (value: boolean) => set(() => ({ modal: value })),
  toast: { active: true, type: "error" },
  setToast: (value: { active: boolean; type: "error" | "success" }) =>
    set(() => ({ toast: value })),
  openModalKey: "",
  setOpenModalKey: (key: string) => set(() => ({ openModalKey: key })),
  checkKeyModal: (key: string) => get().openModalKey === key,
}));
