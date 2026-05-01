import { InputT } from "@/types/input";
import { ChangeEvent, useState } from "react";
import ReactInputMask from "@mona-health/react-input-mask";

export default function Input({
  value,
  onChange,
  title,
  placeholder,
  type = "text",
  className,
  id,
  errors,
  style,
  autoComplete,
}: InputT) {
  const [focus, setFocus] = useState(false);

  const handleSubmit = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const cleanPhone = event.target.value.replace(/\D/g, "");
    onChange && onChange(cleanPhone);
  };

  return (
    <label className={`input__element ${!focus ? "input__focus" : ""}`}>
      {title && <span>{title}</span>}
      {type === "phone" ? (
        <ReactInputMask
          mask="99-999-99-99"
          value={value}
          onChange={handleSubmit}
          type="tel"
          title="Телефон"
          id="phone-input"
          className="form-control"
          placeholder={!focus ? "Телефон" : ""}
          onFocus={setFocus.bind(null, true)}
          onBlur={setFocus.bind(null, false)}
          style={style}
          required
          readOnly={!onChange}
          autoComplete={autoComplete}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={!focus ? placeholder : ""}
          className={className}
          id={id}
          style={style}
          readOnly={!onChange}
          autoComplete={autoComplete}
        />
      )}
      <p className="input__error" style={{ opacity: errors?.[id] ? 1 : 0 }}>
        {errors?.[id]}
      </p>
    </label>
  );
}
