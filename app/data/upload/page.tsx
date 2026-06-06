"use client"

import { useState } from "react"
import { Header } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UploadCloud, CheckCircle2, XCircle, Check } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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

const steps = [
  { id: 1, title: "上传文件" },
  { id: 2, title: "填写元数据" },
  { id: 3, title: "确认提交" },
]

// 处理阶段：暗印/追踪绑定 → 脱敏 → 预处理 → 预览生成
const mockFiles = [
  {
    name: "chest_ct_001.dcm",
    progress: 100,
    state: "done" as const,
    stage: "处理完成",
  },
  {
    name: "chest_ct_002.dcm",
    progress: 65,
    state: "processing" as const,
    stage: "脱敏处理中...",
  },
  {
    name: "chest_ct_003.dcm",
    progress: 0,
    state: "failed" as const,
    stage: "处理失败：文件格式异常",
  },
]

export default function DataUploadPage() {
  const [currentStep] = useState(1)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isLoggedIn user={mockUser} wallet={mockWallet} notificationCount={2} />

      <main className="flex-1">
        <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 lg:px-8">
          {/* 面包屑 */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/data">影像数据</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>上传数据</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* 分步导航 Stepper */}
          <div className="mb-10 flex items-center">
            {steps.map((step, index) => {
              const isComplete = currentStep > step.id
              const isActive = currentStep === step.id
              return (
                <div key={step.id} className="flex flex-1 items-center last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                        isComplete
                          ? "border-primary bg-primary text-primary-foreground"
                          : isActive
                            ? "border-primary text-primary"
                            : "border-muted-foreground/30 text-muted-foreground"
                      )}
                    >
                      {isComplete ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium whitespace-nowrap",
                        isActive
                          ? "text-foreground"
                          : isComplete
                            ? "text-foreground"
                            : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-4 h-0.5 flex-1",
                        currentStep > step.id ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step 1: 上传文件 */}
          <h2 className="text-xl font-semibold text-foreground">上传医学影像文件</h2>

          {/* 拖拽上传区域 */}
          <div className="mt-6 flex h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/20 px-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/40 cursor-pointer">
            <UploadCloud className="h-12 w-12 text-primary" />
            <p className="mt-3 text-base font-medium text-foreground">
              拖拽文件到此处，或点击选择文件
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              支持格式：DICOM / NIfTI / TIFF / PNG / JPEG / BMP / SVS
            </p>
            <p className="text-xs text-muted-foreground">单个文件最大 500MB</p>
          </div>

          {/* 上传进度列表 */}
          <div className="mt-6 space-y-3">
            {mockFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-sm text-foreground">{file.name}</span>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 text-xs",
                        file.state === "done"
                          ? "text-emerald-600"
                          : file.state === "failed"
                            ? "text-destructive"
                            : "text-muted-foreground"
                      )}
                    >
                      {file.state === "done" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {file.state === "failed" && <XCircle className="h-3.5 w-3.5" />}
                      {file.stage}
                    </span>
                  </div>
                  {file.state !== "failed" && (
                    <Progress
                      value={file.progress}
                      className="mt-2 h-1.5"
                    />
                  )}
                </div>
                {file.state === "failed" && (
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      跳过
                    </button>
                    <button className="text-primary hover:underline">重新上传</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 底部操作栏 */}
          <div className="mt-8 flex items-center gap-4">
            <Button size="lg">下一步</Button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              保存草稿
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
