"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/ui/loading/Loading";

interface Props {
  content: string;
}

export default function Fb2ReaderContent({ content }: Props) {
  const [parsedHtml, setParsedHtml] = useState<string>("");

  useEffect(() => {
    if (!content) return;

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "text/xml");
      
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        console.error("FB2 XML Parsing Error:", parserError[0].textContent);
        setParsedHtml("<p>Error parsing FB2: Invalid XML structure</p>");
        return;
      }

      const body = xmlDoc.getElementsByTagName("body")[0];

      if (!body) {
        setParsedHtml("<p>Error parsing FB2: No body found</p>");
        return;
      }

      const transform = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
        if (node.nodeType !== Node.ELEMENT_NODE) return "";

        const el = node as Element;
        const tagName = el.tagName.toLowerCase();
        
        let children = "";
        for (let i = 0; i < el.childNodes.length; i++) {
          children += transform(el.childNodes[i]);
        }

        switch (tagName) {
          case "p": return `<p>${children}</p>`;
          case "v": return `<p class="stanza-v">${children}</p>`;
          case "subtitle": return `<h3>${children}</h3>`;
          case "title": return `<h2>${children}</h2>`;
          case "section": return `<section>${children}</section>`;
          case "empty-line": return `<div class="empty-line"></div>`;
          case "strong": return `<strong>${children}</strong>`;
          case "emphasis": return `<em>${children}</em>`;
          case "cite": return `<blockquote>${children}</blockquote>`;
          case "poem": return `<div class="poem">${children}</div>`;
          case "stanza": return `<div class="stanza">${children}</div>`;
          case "epigraph": return `<div class="epigraph">${children}</div>`;
          case "annotation": return `<div class="annotation">${children}</div>`;
          default: return children;
        }
      };

      setParsedHtml(transform(body));
    } catch (e) {
      console.error("FB2 parsing error:", e);
      setParsedHtml("<p>Error parsing FB2 file</p>");
    }
  }, [content]);

  if (!parsedHtml) return <Loading />;

  return (
    <div className="fb2-container" dangerouslySetInnerHTML={{ __html: parsedHtml }} />
  );
}
