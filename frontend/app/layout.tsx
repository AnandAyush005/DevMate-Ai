import type { Metadata } from "next";

import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "DevMate Ai",
  description: "Your coding friend",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={` h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
        {children}
        </Providers>

        <Toaster />
        </body>
    </html>
  );
}
