"use client"

import { useState } from "react"
import { Header, TaskStatusBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  Building2,
  Coins,
  Clock,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"

const mockUser = {
  name: "张医生",
  email: "zhang@hospital.com",
  level: 5,
  verified: true,
}

const mockWallet = { balance: 125680, locked: 15000, change: 2350 }

// 我领取的任务
const claimedTasks = [
  {
    id: "T002",
    title: "脑部肿瘤边界分割",
    publisher: "天坛医院神经影像科",
    reward: 8000,
    taskType: "annotation" as const,
    progress: 65,
    totalCases: 100,
    completedCases: 65,
    deadline: "2026-06-20",
    status: "in_progress" as const,
  },
  {
    id: "T006",
    title: "肺结节标注质量审核",
    publisher: "协和医院影像中心",
    reward: 3000,
    taskType: "audit" as const,
    progress: 20,
    totalCases: 50,
    completedCases: 10,
    deadline: "2026-06-18",
    status: "in_progress" as const,
  },
  {
    id: "T009",
    title: "肝脏分割标注",
    publisher: "瑞金医院",
    reward: 6500,
    taskType: "annotation" as const,
    progress: 100,
    totalCases: 80,
    completedCases: 80,
    deadline: "2026-05-30",
    status: "under_review" as const,
  },
  {
    id: "T011",
    title: "视网膜病变分级",
    publisher: "同仁医院眼科中心",
    reward: 4200,
    taskType: "annotation" as const,
    progress: 100,
    totalCases: 60,
    completedCases: 60,
    deadline: "2026-05-12",
    status: "completed" as const,
  },
]

const filterTabs = [
  { key: "all", label: "全部" },
  { key: "in_progress", label: "进行中" },
    { key: "under_review", label: "审查中" },
  { key: "completed", label: "已完成" },
]

export default function MyTasksPage() {
  const [activeFilter, setActiveFilter] = useState("all")

  const filtered = claimedTasks.filter((t) =>
    activeFilter === "all" ? true : t.status === activeFilter
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn
        user={mockUser}
        wallet={mockWallet}
        notificationCount={3}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 面包屑 */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/me">个人中心</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>我的任务</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* 标题 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">我的任务</h1>
            <p className="mt-1 text-muted-foreground">跟踪你领取的标注与审核任务进度</p>
          </div>

          {/* 筛选 Tab */}
          <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-full w-fit">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  activeFilter === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 任务列表 */}
          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((task) => (
                <Card key={task.id} className="border border-border">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* 左侧信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-semibold text-foreground truncate">{task.title}</h3>
                          {task.taskType === "annotation" ? (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">标注</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">审核</Badge>
                          )}
                          <TaskStatusBadge status={task.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            {task.publisher}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            截止 {task.deadline}
                          </span>
                          <span className="flex items-center gap-1.5 text-primary font-medium">
                            <Coins className="h-3.5 w-3.5" />
                            <span className="font-mono">{task.reward.toLocaleString()}</span>
                          </span>
                        </div>
                        {/* 进度 */}
                        <div className="mt-3 max-w-md">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">标注进度</span>
                            <span className="font-mono">{task.completedCases}/{task.totalCases}</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      </div>

                      {/* 右侧操作 */}
                      <div className="sm:w-40 flex-shrink-0">
                        {task.status === "in_progress" && (
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white" asChild>
                            <Link href={task.taskType === "audit" ? "/workspace/audit" : "/workspace/annotation"}>
                              继续{task.taskType === "audit" ? "审核" : "标注"}
                              <ArrowRight className="h-4 w-4 ml-1.5" />
                            </Link>
                          </Button>
                        )}
                        {task.status === "under_review" && (
                          <div className="text-center text-sm text-warning flex items-center justify-center gap-1.5 py-2">
                            <Clock className="h-4 w-4" />
                            等待审查
                          </div>
                        )}
                        {task.status === "completed" && (
                          <div className="text-center text-sm text-primary flex items-center justify-center gap-1.5 py-2">
                            <CheckCircle2 className="h-4 w-4" />
                            已结算
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">该分类下暂无任务</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/tasks">浏览标注任务</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
