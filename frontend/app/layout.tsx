import type { Metadata } from "next";

import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "DevMate AI — Your AI developer workspace",
  description: "Organize projects, work with your code, and bring AI assistance into the flow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
        {children}
        </Providers>

        <Toaster />
        </body>
    </html>
  );
}
