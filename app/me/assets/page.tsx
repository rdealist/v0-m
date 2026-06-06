"use client"

import { useState } from "react"
import { Header, LevelBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Wallet,
  Clock,
  Lock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  ChevronLeft,
  Info,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
  pending: 8500,
  totalIncome: 245000,
  totalSpend: 35000,
}

// 流水记录
const mockFlows = [
  {
    id: "F001",
    type: "income",
    amount: 2400,
    description: "肺结节标注任务奖励",
    taskId: "T001",
    taskName: "肺结节良恶性标注",
    status: "completed",
    createdAt: "2026-05-19 14:30",
  },
  {
    id: "F002",
    type: "income",
    amount: 1800,
    description: "视网膜病变标注任务奖励",
    taskId: "T003",
    taskName: "视网膜病变分级标注",
    status: "completed",
    createdAt: "2026-05-18 16:45",
  },
  {
    id: "F003",
    type: "pending",
    amount: 3200,
    description: "脑部肿瘤分割任务（审核中）",
    taskId: "T002",
    taskName: "脑部肿瘤边界分割",
    status: "pending",
    createdAt: "2026-05-17 10:20",
  },
  {
    id: "F004",
    type: "expense",
    amount: -5250,
    description: "发布任务预存",
    taskId: "T001",
    taskName: "肺结节良恶性标注",
    status: "locked",
    createdAt: "2026-05-15 09:00",
  },
  {
    id: "F005",
    type: "refund",
    amount: 1050,
    description: "任务未完成退款",
    taskId: "T005",
    taskName: "心脏超声结构分割",
    status: "completed",
    createdAt: "2026-05-10 11:30",
  },
]

// 预存记录
const mockLockups = [
  {
    id: "L001",
    taskId: "T001",
    taskName: "肺结节良恶性标注",
    amount: 5250,
    status: "locked",
    lockedAt: "2026-05-15",
    estimatedRelease: "2026-06-15",
  },
  {
    id: "L002",
    taskId: "T006",
    taskName: "胸部X光肺炎检测",
    amount: 4725,
    status: "settled",
    lockedAt: "2026-04-01",
    settledAt: "2026-05-01",
  },
  {
    id: "L003",
    taskId: "T007",
    taskName: "眼底血管分割",
    amount: 3675,
    status: "refunded",
    lockedAt: "2026-03-15",
    refundedAt: "2026-04-15",
    refundReason: "任务取消",
  },
]

// 退款记录
const mockRefunds = [
  {
    id: "R001",
    taskId: "T007",
    taskName: "眼底血管分割",
    amount: 3675,
    reason: "任务取消",
    refundedAt: "2026-04-15",
  },
  {
    id: "R002",
    taskId: "T005",
    taskName: "心脏超声结构分割",
    amount: 1050,
    reason: "部分完成退款",
    refundedAt: "2026-05-10",
  },
]

