"use client";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.payingsurveys.homeworkjobs";

interface Props {
  size?: "sm" | "md" | "lg";
  label?: string;
  style?: React.CSSProperties;
}

const PlayIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.18 1.25C2.76 1.48 2.5 1.93 2.5 2.5v19c0 .57.26 1.02.68 1.25l.1.06 10.64-10.64v-.25L3.28 1.19l-.1.06z" fill="#fff" opacity="0.95"/>
    <path d="M17.42 15.17l-3.54-3.54v-.26l3.54-3.54.08.05 4.2 2.38c1.2.68 1.2 1.8 0 2.48l-4.2 2.38-.08.05z" fill="#fff" opacity="0.95"/>
    <path d="M17.5 15.12L13.92 11.5 3.18 22.25c.4.42 1.04.47 1.76.06l12.56-7.19" fill="#fff" opacity="0.75"/>
    <path d="M17.5 7.88L4.94.69C4.22.28 3.58.33 3.18.75L13.92 11.5l3.58-3.62z" fill="#fff" opacity="0.75"/>
  </svg>
);

export default function DownloadButton({ size = "md", label, style }: Props) {
  const sizeClass = size === "lg" ? "btn-download btn-download-lg" : size === "sm" ? "btn-download btn-download-sm" : "btn-download btn-download-md";
  const iconSize = size === "lg" ? 20 : 16;
  const defaultLabel = size === "sm" ? "Download" : "Download Free on Google Play";

  return (
    <button
      className={sizeClass}
      style={style}
      onClick={() => window.open(PLAY_STORE_URL, "_blank", "noopener,noreferrer")}
    >
      <PlayIcon size={iconSize} />
      {label ?? defaultLabel}
    </button>
  );
}
