"use client"

import { useState } from "react"
import { Header } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { UploadCloud, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"

const departments = ["放射科", "病理科", "超声科", "核医学科", "神经科", "心内科", "其他"]
const titles = ["住院医师", "主治医师", "副主任医师", "主任医师", "其他"]
const specialties = ["放射科", "病理科", "超声科", "核医学", "神经影像", "心血管影像", "骨骼肌肉"]

// 必填标记
function RequiredMark() {
  return <span className="text-destructive ml-0.5">*</span>
}

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(["放射科"])
  const [agreed, setAgreed] = useState(false)

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 lg:px-8">
          {/* 面包屑 */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">首页</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/login">注册</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>专家注册</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* 标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">专家资质认证申请</h1>
            <p className="mt-2 text-muted-foreground">请填写以下信息，提交后将进入审核流程</p>
          </div>

          {!submitted ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="space-y-10"
            >
              {/* 第一组 - 基本信息 */}
              <section>
                <div className="border-b border-border pb-2 mb-5">
                  <h3 className="text-base font-semibold text-foreground">基本信息</h3>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名<RequiredMark /></Label>
                    <Input id="name" placeholder="请输入真实姓名" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">所在机构/医院名称<RequiredMark /></Label>
                    <Input id="institution" placeholder="如：北京协和医院" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">科室</Label>
                    <Select>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="请选择科室" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">职称</Label>
                    <Select>
                      <SelectTrigger id="title">
                        <SelectValue placeholder="请选择职称" />
                      </SelectTrigger>
                      <SelectContent>
                        {titles.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">联系邮箱<RequiredMark /></Label>
                    <Input id="email" type="email" placeholder="name@hospital.com" required />
                  </div>
                </div>
              </section>

              {/* 第二组 - 资质认证 */}
              <section>
                <div className="border-b border-border pb-2 mb-5">
                  <h3 className="text-base font-semibold text-foreground">资质认证</h3>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="license">医师执业证书编号</Label>
                    <Input id="license" placeholder="请输入执业证书编号" />
                  </div>
                  <div className="space-y-2">
                    <Label>专业领域标签</Label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((s) => {
                        const active = selectedSpecialties.includes(s)
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSpecialty(s)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>执业证书扫描件上传</Label>
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <UploadCloud className="h-10 w-10 text-muted-foreground/60 mb-3" />
                      <p className="text-sm font-medium text-foreground">点击或拖拽文件到此处上传</p>
                      <p className="text-xs text-muted-foreground mt-1">支持 JPG / PNG / PDF，最大 10MB</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 第三组 - 补充信息 */}
              <section>
                <div className="border-b border-border pb-2 mb-5">
                  <h3 className="text-base font-semibold text-foreground">补充信息</h3>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="bio">个人简介 / 专业经历</Label>
                    <Textarea id="bio" placeholder="简要介绍您的专业背景与经历" maxLength={500} rows={4} />
                    <p className="text-xs text-muted-foreground text-right">最多 500 字</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">申请说明（可选）</Label>
                    <Textarea id="note" placeholder="如有其他需要说明的情况，请在此填写" rows={3} />
                  </div>
                </div>
              </section>

              {/* 底部 */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
                  <Label htmlFor="agree" className="text-sm font-normal text-muted-foreground cursor-pointer">
                    我已阅读并同意
                    <Link href="#" className="text-primary hover:underline">《平台服务协议》</Link>
                  </Label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={!agreed}>
                    提交申请
                  </Button>
                  <Button type="button" variant="outline">
                    暂存草稿
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* 提交成功卡片 */
            <Card className="border border-success/30 bg-success/5">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
                  <CheckCircle2 className="h-9 w-9 text-success" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">申请已提交</h2>
                <p className="text-muted-foreground max-w-md">
                  您的资质认证申请正在审核中，预计 3 个工作日内反馈结果
                </p>
                <Badge className="mt-4 bg-warning/10 text-warning border-warning/30">
                  <Clock className="h-3 w-3 mr-1" />
                  审核中
                </Badge>
                <Button className="mt-6 bg-primary hover:bg-primary/90 text-white" asChild>
                  <Link href="/">返回首页</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
