"use client"

import { useState } from "react"
import { Header } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  FileStack,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Database,
  ArrowRight,
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
  change: 12500,
}

// 步骤配置
const steps = [
  { id: 1, title: "选择数据", description: "上传或选择数据集" },
  { id: 2, title: "填写元数据", description: "描述数据集信息" },
  { id: 3, title: "预检验证", description: "验证数据格式" },
  { id: 4, title: "发布确认", description: "确认并发布" },
]

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

// Mock预检结果
const mockPrecheckResults = [
  { id: 1, name: "文件格式检查", status: "passed", message: "全部文件为有效DICOM格式" },
  { id: 2, name: "元数据完整性", status: "passed", message: "必填字段已完整填写" },
  { id: 3, name: "样本数量验证", status: "passed", message: "声明样本数与实际一致" },
  { id: 4, name: "隐私脱敏检查", status: "warning", message: "建议检查Patient ID字段脱敏情况" },
  { id: 5, name: "图像质量评估", status: "passed", message: "图像分辨率符合标准" },
]

export default function DataUploadPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPreChecking, setIsPreChecking] = useState(false)
  const [preCheckComplete, setPreCheckComplete] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    modality: "",
    specialty: "",
    sampleCount: "",
    bodyPart: "",
    features: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 模拟上传
  const handleUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  // 模拟预检
  const handlePreCheck = () => {
    setIsPreChecking(true)
    setTimeout(() => {
      setIsPreChecking(false)
      setPreCheckComplete(true)
    }, 2000)
  }

  // 模拟发布
  const handlePublish = () => {
    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      // 发布成功后跳转
    }, 1500)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return uploadProgress === 100
      case 2:
        return formData.name && formData.modality && formData.specialty && formData.sampleCount
      case 3:
        return preCheckComplete
      case 4:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(prev => prev + 1)
      if (currentStep === 2) {
        handlePreCheck()
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        currentPath="/data"
        notificationCount={2}
        onNavigate={(path) => console.log("Navigate to:", path)}
        onLogout={() => console.log("Logout")}
        onNotificationClick={() => console.log("Notifications")}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <Link href="/data" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
              <ChevronLeft className="h-4 w-4" />
              返回数据广场
            </Link>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">上传数据集</h1>
            <p className="mt-1 text-muted-foreground">创建新的数据集并发布到数据广场</p>
          </div>

          {/* 步骤指示器 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                        currentStep > step.id
                          ? "border-[#0F8770] bg-[#0F8770] text-white"
                          : currentStep === step.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-background text-muted-foreground"
                      )}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={cn(
                        "text-sm font-medium",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-4 h-0.5 flex-1 min-w-[40px]",
                        currentStep > step.id ? "bg-[#0F8770]" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 步骤内容 */}
          <Card className="border border-border">
            <CardContent className="pt-6">
              {/* Step 1: 选择数据 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">选择数据</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      上传您的医学影像数据集或选择已有的草稿
                    </p>
                  </div>

                  {/* 上传区域 */}
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                      uploadProgress === 100
                        ? "border-[#0F8770] bg-[#0F8770]/5"
                        : "border-muted hover:border-primary/50 cursor-pointer"
                    )}
                    onClick={uploadProgress === 0 ? handleUpload : undefined}
                  >
                    {uploadProgress === 100 ? (
                      <div className="space-y-4">
                        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#0F8770]/10">
                          <CheckCircle2 className="h-8 w-8 text-[#0F8770]" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-foreground">上传完成</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            已上传 <span className="font-mono">12,500</span> 个DICOM文件
                          </p>
                        </div>
                      </div>
                    ) : isUploading ? (
                      <div className="space-y-4">
                        <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                        <div>
                          <p className="text-lg font-medium text-foreground">正在上传...</p>
                          <Progress value={uploadProgress} className="mt-4 h-2" />
                          <p className="text-sm text-muted-foreground mt-2">
                            {uploadProgress}% 完成
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-foreground">
                            点击上传或拖放文件
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            支持 DICOM, NIfTI, PNG, JPG 格式
                          </p>
                        </div>
                        <Button variant="outline" onClick={handleUpload}>
                          <FileStack className="mr-2 h-4 w-4" />
                          选择文件夹
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 或选择草稿 */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">或</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">选择已有草稿</p>
                    <Card className="border border-border hover:border-primary/30 cursor-pointer">
                      <CardContent className="py-4 flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">胸部CT数据集草稿</p>
                          <p className="text-sm text-muted-foreground">上次编辑：2小时前</p>
                        </div>
                        <Badge variant="secondary">草稿</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Step 2: 填写元数据 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">填写元数据</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      描述数据集的基本信息，帮助用户理解和发现
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {/* 数据集名称 */}
                    <div className="space-y-2">
                      <Label htmlFor="name">数据集名称 *</Label>
                      <Input
                        id="name"
                        placeholder="例如：胸部CT肺结节数据集"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>

                    {/* 描述 */}
                    <div className="space-y-2">
                      <Label htmlFor="description">数据集描述</Label>
                      <Textarea
                        id="description"
                        placeholder="描述数据集的内容、来源、标注类型等信息..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* 成像模态与检查技术 */}
                      <div className="space-y-2">
                        <Label>成像模态与检查技术 *</Label>
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
                        <Label>解剖部位与专科系统 *</Label>
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

                      {/* 样本数量 */}
                      <div className="space-y-2">
                        <Label htmlFor="sampleCount">样本数量 *</Label>
                        <Input
                          id="sampleCount"
                          type="number"
                          placeholder="例如：12500"
                          value={formData.sampleCount}
                          onChange={(e) => handleInputChange("sampleCount", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 特征标签 */}
                    <div className="space-y-2">
                      <Label htmlFor="features">特征标签</Label>
                      <Input
                        id="features"
                        placeholder="用逗号分隔，例如：肺结节, 良恶性分类, 3D分割"
                        value={formData.features}
                        onChange={(e) => handleInputChange("features", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        添加标签可以帮助用户更容易找到您的数据集
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: 预检验证 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">预检验证</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      系统正在验证数据集格式和完整性
                    </p>
                  </div>

                  {isPreChecking ? (
                    <div className="py-12 text-center">
                      <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                      <p className="mt-4 text-lg font-medium text-foreground">正在验证...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        这可能需要几分钟时间
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mockPrecheckResults.map((result) => (
                        <div
                          key={result.id}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border",
                            result.status === "passed"
                              ? "border-[#0F8770]/30 bg-[#0F8770]/5"
                              : result.status === "warning"
                              ? "border-warning/30 bg-warning/5"
                              : "border-destructive/30 bg-destructive/5"
                          )}
                        >
                          {result.status === "passed" ? (
                            <CheckCircle2 className="h-5 w-5 text-[#0F8770] flex-shrink-0 mt-0.5" />
                          ) : result.status === "warning" ? (
                            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{result.name}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {result.message}
                            </p>
                          </div>
                        </div>
                      ))}

                      {preCheckComplete && (
                        <div className="mt-6 p-4 rounded-lg bg-[#0F8770]/10 border border-[#0F8770]/30">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-[#0F8770]" />
                            <div>
                              <p className="font-medium text-foreground">预检通过</p>
                              <p className="text-sm text-muted-foreground">
                                数据集已通过基本验证，可以继续发布
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: 发布确认 */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">发布确认</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      请确认数据集信息，发布后将在数据广场公开展示
                    </p>
                  </div>

                  {/* 数据集信息摘要 */}
                  <Card className="border border-border">
                    <CardHeader>
                      <CardTitle className="text-base">{formData.name || "未命名数据集"}</CardTitle>
                      <CardDescription>
                        {formData.description || "暂无描述"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">影像模态：</span>
                          <Badge variant="outline">
                            {modalityOptions.find(o => o.value === formData.modality)?.label || "-"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">相关科室：</span>
                          <Badge variant="outline">
                            {specialtyOptions.find(o => o.value === formData.specialty)?.label || "-"}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">样本数量：</span>
                          <span className="font-mono font-medium ml-1">
                            {formData.sampleCount ? parseInt(formData.sampleCount).toLocaleString() : "-"}
                          </span>
                        </div>
                      </div>

                      {formData.features && (
                        <div className="pt-4 border-t border-border">
                          <span className="text-sm text-muted-foreground">特征标签：</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.features.split(",").map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 发布提示 */}
                  <div className="p-4 rounded-lg bg-accent border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">提示：</strong>发布后，数据集将进入「待审核」状态，
                      通过平台审核后将正式公开展示在数据广场。
                    </p>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  上一步
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    下一步
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-[#0F8770] hover:bg-[#0A6655] text-white"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        发布中...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        确认发布
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 保存草稿提示 */}
          {currentStep > 1 && currentStep < 4 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              您的进度会自动保存为草稿，可随时返回继续编辑
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
