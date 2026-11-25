"use client";

import { File } from "lucide-react";
import type { SimpleIcon } from "simple-icons";
import {
  siC,
  siCplusplus,
  siCss,
  siGo,
  siHtml5,
  siJavascript,
  siJson,
  siMarkdown,
  siOpenjdk,
  siPhp,
  siPython,
  siRust,
  siTypescript,
} from "simple-icons";

const fileTypeIcons: Record<string, SimpleIcon> = {
  js: siJavascript,
  jsx: siJavascript,
  ts: siTypescript,
  tsx: siTypescript,
  py: siPython,
  html: siHtml5,
  css: siCss,
  json: siJson,
  md: siMarkdown,
  java: siOpenjdk,
  c: siC,
  cpp: siCplusplus,
  go: siGo,
  rs: siRust,
  php: siPhp,
};

export function getFileTypeIcon(fileName: string): SimpleIcon | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || extension === fileName.toLowerCase()) return null;
  return fileTypeIcons[extension] ?? null;
}

export default function FileTypeIcon({
  fileName,
}: {
  fileName: string;
}) {
  const icon = getFileTypeIcon(fileName);

  if (!icon) {
    return (
      <File
        className="h-4 w-4 shrink-0 text-slate-500"
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill={`#${icon.hex}`}
      className="shrink-0"
      role="img"
      aria-label={`${icon.title} file`}
    >
      <path d={icon.path} />
    </svg>
  );
}
