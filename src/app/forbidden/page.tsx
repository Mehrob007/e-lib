import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        403 - Доступ запрещен
      </h1>
      <p className="text-gray-600 mb-6">
        У вас недостаточно прав для просмотра этой страницы.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
