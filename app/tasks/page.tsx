"use client"

import { useState } from "react"
import { Header, Footer, LevelBadge, TaskStatusBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Search,
  Plus,
  Clock,
  Coins,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Building2,
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
  change: 2350,
}

// 模拟任务列表
const mockTasks = [
  {
    id: "T001",
    title: "肺结节良恶性标注",
    description: "对胸部CT影像中的肺结节进行良恶性分类标注，需要标注结节位置和分类",
    publisher: "协和医院影像中心",
    publisherLevel: 7,
    reward: 5000,
    rewardPerCase: 4,
    minLevel: 3,
    deadline: "2026-06-15",
    claimed: 12,
    maxClaims: 20,
    totalCases: 1250,
    status: "open" as const,
    modality: "计算机断层扫描",
    specialty: "呼吸与胸壁",
    taskType: "annotation" as const,
  },
  {
    id: "T002",
    title: "脑部肿瘤边界分割",
    description: "对脑部MRI影像中的肿瘤进行边界分割标注，要求精确到像素级别",
    publisher: "华西医学影像研究院",
    publisherLevel: 8,
    reward: 8000,
    rewardPerCase: 8,
    minLevel: 4,
    deadline: "2026-06-20",
    claimed: 5,
    maxClaims: 10,
    totalCases: 1000,
    status: "open" as const,
    modality: "磁共振成像",
    specialty: "神经与颅脑",
    taskType: "annotation" as const,
  },
  {
    id: "T003",
    title: "视网膜病变分级标注",
    description: "对眼底OCT影像进行糖尿病视网膜病变分级标注（0-4级）",
    publisher: "中山眼科中心",
    publisherLevel: 6,
    reward: 3500,
    rewardPerCase: 2,
    minLevel: 2,
    deadline: "2026-06-10",
    claimed: 18,
    maxClaims: 25,
    totalCases: 1750,
    status: "open" as const,
    modality: "可见光影像",
    specialty: "视觉与五官系统",
    taskType: "annotation" as const,
  },
  {
    id: "T004",
    title: "胸部X光肺炎检测",
    description: "对胸部X光片进行肺炎检测和定位标注",
    publisher: "北京大学人民医院",
    publisherLevel: 7,
    reward: 4500,
    rewardPerCase: 2,
    minLevel: 2,
    deadline: "2026-06-08",
    claimed: 22,
    maxClaims: 30,
    totalCases: 2250,
    status: "open" as const,
    modality: "X射线影像",
    specialty: "呼吸与胸壁",
    taskType: "annotation" as const,
  },
  {
    id: "T005",
    title: "心脏超声结构分割",
    description: "对心脏超声影像进行心室心房边界分割",
    publisher: "阜外医院",
    publisherLevel: 8,
    reward: 6000,
    rewardPerCase: 6,
    minLevel: 4,
    deadline: "2026-06-25",
    claimed: 8,
    maxClaims: 15,
    totalCases: 1000,
    status: "open" as const,
    modality: "声学超声影像",
    specialty: "循环与心血管",
    taskType: "annotation" as const,
  },
  {
    id: "T006",
    title: "肺结节标注质量审核",
    description: "审核其他标注员提交的肺结节标注结果，确保标注质量符合标准",
    publisher: "协和医院影像中心",
    publisherLevel: 7,
    reward: 3000,
    rewardPerCase: 3,
    minLevel: 5,
    deadline: "2026-06-18",
    claimed: 2,
    maxClaims: 5,
    totalCases: 500,
    status: "open" as const,
    modality: "计算机断层扫描",
    specialty: "呼吸与胸壁",
    taskType: "audit" as const,
  },
  {
    id: "T007",
    title: "脑部MRI分割审核",
    description: "审核脑部肿瘤边界分割的标注结果，需要具备神经影像专业背景",
    publisher: "华西医学影像研究院",
    publisherLevel: 8,
    reward: 5000,
    rewardPerCase: 5,
    minLevel: 5,
    deadline: "2026-06-22",
    claimed: 1,
    maxClaims: 3,
    totalCases: 300,
    status: "open" as const,
    modality: "磁共振成像",
    specialty: "神经与颅脑",
    taskType: "audit" as const,
  },
]

