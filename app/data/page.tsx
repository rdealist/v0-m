"use client"

import { useState } from "react"
import { Header } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageOff, Lock, Plus, Layers } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const mockUser = {
  name: "张医生",
  email: "zhang@hospital.com",
  level: 5,
  verified: true,
}
const mockWallet = { balance: 125680, locked: 15000, change: 2350 }

// 模态筛选
const modalityOptions = ["全部", "DICOM", "NIfTI", "WSI", "TIFF", "PNG", "JPEG"]
// 特征标签（多选）
const featureTags = ["呼吸系统", "神经系统", "心血管", "消化系统", "病理细胞", "眼科"]

// 数据集卡片数据
interface DatasetCard {
  id: string
  name: string
  cover: string | null
  modality: string
  feature: string
  available: number
  total: number
  uploadedAt: string
  published: boolean
  // 变体
  owned?: boolean
  wsi?: boolean
  slides?: number
  restricted?: boolean
}

const datasets: DatasetCard[] = [
  {
    id: "DS001",
    name: "胸部 CT 标注集 - 肺结节检测",
    cover: "/datasets/chest-ct.png",
    modality: "DICOM",
    feature: "呼吸系统",
    available: 142,
    total: 156,
    uploadedAt: "2026-05-20",
    published: true,
  },
  {
    id: "DS002",
    name: "脑部 MRI 肿瘤分割数据集",
    cover: "/datasets/brain-mri.png",
    modality: "NIfTI",
    feature: "神经系统",
    available: 88,
    total: 100,
    uploadedAt: "2026-05-12",
    published: true,
    owned: true,
  },
  {
    id: "DS003",
    name: "乳腺病理切片 HE 染色数据集",
    cover: "/datasets/pathology-wsi.png",
    modality: "WSI",
    feature: "病理细胞",
    available: 12,
    total: 12,
    uploadedAt: "2026-05-08",
    published: true,
    wsi: true,
    slides: 12,
  },
  {
    id: "DS004",
    name: "胸部 X 光肺炎检测数据集",
    cover: "/datasets/chest-xray.png",
    modality: "PNG",
    feature: "呼吸系统",
    available: 320,
    total: 340,
    uploadedAt: "2026-04-28",
    published: false,
  },
  {
    id: "DS005",
    name: "肝脏增强 CT 分割数据集",
    cover: null,
    modality: "DICOM",
    feature: "消化系统",
    available: 64,
    total: 80,
    uploadedAt: "2026-04-15",
    published: true,
  },
  {
    id: "DS006",
    name: "冠脉造影序列协作数据集",
    cover: "/datasets/chest-ct.png",
    modality: "DICOM",
    feature: "心血管",
    available: 0,
    total: 200,
    uploadedAt: "2026-04-02",
    published: true,
    restricted: true,
  },
]

export default function BrowseDatasetsPage() {
  const [tab, setTab] = useState<"public" | "mine">("public")
  const [modality, setModality] = useState("全部")
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const toggleFeature = (f: string) =>
    setSelectedFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    )

  const visible = datasets.filter((d) => (tab === "mine" ? d.owned : true))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isLoggedIn user={mockUser} wallet={mockWallet} notificationCount={3} />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 标题 + Tab */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">浏览数据集</h1>
            <div className="flex gap-1 p-1 bg-muted/50 rounded-full w-fit">
              {[
                { key: "public", label: "公开数据集" },
                { key: "mine", label: "我的数据集" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as "public" | "mine")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    tab === t.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 水平筛选器 */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Select value={modality} onValueChange={setModality}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="模态筛选" />
              </SelectTrigger>
              <SelectContent>
                {modalityOptions.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap items-center gap-2">
              {featureTags.map((f) => {
                const active = selectedFeatures.includes(f)
                return (
                  <button
                    key={f}
                    onClick={() => toggleFeature(f)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>

          {/* WSI 时展开样本类型筛选 */}
          {modality === "WSI" && (
            <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-muted/40 border border-border animate-in fade-in slide-in-from-top-1">
              <span className="text-sm text-muted-foreground">样本类型：</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-44 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部样本类型</SelectItem>
                  <SelectItem value="he">HE 染色</SelectItem>
                  <SelectItem value="ihc">免疫组化 (IHC)</SelectItem>
                  <SelectItem value="frozen">冰冻切片</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 数据集卡片网格 */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {visible.map((d) => (
              <Link
                key={d.id}
                href={d.restricted ? "#" : `/data/${d.id}`}
                className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30"
              >
                {/* 预览图 16:10 */}
                <div className="relative aspect-[16/10] bg-muted">
                  {d.cover ? (
                    <Image
                      src={d.cover || "/placeholder.svg"}
                      alt={`${d.name}预览图`}
                      fill
                      className={`object-cover ${d.restricted ? "blur-sm" : ""}`}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/50">
                      <ImageOff className="h-8 w-8" />
                      <span className="mt-1 text-xs">无法预览</span>
                    </div>
                  )}
                  {d.restricted && (
                    <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* 信息区 */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate">{d.name}</h3>

                  {/* 标签行 */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">{d.modality}</Badge>
                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">{d.feature}</Badge>
                    {d.wsi && (
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50">HE 染色</Badge>
                    )}
                  </div>

                  {/* 数据行 */}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {d.wsi ? (
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {d.slides} 张切片 · {d.uploadedAt} 上传
                      </span>
                    ) : (
                      <>可用 <span className="font-mono text-foreground">{d.available}</span> / 总计 {d.total} 个样本 · {d.uploadedAt} 上传</>
                    )}
                  </p>

                  {/* 状态行 */}
                  <div className="mt-3 flex items-center justify-between">
                    {d.restricted ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        受限协作 · 需授权查看详情
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className={`h-2 w-2 rounded-full ${d.published ? "bg-green-500" : "bg-amber-500"}`} />
                        <span className={d.published ? "text-green-600" : "text-amber-600"}>
                          {d.published ? "已发布" : "审核中"}
                        </span>
                      </span>
                    )}

                    {/* 我的数据集变体：发布任务按钮 */}
                    {d.owned && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/5"
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = "/tasks/new"
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        发布任务
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
