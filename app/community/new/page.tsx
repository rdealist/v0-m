"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Image as ImageIcon,
  X,
  Send,
} from "lucide-react"

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

// 可选话题标签
const availableTags = [
  "肺结节AI诊断",
  "标注经验分享",
  "数据质量控制",
  "CT影像处理",
  "病理切片分析",
  "脑部MRI",
  "分割标注",
  "新手指南",
  "病例讨论",
  "技术问答",
]

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    router.push("/community")
  }

  const isValid = title.trim().length > 0 && content.trim().length > 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        notificationCount={3}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 返回按钮 */}
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回社区
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">发布新帖子</CardTitle>
              <CardDescription>分享您的标注经验、提问或讨论病例</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  placeholder="请输入帖子标题..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {title.length}/100
                </p>
              </div>

              {/* 内容 */}
              <div className="space-y-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  placeholder="请输入帖子内容..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length}/5000
                </p>
              </div>

              {/* 添加图片 */}
              <div className="space-y-2">
                <Label>添加图片（可选）</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    点击或拖拽上传图片
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 JPG、PNG 格式，最多 9 张
                  </p>
                </div>
              </div>

              {/* 话题标签 */}
              <div className="space-y-2">
                <Label>话题标签（最多选择 3 个）</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag}
                      {selectedTags.includes(tag) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Link href="/community">
                  <Button variant="outline">取消</Button>
                </Link>
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    "发布中..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      发布帖子
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 发帖提示 */}
          <Card className="mt-6 bg-muted/30">
            <CardContent className="pt-6">
              <h4 className="font-medium text-foreground mb-2">发帖提示</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>- 标题应简洁明了，概括帖子主要内容</li>
                <li>- 如涉及医学影像，请确保已脱敏处理</li>
                <li>- 选择合适的话题标签可以让更多人看到您的帖子</li>
                <li>- 请遵守社区规范，尊重他人，友善讨论</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
