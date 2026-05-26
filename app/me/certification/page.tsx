"use client"

import { useState } from "react"
import { Header, LevelBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Shield,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  Award,
  ArrowRight,
  ChevronLeft,
  Star,
  Lock,
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

// 等级阶梯
const levelSteps = [
  { level: 0, label: "L0", name: "游客", requirement: "注册账号", completed: true },
  { level: 1, label: "Lv1", name: "新手", requirement: "完成基础认证", completed: true },
  { level: 2, label: "Lv2", name: "初级", requirement: "完成10个标注任务", completed: true },
  { level: 3, label: "Lv3", name: "中级", requirement: "完成50个标注任务", completed: true },
  { level: 4, label: "Lv4", name: "高级", requirement: "完成200个标注任务", completed: true },
  { level: 5, label: "Lv5", name: "专家", requirement: "通过专家认证考试", completed: true, current: true },
  { level: 6, label: "Lv6", name: "资深专家", requirement: "审核通过率≥95%", completed: false },
  { level: 7, label: "Lv7", name: "权威专家", requirement: "平台邀请认证", completed: false },
  { level: 8, label: "Lv8", name: "首席专家", requirement: "特殊贡献", completed: false },
  { level: 9, label: "Lv9", name: "顶级专家", requirement: "种子用户", completed: false },
]

// 认证状态
const certifications = [
  {
    id: "basic",
    title: "基础认证",
    description: "验证邮箱和手机号",
    status: "completed" as const,
    completedAt: "2026-01-15",
  },
  {
    id: "identity",
    title: "身份认证",
    description: "上传身份证明文件",
    status: "completed" as const,
    completedAt: "2026-01-16",
  },
  {
    id: "professional",
    title: "专业认证",
    description: "上传医师资格证、执业证",
    status: "completed" as const,
    completedAt: "2026-01-20",
  },
  {
    id: "expert",
    title: "专家认证",
    description: "通过专业能力考试",
    status: "completed" as const,
    completedAt: "2026-03-10",
  },
  {
    id: "senior",
    title: "资深专家认证",
    description: "累计审核通过率≥95%",
    status: "in_progress" as const,
    progress: 78,
  },
]

export default function CertificationPage() {
  const currentLevel = 5
  const nextLevel = levelSteps.find((l) => l.level === currentLevel + 1)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        notificationCount={3}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 返回链接 */}
          <Link
            href="/me"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            返回个人中心
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">认证中心</h1>
            <p className="mt-1 text-muted-foreground">提升等级，解锁更多权限和收益</p>
          </div>

          {/* 当前等级卡片 */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-chart-2 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">当前等级</p>
                    <p className="text-2xl font-bold">Lv{currentLevel} 专家</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">已解锁权限</p>
                  <p className="text-lg font-semibold">审核权限 · 80%分成</p>
                </div>
              </div>
            </div>
            {nextLevel && (
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    距离 {nextLevel.label} {nextLevel.name}
                  </span>
                  <span className="text-sm font-medium text-foreground">78%</span>
                </div>
                <Progress value={78} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  还需：{nextLevel.requirement}
                </p>
              </CardContent>
            )}
          </Card>

          {/* 等级阶梯 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                等级阶梯
              </CardTitle>
              <CardDescription>L0 + Lv1~Lv9 十级体系，Lv5 及以上解锁审核权限</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* 连接线 */}
                <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-muted" />
                
                <div className="space-y-4">
                  {levelSteps.map((step, index) => (
                    <div
                      key={step.level}
                      className={`relative flex items-start gap-4 p-3 rounded-xl transition-colors ${
                        step.current
                          ? "bg-primary/10"
                          : step.completed
                          ? "bg-muted/30"
                          : ""
                      }`}
                    >
                      {/* 圆点 */}
                      <div
                        className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                          step.current
                            ? "bg-primary text-white"
                            : step.completed
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {step.label} {step.name}
                          </span>
                          {step.current && (
                            <Badge className="bg-primary text-white text-xs">当前等级</Badge>
                          )}
                          {step.level >= 5 && !step.current && (
                            <Badge variant="outline" className="text-xs text-primary">
                              审核权限
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {step.requirement}
                        </p>
                      </div>

                      {/* 状态 */}
                      <div className="flex-shrink-0">
                        {step.completed ? (
                          <span className="text-xs text-primary">已达成</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">未达成</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 认证列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                认证进度
              </CardTitle>
              <CardDescription>完成认证项目以提升等级</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    cert.status === "completed"
                      ? "bg-primary/5"
                      : cert.status === "in_progress"
                      ? "bg-primary/5"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        cert.status === "completed"
                          ? "bg-primary/10 text-primary"
                          : cert.status === "in_progress"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cert.status === "completed" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : cert.status === "in_progress" ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cert.title}</p>
                      <p className="text-sm text-muted-foreground">{cert.description}</p>
                      {cert.status === "in_progress" && cert.progress !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={cert.progress} className="h-1.5 w-24" />
                          <span className="text-xs text-muted-foreground">{cert.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {cert.status === "completed" && cert.completedAt ? (
                      <span className="text-xs text-muted-foreground">
                        {cert.completedAt} 完成
                      </span>
                    ) : cert.status === "in_progress" ? (
                      <Badge variant="outline" className="text-primary">进行中</Badge>
                    ) : (
                      <Button size="sm" variant="outline">
                        开始认证
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
