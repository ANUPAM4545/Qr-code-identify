import { QRCodeDesignOptions } from "@/domain/types";

export type PresetName = "Default" | "Minimal" | "Modern" | "Corporate" | "Conference" | "Rounded" | "Dark" | "Poster";

export const QR_PRESETS: Record<PresetName, QRCodeDesignOptions> = {
  Default: {
    margin: 10,
    qrOptions: { errorCorrectionLevel: "Q" },
    dotsOptions: { type: "rounded", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
    cornersDotOptions: { type: "dot", color: "#000000" },
  },
  Minimal: {
    margin: 0,
    qrOptions: { errorCorrectionLevel: "L" },
    dotsOptions: { type: "square", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "square", color: "#000000" },
    cornersDotOptions: { type: "square", color: "#000000" },
  },
  Modern: {
    margin: 10,
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { type: "classy", color: "#2563EB" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "extra-rounded", color: "#1D4ED8" },
    cornersDotOptions: { type: "dot", color: "#1D4ED8" },
  },
  Corporate: {
    margin: 15,
    qrOptions: { errorCorrectionLevel: "M" },
    dotsOptions: { type: "dots", color: "#0F172A" },
    backgroundOptions: { color: "#F8FAFC" },
    cornersSquareOptions: { type: "square", color: "#0F172A" },
    cornersDotOptions: { type: "square", color: "#0F172A" },
  },
  Conference: {
    margin: 10,
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { type: "classy-rounded", color: "#4F46E5" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "extra-rounded", color: "#312E81" },
    cornersDotOptions: { type: "dot", color: "#312E81" },
  },
  Rounded: {
    margin: 10,
    qrOptions: { errorCorrectionLevel: "M" },
    dotsOptions: { type: "rounded", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "dot", color: "#000000" },
    cornersDotOptions: { type: "dot", color: "#000000" },
  },
  Dark: {
    margin: 10,
    qrOptions: { errorCorrectionLevel: "Q" },
    dotsOptions: { type: "rounded", color: "#ffffff" },
    backgroundOptions: { color: "#09090b" },
    cornersSquareOptions: { type: "extra-rounded", color: "#ffffff" },
    cornersDotOptions: { type: "dot", color: "#ffffff" },
  },
  Poster: {
    margin: 20,
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { type: "classy", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
    cornersDotOptions: { type: "dot", color: "#000000" },
  }
};
