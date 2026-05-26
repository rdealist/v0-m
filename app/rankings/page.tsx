"use client"

import { useState } from "react"
import { Header, LevelBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Building2,
  User,
  CheckSquare,
  Database,
  Coins,
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

// 标注贡献榜（按标注数量排名）
const annotationRanking = [
  { rank: 1, name: "王主任", institution: "北京大学人民医院", level: 7, count: 15680, change: 2 },
  { rank: 2, name: "李教授", institution: "协和医院", level: 8, count: 14520, change: -1 },
  { rank: 3, name: "张医生", institution: "华西医院", level: 6, count: 12890, change: 1 },
  { rank: 4, name: "刘专家", institution: "中山医院", level: 7, count: 11200, change: 0 },
  { rank: 5, name: "陈医师", institution: "湘雅医院", level: 5, count: 10580, change: 3 },
  { rank: 6, name: "赵博士", institution: "复旦肿瘤医院", level: 6, count: 9870, change: -2 },
  { rank: 7, name: "孙主治", institution: "天坛医院", level: 5, count: 9450, change: 0 },
  { rank: 8, name: "周医生", institution: "瑞金医院", level: 6, count: 8920, change: 1 },
  { rank: 9, name: "吴研究员", institution: "阜外医院", level: 7, count: 8650, change: -1 },
  { rank: 10, name: "郑专家", institution: "301医院", level: 8, count: 8200, change: 0 },
]

// 审核贡献榜（Lv5+专家）
const auditRanking = [
  { rank: 1, name: "钱教授", institution: "协和医院", level: 9, count: 5680, approvalRate: 96 },
  { rank: 2, name: "孙主任", institution: "北大人民医院", level: 8, count: 4920, approvalRate: 94 },
  { rank: 3, name: "李专家", institution: "华西医院", level: 8, count: 4580, approvalRate: 97 },
  { rank: 4, name: "周院士", institution: "中山眼科", level: 9, count: 4120, approvalRate: 98 },
  { rank: 5, name: "吴教授", institution: "湘雅医院", level: 7, count: 3890, approvalRate: 93 },
]

// 数据贡献榜（机构）
const dataRanking = [
  { rank: 1, name: "协和医院影像中心", type: "三甲医院", datasets: 28, samples: 285000 },
  { rank: 2, name: "华西医学影像研究院", type: "研究机构", datasets: 22, samples: 218000 },
  { rank: 3, name: "中山眼科中心", type: "专科医院", datasets: 18, samples: 186000 },
  { rank: 4, name: "北京大学人民医院", type: "三甲医院", datasets: 15, samples: 152000 },
  { rank: 5, name: "复旦大学附属肿瘤医院", type: "肿瘤中心", datasets: 12, samples: 128000 },
]

// 积分榜
const pointsRanking = [
  { rank: 1, name: "王主任", institution: "北京大学人民医院", level: 7, points: 458000 },
  { rank: 2, name: "李教授", institution: "协和医院", level: 8, points: 425000 },
  { rank: 3, name: "钱教授", institution: "协和医院", level: 9, points: 398000 },
  { rank: 4, name: "张医生", institution: "华西医院", level: 6, points: 365000 },
  { rank: 5, name: "刘专家", institution: "中山医院", level: 7, points: 342000 },
]

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
  return <span className="w-5 text-center font-mono text-muted-foreground">{rank}</span>
}

const getRankBg = (rank: number) => {
  if (rank === 1) return "bg-amber-50"
  if (rank === 2) return "bg-slate-50"
  if (rank === 3) return "bg-amber-50/50"
  return ""
}

export default function RankingsPage() {
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-500" />
              排行榜
            </h1>
            <p className="mt-1 text-muted-foreground">平台贡献者荣誉榜，数据每日更新</p>
          </div>

          <Tabs defaultValue="annotation" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 rounded-full flex-wrap h-auto gap-1">
              <TabsTrigger value="annotation" className="rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <CheckSquare className="mr-2 h-4 w-4" />
                标注贡献榜
              </TabsTrigger>
              <TabsTrigger value="audit" className="rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <User className="mr-2 h-4 w-4" />
                审核贡献榜
              </TabsTrigger>
              <TabsTrigger value="data" className="rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Database className="mr-2 h-4 w-4" />
                数据贡献榜
              </TabsTrigger>
              <TabsTrigger value="points" className="rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Coins className="mr-2 h-4 w-4" />
                积分榜
              </TabsTrigger>
            </TabsList>

            {/* 标注贡献榜 */}
            <TabsContent value="annotation">
              <Card>
                <CardHeader>
                  <CardTitle>标注贡献榜</CardTitle>
                  <CardDescription>按累计标注样本数量排名</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {annotationRanking.map((item) => (
                      <div
                        key={item.rank}
                        className={`flex items-center gap-4 p-4 rounded-xl ${getRankBg(item.rank)}`}
                      >
                        <div className="flex-shrink-0 w-8 flex justify-center">
                          {getRankIcon(item.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {item.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{item.name}</span>
                            <LevelBadge level={item.level} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{item.institution}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-foreground">
                            {item.count.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">标注样本</p>
                        </div>
                        <div className="w-12 text-center">
                          {item.change > 0 && (
                            <Badge variant="outline" className="text-primary bg-primary/10">
                              <TrendingUp className="h-3 w-3 mr-0.5" />
                              {item.change}
                            </Badge>
                          )}
                          {item.change < 0 && (
                            <Badge variant="outline" className="text-destructive bg-destructive/10">
                              {item.change}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 审核贡献榜 */}
            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle>审核贡献榜</CardTitle>
                  <CardDescription>Lv5及以上专家审核贡献排名</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditRanking.map((item) => (
                      <div
                        key={item.rank}
                        className={`flex items-center gap-4 p-4 rounded-xl ${getRankBg(item.rank)}`}
                      >
                        <div className="flex-shrink-0 w-8 flex justify-center">
                          {getRankIcon(item.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {item.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{item.name}</span>
                            <LevelBadge level={item.level} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{item.institution}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-foreground">
                            {item.count.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">审核样本</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-primary/10 text-primary">
                            {item.approvalRate}% 通过率
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 数据贡献榜 */}
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>数据贡献榜</CardTitle>
                  <CardDescription>按机构贡献数据量排名</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dataRanking.map((item) => (
                      <div
                        key={item.rank}
                        className={`flex items-center gap-4 p-4 rounded-xl ${getRankBg(item.rank)}`}
                      >
                        <div className="flex-shrink-0 w-8 flex justify-center">
                          {getRankIcon(item.rank)}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-foreground">{item.datasets}</p>
                          <p className="text-xs text-muted-foreground">数据集</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-primary">
                            {(item.samples / 10000).toFixed(1)}万
                          </p>
                          <p className="text-xs text-muted-foreground">样本</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 积分榜 */}
            <TabsContent value="points">
              <Card>
                <CardHeader>
                  <CardTitle>积分榜</CardTitle>
                  <CardDescription>按累计积分收益排名</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pointsRanking.map((item) => (
                      <div
                        key={item.rank}
                        className={`flex items-center gap-4 p-4 rounded-xl ${getRankBg(item.rank)}`}
                      >
                        <div className="flex-shrink-0 w-8 flex justify-center">
                          {getRankIcon(item.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-amber-500/10 text-amber-600">
                            {item.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{item.name}</span>
                            <LevelBadge level={item.level} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{item.institution}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-primary">
                            {item.points.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">积分</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
