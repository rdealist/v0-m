"use client"

import { useState, useMemo } from "react"
import { Header, Footer, LevelBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  Wallet,
  Calculator,
  Lock,
  Coins,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// 模拟用户数据
const mockUser = {
  name: "协和医院影像中心",
  email: "imaging@pumch.cn",
  avatar: undefined,
  level: 7,
  verified: true,
}

const mockWallet = {
  balance: 500000,
  locked: 85000,
  pending: 12500,
}

// 模态选项
const modalityOptions = [
  { value: "X射线影像", label: "X射线影像 (XRAY)" },
  { value: "计算机断层扫描", label: "计算机断层扫描 (CT)" },
  { value: "声学超声影像", label: "声学超声影像 (US)" },
  { value: "实验室与特异分子显色", label: "实验室与特异分子显色 (LAB)" },
  { value: "磁共振成像", label: "磁共振成像 (MR)" },
  { value: "全幅数字病理", label: "全幅数字病理 (WSI)" },
  { value: "可见光影像", label: "专科可见光影像 (VL)" },
  { value: "核医学与分子代谢", label: "核医学与分子代谢 (NM)" },
  { value: "时序动态视频流媒体", label: "时序动态视频流媒体 (VIDEO)" },
  { value: "其他", label: "其他 (OTH)" },
]

// 科室选项
const specialtyOptions = [
  { value: "呼吸与胸壁", label: "呼吸与胸壁" },
  { value: "神经与颅脑", label: "神经与颅脑" },
  { value: "循环与心血管", label: "循环与心血管" },
  { value: "消化与腹部", label: "消化与腹部" },
  { value: "细胞与分子遗传学", label: "细胞与分子遗传学" },
  { value: "皮肤、体表与感官", label: "皮肤、体表与感官" },
  { value: "视觉与五官系统", label: "眼与视觉五官" },
  { value: "泌尿与内生殖", label: "泌尿与内生殖" },
  { value: "运动与骨关节", label: "运动与骨关节" },
  { value: "生殖医学与胚胎发育", label: "生殖医学与胚胎发育" },
  { value: "其他专科", label: "其他专科 / 综合系统" },
]

// 任务类型选项
const taskTypeOptions = [
  { value: "annotation", label: "标注任务", description: "需要标注者对数据进行标注" },
  { value: "audit", label: "审核任务", description: "需要专家审核已完成的标注结果" },
]

// 数据集选项（mock）
const datasetOptions = [
  { value: "DS001", label: "胸部CT肺结节数据集", samples: 12500 },
  { value: "DS002", label: "脑部MRI肿瘤分割数据", samples: 8200 },
  { value: "DS003", label: "眼底OCT糖网病变数据", samples: 15800 },
]

// 平台服务费率
const PLATFORM_FEE_RATE = 0.05 // 5%

export default function TaskPublishPage() {
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState({
    taskType: "annotation",
    title: "",
    description: "",
    datasetId: "",
    modality: "",
    specialty: "",
    minLevel: "2",
    maxParticipants: "10",
    totalCases: "",
    pricePerCase: "",
    deadline: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 计算锁仓金额
  const lockupCalculation = useMemo(() => {
    const totalCases = parseInt(formData.totalCases) || 0
    const pricePerCase = parseFloat(formData.pricePerCase) || 0
    
    const baseAmount = totalCases * pricePerCase
    const platformFee = baseAmount * PLATFORM_FEE_RATE
    const totalLockup = baseAmount + platformFee
    
    return {
      totalCases,
      pricePerCase,
      baseAmount,
      platformFee,
      totalLockup,
    }
  }, [formData.totalCases, formData.pricePerCase])

  // 余额是否充足
  const hasEnoughBalance = mockWallet.balance >= lockupCalculation.totalLockup
  const balanceAfterLockup = mockWallet.balance - lockupCalculation.totalLockup

  // 表单是否有效
  const isFormValid = 
    formData.title &&
    formData.datasetId &&
    formData.minLevel &&
    formData.maxParticipants &&
    formData.totalCases &&
    formData.pricePerCase &&
    formData.deadline &&
    hasEnoughBalance &&
    lockupCalculation.totalLockup > 0

  // 发布任务
  const handlePublish = () => {
    if (!isFormValid) return
    
    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      setPublishSuccess(true)
    }, 1500)
  }

  if (publishSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          isLoggedIn={true}
          user={mockUser}
          wallet={mockWallet}
          currentPath="/tasks"
          notificationCount={2}
          onNavigate={(path) => console.log("Navigate to:", path)}
          onLogout={() => console.log("Logout")}
          onNotificationClick={() => console.log("Notifications")}
        />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#0F8770]/10">
                <CheckCircle2 className="h-8 w-8 text-[#0F8770]" />
              </div>
              <h2 className="mt-6 text-xl font-bold text-foreground">任务发布成功</h2>
              <p className="mt-2 text-muted-foreground">
                已锁仓 <span className="font-mono font-medium text-primary">{lockupCalculation.totalLockup.toLocaleString()}</span> 积分
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/tasks">返回任务广场</Link>
                </Button>
                <Button className="bg-primary hover:bg-primary/90" asChild>
                  <Link href="/me">查看我的任务</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        currentPath="/tasks"
        notificationCount={2}
        onNavigate={(path) => console.log("Navigate to:", path)}
        onLogout={() => console.log("Logout")}
        onNotificationClick={() => console.log("Notifications")}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
              <ChevronLeft className="h-4 w-4" />
              返回任务广场
            </Link>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">发布任务</h1>
            <p className="mt-1 text-muted-foreground">创建标注或审核任务，设定奖励并锁仓资金</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* 左侧：任务表单 */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>任务信息</CardTitle>
                <CardDescription>填写任务的基本信息和要求</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 任务类型 */}
                <div className="space-y-3">
                  <Label>任务类型 *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {taskTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange("taskType", option.value)}
                        className={cn(
                          "p-4 rounded-lg border text-left transition-all",
                          formData.taskType === option.value
                            ? option.value === "annotation"
                              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                              : "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                            : "border-border hover:border-muted-foreground/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              option.value === "annotation"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            )}
                          >
                            {option.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 任务标题 */}
                <div className="space-y-2">
                  <Label htmlFor="title">任务标题 *</Label>
                  <Input
                    id="title"
                    placeholder="例如：肺结节良恶性标注"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                {/* 任务描述 */}
                <div className="space-y-2">
                  <Label htmlFor="description">任务描述</Label>
                  <Textarea
                    id="description"
                    placeholder="详细描述标注任务的要求、注意事项等..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                {/* 关联数据集 */}
                <div className="space-y-2">
                  <Label>关联数据集 *</Label>
                  <Select
                    value={formData.datasetId}
                    onValueChange={(value) => handleInputChange("datasetId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择数据集" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasetOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ({option.samples.toLocaleString()} 样本)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* 成像模态 */}
                  <div className="space-y-2">
                    <Label>成像模态与检查技术</Label>
                    <Select
                      value={formData.modality}
                      onValueChange={(value) => handleInputChange("modality", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择模态" />
                      </SelectTrigger>
                      <SelectContent>
                        {modalityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 解剖部位与专科系统 */}
                  <div className="space-y-2">
                    <Label>解剖部位与专科系统</Label>
                    <Select
                      value={formData.specialty}
                      onValueChange={(value) => handleInputChange("specialty", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择科室" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialtyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 最低等级要求 */}
                  <div className="space-y-2">
                    <Label>最低等级要求 *</Label>
                    <Select
                      value={formData.minLevel}
                      onValueChange={(value) => handleInputChange("minLevel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择等级" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <SelectItem key={level} value={String(level)}>
                            <div className="flex items-center gap-2">
                              <span>Lv{level} 及以上</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 最大参与人数 */}
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">最大参与人数 *</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      placeholder="例如：20"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                    />
                  </div>

                  {/* 总例数 */}
                  <div className="space-y-2">
                    <Label htmlFor="totalCases">
                      {formData.taskType === "audit" ? "总审核例数" : "总标注例数"} *
                    </Label>
                    <Input
                      id="totalCases"
                      type="number"
                      placeholder="例如：1000"
                      value={formData.totalCases}
                      onChange={(e) => handleInputChange("totalCases", e.target.value)}
                    />
                  </div>

                  {/* 单例基础价 */}
                  <div className="space-y-2">
                    <Label htmlFor="pricePerCase">单例基础价（积分）*</Label>
                    <Input
                      id="pricePerCase"
                      type="number"
                      step="0.1"
                      placeholder="例如：5"
                      value={formData.pricePerCase}
                      onChange={(e) => handleInputChange("pricePerCase", e.target.value)}
                    />
                  </div>
                </div>

                {/* 截止时间 */}
                <div className="space-y-2">
                  <Label htmlFor="deadline">截止时间 *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 右侧：锁仓计算器 */}
            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* 钱包余额 */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    当前钱包
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">可用余额</span>
                    <span className="font-mono font-bold text-lg text-foreground">
                      {mockWallet.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">已锁仓</span>
                    <span className="font-mono text-sm text-primary">
                      {mockWallet.locked.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">审查中收益</span>
                    <span className="font-mono text-sm text-warning">
                      {mockWallet.pending.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 锁仓计算器 */}
              <Card className="border border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    锁仓计算
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 计算明细 */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">总例数</span>
                      <span className="font-mono">
                        {lockupCalculation.totalCases.toLocaleString()} 例
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">× 单例基础价</span>
                      <span className="font-mono">
                        {lockupCalculation.pricePerCase.toLocaleString()} 积分
                      </span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">基础金额</span>
                        <span className="font-mono font-medium">
                          {lockupCalculation.baseAmount.toLocaleString()} 积分
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        + 平台服务费 (5%)
                        <Info className="h-3 w-3" />
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {lockupCalculation.platformFee.toLocaleString()} 积分
                      </span>
                    </div>
                  </div>

                  {/* 总锁仓金额 */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        总锁仓金额
                      </span>
                      <span className="font-mono font-bold text-xl text-primary">
                        {lockupCalculation.totalLockup.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 锁仓后余额 */}
                  <div className="rounded-lg bg-background p-3 border border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">锁仓后可用余额</span>
                      <span className={cn(
                        "font-mono font-medium",
                        hasEnoughBalance ? "text-foreground" : "text-destructive"
                      )}>
                        {hasEnoughBalance 
                          ? balanceAfterLockup.toLocaleString()
                          : "余额不足"
                        }
                      </span>
                    </div>
                  </div>

                  {/* 余额不足警告 */}
                  {!hasEnoughBalance && lockupCalculation.totalLockup > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive">余额不足</p>
                        <p className="text-muted-foreground mt-1">
                          还需 <span className="font-mono">{(lockupCalculation.totalLockup - mockWallet.balance).toLocaleString()}</span> 积分
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 分成说明 */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">分成比例说明</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lv1-Lv4 标注者</span>
                    <Badge variant="secondary">60%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lv5-Lv8 专家</span>
                    <Badge variant="secondary">80%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lv9 顶级专家</span>
                    <Badge variant="secondary">100%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">平台服务费</span>
                    <Badge variant="outline">5%</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 发布按钮 */}
              <Button
                className={cn(
                  "w-full h-12 text-base",
                  isFormValid
                    ? "bg-[#0F8770] hover:bg-[#0A6655] text-white"
                    : ""
                )}
                disabled={!isFormValid || isPublishing}
                onClick={handlePublish}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    发布中...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    确认发布并锁仓
                  </>
                )}
              </Button>

              {/* 提示 */}
              <p className="text-xs text-muted-foreground text-center">
                发布后锁仓资金将从可用余额扣除，任务结束后按实际完成情况结算
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
