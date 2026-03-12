import { TableItemsT } from "@/types/table";
import TableHeader from "./TableHeader";
import TableItem from "./TableItem";
import "./Table.css";
import { GoPlus } from "react-icons/go";

export default function TableItems({
  header,
  items,
  styleHeader,
  styleTable,
  editItem,
  deleteItem,
  styles,
  setPage,
  page,
  filterREQ = { SortType: "desc" },
  setFilterREQ,
  onFilter = false,
  openModalAdd,
  personIcon,
}: TableItemsT) {
  // Adjust column count to account for the management column
  const colsCount = (header?.length || 0) + 1;
  const gridStyle = { "--cols": colsCount } as React.CSSProperties;

  return (
    <div className="table__items" style={gridStyle}>
      {header && (
        <div className="table__header" style={styleHeader}>
          {header.map((e) => (
            <TableHeader name={e.name} key={e.key} />
          ))}
          <TableHeader name="Управление" key="actions" />
        </div>
      )}
      <main className="table__item">
        {items?.data && items.data.length > 0 ? (
          items.data.map((e, i) => (
            <TableItem
              styleTable={styleTable}
              personIcon={personIcon}
              key={i}
              keys={items.keys}
              data={e}
            />
          ))
        ) : (
          <div className="table__empty">Нет элементов</div>
        )}
      </main>
      <div className="table__footer">
        <button className="add-btn" onClick={openModalAdd}>
          <GoPlus className="add-btn-icon" />
          Добавить
        </button>
      </div>
    </div>
  );
}
