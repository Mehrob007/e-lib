"use client";

import { ReactReader, ReactReaderStyle } from "react-reader";
import { useEffect, useRef } from "react";

interface Props {
  data: ArrayBuffer;
  title: string;
  location?: string | number | null;
  onLocationChange: (location: string) => void;
  fontSize?: number;
  nextTrigger?: number;
  prevTrigger?: number;
}

export default function EpubReaderContent({
  data,
  title,
  location = null,
  onLocationChange,
  fontSize = 18,
  nextTrigger = 0,
  prevTrigger = 0,
}: Props) {
  const renditionRef = useRef<any>(null);

  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}px`);
    }
  }, [fontSize]);

  useEffect(() => {
    if (renditionRef.current && nextTrigger > 0) {
      renditionRef.current.next();
    }
  }, [nextTrigger]);

  useEffect(() => {
    if (renditionRef.current && prevTrigger > 0) {
      renditionRef.current.prev();
    }
  }, [prevTrigger]);

  // Custom styles to hide default arrows and make it look cleaner
  const ownStyles = {
    ...ReactReaderStyle,
    arrow: {
      ...ReactReaderStyle.arrow,
      display: "none",
    },
    reader: {
      ...ReactReaderStyle.reader,
      position: "absolute",
      inset: 0,
    }
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <ReactReader
        url={data}
        title={title}
        location={location as any}
        locationChanged={onLocationChange as any}
        getRendition={(rendition: any) => {
          renditionRef.current = rendition;
          rendition.themes.fontSize(`${fontSize}px`);
          rendition.themes.register("custom", {
            body: {
              fontFamily: "Georgia, serif !important",
              color: "#333 !important",
              lineHeight: "1.6 !important"
            },
          });
          rendition.themes.select("custom");
        }}
        epubOptions={{
          flow: "paginated",
          manager: "default",
          spread: "none"
        }}
        styles={ownStyles as any}
      />
    </div>
  );
}
