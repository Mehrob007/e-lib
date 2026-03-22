"use client"
import HeaderHome from "../../components/ui/header/HeaderHome";
import HeroBanner from "../../components/ui/banner/HeroBanner";
import SectionHeader from "../../components/ui/section/SectionHeader";
import BookCard from "../../components/ui/cards/BookCard";

export default function Page() {
  const books = [
    {
      title: "Падая словно звёзды",
      author: "Эмма Скотт",
      date: "11.02.2026",
      image: "",
      type: "text",
      typeLabel: "Матн",
    },
    {
      title: "Дарси 1. Забони модарӣ",
      author: "Нашриёт",
      date: "11.02.2026",
      image: "",
      type: "video",
      typeLabel: "Видео",
    },
    {
      title: "Убийство в восточном экспрессе",
      author: "Агата Кристи",
      date: "11.02.2026",
      image: "",
      type: "audio",
      typeLabel: "Аудио",
    },
    {
      title: "Дарси 2. Забони модарӣ",
      author: "Нашриёт",
      date: "11.02.2026",
      image: "",
      type: "video",
      typeLabel: "Видео",
    },
    {
      title: "Ведьмак. Последнее желание",
      author: "Анджей Сапковский",
      date: "11.02.2026",
      image: "",
      type: "text",
      typeLabel: "Матн",
    },
    {
      title: "Утреннее сияние",
      author: "Сара Джио",
      date: "11.02.2026",
      image: "",
      type: "audio",
      typeLabel: "Аудио",
    },
  ];

  return (
    <div className="home-page">
      <HeaderHome />
      <div className="home-page__content" style={{ padding: "0 40px" }}>
        <HeroBanner />
        <SectionHeader title="ХОНАНДАГОН" onViewAll={() => {}} />
        <div className="book-grid">
          {books.map((book, i) => (
            // @ts-expect-error: mapping props from array
            <BookCard key={i} {...book} />
          ))}
        </div>
      </div>
    </div>
  );
}
