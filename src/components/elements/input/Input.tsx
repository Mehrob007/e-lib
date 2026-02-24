import { InputT } from "@/types/input";

export default function Input({
  value,
  onChange,
  title,
  placeholder,
  type = "text",
  className,
  id,
  error,
  style,
}: InputT) {
  return (
    <label>
      {title && <span>{title}</span>}
      {type === "phone" ? (
        <ReactInputMask
          mask="99-999-99-99"
          maskChar="___"
          value={value}
          onChange={handleSubmit}
          type="tel"
          title="Телефон"
          id="phone-input"
          className="form-control"
          // placeholder={!focus ? "Телефон" : ""}
          onFocus={setFocus.bind(null, true)}
          onBlur={setFocus.bind(null, false)}
          style={style}
          required
        />
      ) : (
        <input type={type} />
      )}
    </label>
  );
}
