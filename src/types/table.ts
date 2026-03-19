import { StaticImageData } from "next/image";
import { styleT } from "./def";
import { ReactElement } from "react";
import { folderLine } from "./category";

export interface ItemT {
  [key: string]:
    | string
    | boolean
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
  loading?: boolean;
  header?: TableHeaderT[];
  items?: { data: ItemT[] | null; keys: string[] };
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
  personIcon?: ReactElement;
  onClick?: (data: folderLine) => void;
}

export interface TableItemT {
  keys: string[];
  data: ItemT;
  styleTable?: styleT;
  personIcon?: ReactElement;
  onClick?: (data: folderLine) => void;
}
