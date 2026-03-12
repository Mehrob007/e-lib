import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Админ-панель</h1>
      <p className="text-lg">
        Эта страница доступна только пользователям с ролью ADMIN.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block text-blue-500 hover:underline"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
