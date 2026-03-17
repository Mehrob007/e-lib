import { SelectT } from "@/types/input";
import { useState } from "react";

export default function Select({
  value,
  onChange,
  options,
  title,
  placeholder,
  className,
  id,
  errors,
  style,
}: SelectT) {
  const [focus, setFocus] = useState(false);

  return (
    <label className={`input__element ${focus ? "input__focus" : ""}`}>
      {title && <span>{title}</span>}
      <div className="select__wrapper">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className={`${className} ${!value ? "placeholder" : ""}`}
          id={id}
          style={style}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="select__arrow">
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="#505050"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <p className="input__error" style={{ opacity: errors?.[id] ? 1 : 0 }}>
        {errors?.[id]}
      </p>
    </label>
  );
}
