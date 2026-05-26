"use client"

import { useState, use } from "react"
import { Header, LevelBadge, DatasetStatusBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Database,
  Building2,
  Calendar,
  FileImage,
  Lock,
  Eye,
  Download,
  Edit,
  Trash2,
  Share2,
  BarChart3,
  FileText,
  Layers,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Coins,
} from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

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

// 模拟数据集详情
const mockDatasets: Record<string, {
  id: string
  name: string
  description: string
  owner: string
  ownerType: "institution" | "individual"
  ownerLevel: number
  modality: string
  specialty: string
  samples: number
  status: "public" | "private" | "pending_audit"
  price: number
  coverImage: string | null
  createdAt: string
  isOwned: boolean
  // 详细信息（仅上传者可见）
  files?: {
    id: string
    name: string
    type: string
    size: string
    uploadedAt: string
  }[]
  annotations?: {
    type: string
    count: number
    format: string
  }[]
  statistics?: {
    totalViews: number
    totalDownloads: number
    totalRevenue: number
    averageRating: number
  }
  tasks?: {
    id: string
    name: string
    status: "active" | "completed" | "paused"
    progress: number
    participants: number
  }[]
  // 公开信息
  tags: string[]
  license: string
  format: string
  lastUpdated: string
  downloads: number
  rating: number
}> = {
  "DS001": {
    id: "DS001",
    name: "胸部CT肺结节数据集",
    description: "包含12,500例胸部CT影像，标注有肺结节位置与良恶性分类。数据来源于多家三甲医院，经过严格的质量控制和脱敏处理。适用于肺结节检测、分类、分割等研究任务。",
    owner: "协和医院影像中心",
    ownerType: "institution",
    ownerLevel: 7,
    modality: "计算机断层扫描",
    specialty: "呼吸与胸壁",
    samples: 12500,
    status: "public",
    price: 5000,
    coverImage: null,
    createdAt: "2026-03-15",
    isOwned: false,
    tags: ["肺结节", "CT", "分类", "检测", "胸部影像"],
    license: "研究许可协议 v2.0",
    format: "DICOM / NIfTI",
    lastUpdated: "2026-05-10",
    downloads: 156,
    rating: 4.8,
  },
  "DS002": {
    id: "DS002",
    name: "脑部MRI肿瘤分割数据",
    description: "8,200例脑部MRI影像，包含肿瘤边界分割标注。覆盖胶质瘤、脑膜瘤等多种肿瘤类型，标注由神经外科专家团队完成。",
    owner: "华西医学影像研究院",
    ownerType: "institution",
    ownerLevel: 8,
    modality: "磁共振成像",
    specialty: "神经与颅脑",
    samples: 8200,
    status: "public",
    price: 8000,
    coverImage: null,
    createdAt: "2026-02-28",
    isOwned: false,
    tags: ["脑肿瘤", "MRI", "分割", "胶质瘤", "神经影像"],
    license: "学术研究许可",
    format: "NIfTI",
    lastUpdated: "2026-04-20",
    downloads: 89,
    rating: 4.9,
  },
  "DS003": {
    id: "DS003",
    name: "眼底OCT糖网病变数据",
    description: "15,800例眼底OCT影像，糖尿病视网膜病变分级标注。包含DR0-DR4五级分类，标注由眼科专家团队完成，适用于糖尿病视网膜病变的自动筛查和分级研究。",
    owner: "中山眼科中心",
    ownerType: "institution",
    ownerLevel: 6,
    modality: "可见光影像",
    specialty: "视觉与五官系统",
    samples: 15800,
    status: "public",
    price: 3500,
    coverImage: null,
    createdAt: "2026-04-01",
    isOwned: true,
    tags: ["糖尿病", "视网膜病变", "OCT", "眼底", "分级"],
    license: "研究许可协议 v2.0",
    format: "PNG / JPEG",
    lastUpdated: "2026-05-18",
    downloads: 234,
    rating: 4.7,
    // 上传者可见的详细信息
    files: [
      { id: "F001", name: "train_images.zip", type: "压缩包", size: "45.6 GB", uploadedAt: "2026-04-01" },
      { id: "F002", name: "test_images.zip", type: "压缩包", size: "12.3 GB", uploadedAt: "2026-04-01" },
      { id: "F003", name: "annotations.json", type: "标注文件", size: "156 MB", uploadedAt: "2026-04-05" },
      { id: "F004", name: "metadata.csv", type: "元数据", size: "8.2 MB", uploadedAt: "2026-04-01" },
    ],
    annotations: [
      { type: "分级标注", count: 15800, format: "JSON" },
      { type: "边界框", count: 8500, format: "COCO" },
      { type: "分割掩码", count: 3200, format: "PNG" },
    ],
    statistics: {
      totalViews: 1256,
      totalDownloads: 234,
      totalRevenue: 45600,
      averageRating: 4.7,
    },
    tasks: [
      { id: "T001", name: "DR分级标注", status: "completed", progress: 100, participants: 12 },
      { id: "T002", name: "病变区域分割", status: "active", progress: 68, participants: 8 },
    ],
  },
  "DS004": {
    id: "DS004",
    name: "胸部X光肺炎检测数据",
    description: "22,000例胸部X光片，包含正常与肺炎分类标注。数据集涵盖细菌性肺炎、病毒性肺炎和正常样本，适用于肺炎检测模型的训练和评估。",
    owner: "北京大学人民医院",
    ownerType: "institution",
    ownerLevel: 7,
    modality: "X射线影像",
    specialty: "呼吸与胸壁",
    samples: 22000,
    status: "public",
    price: 4500,
    coverImage: null,
    createdAt: "2026-03-20",
    isOwned: false,
    tags: ["肺炎", "X光", "分类", "胸部", "检测"],
    license: "开放研究许可",
    format: "JPEG",
    lastUpdated: "2026-05-01",
    downloads: 412,
    rating: 4.6,
  },
  "DS005": {
    id: "DS005",
    name: "心脏超声结构分割数据",
    description: "6,500例心脏超声影像，心室心房边界分割。包含二维和M型超声，标注由心内科专家完成，适用于心脏结构自动分割和功能评估研究。",
    owner: "阜外医院",
    ownerType: "institution",
    ownerLevel: 8,
    modality: "声学超声影像",
    specialty: "循环与心血管",
    samples: 6500,
    status: "public",
    price: 6000,
    coverImage: null,
    createdAt: "2026-01-15",
    isOwned: true,
    tags: ["心脏", "超声", "分割", "心室", "心房"],
    license: "学术研究许可",
    format: "DICOM",
    lastUpdated: "2026-04-28",
    downloads: 67,
    rating: 4.9,
    // 上传者可见的详细信息
    files: [
      { id: "F001", name: "echo_images.zip", type: "压缩包", size: "28.4 GB", uploadedAt: "2026-01-15" },
      { id: "F002", name: "segmentation_masks.zip", type: "分割掩码", size: "5.6 GB", uploadedAt: "2026-01-20" },
      { id: "F003", name: "patient_info.csv", type: "元数据", size: "2.1 MB", uploadedAt: "2026-01-15" },
    ],
    annotations: [
      { type: "语义分割", count: 6500, format: "NIfTI" },
      { type: "关键点标注", count: 6500, format: "JSON" },
    ],
    statistics: {
      totalViews: 523,
      totalDownloads: 67,
      totalRevenue: 28500,
      averageRating: 4.9,
    },
    tasks: [
      { id: "T003", name: "心室分割标注", status: "completed", progress: 100, participants: 6 },
    ],
  },
  "DS006": {
    id: "DS006",
    name: "病理切片乳腺癌分级",
    description: "9,800例乳腺病理切片，恶性程度分级标注。数据来源于多中心病理科，覆盖I-III级乳腺癌，适用于病理图像分析和癌症分级研究。",
    owner: "复旦大学附属肿瘤医院",
    ownerType: "institution",
    ownerLevel: 9,
    modality: "全幅数字病理",
    specialty: "泌尿与内生殖",
    samples: 9800,
    status: "public",
    price: 12000,
    coverImage: null,
    createdAt: "2026-04-10",
    isOwned: false,
    tags: ["乳腺癌", "病理", "分级", "WSI", "肿瘤"],
    license: "研究许可协议 v3.0",
    format: "SVS / TIFF",
    lastUpdated: "2026-05-15",
    downloads: 45,
    rating: 4.8,
  },
}

