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
  Cpu,
  Rocket,
  Zap,
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
  description: "创建任务并预存报酬",
  color: "bg-primary/10 text-primary",
  },
  {
    icon: CheckSquare,
    title: "标注与审核",
    description: "标注者完成后Lv5+专家审核",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Wallet,
    title: "钱包结算",
    description: "审核通过后积分自动结算",
    color: "bg-primary/10 text-primary",
  },
]

// 平台统计（克制呈现，使用种子数据）
const platformStats = [
  {
    title: "标注记录",
    value: "1,245,800",
    unit: "个",
    icon: <FileStack className="h-5 w-5 text-primary" />,
  },
  {
    title: "接入影像总量",
    value: "486.3",
    unit: "TB",
    icon: <Database className="h-5 w-5 text-primary" />,
  },
  {
    title: "活跃任务数",
    value: "128",
    unit: "个",
    icon: <ClipboardList className="h-5 w-5 text-primary" />,
  },
  {
    title: "认证专家",
    value: "3,892",
    unit: "位",
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

// 等级阶梯说明（精简版）
const levelDescriptions = [
  { level: 1, name: "初级标注员", ability: "基础标注任务", reward: "基础报酬" },
  { level: 3, name: "中级标注员", ability: "复杂标注任务", reward: "1.5x 报酬系数" },
  { level: 5, name: "专家", ability: "审核资质", reward: "2x 报酬系数", highlight: true },
  { level: 7, name: "权威专家", ability: "高优先级任务", reward: "3x 报酬系数" },
  { level: 9, name: "首席专家", ability: "最高权限", reward: "4x 报酬系数" },
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
                中国拥有超 3285 项医学影像检测，但智能化辅助诊断覆盖率不足 2%。我们致力于打破传统瓶颈，全面加速临床级智能化应用的普及与落地。
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
                        <p className="text-2xl font-bold text-foreground font-mono">
                          {stat.value}
                          <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 数据端与标注端解耦 */}
        <section className="bg-card shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                打破院墙限制：让沉睡的影像资产，跨时空连接全球专家智库
              </h2>
              <p className="mt-3 max-w-3xl mx-auto text-lg text-muted-foreground">
                将海量数据获取能力与专家高年资智力彻底并行解耦，全面释放产业效率
              </p>
            </div>
            
            {/* 解耦示意图 */}
            <div className="relative max-w-5xl mx-auto">
              {/* 中心连接线 - 桌面端 */}
              <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300" />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {/* 数据端 */}
                <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm space-y-5 relative">
                  <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    数据端
                  </div>
                  <div className="pt-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                      <Database className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">医院/机构</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                      专注数据资产管理，无需操心标注流程。一键上传脱敏数据，平台自动匹配最优标注资源，数据即刻转化为可持续收益的数字资产。
                    </p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Upload className="h-3.5 w-3.5 text-blue-500" />
                      <span>脱敏上传，隐私合规</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <FileStack className="h-3.5 w-3.5 text-blue-500" />
                      <span>自动匹配标注资源</span>
                    </div>
                  </div>
                  <Link href="/data" className="w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs py-2.5 rounded-lg border border-blue-200 transition block">
                    {"上传数据资产 →"}
                  </Link>
                </div>

                {/* 中心 - 区块链确权 */}
<div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-2xl border-2 border-blue-300 shadow-md space-y-5 relative lg:scale-105 lg:z-10">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    区块链确权
                  </div>
                  <div className="pt-2 text-center">
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">智能合约结算</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                      每一份贡献链上存证，权益归属清晰透明。API 调用即触发分账，数据贡献者与标注专家共享模型收益。
                    </p>
                  </div>
<div className="space-y-2 pt-2 border-t border-blue-200">
                      <div className="flex items-center justify-center gap-2 text-xs text-blue-700">
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>贡献存证，永久可查</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-700">
                      <Coins className="h-3.5 w-3.5" />
                      <span>秒级分账，收益透明</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-blue-700 bg-white/60 border border-blue-200 rounded-lg p-2 text-center font-medium">
                    清算结算系统全合规支持
                  </div>
                </div>

                {/* 标注端 */}
                <div className="bg-white p-6 rounded-2xl border-2 border-cyan-200 shadow-sm space-y-5 relative">
                  <div className="absolute -top-3 right-6 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    标注端
                  </div>
                  <div className="pt-2">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-cyan-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">高年资专家</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                      突破地域与时间限制，用碎片化时间释放专业价值。平台智能派单，专家专注标注与审核，经验即刻转化为持续收益。
                    </p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-cyan-500" />
                      <span>碎片时间，灵活参与</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Trophy className="h-3.5 w-3.5 text-cyan-500" />
                      <span>等级越高，收益越高</span>
                    </div>
                  </div>
                  <Link href="/tasks" className="w-full text-center bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold text-xs py-2.5 rounded-lg border border-cyan-200 transition block">
                    {"领取标注任务 →"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 热门数据集 + 热门任务 */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            {/* 热门数据集 */}
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">热门数据集</h2>
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
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">热门任务</h2>
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
                        <div className="flex items-center gap-1.5 text-primary font-medium">
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

        {/* 信任阶梯 */}
        <section className="bg-card shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                信任阶梯
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                专业能力决定任务权限，贡献质量决定收益回报
              </p>
            </div>
            
            {/* 等级展示 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {levelDescriptions.map((item, index) => (
                <div
                  key={item.level}
                  className={`relative flex flex-col items-center p-5 rounded-xl border ${
                    item.highlight 
                      ? "bg-primary/5 border-primary/30 shadow-md" 
                      : "bg-background border-border shadow-sm"
                  }`}
                >
                  <LevelBadge level={item.level} size="md" />
                  <span className="mt-3 text-sm font-semibold text-foreground">{item.name}</span>
                  <span className="mt-1 text-xs text-muted-foreground text-center">{item.ability}</span>
                  <span className="mt-2 text-xs font-medium text-primary">{item.reward}</span>
                  {item.highlight && (
                    <Badge className="absolute -top-2 -right-2 bg-primary text-white text-[10px]">审核资质</Badge>
                  )}
                  {index < levelDescriptions.length - 1 && (
                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-8">
              等级通过完成任务与审核积累提升，高质量贡献可获得额外经验加成
            </p>
          </div>
        </section>

        {/* iMedImage® 医学专科模型工厂 */}
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-8 border-t border-slate-100">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">iMedImage 医学专科模型工厂</h2>
            <p className="text-lg text-muted-foreground">从原始影像到生产级应用，只需三步</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground">分布式微调</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  预置 iMedImage 基础大模型，支持零代码一键配置超参、多任务类型、多维度统计指标。无需深度学习背景，即可快速打造专属专科模型。
                </p>
              </div>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground">快捷部署</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  可视化训练过程监控，支持 TensorBoard 实时查看训练曲线与模型收敛状态。零代码一键部署，自动适配云端推理集群。
                </p>
              </div>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 hover:border-primary/30 hover:shadow-md transition-all">
<div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground">高并发推理</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  毫秒级批量推理响应，支持多模态影像输入。输出临床级 CAM 可解释性热力图，辅助医生快速定位病灶区域，提升诊断效率。
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-6 py-2.5 rounded-lg transition">
              进入 iMed MaaS
              <ArrowRight className="inline-block ml-2 h-4 w-4" />
            </a>
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
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
