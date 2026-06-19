import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import AuthCheck from "@/components/auth-check";
import NotificationProvider from "@/components/notification-provider";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const headingFont = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Meridian — Personal Life Manager",
    template: "%s | Meridian",
  },
  description:
    "Meridian is a minimal personal life manager for tracking water, todos, food, and notes. Stay organized, hydrated, and focused.",
  keywords: [
    "productivity",
    "todo app",
    "water tracker",
    "food tracker",
    "notes app",
    "personal organizer",
    "habit tracker",
  ],
  authors: [{ name: "Meridian" }],
  creator: "Meridian",
  openGraph: {
    title: "Meridian — Personal Life Manager",
    description:
      "Track your water, todos, food, and notes in one calm, minimal space.",
    siteName: "Meridian",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian — Personal Life Manager",
    description:
      "Track your water, todos, food, and notes in one calm, minimal space.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", bodyFont.variable, headingFont.variable)}
    >
      <head>
        <script defer src="https://analytics.arunspace.xyz/script.js" data-website-id="add76d88-13f4-4b01-8d2f-1dffc3e697e1"></script>
      </head>
      <body className="min-h-full flex flex-col font-body">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthCheck />
          <NotificationProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
