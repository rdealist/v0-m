"use client"

import { Header, Footer, StatCard, LevelBadge, TaskStatusBadge, DatasetStatusBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Database,
  ClipboardList,
  Users,
  FileStack,
  ArrowRight,
  Upload,
  FileSearch,
  CheckSquare,
  Wallet,
  Trophy,
  MessageSquare,
  Clock,
  Coins,
  ChevronRight,
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

// 业务闭环步骤（根据Brief：上传 → 发布 → 任务 → 标注 → 审核 → 钱包变化）
const workflowSteps = [
  {
    icon: Upload,
    title: "数据上传",
    description: "机构上传医学影像数据集",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FileSearch,
    title: "数据发布",
    description: "发布至数据广场公开展示",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ClipboardList,
    title: "任务发布",
    description: "创建任务并锁仓积分",
    color: "bg-[#0F8770]/10 text-[#0F8770]",
  },
  {
    icon: CheckSquare,
    title: "标注与审核",
    description: "标注者完成后Lv5+专家审核",
    color: "bg-[#0F8770]/10 text-[#0F8770]",
  },
  {
    icon: Wallet,
    title: "钱包结算",
    description: "审核通过后积分自动结算",
    color: "bg-[#0F8770]/10 text-[#0F8770]",
  },
]

// 平台统计（克制呈现，使用种子数据）
const platformStats = [
  {
    title: "标注记录",
    value: "1,245,800",
    icon: <FileStack className="h-5 w-5 text-primary" />,
  },
  {
    title: "接入影像总量（TB）",
    value: "486.3",
    icon: <Database className="h-5 w-5 text-primary" />,
  },
  {
    title: "活跃任务数",
    value: "128",
    icon: <ClipboardList className="h-5 w-5 text-primary" />,
  },
  {
    title: "全球认证专家（位）",
    value: "3,892",
    icon: <Users className="h-5 w-5 text-primary" />,
  },
]

// 热门数据集（mock）
const hotDatasets = [
  {
    id: "DS001",
    name: "胸部CT肺结节数据集",
    owner: "协和医院影像中心",
    modality: "CT",
    samples: 12500,
    status: "public" as const,
  },
  {
    id: "DS002",
    name: "脑部MRI肿瘤分割数据",
    owner: "华西医学影像研究院",
    modality: "MRI",
    samples: 8200,
    status: "public" as const,
  },
  {
    id: "DS003",
    name: "眼底OCT糖网病变数据",
    owner: "中山眼科中心",
    modality: "OCT",
    samples: 15800,
    status: "public" as const,
  },
]

// 热门任务（mock）
const hotTasks = [
  {
    id: "T001",
    title: "肺结节良恶性标注",
    reward: 5000,
    minLevel: 3,
    deadline: "2026-06-15",
    claimed: 12,
    maxClaims: 20,
    status: "open" as const,
  },
  {
    id: "T002",
    title: "脑部肿瘤边界分割",
    reward: 8000,
    minLevel: 4,
    deadline: "2026-06-20",
    claimed: 5,
    maxClaims: 10,
    status: "open" as const,
  },
  {
    id: "T003",
    title: "视网膜病变分级标注",
    reward: 3500,
    minLevel: 2,
    deadline: "2026-06-10",
    claimed: 18,
    maxClaims: 25,
    status: "open" as const,
  },
]

// 等级阶梯说明
const levelDescriptions = [
  { level: 0, label: "L0", name: "游客", ability: "仅浏览公开内容" },
  { level: 1, label: "Lv1", name: "新手", ability: "基础标注" },
  { level: 2, label: "Lv2", name: "初级", ability: "简单任务" },
  { level: 3, label: "Lv3", name: "中级", ability: "复杂任务" },
  { level: 4, label: "Lv4", name: "高级", ability: "高难任务" },
  { level: 5, label: "Lv5", name: "专家", ability: "审核权限", highlight: true },
  { level: 6, label: "Lv6", name: "资深专家", ability: "审核权限" },
  { level: 7, label: "Lv7", name: "权威专家", ability: "审核权限" },
  { level: 8, label: "Lv8", name: "首席专家", ability: "审核权限" },
  { level: 9, label: "Lv9", name: "顶级专家", ability: "最高权限" },
]

export default function HomePage() {
  const isLoggedIn = true // 模拟已登录状态

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 全局顶部导航 */}
      <Header
        isLoggedIn={isLoggedIn}
        user={mockUser}
        wallet={mockWallet}
        notificationCount={3}
        onNavigate={(path) => console.log("Navigate to:", path)}
        onLogout={() => console.log("Logout")}
        onNotificationClick={() => console.log("Notifications")}
      />

      {/* 主内容区 */}
      <main className="flex-1">
        {/* Hero 区域 */}
        <section className="bg-gradient-to-b from-accent/50 to-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance leading-tight">
                加速全球医学影像行业迈入智能化时代
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                中国拥有超 3285 项医学影像检测，但智能化辅助诊断渗透率不足 1%。我们致力于打破传统瓶颈，全面加速临床级智能化应用的普及与落地。
              </p>
              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                {isLoggedIn ? (
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8" asChild>
                    <Link href="/workspace/annotation">
                      进入工作台
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8" asChild>
                    <Link href="/login">
                      立即注册
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                  <Link href="/data">浏览数据广场</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 关键指标卡片（克制呈现） */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {platformStats.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold text-foreground font-mono">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 业务闭环时间线 */}
        <section className="bg-card shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                打破院墙限制：让沉睡的影像资产，跨时空连接全球专家智库
              </h2>
              <p className="mt-3" style={{ fontSize: '18px', color: 'rgb(92, 102, 112)' }}>
                将海量数据获取能力与专家高年资智力彻底并行解耦，全面释放产业效率。
              </p>
            </div>
            
            {/* 时间线 */}
            <div className="relative">
              {/* 连接线 */}
              <div className="absolute top-12 left-0 right-0 h-0.5 bg-muted hidden lg:block" />
              
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="relative flex flex-col items-center text-center">
                    {/* 步骤圆点 */}
                    <div className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl ${step.color} bg-background shadow-sm`}>
                      <step.icon className="h-10 w-10" />
                    </div>
                    {/* 步骤编号 */}
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                      {index + 1}
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 热门数据集 + 热门任务 */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            {/* 热门数据集 */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">热门数据集</h2>
                <Link href="/data" className="text-sm text-primary hover:underline flex items-center gap-1">
                  查看全部 <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hotDatasets.map((dataset) => (
                  <Card key={dataset.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{dataset.name}</CardTitle>
                          <CardDescription className="mt-1 truncate">{dataset.owner}</CardDescription>
                        </div>
                        <DatasetStatusBadge status={dataset.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="secondary" className="font-normal">{dataset.modality}</Badge>
                        <span className="text-muted-foreground">
                          <span className="font-mono">{dataset.samples.toLocaleString()}</span> 样本
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 热门任务 */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">热门任务</h2>
                <Link href="/tasks" className="text-sm text-primary hover:underline flex items-center gap-1">
                  查看全部 <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hotTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base flex-1 min-w-0 truncate">{task.title}</CardTitle>
                        <TaskStatusBadge status={task.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-[#0F8770] font-medium">
                          <Coins className="h-4 w-4" />
                          <span className="font-mono">{task.reward.toLocaleString()}</span> 积分
                        </div>
                        <LevelBadge level={task.minLevel} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          截止 {task.deadline}
                        </div>
                        <span>
                          <span className="font-mono">{task.claimed}</span>/{task.maxClaims} 已领取
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 信任阶梯（L0 + Lv1~Lv9） */}
        <section className="bg-card shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                信任阶梯
              </h2>
              <p className="mt-3 text-muted-foreground">
                Lv5 及以上解锁审核权限
              </p>
            </div>
            
            {/* 等级展示 */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-max justify-center">
                {levelDescriptions.map((item) => (
                  <div
                    key={item.level}
                    className={`flex flex-col items-center p-4 rounded-xl ${
                      item.highlight 
                        ? "bg-[#0F8770]/5 shadow-md" 
                        : "bg-background shadow-sm"
                    } min-w-[100px]`}
                  >
                    {item.level === 0 ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">
                        L0
                      </div>
                    ) : (
                      <LevelBadge level={item.level} size="md" />
                    )}
                    <span className="mt-2 text-sm font-medium text-foreground">{item.name}</span>
                    <span className="mt-1 text-xs text-muted-foreground text-center">{item.ability}</span>
                    {item.highlight && (
                      <Badge className="mt-2 bg-[#0F8770] text-white text-xs">审核起点</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 入口卡片（四张RouteCard） */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/data">
                <Card className="h-full hover:shadow-lg transition-all group cursor-pointer">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Database className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-4">数据广场</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      浏览公开数据资产��按模态、科室筛选
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tasks">
                <Card className="h-full hover:shadow-lg transition-all group cursor-pointer">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F8770]/10 text-[#0F8770] group-hover:bg-[#0F8770] group-hover:text-white transition-colors">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-4">任务广场</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      领取标注任务，赚取积分收益
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/rankings">
                <Card className="h-full hover:shadow-lg transition-all group cursor-pointer">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-4">排行榜</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      查看医生、专家、机构贡献排名
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/community">
                <Card className="h-full hover:shadow-lg transition-all group cursor-pointer">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-4">社区</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      医学讨论交流，分享专业见解
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 全局底部 */}
      <Footer />
    </div>
  )
}
