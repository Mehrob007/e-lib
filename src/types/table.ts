import { StaticImageData } from "next/image";
import { styleT } from "./def";

export interface ItemT {
  [key: string]:
    | string
    | number
    | StaticImageData
    | { name: string }
    | { [key: string]: string | number };
}

export interface TableHeaderT {
  name: string;
  key?: string;
  icon?: boolean;
}

export type FilterREQ = {
  ColumnName?: string;
  SortType?: "asc" | "desc";
};

export interface TableItemsT {
  header?: TableHeaderT[];
  items?: { data: ItemT[]; keys: string[] };
  styles?: styleT;
  styleHeader?: styleT;
  styleTable?: styleT;
  //   renderItems,
  editItem?: (id: number) => void;
  deleteItem?: (id: number) => void;
  setPage?: (value: number) => void;
  page?: number;
  //   activeButton
  filterREQ?: FilterREQ;
  setFilterREQ?: (value: FilterREQ) => void;
  onFilter?: boolean;
  openModalAdd: () => void;
  personIcon?: boolean;
}

export interface TableItemT {
  keys: string[];
  data: ItemT;
  styleTable?: styleT;
  personIcon?: boolean;
}
