"use client";

import { useEffect, useRef, memo, useState } from "react";
import { QRCodeDesignOptions } from "@/domain/types";

interface QRCodeStylingInstance {
  append: (element: HTMLElement) => void;
  update: (options: Record<string, unknown>) => void;
  download: (options: { name: string; extension: string }) => void;
}
interface QRCodeStylingConstructor {
  new (options: Record<string, unknown>): QRCodeStylingInstance;
}

let QRCodeStyling: QRCodeStylingConstructor | undefined;
if (typeof window !== "undefined") {
  import("qr-code-styling").then((mod) => { QRCodeStyling = mod.default as unknown as QRCodeStylingConstructor; });
}

interface QRCanvasProps {
  options: QRCodeDesignOptions;
  qrRef: React.MutableRefObject<any>;
  refreshKey?: number;
}

export const QRCanvas = memo(({ options, qrRef, refreshKey }: QRCanvasProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastOptions = useRef<QRCodeDesignOptions>(options);
  const [isLoaded, setIsLoaded] = useState(!!QRCodeStyling);

  useEffect(() => {
    if (!QRCodeStyling) {
      import("qr-code-styling").then((mod) => { 
        QRCodeStyling = mod.default as unknown as QRCodeStylingConstructor; 
        setIsLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!QRCodeStyling || !isLoaded || !ref.current) return;
    
    // Default base options
    const baseOptions = {
      width: 500, // higher resolution internal canvas
      height: 500,
      type: "svg",
      data: options.data || "https://identity.com",
      ...(options as Record<string, unknown>)
    };

    if (!qrRef.current || refreshKey) {
      if (qrRef.current && ref.current) {
        ref.current.innerHTML = ""; // Clear existing canvas
      }
      qrRef.current = new QRCodeStyling(baseOptions);
      qrRef.current.append(ref.current);
    } else {
      // Instead of completely recreating, just update. 
      // If there's a heavy structural change, `qr-code-styling` usually handles it in svg mode.
      qrRef.current.update(baseOptions);
    }
    lastOptions.current = options;
  }, [options, qrRef]);

  return (
    <div 
      ref={ref} 
      className="flex justify-center items-center w-full h-full min-w-[300px] min-h-[300px]" 
      // Prevent internal SVGs from having fixed widths that overflow
      style={{
        "& svg": { width: "100%", height: "100%" }
      } as any}
    />
  );
}, (prev, next) => {
  return prev.refreshKey === next.refreshKey && JSON.stringify(prev.options) === JSON.stringify(next.options);
});
