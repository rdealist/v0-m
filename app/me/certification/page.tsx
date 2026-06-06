"use client"

import { Header } from "@/components/m-platform"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ShieldCheck, Crown } from "lucide-react"
import Link from "next/link"

// 当前用户为 Lv3（基础标注者）
const mockUser = {
  name: "张医生",
  email: "zhang@hospital.com",
  avatar: undefined,
  level: 3,
  verified: true,
}

const mockWallet = {
  balance: 8240,
  locked: 0,
  pending: 3600,
}

const CURRENT_LEVEL = 3

// 等级阶梯：L0 + Lv1~Lv9
const levelLadder = [
  {
    key: "L0",
    label: "L0",
    name: "游客",
    desc: "浏览公开页面 · 不可参与业务操作",
    share: null,
    tone: "muted" as const,
    short: "L0",
  },
  {
    key: "Lv1-2",
    label: "Lv1~Lv2",
    name: "注册标注者",
    desc: "注册认证 · 领取基础任务 · 标注 · 社区互动",
    share: "60%",
    tone: "light" as const,
    short: "1-2",
  },
  {
    key: "Lv3",
    label: "Lv3",
    name: "基础标注者",
    desc: "领取符合等级要求的任务 · 完整标注能力",
    share: "60%",
    tone: "current" as const,
    short: "3",
  },
  {
    key: "Lv4",
    label: "Lv4",
    name: "进阶标注者",
    desc: "更高级别任务 · 更多领取配额",
    share: "60%",
    tone: "locked" as const,
    short: "4",
  },
  {
    key: "Lv5",
    label: "Lv5",
    name: "审核专家",
    desc: "解锁审核能力",
    share: "80%",
    tone: "threshold" as const,
    badge: "审核门槛",
    short: "5",
  },
  {
    key: "Lv6-8",
    label: "Lv6~Lv8",
    name: "高级审核专家",
    desc: "高级审核 · 80% 分成",
    share: "80%",
    tone: "locked" as const,
    short: "6-8",
  },
  {
    key: "Lv9",
    label: "Lv9",
    name: "顶级专家",
    desc: "顶级专家 · 最高权限 · 100% 分成",
    share: "100%",
    tone: "locked" as const,
    crown: true,
  },
]

export default function CertificationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isLoggedIn user={mockUser} wallet={mockWallet} currentPath="/me" notificationCount={3} />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/me"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            返回个人中心
          </Link>

          {/* 上半部分 — 当前等级突出展示 */}
          <section className="flex flex-col items-center text-center py-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-white shadow-lg">
              Lv{CURRENT_LEVEL}
            </div>
            <h1 className="mt-3 text-xl font-semibold text-foreground">Lv{CURRENT_LEVEL} · 基础标注者</h1>
            <Badge className="mt-2 bg-primary/10 text-primary border-primary/30">
              <ShieldCheck className="h-3 w-3 mr-1" />
              已认证
            </Badge>
            <p className="mt-2 text-sm text-muted-foreground">当前分成比例：60%</p>
          </section>

          {/* 下半部分 — 等级阶梯可视化 */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">等级体系与能力</h2>
            <p className="text-sm text-muted-foreground mb-6">
              L0 + Lv1~Lv9 十级体系，Lv5 解锁审核能力，分成比例分三档（60% / 80% / 100%）
            </p>

            <div className="relative space-y-4">
              {/* 阶梯连接线 */}
              <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border" aria-hidden />

              {levelLadder.map((step) => {
                const isCurrent = step.tone === "current"
                const isThreshold = step.tone === "threshold"
                const isLocked = step.tone === "locked" || step.tone === "threshold"

                return (
                  <div
                    key={step.key}
                    className={cn(
                      "relative flex items-start gap-4",
                      isLocked && !isThreshold && "opacity-60",
                    )}
                  >
                    {/* 左侧等级标识圆点 */}
                    <div
                      className={cn(
                        "relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        step.tone === "muted" && "bg-muted text-muted-foreground",
                        step.tone === "light" && "bg-primary/15 text-primary",
                        isCurrent && "bg-primary text-white ring-4 ring-primary/20",
                        step.tone === "locked" && "border border-dashed border-border bg-card text-muted-foreground",
                        isThreshold && "border-2 border-dashed border-primary bg-card text-primary",
                      )}
                    >
                      {step.crown ? <Crown className="h-5 w-5" /> : `L${step.short}`}
                    </div>

                    {/* 右侧内容卡片 */}
                    <div
                      className={cn(
                        "flex-1 rounded-xl border p-4",
                        isCurrent && "border-primary bg-primary/5",
                        isThreshold && "border-primary/60 border-dashed bg-card",
                        !isCurrent && !isThreshold && "border-border bg-card",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("font-semibold", isThreshold ? "text-base" : "text-sm", "text-foreground")}>
                          {step.label} {step.name}
                        </span>
                        {isCurrent && (
                          <span className="text-sm font-medium text-primary">← 你在这里</span>
                        )}
                        {step.badge && (
                          <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">{step.badge}</Badge>
                        )}
                        {step.crown && (
                          <Badge variant="outline" className="text-xs text-chart-2 border-chart-2/40">
                            顶级
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className={cn("text-sm text-muted-foreground", isThreshold && "font-medium text-foreground")}>
                          {step.desc}
                        </p>
                        {step.share && (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-xs font-mono font-medium",
                              step.share === "100%"
                                ? "bg-chart-2/15 text-chart-2"
                                : step.share === "80%"
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            {step.share}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              M0 阶段不支持自动升级，等级与分成比例由平台依据资质与贡献综合评定。
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
