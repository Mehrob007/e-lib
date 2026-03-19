export interface InputT {
  value: string;
  onChange?: (e: string) => void;
  title?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  id: string;
  errors?: { [key: string]: string };
  style?: React.CSSProperties;
}

export interface SelectT {
  value: string;
  onChange: (e: string) => void;
  options: { value: string; label: string;}[];
  title?: string;
  placeholder?: string;
  className?: string;
  id: string;
  errors?: { [key: string]: string };
  style?: React.CSSProperties;
}
