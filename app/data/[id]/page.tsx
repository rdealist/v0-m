"use client"

import { use } from "react"
import { Header } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Database, Lock, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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

type DatasetDetail = {
  id: string
  name: string
  intro: string
  modality: string
  specialty: string
  availableSamples: number
  totalSamples: number
  uploadedAt: string
  status: "published" | "pending_audit"
  accessMode: string
  coverImage: string | null
  isOwner: boolean
}

const mockDatasets: Record<string, DatasetDetail> = {
  DS001: {
    id: "DS001",
    name: "胸部 CT 标注集 - 肺结节检测",
    intro:
      "该数据集包含 156 例胸部 CT 影像，覆盖肺结节检测场景，已完成脱敏处理和质量筛查。数据来源于多家三甲医院，适用于肺结节检测、分类等研究任务。",
    modality: "DICOM",
    specialty: "呼吸系统",
    availableSamples: 142,
    totalSamples: 156,
    uploadedAt: "2026-05-20",
    status: "published",
    accessMode: "受限协作",
    coverImage: "/datasets/chest-ct.png",
    isOwner: false,
  },
  DS002: {
    id: "DS002",
    name: "脑部 MRI 肿瘤分割数据集",
    intro:
      "包含 8,200 例脑部 MRI 影像，覆盖胶质瘤、脑膜瘤等多种肿瘤类型，已完成脱敏处理。适用于肿瘤边界分割研究。",
    modality: "NIfTI",
    specialty: "神经与颅脑",
    availableSamples: 7600,
    totalSamples: 8200,
    uploadedAt: "2026-04-20",
    status: "published",
    accessMode: "受限协作",
    coverImage: "/datasets/brain-mri.png",
    isOwner: false,
  },
  DS003: {
    id: "DS003",
    name: "眼底影像糖网病变分级集",
    intro:
      "15,800 例眼底影像，覆盖糖尿病视网膜病变 DR0-DR4 五级分类，已完成脱敏与质量筛查。适用于自动筛查和分级研究。",
    modality: "PNG",
    specialty: "视觉与五官系统",
    availableSamples: 15800,
    totalSamples: 15800,
    uploadedAt: "2026-05-18",
    status: "published",
    accessMode: "公开协作",
    coverImage: null,
    isOwner: true,
  },
  DS005: {
    id: "DS005",
    name: "心脏超声结构分割数据集",
    intro:
      "6,500 例心脏超声影像，覆盖二维和 M 型超声，已完成脱敏处理。适用于心脏结构自动分割和功能评估研究。",
    modality: "DICOM",
    specialty: "循环与心血管",
    availableSamples: 0,
    totalSamples: 6500,
    uploadedAt: "2026-04-28",
    status: "pending_audit",
    accessMode: "受限协作",
    coverImage: null,
    isOwner: true,
  },
}

export default function DatasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const dataset = mockDatasets[id]

  if (!dataset) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn user={mockUser} wallet={mockWallet} notificationCount={3} />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Database className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">数据集不存在</h2>
          <p className="mt-2 text-muted-foreground">该数据集可能已被删除或您无权访问</p>
          <Button className="mt-6" asChild>
            <Link href="/data">返回浏览数据集</Link>
          </Button>
        </main>
      </div>
    )
  }

  const metadata: { label: string; value: React.ReactNode }[] = [
    { label: "设备模态", value: dataset.modality },
    { label: "临床解剖系统", value: dataset.specialty },
    {
      label: "可用样本量",
      value: `${dataset.availableSamples.toLocaleString()} / ${dataset.totalSamples.toLocaleString()}`,
    },
    { label: "上传时间", value: dataset.uploadedAt },
    {
      label: "发布状态",
      value:
        dataset.status === "published" ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            已发布
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            审核中
          </span>
        ),
    },
    {
      label: "数据访问模式",
      value: (
        <span className="inline-flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          {dataset.accessMode}
        </span>
      ),
    },
  ]

  const canPublishTask = dataset.isOwner && dataset.status === "published"

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn user={mockUser} wallet={mockWallet} notificationCount={3} />

      <main className="mx-auto max-w-[960px] px-4 py-8 sm:px-6 lg:px-8">
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
              <BreadcrumbLink asChild>
                <Link href="/data">浏览数据集</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[280px] truncate">{dataset.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 封面图 */}
        <div className="relative h-[280px] w-full overflow-hidden rounded-lg bg-muted">
          {dataset.coverImage ? (
            <Image
              src={dataset.coverImage || "/placeholder.svg"}
              alt={`${dataset.name} 封面预览`}
              fill
              className="object-cover"
              sizes="960px"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
              <Database className="h-12 w-12 opacity-40" />
              <span className="mt-2 text-sm">暂无封面预览</span>
            </div>
          )}
        </div>

        {/* 标题区 */}
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl text-balance">{dataset.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{dataset.modality}</Badge>
            <Badge variant="secondary">{dataset.specialty}</Badge>
            {dataset.isOwner && (
              <Badge className="bg-primary/10 text-primary border-primary/20">我的数据集</Badge>
            )}
          </div>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{dataset.intro}</p>
        </div>

        {/* 元数据 - 松散键值对 */}
        <dl className="mt-8 border-t border-border">
          {metadata.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between border-b border-border py-2.5"
              style={{ minHeight: 40 }}
            >
              <dt className="text-sm text-muted-foreground">{item.label}</dt>
              <dd className="text-sm font-medium text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>

        {/* 操作区 */}
        <div className="mt-8">
          <Button size="lg" className="w-full sm:w-auto" disabled={!canPublishTask} asChild={canPublishTask}>
            {canPublishTask ? (
              <Link href="/tasks/new">
                基于此数据集发布任务
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <span>
                基于此数据集发布任务
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            仅数据集拥有者在数据处理完成后可发布任务
          </p>
        </div>
      </main>
    </div>
  )
}
