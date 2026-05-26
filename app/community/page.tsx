"use client"

import { useState } from "react"
import Link from "next/link"
import { Header, Footer, LevelBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  Filter,
  Flame,
  Clock,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Plus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

// 热门话题
const hotTopics = [
  { id: 1, name: "肺结节AI诊断", count: 1280 },
  { id: 2, name: "标注经验分享", count: 856 },
  { id: 3, name: "数据质量控制", count: 642 },
  { id: 4, name: "CT影像处理", count: 523 },
  { id: 5, name: "病理切片分析", count: 489 },
]

// 讨论帖子
const discussions = [
  {
    id: 1,
    author: {
      name: "王主任",
      avatar: undefined,
      level: 7,
      institution: "北京大学人民医院",
    },
    title: "肺结节良恶性标注的几个关键判断点",
    content:
      "在标注肺结节的良恶性时，除了关注结节的大小和形态，还需要特别注意以下几点：1. 毛刺征的分布和长度；2. 分叶征的深度；3. 空泡征的位置；4. 胸膜凹陷的程度。这些特征在AI模型训练中具有重要的区分价值...",
    tags: ["肺结节AI诊断", "标注经验分享"],
    likes: 328,
    comments: 56,
    views: 2580,
    createdAt: "2小时前",
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: 2,
    author: {
      name: "李教授",
      avatar: undefined,
      level: 8,
      institution: "协和医院",
    },
    title: "关于脑部MRI分割任务的边界处理技巧",
    content:
      "最近在参与一个脑部肿瘤分割任务，发现很多标注者在处理肿瘤边界时存在困惑。分享几点经验：首先，T1增强序列是确定肿瘤边界的最佳参考；其次，水肿区域需要与肿瘤实质区分开...",
    tags: ["脑部MRI", "分割标注"],
    likes: 256,
    comments: 42,
    views: 1890,
    createdAt: "5小时前",
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: 3,
    author: {
      name: "陈医师",
      avatar: undefined,
      level: 5,
      institution: "湘雅医院",
    },
    title: "新手标注者如何快速提升标注准确率？",
    content:
      "作为一个刚升到Lv5的标注者，想分享一下我的经验：1. 多看审核反馈，每次被驳回都是学习机会；2. 参与讨论区的病例讨论；3. 利用平台的标注指南反复学习；4. 从简单任务开始，逐步挑战高难度任务...",
    tags: ["标注经验分享", "新手指南"],
    likes: 189,
    comments: 38,
    views: 1520,
    createdAt: "1天前",
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 4,
    author: {
      name: "周博士",
      avatar: undefined,
      level: 6,
      institution: "复旦肿瘤医院",
    },
    title: "病理切片标注中的常见陷阱",
    content:
      "病理切片标注与影像标注有很大不同，需要特别注意：1. 放大倍数的选择直接影响判断；2. 染色质量差异可能导致误判；3. 切片边缘的伪影要注意排除；4. 同一肿瘤的异质性在不同区域表现不同...",
    tags: ["病理切片分析", "数据质量控制"],
    likes: 167,
    comments: 29,
    views: 1280,
    createdAt: "2天前",
    isLiked: false,
    isBookmarked: true,
  },
]

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        notificationCount={3}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">医学讨论社区</h1>
              <p className="mt-1 text-muted-foreground">分享经验、探讨病例、共同进步</p>
            </div>
            <Link href="/community/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                发布帖子
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* 主内容区 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 排序标签 */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                  <Flame className="h-4 w-4 mr-1.5" />
                  热门
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <Clock className="h-4 w-4 mr-1.5" />
                  最新
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  热议
                </Button>
              </div>

              {/* 帖子列表 */}
              <div className="space-y-4">
                {discussions.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      {/* 作者信息 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {post.author.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{post.author.name}</span>
                              <LevelBadge level={post.author.level} size="sm" />
                            </div>
                            <p className="text-xs text-muted-foreground">{post.author.institution}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>举报</DropdownMenuItem>
                              <DropdownMenuItem>屏蔽</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* 内容 */}
                      <h3 className="text-lg font-semibold text-foreground mb-2">{post.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {post.content}
                      </p>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="bg-muted/50">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* 互动栏 */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={post.isLiked ? "text-red-500" : "text-muted-foreground"}
                          >
                            <Heart className={`h-4 w-4 mr-1.5 ${post.isLiked ? "fill-current" : ""}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <MessageSquare className="h-4 w-4 mr-1.5" />
                            {post.comments}
                          </Button>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${post.isBookmarked ? "text-primary" : "text-muted-foreground"}`}
                          >
                            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? "fill-current" : ""}`} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 加载更多 */}
              <div className="flex justify-center">
                <Button variant="outline">加载更多</Button>
              </div>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 热门话题 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    热门话题
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hotTopics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 text-center font-bold ${
                            index < 3 ? "text-orange-500" : "text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground">#{topic.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{topic.count} 讨论</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 活跃用户 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">本周活跃用户</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {discussions.slice(0, 4).map((post) => (
                    <div key={post.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {post.author.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground truncate">
                            {post.author.name}
                          </span>
                          <LevelBadge level={post.author.level} size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {post.author.institution}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 社区规范 */}
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <h4 className="font-medium text-foreground mb-2">社区规范</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>- 尊重他人，友善讨论</li>
                    <li>- 保护患者隐私，脱敏处理</li>
                    <li>- 分享真实经验，拒绝抄袭</li>
                    <li>- 不发布广告或无关内容</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
