"use client"

import { Header, Footer } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  UploadCloud,
  ClipboardList,
  Brush,
  CheckSquare,
  Wallet,
  Stethoscope,
  Building2,
  Compass,
} from "lucide-react"
import Link from "next/link"

// 模拟用户数据
const mockUser = {
  name: "张医生",
  email: "zhang@hospital.com",
  avatar: undefined,
  level: 5,
  verified: true,
}

const mockWallet = {
  balance: 125680,
  locked: 15000,
  change: 2350,
}

// 第一屏 - 业务闭环流程线（5 节点）
const workflowNodes = [
  { icon: UploadCloud, label: "数据上传" },
  { icon: ClipboardList, label: "任务发布" },
  { icon: Brush, label: "标注执行" },
  { icon: CheckSquare, label: "专家审核" },
  { icon: Wallet, label: "收益结算" },
]

// 第二屏 - L0~Lv9 信任阶梯
const trustLadder = [
  {
    name: "L0 游客",
    ability: "浏览公开内容",
    share: "",
    tone: "bg-muted text-muted-foreground border-border",
    height: "h-40",
  },
  {
    name: "Lv1 ~ Lv4 基础账号",
    ability: "领取任务 · 标注",
    share: "60% 分成",
    tone: "bg-primary/10 text-foreground border-primary/20",
    height: "h-48",
  },
  {
    name: "Lv5 ~ Lv8 专家账号",
    ability: "审核能力",
    share: "80% 分成",
    tone: "bg-primary/20 text-foreground border-primary/30",
    height: "h-56",
  },
  {
    name: "Lv9 顶级专家",
    ability: "最高权限",
    share: "100% 分成",
    tone: "bg-primary text-primary-foreground border-primary",
    height: "h-64",
  },
]

// 第三屏 - 角色入口
const roleCards = [
  {
    icon: Stethoscope,
    title: "我是医生 / 标注者",
    desc: "领取任务，完成标注，获取收益",
    cta: "浏览标注任务",
    href: "/tasks",
  },
  {
    icon: Building2,
    title: "我是机构 / 数据方",
    desc: "上传影像数据，发布任务，获得标注成果",
    cta: "上传影像数据",
    href: "/data/upload",
  },
  {
    icon: Compass,
    title: "我想了解更多",
    desc: "查看平台介绍和等级体系",
    cta: "了解信任体系",
    href: "/me/certification",
  },
]

export default function HomePage() {
  const isLoggedIn = true // 模拟已登录状态

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        user={mockUser}
        wallet={mockWallet}
        notificationCount={3}
      />

      <main className="flex-1">
        {/* 第一屏 — 价值主张 */}
        <section className="bg-gradient-to-b from-accent/40 to-background">
          <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance leading-tight">
                加速全球医学影像行业迈入智能化时代
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed text-pretty">
                连接医疗数据拥有者、标注执行者和质量审核方的 AI 医学影像标注平台
              </p>

              {/* 业务闭环流程线 */}
              <div className="mt-12">
                <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  {workflowNodes.map((node, i) => {
                    const Icon = node.icon
                    const isFirst = i === 0
                    return (
                      <div key={node.label} className="flex items-center">
                        <div className="flex flex-col items-center gap-2 w-20 sm:w-24">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                              isFirst
                                ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{node.label}</span>
                        </div>
                        {i < workflowNodes.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground/40 -mt-6 mx-0.5 shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 双 CTA */}
              <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
                {isLoggedIn ? (
                  <Button size="lg" className="h-11 w-40 bg-primary hover:bg-primary/90 text-white" asChild>
                    <Link href="/workspace/annotation">
                      进入工作台
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="h-11 w-40 bg-primary hover:bg-primary/90 text-white" asChild>
                    <Link href="/register">立即注册</Link>
                  </Button>
                )}
                <Button size="lg" variant="outline" className="h-11 px-6" asChild>
                  <Link href="/data">了解更多</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 第二屏 — 信任体系 */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">L0 ~ Lv9 信任等级体系</h2>
              <p className="mt-3 text-muted-foreground">等级越高，能力越强，收益越大</p>
            </div>

            {/* 水平阶梯 */}
            <div className="flex items-end justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
              {trustLadder.map((tier) => (
                <div
                  key={tier.name}
                  className={`flex-1 flex flex-col justify-end rounded-t-xl border p-4 ${tier.tone} ${tier.height}`}
                >
                  <p className="text-sm font-bold leading-snug">{tier.name}</p>
                  <p className="mt-1.5 text-xs opacity-90">{tier.ability}</p>
                  {tier.share && (
                    <p className="mt-2 text-xs font-semibold">{tier.share}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 第三屏 — 角色入口 */}
        <section className="bg-muted/30 border-t border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">选择你的角色</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {roleCards.map((role) => {
                const Icon = role.icon
                return (
                  <Card
                    key={role.title}
                    className="border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <CardContent className="flex flex-col items-start p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{role.desc}</p>
                      <Button variant="outline" className="mt-5 w-full" asChild>
                        <Link href={role.href}>
                          {role.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