// 我的任务（已领取的任务）
const myClaimedTasks = [
  {
    id: "T001",
    title: "肺结节良恶性标注",
    publisher: "协和医院影像中心",
    reward: 5000,
    deadline: "2026-06-15",
    myProgress: 45,
    totalCases: 100,
    completedCases: 45,
    status: "in_progress" as const,
    taskType: "annotation" as const,
  },
  {
    id: "T006",
    title: "肺结节标注质量审核",
    publisher: "协和医院影像中心",
    reward: 3000,
    deadline: "2026-06-18",
    myProgress: 20,
    totalCases: 50,
    completedCases: 10,
    status: "in_progress" as const,
    taskType: "audit" as const,
  },
]

// 我发布的任务（机构可见）
const myPublishedTasks = [
  {
    id: "T001",
    title: "肺结节良恶性标注",
    reward: 5000,
    lockedFunds: 5250,
    deadline: "2026-06-15",
    claimed: 12,
    maxClaims: 20,
    status: "open" as const,
  },
]

export default function TaskMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModality, setSelectedModality] = useState<string>("all")
  const [selectedTaskType, setSelectedTaskType] = useState<string>("all")
  const [selectedMinLevel, setSelectedMinLevel] = useState<string>("all")
  const [sortBy, setSortBy] = useState("newest")
  const [activeTab, setActiveTab] = useState("all")
  const [myTaskSource, setMyTaskSource] = useState<string>("claimed")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const userLevel = mockUser.level
  const isExpert = userLevel >= 5
  const isPublisher = true // 模拟机构身份

  // 过滤任务
  const filteredTasks = mockTasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedModality !== "all" && task.modality !== selectedModality) {
      return false
    }
    // 任务类型筛选
    if (selectedTaskType !== "all" && task.taskType !== selectedTaskType) {
      return false
    }
    // 审核任务只有 Lv5+ 可见
    if (task.taskType === "audit" && !isExpert) {
      return false
    }
    return true
  })

  // 分页
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // 判断用户是否可以领取任务
  const canClaimTask = (task: typeof mockTasks[0]) => {
    return userLevel >= task.minLevel && task.claimed < task.maxClaims
  }

  // 计算截止时间状态
  const getDeadlineStatus = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 3) return "urgent"
    if (daysLeft <= 7) return "warning"
    return "normal"
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        currentPath="/tasks"
        notificationCount={3}
        onNavigate={(path) => console.log("Navigate to:", path)}
        onLogout={() => console.log("Logout")}
        onNotificationClick={() => console.log("Notifications")}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 页面标题区 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">任务广场</h1>
              <p className="mt-1 text-muted-foreground">发现标注任务，赚取积分收益</p>
            </div>
            {isPublisher && (
              <Button className="bg-[#0F8770] hover:bg-[#0A6655] text-white" asChild>
                <Link href="/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  发布任务
                </Link>
              </Button>
            )}
          </div>

          {/* 任务Tab */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
              <TabsTrigger value="all">全部任务</TabsTrigger>
              <TabsTrigger value="mine">我的任务</TabsTrigger>
            </TabsList>

            {/* 搜索和筛选 - 全部任务Tab */}
            {activeTab === "all" && (
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索任务..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="任务类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="annotation">标注任务</SelectItem>
                      {isExpert && <SelectItem value="audit">审核任务</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Select value={selectedModality} onValueChange={setSelectedModality}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="成像模态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部模态</SelectItem>
                      <SelectItem value="X射线影像">X射线影像 (XRAY)</SelectItem>
                      <SelectItem value="计算机断层扫描">计算机断层扫描 (CT)</SelectItem>
                      <SelectItem value="声学超声影像">声学超声影像 (US)</SelectItem>
                      <SelectItem value="实验室与特异分子显色">实验室与特异分子显色 (LAB)</SelectItem>
                      <SelectItem value="磁共振成像">磁共振成像 (MR)</SelectItem>
                      <SelectItem value="全幅数字病理">全幅数字病理 (WSI)</SelectItem>
                      <SelectItem value="可见光影像">专科可见光影像 (VL)</SelectItem>
                      <SelectItem value="核医学与分子代谢">核医学与分子代谢 (NM)</SelectItem>
                      <SelectItem value="时序动态视频流媒体">时序动态视频流媒体 (VIDEO)</SelectItem>
                      <SelectItem value="其他">其他 (OTH)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedMinLevel} onValueChange={setSelectedMinLevel}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="最低等级" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">全部等级</SelectItem>
                    <SelectItem value="1">Lv1 及以上</SelectItem>
                    <SelectItem value="2">Lv2 及以上</SelectItem>
                    <SelectItem value="3">Lv3 及以上</SelectItem>
                    <SelectItem value="4">Lv4 及以上</SelectItem>
                    <SelectItem value="5">Lv5 及以上</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="排序" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">最新发布</SelectItem>
                    <SelectItem value="deadline">截止最近</SelectItem>
                    <SelectItem value="reward">奖励最高</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              </div>
            )}

            {/* 我的任务Tab筛选 */}
            {activeTab === "mine" && (
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex gap-2">
                  <Select value={myTaskSource} onValueChange={setMyTaskSource}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="任务来源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claimed">我的任务</SelectItem>
                      {isPublisher && <SelectItem value="published">我发布的</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="任务类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="annotation">标注任务</SelectItem>
                      <SelectItem value="audit">审核任务</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* 全部任务 */}
            <TabsContent value="all" className="space-y-6">
              {/* 结果计数 */}
              <p className="text-sm text-muted-foreground">
                共找到 <span className="font-mono font-medium text-foreground">{filteredTasks.length}</span> 个任务
                {totalPages > 1 && (
                  <span>，显示第 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTasks.length)} 个</span>
                )}
              </p>
              
              {/* 任务列表 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedTasks.map((task) => {
                  const deadlineStatus = getDeadlineStatus(task.deadline)
                  const claimable = canClaimTask(task)
                  const levelBlocked = userLevel < task.minLevel
                  const isFull = task.claimed >= task.maxClaims

                  return (
                    <Card
                      key={task.id}
                      className={cn(
                        "border border-border hover:border-primary/30 hover:shadow-sm transition-all",
                        !claimable && "opacity-75"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base truncate">
                                {task.title}
                              </CardTitle>
                              {task.taskType === "annotation" && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  标注
                                </Badge>
                              )}
                              {task.taskType === "audit" && (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  审核
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mt-1 flex items-center gap-1.5 text-sm">
                              <Building2 className="h-3.5 w-3.5" />
                              <span className="truncate">{task.publisher}</span>
                            </CardDescription>
                          </div>
                          <TaskStatusBadge status={task.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>

                        {/* 奖励和等级要求 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[#0F8770] font-medium">
                            <Coins className="h-4 w-4" />
                            <span className="font-mono">{task.reward.toLocaleString()}</span>
                            <span className="text-sm">积分</span>
                          </div>
                          <LevelBadge level={task.minLevel} size="sm" />
                        </div>

                        {/* 截止时间和进度 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className={cn(
                              "flex items-center gap-1.5",
                              deadlineStatus === "urgent" ? "text-destructive" :
                              deadlineStatus === "warning" ? "text-warning" :
                              "text-muted-foreground"
                            )}>
                              {deadlineStatus === "urgent" ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                              截止 {task.deadline}
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span className="font-mono">{task.claimed}</span>/{task.maxClaims}
                            </div>
                          </div>
                          <Progress 
                            value={(task.claimed / task.maxClaims) * 100} 
                            className="h-1.5"
                          />
                        </div>

                        {/* 领取按钮 */}
                        <Button
                          className={cn(
                            "w-full",
                            claimable
                              ? "bg-[#0F8770] hover:bg-[#0A6655] text-white"
                              : ""
                          )}
                          variant={claimable ? "default" : "secondary"}
                          disabled={!claimable}
                        >
                          {levelBlocked ? (
                            `需要 Lv${task.minLevel} 及以上`
                          ) : isFull ? (
                            "名额已满"
                          ) : (
                            "领取任务"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }
                      return null
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </TabsContent>

            {/* 我的任务 */}
            <TabsContent value="mine" className="space-y-6">
              {/* 我领取的任务 */}
              {myTaskSource === "claimed" && (
                <>
                  {myClaimedTasks.filter(t => selectedTaskType === "all" || t.taskType === selectedTaskType).length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {myClaimedTasks
                        .filter(t => selectedTaskType === "all" || t.taskType === selectedTaskType)
                        .map((task) => (
                        <Card key={task.id} className="border border-border">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{task.title}</CardTitle>
                              {task.taskType === "annotation" && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  标注
                                </Badge>
                              )}
                              {task.taskType === "audit" && (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  审核
                                </Badge>
                              )}
                            </div>
                            <CardDescription>{task.publisher}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {task.taskType === "audit" ? "审核进度" : "标注进度"}
                                </span>
                                <span className="font-mono font-medium">
                                  {task.completedCases}/{task.totalCases}
                                </span>
                              </div>
                              <Progress value={task.myProgress} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                截止 {task.deadline}
                              </div>
                              <div className="flex items-center gap-1.5 text-[#0F8770] font-medium">
                                <Coins className="h-4 w-4" />
                                <span className="font-mono">{task.reward.toLocaleString()}</span>
                              </div>
                            </div>
                            <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                              <Link href={task.taskType === "audit" ? "/workspace/audit" : "/workspace/annotation"}>
                                {task.taskType === "audit" ? "去审核" : "去标注"}
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border border-dashed">
                      <CardContent className="py-16 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
                        <h3 className="mt-4 text-lg font-medium text-foreground">暂无进行中的任务</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          浏览任务广场，领取适合您的任务
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => setActiveTab("all")}>
                          浏览任务
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* 我发布的 */}
              {myTaskSource === "published" && isPublisher && (
                <>
                  {myPublishedTasks.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {myPublishedTasks.map((task) => (
                        <Card key={task.id} className="border border-border">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{task.title}</CardTitle>
                              <TaskStatusBadge status={task.status} />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">任务奖励</span>
                                <p className="font-mono font-medium text-foreground">
                                  {task.reward.toLocaleString()} 积分
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">预存报酬</span>
                                <p className="font-mono font-medium text-primary">
                                  {task.lockedFunds.toLocaleString()} 积分
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">领取进度</span>
                                <span className="font-mono">{task.claimed}/{task.maxClaims}</span>
                              </div>
                              <Progress value={(task.claimed / task.maxClaims) * 100} className="h-1.5" />
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                截止 {task.deadline}
                              </div>
                            </div>
                            <Button variant="outline" className="w-full">
                              查看详情
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border border-dashed">
                      <CardContent className="py-16 text-center">
                        <Plus className="mx-auto h-12 w-12 text-muted-foreground/30" />
                        <h3 className="mt-4 text-lg font-medium text-foreground">暂无发布的任务</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          发布标注任务，吸引专业标注者
                        </p>
                        <Button className="mt-4 bg-[#0F8770] hover:bg-[#0A6655] text-white" asChild>
                          <Link href="/tasks/new">
                            <Plus className="mr-2 h-4 w-4" />
                            发布任务
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
