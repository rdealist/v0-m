"use client"

import { Header, LevelBadge, TaskStatusBadge, DatasetStatusBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Wallet,
  Clock,
  Lock,
  TrendingUp,
  ChevronRight,
  Database,
  ClipboardList,
  CheckSquare,
  Shield,
  Building2,
  Plus,
  Upload,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

// 模拟用户数据 - Lv5专家身份
const mockUser = {
  name: "张医生",
  email: "zhang@hospital.com",
  avatar: undefined,
  level: 5,
  verified: true,
  institution: "协和医院影像中心",
  specialty: "放射科",
  joinDate: "2025-08-15",
}

const mockWallet = {
  balance: 125680,
  locked: 15000,
  pending: 8500,
  totalIncome: 245000,
  totalSpend: 35000,
  change: 2350,
}

// 我的数据集（发布方面板）
const myDatasets = [
  {
    id: "DS001",
    name: "胸部CT肺结节数据集",
    samples: 12500,
    status: "public" as const,
    views: 1280,
    createdAt: "2026-03-15",
  },
]

// 我发布的任务
const myPublishedTasks = [
  {
    id: "T001",
    title: "肺结节良恶性标注",
    reward: 5000,
    lockedFunds: 5250,
    claimed: 12,
    maxClaims: 20,
    status: "open" as const,
  },
]

// 我领取的任务（标注者面板）
const myClaimedTasks = [
  {
    id: "T002",
    title: "脑部肿瘤边界分割",
    reward: 8000,
    progress: 65,
    totalCases: 100,
    completedCases: 65,
    deadline: "2026-06-20",
    status: "in_progress" as const,
  },
]

// 审核统计（专家面板）
const auditStats = {
  todayAudited: 12,
  pendingAudit: 3,
  totalAudited: 856,
  approvalRate: 92,
}

export default function PersonalCenterPage() {
  const isPublisher = true // 有数据集或任务的用户
  const isWorker = true // 领取过任务的用户
  const isExpert = mockUser.level >= 5

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        currentPath="/me"
        notificationCount={3}
        onNavigate={(path) => console.log("Navigate to:", path)}
        onLogout={() => console.log("Logout")}
        onNotificationClick={() => console.log("Notifications")}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 身份卡片 */}
          <Card className="mb-8 overflow-hidden">
            {/* 渐变背景头部 */}
            <div className="relative h-32 bg-gradient-to-r from-primary via-chart-2 to-chart-3">
              {/* 像素网格覆盖层 */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.1) 50%),
                    linear-gradient(0deg, transparent 50%, rgba(255,255,255,0.1) 50%)
                  `,
                  backgroundSize: '8px 8px'
                }}
              />
              {/* 光晕效果 */}
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            </div>
            
            <CardContent className="relative pt-0 pb-6">
              {/* 头像 - 悬浮在渐变背景上 */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-chart-2 to-chart-3 blur-md opacity-60 scale-110" />
                  <Avatar className="h-24 w-24 relative ring-4 ring-background shadow-xl">
                    <AvatarImage src={mockUser.avatar} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-chart-2 text-white font-bold">
                      {mockUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 pt-2">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-foreground">{mockUser.name}</h1>
                    <LevelBadge level={mockUser.level} size="md" />
                    {mockUser.verified && (
                      <Badge className="bg-primary/10 text-primary border-primary/30">
                        <Shield className="h-3 w-3 mr-1" />
                        已认证
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {mockUser.institution}
                    </span>
                    <span>{mockUser.specialty}</span>
                    <span>加入于 {mockUser.joinDate}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 sm:self-center">
                  <Button variant="outline" asChild>
                    <Link href="/me/settings">账号设置</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/me/certification">资质认证</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 钱包概览卡片 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Link href="/me/assets">
              <Card className="border border-border hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm">可用余额</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {mockWallet.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">积分</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/me/assets">
              <Card className="border border-border hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">审查中收益</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-warning">
                    {mockWallet.pending.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">积分</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/me/assets">
              <Card className="border border-border hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm">预存资金</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-primary">
                    {mockWallet.locked.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">积分</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/me/assets">
              <Card className="border border-border hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">累计收益</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-2xl font-bold font-mono text-primary">
                  {mockWallet.totalIncome.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">积分</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* 面板区域 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 发布方面板 */}
            {isPublisher && (
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        我的数据与任务
                      </CardTitle>
                      <CardDescription className="mt-1">管理您发布的数据集和任务</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 数据集列表 */}
                  {myDatasets.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">数据集</p>
                      {myDatasets.map((dataset) => (
                        <div
                          key={dataset.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{dataset.name}</p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-mono">{dataset.samples.toLocaleString()}</span> 样本
                            </p>
                          </div>
                          <DatasetStatusBadge status={dataset.status} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 任务列表 */}
                  {myPublishedTasks.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">已发布任务</p>
                      {myPublishedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                              预存 <span className="font-mono text-primary">{task.lockedFunds.toLocaleString()}</span> 积分
                            </p>
                          </div>
                          <div className="text-right">
                            <TaskStatusBadge status={task.status} />
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.claimed}/{task.maxClaims} 已领取
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/data/upload">
                        <Upload className="h-4 w-4 mr-1.5" />
                        上传数据
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/tasks/new">
                        <Plus className="h-4 w-4 mr-1.5" />
                        发布任务
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 标注者面板 */}
            {isWorker && (
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        我的标注
                      </CardTitle>
                      <CardDescription className="mt-1">查看您领取的标注任务</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myClaimedTasks.length > 0 ? (
                    <>
                      {myClaimedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 rounded-lg border border-border bg-card space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                截止 {task.deadline}
                              </p>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-primary/30">
                              进行中
                            </Badge>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">标注进度</span>
                              <span className="font-mono">
                                {task.completedCases}/{task.totalCases}
                              </span>
                            </div>
                            <Progress value={task.progress} className="h-2" />
                          </div>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white" asChild>
                            <Link href="/workspace/annotation">
                              继续标注
                              <ArrowRight className="h-4 w-4 ml-1.5" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/30" />
                      <p className="mt-4 text-muted-foreground">暂无进行中的任务</p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href="/tasks">浏���任务广场</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 专家面板（Lv5+） */}
            {isExpert && (
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-primary" />
                        审核工作台
                      </CardTitle>
                      <CardDescription className="mt-1">Lv5+ 专家审核入口</CardDescription>
                    </div>
                    <LevelBadge level={5} size="sm" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold font-mono text-foreground">{auditStats.todayAudited}</p>
                      <p className="text-xs text-muted-foreground mt-1">今日审核</p>
                    </div>
                    <div className="p-3 rounded-lg bg-warning/10 text-center">
                      <p className="text-2xl font-bold font-mono text-warning">{auditStats.pendingAudit}</p>
                      <p className="text-xs text-muted-foreground mt-1">待审核</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold font-mono text-foreground">{auditStats.totalAudited}</p>
                      <p className="text-xs text-muted-foreground mt-1">累计审核</p>
                    </div>
<div className="p-3 rounded-lg bg-primary/10 text-center">
                        <p className="text-2xl font-bold font-mono text-primary">{auditStats.approvalRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">通过率</p>
                    </div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                    <Link href="/workspace/audit">
                      进入审核工作台
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
