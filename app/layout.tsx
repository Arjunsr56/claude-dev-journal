import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Claude Dev Journal",
    template: "%s | Claude Dev Journal",
  },
  description: "A daily log of what I'm learning with Claude Code",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
