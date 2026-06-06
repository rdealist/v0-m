"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "./logo"
import { UserMenu } from "./user-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Bell, Globe, Check, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n, locales } from "@/lib/i18n"

// 子菜单项类型
interface SubNavItem {
  label: string
  href: string
  description?: string
  // 可见性提示（原型阶段全部展示，用灰字标注条件）
  hint?: string
  // 右侧等级胶囊
  levelBadge?: string
}

// 导航项类型
interface NavItem {
  label: string
  href: string
  // 用于高亮判断：该菜单覆盖的路径前缀
  match: string[]
  children?: SubNavItem[]
}

// 导航配置 - 描述性标签 + 下拉子菜单
const navItems: NavItem[] = [
  {
    label: "首页",
    href: "/",
    match: ["/"],
  },
  {
    label: "影像数据",
    href: "/data",
    match: ["/data", "/me/data"],
    children: [
      { label: "浏览数据集", href: "/data", description: "发现高质量公开医学影像数据" },
      { label: "上传数据", href: "/data/upload", description: "贡献你的影像数据集", hint: "仅机构" },
      { label: "我的数据集", href: "/me/data", description: "管理已上传的数据资产", hint: "需登录" },
    ],
  },
  {
    label: "标注任务",
    href: "/tasks",
    match: ["/tasks", "/me/tasks", "/workspace"],
    children: [
      { label: "浏览任务", href: "/tasks", description: "领取标注任务赚取积分" },
      { label: "发布任务", href: "/tasks/new", description: "招募专业医生标注数据", hint: "仅机构" },
      { label: "我的任务", href: "/me/tasks", description: "查看领取的任务进度", hint: "需登录" },
      { label: "审核工作台", href: "/workspace/audit", description: "审核标注质量", levelBadge: "Lv5+" },
    ],
  },
  {
    label: "贡献排名",
    href: "/rankings",
    match: ["/rankings"],
  },
  {
    label: "医学讨论",
    href: "/community",
    match: ["/community"],
    children: [
      { label: "前沿技术", href: "/community#frontier" },
      { label: "经验分享", href: "/community#experience" },
      { label: "争议病例", href: "/community#cases" },
      { label: "标注指南", href: "/community#guide" },
      { label: "平台公告", href: "/community#announcement" },
    ],
  },
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
  const [isScrolled, setIsScrolled] = useState(false)

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    onNavigate?.(href)
  }

  // 判断菜单是否处于激活态
  const isMenuActive = (item: NavItem) => {
    if (item.href === "/") {
      return pathname === "/"
    }
    return item.match.some((m) => pathname === m || pathname.startsWith(m + "/"))
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-background/98 backdrop-blur-md shadow-sm border-b border-border/60"
          : "bg-background/80 backdrop-blur-sm border-b border-border/40",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300",
          isScrolled ? "h-14" : "h-16"
        )}
      >
        {/* 左侧: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <Logo size="md" />
          </Link>
        </div>

        {/* 中间: 描述性导航 + 下拉子菜单 */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isMenuActive(item)

            // 无子菜单 - 直达链接
            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              )
            }

            // 有子菜单 - 下拉
            return (
              <DropdownMenu key={item.href}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "relative flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors outline-none",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    {active && (
                      <span className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 p-1.5">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild className="cursor-pointer rounded-md p-0">
                      <Link
                        href={child.href}
                        onClick={() => handleNavClick(child.href)}
                        className="flex flex-col items-start gap-0.5 px-3 py-2"
                      >
                        <span className="flex w-full items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                            {child.label}
                            {child.hint && (
                              <span className="text-[11px] font-normal text-muted-foreground">
                                · {child.hint}
                              </span>
                            )}
                          </span>
                          {child.levelBadge && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                              {child.levelBadge}
                            </Badge>
                          )}
                        </span>
                        {child.description && (
                          <span className="text-xs text-muted-foreground leading-snug">
                            {child.description}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}
        </nav>

        {/* 右侧: 多语言 + 通知 + 用户菜单 / 登录按钮 */}
        <div className="flex items-center gap-2">
          {/* 多语言切换 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors">
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
                className="relative h-8 w-8 transition-colors"
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
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-full px-4 transition-all hover:bg-muted" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button size="sm" className="rounded-full px-4 transition-all" asChild>
                <Link href="/register">注册</Link>
              </Button>
            </div>
          )}

          {/* 移动端菜单按钮 */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 transition-colors">
                <Menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  <Logo size="md" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isMenuActive(item)

                  // 无子菜单
                  if (!item.children) {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={cn(
                          "px-4 py-3 text-base font-medium rounded-lg transition-all",
                          active
                            ? "text-foreground bg-muted"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {item.label}
                      </Link>
                    )
                  }

                  // 有子菜单 - 分组平铺
                  return (
                    <div key={item.href} className="mt-2">
                      <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                        {item.label}
                      </p>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => handleNavClick(child.href)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm rounded-lg text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            {child.label}
                            {child.hint && (
                              <span className="text-[11px] text-muted-foreground">· {child.hint}</span>
                            )}
                          </span>
                          {child.levelBadge && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                              {child.levelBadge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  )
                })}

                {/* 未登录: 登录/注册 */}
                {!isLoggedIn && (
                  <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>登录</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>注册</Link>
                    </Button>
                  </div>
                )}

                {/* 已登录: 我的资产 */}
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
