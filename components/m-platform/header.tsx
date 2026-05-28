"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "./logo"
import { UserMenu } from "./user-menu"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Bell, Globe, Check } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n, locales, type Locale } from "@/lib/i18n"

// 导航配置
const navItems = [
  { label: "首页", href: "/" },
  { label: "数据广场", href: "/data" },
  { label: "任务广场", href: "/tasks" },
  { label: "排行榜", href: "/rankings" },
  { label: "社区", href: "/community" },
]

interface HeaderProps {
  className?: string
  // 是否已登录
  isLoggedIn?: boolean
  // 用户信息（登录后）
  user?: {
    name: string
    email: string
    avatar?: string
    level: number
    verified: boolean
  }
  // 钱包信息（登录后）
  wallet?: {
    balance: number
    locked: number
    change?: number
  }
  // 未读通知数量
  notificationCount?: number
  // 事件处理
  onNavigate?: (path: string) => void
  onLogout?: () => void
  onLogin?: () => void
  onNotificationClick?: () => void
}

export function Header({
  className,
  isLoggedIn = false,
  user,
  wallet,
  notificationCount = 0,
  onNavigate,
  onLogout,
  onLogin,
  onNotificationClick,
}: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { locale, setLocale } = useI18n()

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    onNavigate?.(href)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 border-b border-border/40",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 左侧: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>
        </div>

        {/* 中间: 导航菜单 - Voiceflow 风格的胶囊按钮 */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
                  isActive
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* 右侧: 多语言 + 通知 + 用户菜单 / 登录按钮 */}
        <div className="flex items-center gap-2">
          {/* 多语言切换 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Globe className="h-4 w-4" />
                <span className="sr-only">切换语言</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {locales.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={cn(
                    "cursor-pointer flex items-center justify-between",
                    locale === lang.code && "bg-accent"
                  )}
                >
                  <span>{lang.label}</span>
                  {locale === lang.code && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn && user ? (
            <>
              {/* 通知按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
                asChild
              >
                <Link href="/notifications">
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                  <span className="sr-only">
                    {notificationCount > 0
                      ? `${notificationCount} 条未读通知`
                      : "没有新通知"}
                  </span>
                </Link>
              </Button>

              {/* 用户菜单 */}
              <UserMenu
                user={user}
                wallet={wallet}
                onNavigate={onNavigate}
                onLogout={onLogout}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-full px-4" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button size="sm" className="rounded-full px-4" asChild>
                <Link href="/login">注册</Link>
              </Button>
            </div>
          )}

          {/* 移动端菜单按钮 */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>
                  <Logo size="md" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        "px-4 py-3 text-base font-medium rounded-lg transition-all",
                        isActive
                          ? "text-foreground bg-muted"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}

                {/* 移动端导航 */}
                {isLoggedIn && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Link 
                      href="/me/assets"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                    >
                      我的资产
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
