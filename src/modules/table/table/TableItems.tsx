import { TableItemsT } from "@/types/table";
import TableHeader from "./TableHeader";
import TableItem from "./TableItem";
import "./Table.css";
import { GoPlus, GoChevronLeft, GoChevronRight } from "react-icons/go";
import Loading from "@/components/ui/loading/Loading";

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
  // filterREQ = { SortType: "desc" },
  // setFilterREQ,
  // onFilter = false,
  openModalAdd,
  personIcon,
  onClick,
  loading = false,
}: TableItemsT) {
  const colsCount = (header?.length || 0) + 1;
  const gridStyle = { "--cols": colsCount } as React.CSSProperties;

  return (
    <div className="table__items" style={{ ...gridStyle, ...styles }}>
      {header && (
        <div className="table__header" style={styleHeader}>
          {header.map((e, i) => (
            <TableHeader name={e.name} key={i} />
          ))}
          <TableHeader name="Управление" key="actions" />
        </div>
      )}
      <main className="table__item">
        {!loading ? (
          items?.data && items.data.length > 0 ? (
            items.data.map((e, i) => (
              <TableItem
                onClick={onClick}
                styleTable={styleTable}
                personIcon={personIcon}
                key={i}
                keys={items.keys}
                data={e}
                deleteItem={deleteItem}
                editItem={editItem}
              />
            ))
          ) : (
            <div className="table__empty">Нет элементов</div>
          )
        ) : (
          <Loading />
        )}
      </main>
      <div className="table__footer">
        <div className="table__footer-left" onClick={openModalAdd}>
          <button className="add-btn">
            <GoPlus className="add-btn-icon" />
            Добавить
          </button>
        </div>
        <div className="table__pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage && setPage(Math.max(0, (page || 0) - 1))}
            disabled={page === 0}
          >
            <GoChevronLeft />
          </button>
          <span className="pagination-info">Страница {(page || 0) + 1}</span>
          <button
            className="pagination-btn"
            onClick={() => setPage && setPage((page || 0) + 1)}
            disabled={
              items?.data ? items.data.length < 25 : true
            }
          >
            <GoChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
