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

  const ownStyles = {
    ...ReactReaderStyle,
    arrow: {
      ...ReactReaderStyle.arrow,
      display: "none",
    },
    tocButton: {
      ...ReactReaderStyle.tocButton,
      display: "none",
    },
    tocArea: {
      ...ReactReaderStyle.tocArea,
      display: "none",
    },
    reader: {
      ...ReactReaderStyle.reader,
      position: "static",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: "100%",
      width: "100%",
    },
    container: {
      ...ReactReaderStyle.container,
      height: "100%",
      width: "100%",
    },
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <ReactReader
        url={data}
        swipeable={false}
        // title={title}
        location={location as any}
        locationChanged={onLocationChange as any}
        getRendition={(rendition: any) => {
          renditionRef.current = rendition;
          rendition.themes.fontSize(`${fontSize}px`);
          rendition.themes.register("custom", {
            body: {
              fontFamily: "Georgia, serif !important",
              color: "#1a1a1a !important",
              lineHeight: "1.8 !important",
              padding: "0 10px !important",
              margin: "0 !important",
              backgroundColor: "transparent !important",
              wordBreak: "break-word !important",
              overflowWrap: "break-word !important",
              width: "100% !important",
              maxWidth: "100% !important",
            },
          });
          rendition.themes.select("custom");
        }}
        epubOptions={{
          flow: "scrolled",
          manager: "continuous",
        }}
        readerStyles={ownStyles as any}
      />
    </div>
  );
}
