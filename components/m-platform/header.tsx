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
        "sticky top-0 z-50 w-full bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 左侧: Logo + 导航 */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-full transition-all",
                        isActive
                          ? "text-primary-foreground bg-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* 右侧: 多语言 + 钱包 + 通知 + 用户菜单 / 登录按钮 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 多语言切换 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Globe className="h-5 w-5" />
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
                className="relative"
                asChild
              >
                <Link href="/notifications">
                  <Bell className="h-5 w-5" />
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
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/login">注册</Link>
              </Button>
            </>
          )}

          {/* 移动端菜单按钮 */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
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
                        "px-4 py-3 text-base font-medium rounded-full transition-all",
                        isActive
                          ? "text-primary-foreground bg-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent hover:shadow-sm"
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
                      className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-all"
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
