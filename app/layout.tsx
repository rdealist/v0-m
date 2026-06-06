import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import { I18nProvider } from "@/lib/i18n"

// 初始化字体
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: {
    default: "M平台 - 医学影像数据资产平台",
    template: "%s | M平台",
  },
  description:
    "医学影像数据资产平台，连接数据、标注与价值。提供医学数据资产管理、标注任务撮合、沙箱积分账本服务。",
  keywords: [
    "医学影像",
    "数据资产",
    "医学标注",
    "影像标注",
    "数据平台",
    "医疗AI",
  ],
  authors: [{ name: "M平台" }],
  generator: "Next.js",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFBFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1117" },
  ],
  width: "device-width",
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="min-h-screen font-sans antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
