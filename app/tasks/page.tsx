"use client"

import { Header } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, FileImage, Shield, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const mockUser = {
  name: "张医生",
  email: "zhang@hospital.com",
  level: 5,
  verified: true,
}
const mockWallet = { balance: 125680, locked: 15000, change: 2350 }

type TaskVariant = "normal" | "claimed" | "full" | "level_blocked"

interface TaskItem {
  id: string
  title: string
  samples: number
  deadline: string
  minLevel: number
  reward: number
  claimed: number
  maxClaims: number
  variant: TaskVariant
}

const tasks: TaskItem[] = [
  {
    id: "T001",
    title: "胸部 CT 肺结节检测标注",
    samples: 200,
    deadline: "2026-07-15",
    minLevel: 3,
    reward: 2400,
    claimed: 8,
    maxClaims: 15,
    variant: "normal",
  },
  {
    id: "T002",
    title: "脑部 MRI 肿瘤边界分割",
    samples: 100,
    deadline: "2026-07-20",
    minLevel: 4,
    reward: 3600,
    claimed: 5,
    maxClaims: 10,
    variant: "claimed",
  },
  {
    id: "T003",
    title: "视网膜病变分级标注",
    samples: 350,
    deadline: "2026-07-10",
    minLevel: 2,
    reward: 1800,
    claimed: 25,
    maxClaims: 25,
    variant: "full",
  },
  {
    id: "T004",
    title: "病理切片质量审核",
    samples: 80,
    deadline: "2026-07-18",
    minLevel: 5,
    reward: 4000,
    claimed: 2,
    maxClaims: 6,
    variant: "level_blocked",
  },
  {
    id: "T005",
    title: "心脏超声结构分割标注",
    samples: 160,
    deadline: "2026-07-25",
    minLevel: 3,
    reward: 2800,
    claimed: 4,
    maxClaims: 12,
    variant: "normal",
  },
]

export default function BrowseTasksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isLoggedIn user={mockUser} wallet={mockWallet} notificationCount={3} />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">浏览标注任务</h1>
            <p className="mt-1 text-muted-foreground">领取适合你的标注工作机会，赚取积分收益</p>
          </div>

          {/* 任务列表（列表式，非网格） */}
          <div className="space-y-3">
            {tasks.map((task) => {
              const claimedRatio = (task.claimed / task.maxClaims) * 100
              const isFull = task.variant === "full"
              const isClaimed = task.variant === "claimed"
              const isBlocked = task.variant === "level_blocked"

              return (
                <div
                  key={task.id}
                  className={cn(
                    "relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all sm:flex-row sm:items-center",
                    isClaimed && "border-l-[3px] border-l-green-500",
                    isFull && "opacity-60"
                  )}
                >
                  {/* 左侧 70% */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-base truncate">{task.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <FileImage className="h-3.5 w-3.5" />
                        总计 {task.samples} 个样本
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        截止 {task.deadline}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5" />
                        最低 Lv{task.minLevel}
                      </span>
                    </div>
                  </div>

                  {/* 右侧 30% */}
                  <div className="sm:w-48 sm:text-right flex-shrink-0">
                    {/* 报酬数字 - 视觉锚点 */}
                    <p className="font-mono text-2xl font-bold text-primary leading-none">
                      ¥{task.reward.toLocaleString()}
                    </p>

                    {/* 参与进度条 */}
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", isFull ? "bg-muted-foreground/40" : "bg-primary")}
                          style={{ width: `${claimedRatio}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-right">
                        {task.claimed} / {task.maxClaims} 人已领取
                      </p>
                    </div>

                    {/* 操作区 */}
                    <div className="mt-3">
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          已领取
                        </span>
                      ) : isFull ? (
                        <Button size="sm" variant="secondary" disabled className="w-full sm:w-auto">
                          名额已满
                        </Button>
                      ) : isBlocked ? (
                        <div className="sm:flex sm:flex-col sm:items-end">
                          <Button size="sm" variant="secondary" disabled className="w-full sm:w-auto">
                            领取任务
                          </Button>
                          <p className="mt-1 text-xs text-destructive">需要 Lv{task.minLevel} 以上等级</p>
                        </div>
                      ) : (
                        <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
                          领取任务
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
