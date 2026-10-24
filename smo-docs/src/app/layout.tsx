import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const font = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบตรวจเอกสาร สโมสรนักศึกษา",
  description: "ยื่นเอกสารให้ฝ่ายเอกสารตรวจ และส่งต่อให้นายกสโมเซ็น",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${font.className} antialiased bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}