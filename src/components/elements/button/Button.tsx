import React from "react";

export default function Button({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <button className="button" onClick={onClick}>
      {title}
    </button>
  );
}
