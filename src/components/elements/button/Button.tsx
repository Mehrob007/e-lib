import React from "react";

export default function Button({
  title,
  onClick,
  className,
}: {
  title: string;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button className={"button " + className} onClick={onClick}>
      {title}
    </button>
  );
}