export default function AssetsPage() {
  const [flowTypeFilter, setFlowTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("flows")

  const filteredFlows = mockFlows.filter(flow => {
    if (flowTypeFilter === "all") return true
    return flow.type === flowTypeFilter
  })

  const getFlowTypeTag = (type: string) => {
    switch (type) {
      case "income":
        return <Badge className="bg-primary/10 text-primary border-primary/30">收入</Badge>
      case "expense":
        return <Badge className="bg-primary/10 text-primary border-primary/30">支出</Badge>
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/30">审核中</Badge>
      case "refund":
        return <Badge className="bg-muted text-muted-foreground border-border">退款</Badge>
      default:
        return null
    }
  }

  const getLockupStatusBadge = (status: string) => {
    switch (status) {
      case "locked":
        return <Badge className="bg-primary/10 text-primary border-primary/30">锁定中</Badge>
      case "settled":
        return <Badge className="bg-primary/10 text-primary border-primary/30">已结算</Badge>
      case "refunded":
        return <Badge className="bg-muted text-muted-foreground border-border">已退款</Badge>
      default:
        return null
    }
  }

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
          {/* 页面标题 */}
          <div className="mb-8">
            <Link href="/me" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
              <ChevronLeft className="h-4 w-4" />
              返回个人中心
            </Link>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">我的资产</h1>
            <p className="mt-1 text-muted-foreground">沙箱钱包总览与交易流水</p>
          </div>

          {/* 钱包卡片 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm">可用余额</span>
                </div>
                <p className="text-3xl font-bold font-mono text-foreground">
                  {mockWallet.balance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">积分</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">审查中收益</span>
                </div>
                <p className="text-3xl font-bold font-mono text-warning">
                  {mockWallet.pending.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">积分</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">预存资金</span>
                </div>
                <p className="text-3xl font-bold font-mono text-primary">
                  {mockWallet.locked.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">积分</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">累计收益</span>
                </div>
                <p className="text-3xl font-bold font-mono text-primary">
                  {mockWallet.totalIncome.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  累计支出 <span className="font-mono">{mockWallet.totalSpend.toLocaleString()}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="flows">流水</TabsTrigger>
              <TabsTrigger value="lockups">任务预存</TabsTrigger>
              <TabsTrigger value="refunds">退款记录</TabsTrigger>
            </TabsList>

            {/* 流水 */}
            <TabsContent value="flows">
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>交易流水</CardTitle>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={flowTypeFilter} onValueChange={setFlowTypeFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="全部类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部类型</SelectItem>
                          <SelectItem value="income">收入</SelectItem>
                          <SelectItem value="expense">支出</SelectItem>
                          <SelectItem value="pending">审核中</SelectItem>
                          <SelectItem value="refund">退款</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>时间</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead>关联任务</TableHead>
                        <TableHead className="text-right">金额</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFlows.map((flow) => (
                        <TableRow key={flow.id} className="border-border">
                          <TableCell className="text-muted-foreground text-sm">
                            {flow.createdAt}
                          </TableCell>
                          <TableCell>{getFlowTypeTag(flow.type)}</TableCell>
                          <TableCell>{flow.description}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {flow.taskName}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-mono font-medium flex items-center justify-end gap-1",
                              flow.amount > 0 ? "text-primary" : "text-foreground"
                            )}>
                              {flow.amount > 0 ? (
                                <ArrowDownLeft className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              )}
                              {flow.amount > 0 ? "+" : ""}{flow.amount.toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 任务预存 */}
            <TabsContent value="lockups">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>任务预存记录</CardTitle>
                  <CardDescription>
                    发布任务时预存的资金，任务完成后自动结算
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>任务名称</TableHead>
                        <TableHead>预存金额</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>预存时间</TableHead>
                        <TableHead>结算/退款时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLockups.map((lockup) => (
                        <TableRow key={lockup.id} className="border-border">
                          <TableCell className="font-medium">{lockup.taskName}</TableCell>
                          <TableCell className="font-mono">{lockup.amount.toLocaleString()}</TableCell>
                          <TableCell>{getLockupStatusBadge(lockup.status)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{lockup.lockedAt}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {lockup.status === "locked" 
                              ? `预计 ${lockup.estimatedRelease}`
                              : lockup.settledAt || lockup.refundedAt
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 退款记录 */}
            <TabsContent value="refunds">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>退款记录</CardTitle>
                  <CardDescription>
                    任务未完成或取消时的退款记录
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>任务名称</TableHead>
                        <TableHead>退款金额</TableHead>
                        <TableHead>退款原因</TableHead>
                        <TableHead>退款时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockRefunds.map((refund) => (
                        <TableRow key={refund.id} className="border-border">
                          <TableCell className="font-medium">{refund.taskName}</TableCell>
                          <TableCell className="font-mono text-primary">+{refund.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">{refund.reason}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{refund.refundedAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 底部提示 */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">V1 沙箱积分账本</p>
              <p>当前为沙箱测试环境，不支持真实充值/提现。所有积分仅用于平台内测试。</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
