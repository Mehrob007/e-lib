export interface InputT {
  value: string;
  onChange: (e: string) => void;
  title?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  id: string;
  error?: { [key: string]: string };
  style?: React.CSSProperties;
}