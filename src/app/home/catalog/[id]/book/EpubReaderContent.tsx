"use client";

import { ReactReader } from "react-reader";
import { useState } from "react";

interface Props {
  url: string;
  title: string;
  location?: string;
  onLocationChange: (location: string) => void;
}

export default function EpubReaderContent({ url, title, location, onLocationChange }: Props) {
  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <ReactReader
        url={url}
        title={title}
        location={location}
        locationChanged={onLocationChange}
        epubOptions={{
          flow: "scrolled",
          manager: "continuous"
        }}
        swipeable
      />
    </div>
  );
}
