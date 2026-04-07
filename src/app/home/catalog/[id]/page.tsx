"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import HeaderHome from "@/components/ui/header/HeaderHome";
import CatalogTopBar from "@/components/ui/nav/CatalogTopBar";
import Loading from "@/components/ui/loading/Loading";
import { getContentById, getCategoryContentREQ } from "@/api/element";
import { getCategorysREQ } from "@/api/category";
import { LANG_GET_ADMIN } from "@/const/def";
import { ItemT } from "@/types/table";
import { useBranding } from "@/hooks/useBranding";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import "./details.scss";

interface BookDetails {
  id: string;
  title: string;
  author: string;
  language: string;
  pages: string | number;
  year: string | number;
  description: string;
  image: string;
  fileUrl: string;
  path: { id: string; name: string }[];
  categoryId: string;
}

export default function BookDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const branding = useBranding();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Record<string, unknown>[]>(
    [],
  );
  const [categories, setCategories] = useState<ItemT[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch book details
      const res = await getContentById(id as string);
      if (res) {
        const details = (res.details as Record<string, unknown>) || {};
        const pathArr = (res.path as { id: string; name: string }[]) || [];
        const bookData: BookDetails = {
          id: res.id as string,
          title: (res.name as string) || "—",
          author: (details.author as string) || "—",
          language: (details.lang_id as string) === "1" ? "Тоҷикӣ" : "Тоҷикӣ",
          pages: (details.pages as string | number) || "—",
          year: (details.created as string) || "—",
          description:
            (details.annotation as string) || "Тавсиф ҳоло илова нашудааст.",
          image: (details.preview_url as string) || "",
          fileUrl: (details.file_url as string) || "",
          path: pathArr,
          categoryId: pathArr.length > 0 ? pathArr[0].id : "",
        };
        setBook(bookData);

        // Fetch related books from the same category
        if (bookData.categoryId) {
          const relatedRes = (await getCategoryContentREQ(bookData.categoryId, {
            _limit: 4,
          })) as unknown as Record<string, unknown>[];
          if (relatedRes) {
            setRelatedBooks(relatedRes.filter((b) => b.id !== id));
          }
        }
      }

      // Fetch root categories for TopBar
      const catRes = (await getCategorysREQ({
        lang: LANG_GET_ADMIN,
      })) as unknown as ItemT[];
      if (catRes) setCategories(catRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="book-details-page">
        <HeaderHome logo={branding?.logo as string} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "100px",
          }}
        >
          <Loading
            styles={{ width: "60px", height: "60px", borderWidth: "8px" }}
          />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details-page">
        <HeaderHome logo={branding?.logo as string} />
        <p style={{ textAlign: "center", padding: "100px" }}>
          Контент ёфт нашуд
        </p>
      </div>
    );
  }

  return (
    <div className="book-details-page">
      <HeaderHome logo={branding?.logo as string} />
      {/* <CatalogTopBar
        categories={categories}
        activeId={book.categoryId}
        onSelect={(catId) => router.push(`/home/catalog?category_id=${catId}`)}
      /> */}

      <div className="breadcrumbs-container">
        <button className="back-button" onClick={() => router.back()}>
          <IoArrowBack /> Баргаштан
        </button>
        <div className="breadcrumbs">
          {book.path.map((p, index) => (
            <span key={p.id}>
              {p.name}
              {index < book.path.length - 1 ? " / " : ""}
            </span>
          ))}
        </div>
      </div>

      <main className="details-content">
        <div className="main-column">
          <section className="cover-section">
            <div className="book-cover">
              {book.image ? (
                <Image
                  src={
                    book.image.startsWith("http")
                      ? book.image
                      : `/${book.image}`
                  }
                  alt={book.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  {book.title}
                </div>
              )}
            </div>
            <h3 className="description-title">Тавсиф</h3>
            <p className="description-text">{book.description}</p>
          </section>

          <section className="info-section">
            <div className="metadata-list">
              <div className="metadata-item">
                <span className="label">Ном:</span>
                <span className="value">{book.title}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Муаллиф:</span>
                <span className="value">{book.author}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Забон:</span>
                <span className="value">{book.language}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Саҳифаҳо:</span>
                <span className="value">{book.pages}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Соли нашр:</span>
                <span className="value">{book.year}</span>
              </div>
            </div>

            <div className="actions-block">
              <button
                className="read-button"
                onClick={() => {
                  router.push(`/home/catalog/${id}/book`);
                }}
              >
                Хондан
              </button>
              <button
                className="download-btn"
                title="Download"
                onClick={() => {
                  if (book.fileUrl) {
                    const url = book.fileUrl.startsWith("http")
                      ? book.fileUrl
                      : `${process.env.NEXT_PUBLIC_API_URL_ADMIN?.replace(/\/$/, "")}${book.fileUrl.startsWith("/") ? "" : "/"}${book.fileUrl}`;
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${book.title}.pdf`;
                    link.click();
                  }
                }}
              >
                <HiOutlineArrowDownTray />
              </button>
            </div>
          </section>
        </div>

        <aside className="sidebar">
          <div className="sidebar-title">Дигар китобҳо</div>
          <div className="related-list">
            {relatedBooks.length > 0 ? (
              relatedBooks.map((item) => {
                const details = (item.details as Record<string, unknown>) || {};
                const img = (details.preview_url as string) || "";
                return (
                  <div
                    key={item.id as string}
                    className="side-book-card"
                    onClick={() =>
                      router.push(`/home/catalog/${item.id as string}`)
                    }
                  >
                    <div className="side-cover">
                      {img ? (
                        <Image
                          src={img.startsWith("http") ? img : `/${img}`}
                          alt={item.name as string}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#eee",
                          }}
                        />
                      )}
                    </div>
                    <div className="side-info">
                      <h4>{item.name as string}</h4>
                      <p>{(details.author as string) || "—"}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#aaa", fontSize: "14px" }}>Ёфт нашуд</p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
