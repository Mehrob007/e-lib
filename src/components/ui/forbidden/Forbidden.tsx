interface Props {
  title?: string;
}

export default function Forbidden({ title }: Props) {
  return (
    <div className="forbidden">
      <span>{title || "Данных нет!"}</span>
    </div>
  );
}
