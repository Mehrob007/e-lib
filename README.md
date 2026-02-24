## Структура проекта

```
├─ public/            # статические ассеты
│  ├─ icons/          # иконки
│  └─ images/         # изображения
├─ src/
│  ├─ api/            # обёртка Axios
│  ├─ components/     # UI‑компоненты
│  ├─ hooks/          # кастомные хуки
│  ├─ app/            # маршруты (Next App Router)
│  ├─ modules/        # бизнес‑модули (Cart, ProductItems и т. д.)
│  ├─ store/          # Zustand‑слайсы
│  ├─ styles/         # SCSS Стили
│  ├─ types/          # общие типы TS
│  ├─ constants/      # const
│  └─ utils/          # вспомогательные функции
│  └─ fonts/          # шрифты страниц
└─ README.md
```