import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FileVault — Personal File Sharing",
  description:
    "Browse and download shared files. A simple, personal file sharing platform.",
  keywords: ["file sharing", "download", "files"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-mesh min-h-screen">{children}</body>
    </html>
  );
}
