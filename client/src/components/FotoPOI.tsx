import { useEffect, useState } from "react";

interface FotoPOIProps {
  src?: string;
  alt: string;
  className?: string;
}

export default function FotoPOI({ src, alt, className = "" }: FotoPOIProps) {
  const [errore, setErrore] = useState(!src);

  useEffect(() => setErrore(!src), [src]);

  if (errore) {
    return <div className={`flex items-center justify-center bg-surface-container-highest text-on-surface-variant ${className}`} role="img" aria-label={`Foto non disponibile: ${alt}`}><span className="material-symbols-outlined text-3xl">image_not_supported</span></div>;
  }

  return <img src={src} alt={alt} className={className} onError={() => setErrore(true)} />;
}
