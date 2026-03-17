interface Props {
  styles?: { [key: string]: string };
}

export default function Loading({ styles }: Props) {
  return (
    <div className="loading">
      <span style={styles}></span>
    </div>
  );
}