export default function DatasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { locale } = useI18n()
  const [activeTab, setActiveTab] = useState("overview")
  
  const dataset = mockDatasets[id]
  
  if (!dataset) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          isLoggedIn={true}
          user={mockUser}
          wallet={mockWallet}
          notificationCount={3}
        />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Database className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">数据集不存在</h2>
            <p className="mt-2 text-muted-foreground">该数据集可能已被删除或您无权访问</p>
            <Link href="/data">
              <Button className="mt-6">返回数据广场</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const isOwner = dataset.isOwned

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        notificationCount={3}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 面包屑导航 */}
        <div className="mb-6">
          <Link 
            href="/data" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回数据广场
          </Link>
        </div>

        {/* 头部信息 */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {dataset.modality}
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {dataset.specialty}
                </Badge>
                {isOwner && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    我的数据集
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl mb-3">
                {dataset.name}
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                {dataset.description}
              </p>
              
              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mt-4">
                {dataset.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col gap-3 lg:min-w-[200px]">
              {isOwner ? (
                <>
                  <Button className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    编辑数据集
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    分享
                  </Button>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  分享
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 基本信息卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileImage className="h-4 w-4" />
                <span className="text-xs">样本数量</span>
              </div>
              <p className="text-lg font-bold text-foreground">{dataset.samples.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Layers className="h-4 w-4" />
                <span className="text-xs">数据格式</span>
              </div>
              <p className="text-sm font-medium text-foreground">{dataset.format}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs">许可协议</span>
              </div>
              <p className="text-xs font-medium text-foreground truncate">{dataset.license}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">创建时间</span>
              </div>
              <p className="text-sm font-medium text-foreground">{dataset.createdAt}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">最后更新</span>
              </div>
              <p className="text-sm font-medium text-foreground">{dataset.lastUpdated}</p>
            </CardContent>
          </Card>
        </div>

        {/* 上传者信息 */}
        <Card className="border border-border mb-8">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{dataset.owner}</span>
                  <LevelBadge level={dataset.ownerLevel} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {dataset.ownerType === "institution" ? "机构账户" : "个人账户"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 内容区域 - 根据是否为所有者显示不同内容 */}
        {isOwner ? (
          /* 所有者视图 - 完整信息 */
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="files">文件管理</TabsTrigger>
              <TabsTrigger value="annotations">标注信息</TabsTrigger>
              <TabsTrigger value="statistics">统计数据</TabsTrigger>
              <TabsTrigger value="tasks">关联任务</TabsTrigger>
            </TabsList>

            {/* 概览 */}
            <TabsContent value="overview">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base">数据统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dataset.statistics ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">总浏览量</p>
                          <p className="text-2xl font-bold text-foreground">{dataset.statistics.totalViews.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">总下载量</p>
                          <p className="text-2xl font-bold text-foreground">{dataset.statistics.totalDownloads.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">累计收益</p>
                          <p className="text-2xl font-bold text-primary">{dataset.statistics.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">平均评分</p>
                          <p className="text-2xl font-bold text-foreground">{dataset.statistics.averageRating}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">暂无统计数据</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base">标注概况</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dataset.annotations && dataset.annotations.length > 0 ? (
                      <div className="space-y-3">
                        {dataset.annotations.map((ann, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium text-foreground">{ann.type}</p>
                              <p className="text-xs text-muted-foreground">格式: {ann.format}</p>
                            </div>
                            <Badge variant="secondary">{ann.count.toLocaleString()} 条</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">暂无标注信息</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 文件管理 */}
            <TabsContent value="files">
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">文件列表</CardTitle>
                    <Button size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      下载全部
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {dataset.files && dataset.files.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead>文件名</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>大小</TableHead>
                          <TableHead>上传时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataset.files.map((file) => (
                          <TableRow key={file.id} className="border-border">
                            <TableCell className="font-medium">{file.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{file.type}</Badge>
                            </TableCell>
                            <TableCell>{file.size}</TableCell>
                            <TableCell>{file.uploadedAt}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">暂无文件</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 标注信息 */}
            <TabsContent value="annotations">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-base">标注详情</CardTitle>
                  <CardDescription>数据集包含的标注类型和数量</CardDescription>
                </CardHeader>
                <CardContent>
                  {dataset.annotations && dataset.annotations.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {dataset.annotations.map((ann, idx) => (
                        <Card key={idx} className="border border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Tag className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{ann.type}</p>
                                <p className="text-xs text-muted-foreground">格式: {ann.format}</p>
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{ann.count.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">标注数量</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">暂无标注信息</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 统计数据 */}
            <TabsContent value="statistics">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-base">数据统计</CardTitle>
                  <CardDescription>数据集的访问和收益统计</CardDescription>
                </CardHeader>
                <CardContent>
                  {dataset.statistics ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="p-6 bg-muted/50 rounded-xl text-center">
                        <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-3xl font-bold text-foreground">{dataset.statistics.totalViews.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">总浏览量</p>
                      </div>
                      <div className="p-6 bg-muted/50 rounded-xl text-center">
                        <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-3xl font-bold text-foreground">{dataset.statistics.totalDownloads.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">总下载量</p>
                      </div>
                      <div className="p-6 bg-primary/5 rounded-xl text-center border border-primary/20">
                        <Coins className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-3xl font-bold text-primary">{dataset.statistics.totalRevenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">累计收益 (积分)</p>
                      </div>
                      <div className="p-6 bg-muted/50 rounded-xl text-center">
                        <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-3xl font-bold text-foreground">{dataset.statistics.averageRating}</p>
                        <p className="text-sm text-muted-foreground">平均评分</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">暂无统计数据</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 关联任务 */}
            <TabsContent value="tasks">
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">关联任务</CardTitle>
                      <CardDescription>基于此数据集创建的标注/审核任务</CardDescription>
                    </div>
                    <Link href="/tasks/new">
                      <Button size="sm">创建任务</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {dataset.tasks && dataset.tasks.length > 0 ? (
                    <div className="space-y-4">
                      {dataset.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              task.status === "completed" ? "bg-green-100" :
                              task.status === "active" ? "bg-blue-100" : "bg-yellow-100"
                            }`}>
                              {task.status === "completed" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : task.status === "active" ? (
                                <Clock className="h-5 w-5 text-blue-600" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{task.name}</p>
                              <p className="text-sm text-muted-foreground">{task.participants} 人参与</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">{task.progress}%</p>
                              <p className="text-xs text-muted-foreground">完成进度</p>
                            </div>
                            <Button variant="outline" size="sm">查看</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">暂无关联任务</p>
                      <Link href="/tasks/new">
                        <Button variant="outline">创建第一个任务</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          /* 非所有者视图 - 仅基本信息 */
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">数据集简介</CardTitle>
              <CardDescription>
                此数据集由其他机构或用户上传，您可以查看基本信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 描述 */}
              <div>
                <h4 className="font-medium text-foreground mb-2">详细描述</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{dataset.description}</p>
              </div>

              {/* 标签 */}
              <div>
                <h4 className="font-medium text-foreground mb-2">标签</h4>
                <div className="flex flex-wrap gap-2">
                  {dataset.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* 基本信息 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-foreground mb-1">数据格式</h4>
                  <p className="text-sm text-muted-foreground">{dataset.format}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-foreground mb-1">许可协议</h4>
                  <p className="text-sm text-muted-foreground">{dataset.license}</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-foreground mb-1">样本数量</h4>
                  <p className="text-sm text-muted-foreground">{dataset.samples.toLocaleString()} 例</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-foreground mb-1">上传时间</h4>
                  <p className="text-sm text-muted-foreground">{dataset.createdAt}</p>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  完整数据内容仅对数据集所有者可见，如有合作意向请联系数据提供方
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
