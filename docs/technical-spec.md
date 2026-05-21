# Technical Spec · 医学影像标注众包平台 · 预览版 v0.1

**文档版本**：v0.1  
**状态**：草稿（已补充执行准入闭环要求）  
**更新日期**：2026-05-21

---

## 目录

1. [技术栈总览](#1-技术栈总览)
2. [本地开发环境（Docker）](#2-本地开发环境docker)
3. [项目结构](#3-项目结构)
4. [环境变量](#4-环境变量)
5. [数据库 Schema](#5-数据库-schema)
6. [API 规范](#6-api-规范)
7. [认证与权限](#7-认证与权限)
8. [腾讯云 COS 集成（本地用 MinIO）](#8-腾讯云-cos-集成本地用-minio)
9. [实时通知（SSE）](#9-实时通知sse)
10. [标注数据规范](#10-标注数据规范)
11. [积分结算规范](#11-积分结算规范)
12. [标注工作台（Cornerstone3D）](#12-标注工作台cornerstone3d)
13. [部署规范](#13-部署规范)
14. [执行准入闭环补充](#14-执行准入闭环补充)

---

## 1. 技术栈总览

| 层级 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| **前端框架** | Next.js | 16.2.6（以当前 `package.json` 为准） | App Router，Server Components |
| **UI 组件** | shadcn/ui + Tailwind CSS | v4 | 保留现有原型 |
| **服务端状态** | TanStack Query | v5 | 替换所有 mock 数据 |
| **客户端状态** | Zustand | v5 | 标注工作台本地状态 |
| **认证** | Better Auth | latest | 邮箱密码 + 会话管理 |
| **ORM** | Drizzle ORM | latest | TypeScript-first，迁移脚本 |
| **数据库** | PostgreSQL | 15 | 主库（ACID 事务） |
| **缓存** | Redis | 7 | 会话、分布式锁、SSE 广播 |
| **对象存储** | 腾讯云 COS（生产）/ MinIO（开发） | — | DICOM 文件、图片 |
| **医学影像** | Cornerstone3D | v2 | 浏览器端 DICOM 渲染 |
| **邮件** | Nodemailer + SMTP | — | 生产用腾讯云 SES，开发用 Mailhog |
| **运行时** | Node.js | 22 LTS | — |
| **容器** | Docker + Docker Compose | — | 本地开发全服务 |
| **部署** | Docker + Nginx | — | 腾讯云 CVM 单机 |

---

## 2. 本地开发环境（Docker）

### 2.1 docker-compose.yml

在项目根目录创建：

```yaml
# docker-compose.yml
version: '3.9'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: med_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: med_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_dev_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: med_redis
    restart: unless-stopped
    command: redis-server --requirepass redis_dev_password
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', '--no-auth-warning', '-a', 'redis_dev_password', 'ping']
      interval: 5s
      timeout: 3s
      retries: 5

  # MinIO（本地 COS 替代，S3 兼容）
  minio:
    image: minio/minio:latest
    container_name: med_minio
    restart: unless-stopped
    command: server /data --console-address ':9001'
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_dev_password
    ports:
      - '9000:9000'   # API 端口（SDK 连接此端口）
      - '9001:9001'   # Web 控制台
    volumes:
      - minio_data:/data
    healthcheck:
      test: ['CMD', 'mc', 'ready', 'local']
      interval: 5s
      timeout: 5s
      retries: 5

  # MinIO 初始化（创建 Bucket）
  minio-init:
    image: minio/mc:latest
    container_name: med_minio_init
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
        mc alias set local http://minio:9000 minio_admin minio_dev_password;
        mc mb --ignore-existing local/med-datasets-private;
        mc mb --ignore-existing local/med-assets-public;
        mc anonymous set download local/med-assets-public;
        echo 'MinIO buckets initialized';
      "

  # Mailhog（本地邮件捕获，替代真实 SMTP）
  mailhog:
    image: mailhog/mailhog:latest
    container_name: med_mailhog
    restart: unless-stopped
    ports:
      - '1025:1025'   # SMTP 端口（应用发邮件到此）
      - '8025:8025'   # Web UI 查看邮件

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 14. 执行准入闭环补充

本节补齐 `docs/prd.md` 第 8 节与 `.omx/plans/test-spec-med-platform-preview-closure.md` 要求的执行准入技术闭环。后续实现不得绕过本节中的访问矩阵、领域模型、状态机、账本不变量与薄架构 proof gate。

### 14.1 版本与依赖对齐

当前仓库 `package.json` 使用 Next.js `16.2.6`，因此本技术规格以 Next.js 16.x 当前项目版本为准。若后续决定降级或锁定到其他版本，必须同步更新：

- `package.json`
- `pnpm-lock.yaml`
- 本文第 1 节技术栈表
- `.omx/plans/test-spec-med-platform-preview-closure.md` 中的 `TS-F2`

执行准入所需的核心依赖类别包括：

| 能力 | 目标依赖/实现 | 闭环要求 |
|------|---------------|----------|
| 认证与会话 | Better Auth + Drizzle adapter | Better Auth 拥有认证/会话主数据；平台字段不得另建冲突密码体系 |
| ORM/迁移 | Drizzle ORM + PostgreSQL driver + drizzle-kit | schema、migration、seed、studio 脚本一致 |
| 服务端状态 | TanStack Query | 替换页面 mock 数据时统一缓存 key |
| 工作台本地状态 | Zustand | 管理当前 case、工具、草稿、保存状态 |
| 缓存/锁/SSE | Redis 客户端 | 任务领取锁、通知广播、会话/限流辅助 |
| 对象存储 | COS/MinIO 兼容封装 | 上传 URL、下载 URL、私有对象访问控制 |
| DICOM 查看 | Cornerstone3D + dicom loader | 仅通过授权临时 URL 加载私有影像 |
| 邮件 | Nodemailer/SMTP | 验证邮箱、重置密码、通知邮件 |

### 14.2 最小领域模型

为跑通上传 → 发布 → 领取 → 标注 → 审核 → 结算闭环，数据库必须至少包含以下实体或等价结构。

#### 14.2.1 认证与平台用户扩展

Better Auth 负责用户、账号、会话、验证码/邮箱验证等认证主数据。平台业务字段放在扩展表中，避免与认证库的密码/账号模型冲突。

```typescript
export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id),
  role: userRoleEnum('role').notNull().default('user'),
  level: integer('level').notNull().default(1),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  avatarUrl: text('avatar_url'),
  institution: varchar('institution', { length: 200 }),
  specialty: varchar('specialty', { length: 100 }),
  certStatus: certStatusEnum('cert_status').notNull().default('none'),
  certLicenseKey: text('cert_license_key'),
  certNote: text('cert_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

> 实现时若 Better Auth adapter 支持直接扩展 user 表，也可以采用扩展 user 字段方案；但必须保持“认证密码/会话由 Better Auth 负责”这一不变量。

#### 14.2.2 数据集上传、文件与 case 映射

```typescript
export const datasetUploadSessions = pgTable('dataset_upload_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  datasetId: uuid('dataset_id').references(() => datasets.id),
  attestationAccepted: boolean('attestation_accepted').notNull().default(false),
  attestationAcceptedAt: timestamp('attestation_accepted_at'),
  status: varchar('status', { length: 32 }).notNull().default('draft'), // draft/uploading/ready/cancelled
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const datasetFiles = pgTable('dataset_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  datasetId: uuid('dataset_id').notNull().references(() => datasets.id),
  uploadSessionId: uuid('upload_session_id').references(() => datasetUploadSessions.id),
  originalFilename: text('original_filename').notNull(),
  storageKey: text('storage_key').notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }),
  contentType: varchar('content_type', { length: 100 }),
  checksum: varchar('checksum', { length: 128 }),
  status: varchar('status', { length: 32 }).notNull().default('uploaded'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const datasetCases = pgTable('dataset_cases', {
  id: uuid('id').defaultRandom().primaryKey(),
  datasetId: uuid('dataset_id').notNull().references(() => datasets.id),
  fileId: uuid('file_id').references(() => datasetFiles.id),
  caseId: varchar('case_id', { length: 100 }).notNull(),
  storageKey: text('storage_key').notNull(),
  thumbnailKey: text('thumbnail_key'),
  modality: varchar('modality', { length: 50 }),
  orderIndex: integer('order_index').notNull().default(0),
  metadata: jsonb('metadata').notNull().default({}),
  status: varchar('status', { length: 32 }).notNull().default('ready'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  datasetCaseUnique: uniqueIndex('dataset_cases_dataset_case_unique').on(t.datasetId, t.caseId),
}))
```

任务如不覆盖整个数据集，必须通过 `task_cases` 明确任务 case 集合：

```typescript
export const taskCases = pgTable('task_cases', {
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  caseId: uuid('case_id').notNull().references(() => datasetCases.id),
  orderIndex: integer('order_index').notNull().default(0),
}, (t) => ({
  taskCaseUnique: uniqueIndex('task_cases_unique').on(t.taskId, t.caseId),
}))
```

#### 14.2.3 审核结果与幂等结算

每次审核应保留 per-case 结果，便于混合通过/拒绝后结算。

```typescript
export const auditResults = pgTable('audit_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  auditId: uuid('audit_id').notNull().references(() => audits.id),
  datasetCaseId: uuid('dataset_case_id').notNull().references(() => datasetCases.id),
  result: varchar('result', { length: 16 }).notNull(), // approved/rejected
  reason: text('reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  auditCaseUnique: uniqueIndex('audit_results_audit_case_unique').on(t.auditId, t.datasetCaseId),
}))
```

账本必须支持幂等键与引用类型：

```typescript
export const walletTxns = pgTable('wallet_txns', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  type: txnTypeEnum('type').notNull(),
  refType: varchar('ref_type', { length: 50 }),
  refId: uuid('ref_id'),
  idempotencyKey: varchar('idempotency_key', { length: 160 }).notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx: index('wallet_txns_user_idx').on(t.userId),
  idempotencyUnique: uniqueIndex('wallet_txns_idempotency_unique').on(t.idempotencyKey),
}))
```

### 14.3 API 访问矩阵

为满足 PRD 的游客浏览能力，公开只读 API 与登录动作 API 必须拆分：

| API | 游客 | 登录用户 | 机构 | 专家 | 管理员 | 说明 |
|-----|------|----------|------|------|--------|------|
| `GET /api/public/datasets` | 允许 | 允许 | 允许 | 允许 | 允许 | 仅公开元数据，不返回私有 storage key |
| `GET /api/public/datasets/:id` | 允许 | 允许 | 允许 | 允许 | 允许 | 仅公开详情 |
| `GET /api/public/tasks` | 允许 | 允许 | 允许 | 允许 | 允许 | 仅开放任务元数据 |
| `GET /api/public/tasks/:id` | 允许 | 允许 | 允许 | 允许 | 允许 | 仅公开详情 |
| `POST /api/tasks/:id/claim` | 禁止 | 按等级允许 | 按角色策略 | 按等级允许 | 禁止或测试环境 | 原子领取 |
| `POST /api/datasets/upload-url` | 禁止 | 禁止 | 认证后允许 | 禁止 | 允许治理 | 私有上传 |
| `GET /api/annotations/:claimId/dicom-url/:caseId` | 禁止 | claim owner | owner/授权流程 | 授权审核专家 | 允许治理 | 私有临时 URL |
| `/api/me/*` | 禁止 | 仅本人 | 仅本人 | 仅本人 | 后台另设 | 个人信息/钱包 |
| `/api/admin/*` | 禁止 | 禁止 | 禁止 | 禁止 | 允许 | 后台治理 |

旧的 `GET /api/datasets` 与 `GET /api/tasks` 若继续保留，应作为登录后的增强视图；匿名浏览统一走 `/api/public/*`。

### 14.4 状态机

#### 数据集

```text
draft -> uploading -> ready -> public -> archived
          │           │
          └ cancelled └ rejected/manual_hold
```

- `public` 前必须满足：元数据完整、至少一个 `dataset_cases`、去标识化/样例数据声明已确认。
- `archived` 后不可创建新任务，但历史任务和审计记录保留。

#### 任务与领取

```text
task:  open -> closed -> completed
       open -> cancelled

claim: in_progress -> submitted -> settled
       in_progress -> cancelled/expired
```

- `closed` 表示不再接受新领取，可由名额满、截止、机构关闭触发。
- `settled` 可以包含 per-case mixed outcome，不应只用 `approved/rejected` 表示整个 claim。

#### 审核

```text
assigned -> in_review -> completed
```

- `completed` 动作必须在同一事务内写入 audit 完成状态与 wallet 交易。
- 重试同一 `idempotencyKey` 必须返回已完成结果，不得重复写入账本。

### 14.5 钱包、锁仓与结算不变量

1. 账本只增加，不修改、不删除。
2. 发布任务时写入机构用户 `lock` 负数流水，金额为 `rewardPerCase × totalCases × maxClaims × 1.05`。
3. 审核通过 case：标注者获得 `rewardPerCase × approvedCount`。
4. 专家获得 `rewardPerCase × approvedCount × 5%`。
5. 拒绝 case：机构获得 `rewardPerCase × rejectedCount` 的 `refund` 流水。
6. 平台 5% 手续费来自发布时锁仓，不在审核时额外扣除。
7. 同一 claim/audit 只能结算一次，依赖 `idempotencyKey` 和事务唯一约束。
8. 钱包概览必须从流水聚合或物化视图派生：
   - `available`: 可支配积分
   - `locked`: 未释放锁仓
   - `pending`: 已提交未审核收益
   - `totalIncome`: 历史正向收益

### 14.6 原子领取设计

`POST /api/tasks/:id/claim` 必须在数据库事务中完成最终一致校验。

```typescript
await db.transaction(async (tx) => {
  const [task] = await tx
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .for('update')

  if (!task || task.status !== 'open') throw new Error('任务不可领取')
  if (task.claimedCount >= task.maxClaims) throw new Error('名额已满')
  if (user.level < task.minLevel) throw new Error(`等级不足，需要 Lv${task.minLevel}`)

  await tx.insert(taskClaims).values({ taskId, userId }).onConflictDoNothing()

  const inserted = /* 检查是否真实插入 */
  if (!inserted) throw new Error('请勿重复领取')

  await tx
    .update(tasks)
    .set({
      claimedCount: task.claimedCount + 1,
      status: task.claimedCount + 1 >= task.maxClaims ? 'closed' : 'open',
    })
    .where(eq(tasks.id, taskId))
})
```

Redis 锁可作为降噪/限流优化，但 PostgreSQL 行锁和唯一约束是最终一致性的必要条件。

### 14.7 幂等结算设计

审核完成接口必须使用稳定幂等键，例如：

```text
settlement:audit:{auditId}:claim:{claimId}
```

事务流程：

1. 读取 audit、claim、task，并锁定 claim 或 audit 行。
2. 若 settlement idempotency key 已存在，返回已结算结果。
3. 聚合 `audit_results` 得到 approved/rejected counts。
4. 插入标注者 reward、专家 audit_fee、机构 refund、平台 fee/retain 相关流水。
5. 更新 claim 为 `settled`，audit 为 `completed`。
6. 事务提交后发送通知；通知失败不得回滚结算，但必须记录可重试事件。

### 14.8 薄架构 proof gate

大规模功能实现前，必须先完成以下最小 proof gate：

| Proof | 成功标准 | 对应测试 |
|-------|----------|----------|
| Auth/Profile | Better Auth session 可安全携带 role/level/profile，不重复持有密码 | `TS-A3` |
| Dataset Case | 一个上传会话能创建 dataset、file、case，并保留稳定 `caseId` | `TS-B4` |
| Task Lock | 发布任务能写入锁仓流水并打开任务 | `TS-C1` |
| Atomic Claim | 两个并发请求抢一个名额只有一个成功 | `TS-C3` 的最小版 |
| Idempotent Settlement | 一个 annotation + mixed audit 只结算一次 | `TS-D5` |

proof gate 通过前，不得启动广泛页面 mock 替换或完整工作台实现。

### 14.9 非 PHI 日志要求

结构化日志允许包含：

- request id
- user id / task id / claim id / audit id / dataset id / case id
- 状态迁移
- 错误码
- 耗时

结构化日志禁止包含：

- 患者姓名
- 身份证号
- 住院号
- 出生日期
- 原始 DICOM header 中的患者隐私字段
- 私有对象存储签名 URL 全量内容

### 2.2 启动命令

```bash
# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f postgres

# 停止服务（保留数据）
docker compose down

# 停止并清除所有数据（重置环境）
docker compose down -v
```

### 2.3 服务访问地址

| 服务 | 地址 | 凭据 |
|------|------|------|
| PostgreSQL | `localhost:5432` | `postgres / postgres_dev_password` |
| Redis | `localhost:6379` | 密码：`redis_dev_password` |
| MinIO API | `http://localhost:9000` | `minio_admin / minio_dev_password` |
| MinIO 控制台 | `http://localhost:9001` | `minio_admin / minio_dev_password` |
| Mailhog Web | `http://localhost:8025` | 无需登录 |
| Next.js 应用 | `http://localhost:3000` | — |

### 2.4 首次初始化步骤

```bash
# 1. 启动 Docker 服务
docker compose up -d

# 2. 安装 Node 依赖
pnpm install

# 3. 复制环境变量文件
cp .env.example .env.local

# 4. 运行数据库迁移
pnpm db:migrate

# 5. 插入种子数据（可选，开发调试用）
pnpm db:seed

# 6. 启动开发服务器
pnpm dev
```

---

## 3. 项目结构

```
/
├── app/                          # Next.js App Router 页面
│   ├── (auth)/                   # 未登录可访问
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                   # 需登录，有 Header/Footer
│   │   ├── layout.tsx            # 公共布局（Header + Footer）
│   │   ├── page.tsx              # 首页
│   │   ├── data/
│   │   ├── tasks/
│   │   ├── rankings/
│   │   ├── community/
│   │   ├── notifications/
│   │   └── me/
│   ├── workspace/                # 工作台（全屏，无 Footer）
│   │   ├── annotation/
│   │   └── audit/
│   └── api/                      # Route Handlers（后端 API）
│       ├── auth/[...all]/route.ts # Better Auth 入口
│       ├── me/
│       ├── datasets/
│       ├── tasks/
│       ├── annotations/
│       ├── audits/
│       ├── community/
│       ├── notifications/
│       └── admin/
│
├── components/
│   ├── m-platform/               # 平台业务组件（现有）
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── annotation/               # 标注工作台专用组件（新增）
│   │   ├── DicomViewer.tsx
│   │   ├── AnnotationToolbar.tsx
│   │   ├── CaseList.tsx
│   │   └── AnnotationPanel.tsx
│   └── audit/                    # 审核工作台专用组件（新增）
│
├── lib/
│   ├── db/
│   │   ├── index.ts              # Drizzle 实例
│   │   ├── schema.ts             # 完整数据库 Schema
│   │   └── migrations/           # 迁移文件（drizzle-kit 生成）
│   ├── auth.ts                   # Better Auth 配置
│   ├── redis.ts                  # Redis 客户端
│   ├── cos.ts                    # COS/MinIO 工具函数
│   ├── sse.ts                    # SSE 通知推送
│   └── utils.ts                  # 通用工具
│
├── hooks/
│   ├── use-sse.ts                # SSE 客户端 Hook
│   └── ...
│
├── docs/                         # 文档
├── docker-compose.yml
├── .env.example
├── drizzle.config.ts
└── package.json
```

---

## 4. 环境变量

### .env.example

```bash
# ─── 数据库 ───────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:postgres_dev_password@localhost:5432/med_platform"

# ─── Redis ────────────────────────────────────────────────
REDIS_URL="redis://:redis_dev_password@localhost:6379"

# ─── 认证（Better Auth）───────────────────────────────────
BETTER_AUTH_SECRET="dev-secret-change-in-production-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# ─── 对象存储 ─────────────────────────────────────────────
# 本地开发：MinIO
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_REGION="us-east-1"          # MinIO 默认，COS 生产用 ap-guangzhou
STORAGE_ACCESS_KEY="minio_admin"
STORAGE_SECRET_KEY="minio_dev_password"
STORAGE_BUCKET_PRIVATE="med-datasets-private"
STORAGE_BUCKET_PUBLIC="med-assets-public"
STORAGE_PUBLIC_URL="http://localhost:9000/med-assets-public"

# 生产环境（腾讯云 COS）：
# STORAGE_ENDPOINT="https://cos.ap-guangzhou.myqcloud.com"
# STORAGE_REGION="ap-guangzhou"
# STORAGE_ACCESS_KEY="腾讯云 SecretId"
# STORAGE_SECRET_KEY="腾讯云 SecretKey"
# STORAGE_PUBLIC_URL="https://med-assets-public-{appid}.cos.ap-guangzhou.myqcloud.com"

# ─── 邮件 ─────────────────────────────────────────────────
# 本地开发：Mailhog
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@med-platform.dev"

# 生产环境（腾讯云 SES）：
# SMTP_HOST="smtp.qcloudmail.com"
# SMTP_PORT="465"
# SMTP_USER="your@domain.com"
# SMTP_PASS="your-ses-password"

# ─── 应用 ─────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 5. 数据库 Schema

### drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### lib/db/schema.ts（完整）

```typescript
import {
  pgTable, uuid, varchar, text, integer, bigint,
  boolean, timestamp, jsonb, pgEnum, index, uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ─────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'user',         // 普通标注者
  'institution',  // 机构用户
  'admin',        // 管理员
])

export const certStatusEnum = pgEnum('cert_status', [
  'none',         // 未申请
  'pending',      // 待审核
  'approved',     // 已通过
  'rejected',     // 已拒绝
])

export const datasetStatusEnum = pgEnum('dataset_status', [
  'draft',        // 草稿（刚上传）
  'public',       // 公开
  'archived',     // 归档
])

export const taskStatusEnum = pgEnum('task_status', [
  'open',         // 接受领取
  'closed',       // 停止领取（名额满）
  'completed',    // 所有审核完成
  'cancelled',    // 机构取消
])

export const claimStatusEnum = pgEnum('claim_status', [
  'in_progress',  // 标注中
  'submitted',    // 已提交，待审核
  'approved',     // 审核通过，已结算
  'rejected',     // 审核拒绝
])

export const txnTypeEnum = pgEnum('txn_type', [
  'lock',         // 发布任务锁仓
  'unlock',       // 任务取消退还
  'reward',       // 标注获得奖励
  'audit_fee',    // 审核费
  'refund',       // 拒绝例退款给机构
  'purchase',     // 购买数据集（后续功能）
])

export const notifTypeEnum = pgEnum('notif_type', [
  'task_claimed',
  'annotation_submitted',
  'audit_approved',
  'audit_rejected',
  'wallet_change',
  'cert_approved',
  'cert_rejected',
  'system',
])

// ─── Tables ────────────────────────────────────────────────────────────────

// 用户表
export const users = pgTable('users', {
  id:           uuid('id').defaultRandom().primaryKey(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name:         varchar('name', { length: 100 }).notNull(),
  phone:        varchar('phone', { length: 20 }),
  avatarUrl:    text('avatar_url'),
  role:         userRoleEnum('role').notNull().default('user'),
  level:        integer('level').notNull().default(1),  // 1-9
  emailVerified: boolean('email_verified').notNull().default(false),
  certStatus:   certStatusEnum('cert_status').notNull().default('none'),
  certLicense:  text('cert_license'),       // COS key for uploaded license image
  certNote:     text('cert_note'),          // 拒绝原因
  institution:  varchar('institution', { length: 200 }),
  specialty:    varchar('specialty', { length: 100 }),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex('users_email_idx').on(t.email),
}))

// 数据集表
export const datasets = pgTable('datasets', {
  id:          uuid('id').defaultRandom().primaryKey(),
  ownerId:     uuid('owner_id').notNull().references(() => users.id),
  name:        varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  modality:    varchar('modality', { length: 50 }).notNull(),  // CT/MRI/X-Ray/OCT/超声/病理
  specialty:   varchar('specialty', { length: 100 }),
  sampleCount: integer('sample_count').notNull().default(0),
  status:      datasetStatusEnum('status').notNull().default('draft'),
  cosKeyPrefix: text('cos_key_prefix'),  // 文件在 COS 的路径前缀
  thumbnailUrl: text('thumbnail_url'),
  price:       bigint('price', { mode: 'number' }).notNull().default(0),  // 积分
  isPublic:    boolean('is_public').notNull().default(true),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  ownerIdx: index('datasets_owner_idx').on(t.ownerId),
  statusIdx: index('datasets_status_idx').on(t.status),
}))

// 任务表
export const tasks = pgTable('tasks', {
  id:            uuid('id').defaultRandom().primaryKey(),
  publisherId:   uuid('publisher_id').notNull().references(() => users.id),
  datasetId:     uuid('dataset_id').references(() => datasets.id),
  title:         varchar('title', { length: 200 }).notNull(),
  description:   text('description'),
  modality:      varchar('modality', { length: 50 }),
  labelCategories: jsonb('label_categories').$type<string[]>().default([]),
  // 积分（单位：最小积分单元）
  rewardPerCase: bigint('reward_per_case', { mode: 'number' }).notNull(),
  totalCases:    integer('total_cases').notNull(),
  maxClaims:     integer('max_claims').notNull(),
  claimedCount:  integer('claimed_count').notNull().default(0),
  minLevel:      integer('min_level').notNull().default(1),
  lockedAmount:  bigint('locked_amount', { mode: 'number' }).notNull(),
  deadline:      timestamp('deadline').notNull(),
  status:        taskStatusEnum('status').notNull().default('open'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  publisherIdx: index('tasks_publisher_idx').on(t.publisherId),
  statusIdx:    index('tasks_status_idx').on(t.status),
}))

// 任务领取记录
export const taskClaims = pgTable('task_claims', {
  id:             uuid('id').defaultRandom().primaryKey(),
  taskId:         uuid('task_id').notNull().references(() => tasks.id),
  userId:         uuid('user_id').notNull().references(() => users.id),
  completedCases: integer('completed_cases').notNull().default(0),
  status:         claimStatusEnum('status').notNull().default('in_progress'),
  submittedAt:    timestamp('submitted_at'),
  settledAt:      timestamp('settled_at'),
  claimedAt:      timestamp('claimed_at').notNull().defaultNow(),
}, (t) => ({
  uniqueClaim: uniqueIndex('task_claims_unique').on(t.taskId, t.userId),
  taskIdx:     index('task_claims_task_idx').on(t.taskId),
  userIdx:     index('task_claims_user_idx').on(t.userId),
}))

// 标注记录（每例一条）
export const annotations = pgTable('annotations', {
  id:        uuid('id').defaultRandom().primaryKey(),
  claimId:   uuid('claim_id').notNull().references(() => taskClaims.id),
  caseId:    varchar('case_id', { length: 100 }).notNull(),
  data:      jsonb('data').notNull().default({}),  // 标注 JSON 数据
  savedAt:   timestamp('saved_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  claimCaseIdx: uniqueIndex('annotations_claim_case').on(t.claimId, t.caseId),
}))

// 审核记录
export const audits = pgTable('audits', {
  id:        uuid('id').defaultRandom().primaryKey(),
  claimId:   uuid('claim_id').notNull().references(() => taskClaims.id),
  expertId:  uuid('expert_id').notNull().references(() => users.id),
  // 每例审核结果（approved/rejected + 原因）
  results:   jsonb('results').notNull().default({}),
  approvedCount: integer('approved_count').notNull().default(0),
  rejectedCount: integer('rejected_count').notNull().default(0),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// 积分账本（只增，不改不删）
export const walletTxns = pgTable('wallet_txns', {
  id:        uuid('id').defaultRandom().primaryKey(),
  userId:    uuid('user_id').notNull().references(() => users.id),
  amount:    bigint('amount', { mode: 'number' }).notNull(),  // 正数=收入，负数=支出
  type:      txnTypeEnum('type').notNull(),
  refId:     uuid('ref_id'),     // 关联的 taskId 或 claimId
  note:      text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx:      index('wallet_txns_user_idx').on(t.userId),
  createdAtIdx: index('wallet_txns_created_at_idx').on(t.createdAt),
}))

// 通知
export const notifications = pgTable('notifications', {
  id:        uuid('id').defaultRandom().primaryKey(),
  userId:    uuid('user_id').notNull().references(() => users.id),
  type:      notifTypeEnum('type').notNull(),
  title:     varchar('title', { length: 200 }).notNull(),
  body:      text('body').notNull(),
  link:      text('link'),        // 点击跳转的路由
  read:      boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userReadIdx: index('notifications_user_read_idx').on(t.userId, t.read),
}))

// 社区帖子
export const posts = pgTable('posts', {
  id:        uuid('id').defaultRandom().primaryKey(),
  authorId:  uuid('author_id').notNull().references(() => users.id),
  title:     varchar('title', { length: 200 }).notNull(),
  content:   text('content').notNull(),
  tags:      jsonb('tags').$type<string[]>().default([]),
  likeCount: integer('like_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// 评论
export const comments = pgTable('comments', {
  id:        uuid('id').defaultRandom().primaryKey(),
  postId:    uuid('post_id').notNull().references(() => posts.id),
  authorId:  uuid('author_id').notNull().references(() => users.id),
  content:   text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  postIdx: index('comments_post_idx').on(t.postId),
}))

// 点赞（帖子）
export const postLikes = pgTable('post_likes', {
  postId:    uuid('post_id').notNull().references(() => posts.id),
  userId:    uuid('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  pk: uniqueIndex('post_likes_pk').on(t.postId, t.userId),
}))
```

### 常用查询：钱包余额

```typescript
// 余额 = 所有流水之和（不存余额字段）
const [{ balance }] = await db
  .select({ balance: sql<number>`COALESCE(SUM(amount), 0)` })
  .from(walletTxns)
  .where(eq(walletTxns.userId, userId))

// 锁仓金额 = 所有 lock 类型流水绝对值之和（其中未解锁的部分）
// 简化实现：通过关联 task 状态判断
```

---

## 6. API 规范

### 基础约定

```
Base URL：/api
认证：所有 /api/* 接口（除 /api/auth/*）必须携带 Session Cookie
响应格式：
  成功 { data: any, message?: string }
  失败 { error: string, code?: string }
分页参数：?page=1&limit=20
```

### 6.1 认证 /api/auth

由 Better Auth 自动处理，无需手动实现。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/sign-up/email` | 注册 |
| POST | `/api/auth/sign-in/email` | 登录 |
| POST | `/api/auth/sign-out` | 退出 |
| GET  | `/api/auth/session` | 获取当前会话 |
| POST | `/api/auth/verify-email` | 验证邮箱 |
| POST | `/api/auth/forgot-password` | 发送重置密码邮件 |
| POST | `/api/auth/reset-password` | 重置密码 |

### 6.2 用户 /api/me

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET  | `/api/me` | 已登录 | 获取当前用户信息 + 钱包概览 |
| PATCH | `/api/me` | 已登录 | 更新名称、手机、头像 |
| GET  | `/api/me/wallet` | 已登录 | 积分流水列表（分页） |
| POST | `/api/me/cert` | 已登录 | 提交机构认证申请 |
| GET  | `/api/me/cert` | 已登录 | 查询认证状态 |

### 6.3 数据集 /api/datasets

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET  | `/api/datasets` | 已登录 | 列表（支持筛选/分页） |
| GET  | `/api/datasets/:id` | 已登录 | 详情 |
| POST | `/api/datasets/upload-url` | 机构用户 | 获取 COS 预签名上传 URL |
| POST | `/api/datasets` | 机构用户 | 提交数据集元数据（上传完成后调用） |
| PATCH | `/api/datasets/:id` | 机构用户（owner） | 更新元数据 |
| GET  | `/api/datasets/mine` | 机构用户 | 我上传的数据集 |

**GET /api/datasets 查询参数：**
```
modality    string   CT|MRI|X-Ray|超声|OCT|病理
specialty   string   科室名
status      string   public|draft
sortBy      string   newest(default)|samples|price_asc|price_desc
page        number   默认 1
limit       number   默认 20，最大 50
```

### 6.4 任务 /api/tasks

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET  | `/api/tasks` | 已登录 | 列表（支持筛选/分页） |
| GET  | `/api/tasks/:id` | 已登录 | 详情 |
| POST | `/api/tasks` | 机构用户 | 发布任务（含积分锁仓） |
| POST | `/api/tasks/:id/claim` | Lv1+ 用户 | 领取任务 |
| GET  | `/api/tasks/mine/claimed` | 已登录 | 我领取的任务 |
| GET  | `/api/tasks/mine/published` | 机构用户 | 我发布的任务 |
| GET  | `/api/tasks/audit` | Lv5+ | 待审核任务列表 |

**POST /api/tasks 请求体：**
```typescript
{
  datasetId:       string,
  title:           string,
  description:     string,
  modality:        string,
  labelCategories: string[],   // 标注类别列表
  rewardPerCase:   number,     // 每例积分
  totalCases:      number,
  maxClaims:       number,
  minLevel:        number,     // 1-4
  deadline:        string,     // ISO 8601
}
```

**POST /api/tasks/:id/claim 响应：**
```typescript
// 成功
{ data: { claimId: string, message: "领取成功" } }

// 失败
{ error: "名额已满" }
{ error: "等级不足，需要 Lv3" }
{ error: "请勿重复领取" }
```

### 6.5 标注 /api/annotations

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET  | `/api/annotations/:claimId` | claim owner | 获取该领取的所有标注 |
| PUT  | `/api/annotations/:claimId/:caseId` | claim owner | 保存/更新单例标注（upsert） |
| POST | `/api/annotations/:claimId/submit` | claim owner | 提交全部标注待审核 |
| GET  | `/api/annotations/:claimId/dicom-url/:caseId` | claim owner / 审核专家 | 获取 DICOM 文件临时访问 URL |

**PUT /api/annotations/:claimId/:caseId 请求体：**
```typescript
{
  data: AnnotationData,   // 见第 10 节标注数据规范
}
```

### 6.6 审核 /api/audits

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/audits` | Lv5+ | 创建审核任务（领取一个待审核的 claim） |
| GET  | `/api/audits/:auditId` | 对应专家 | 审核详情（含标注数据） |
| PUT  | `/api/audits/:auditId/case/:caseId` | 对应专家 | 提交单例审核结果 |
| POST | `/api/audits/:auditId/complete` | 对应专家 | 完成全部审核，触发结算 |

**PUT /api/audits/:auditId/case/:caseId 请求体：**
```typescript
{
  result:  'approved' | 'rejected',
  reason?: string,   // 拒绝时必填
}
```

### 6.7 通知 /api/notifications

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET  | `/api/notifications` | 已登录 | 通知列表（分页） |
| POST | `/api/notifications/read-all` | 已登录 | 全部标为已读 |
| GET  | `/api/notifications/stream` | 已登录 | SSE 实时推送连接 |

### 6.8 社区 /api/community

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET  | `/api/community/posts` | 已登录 | 帖子列表 |
| POST | `/api/community/posts` | 已登录 | 发帖 |
| GET  | `/api/community/posts/:id` | 已登录 | 帖子详情 + 评论 |
| POST | `/api/community/posts/:id/like` | 已登录 | 点赞/取消点赞 |
| POST | `/api/community/posts/:id/comments` | 已登录 | 发表评论 |

### 6.9 管理员 /api/admin

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET  | `/api/admin/certs` | admin | 待审核机构认证列表 |
| POST | `/api/admin/certs/:userId/approve` | admin | 通过认证 |
| POST | `/api/admin/certs/:userId/reject` | admin | 拒绝认证 |
| GET  | `/api/admin/users` | admin | 用户列表 |
| PATCH | `/api/admin/users/:id/level` | admin | 手动调整用户等级 |

---

## 7. 认证与权限

### 7.1 Better Auth 配置

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,         // 7 天
    updateAge: 60 * 60 * 24,              // 每天续签
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: '验证您的邮箱',
        html: `<a href="${url}">点击验证</a>`,
      })
    },
  },
})
```

### 7.2 路由权限中间件

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const PUBLIC_PATHS = ['/', '/login', '/register', '/data', '/tasks', '/rankings']

export function middleware(req: NextRequest) {
  const session = getSessionCookie(req)
  const isPublic = PUBLIC_PATHS.some(p => req.nextUrl.pathname.startsWith(p))

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next|favicon).*)'],
}
```

### 7.3 API 权限检查辅助函数

```typescript
// lib/auth-helpers.ts
import { auth } from './auth'
import { headers } from 'next/headers'

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Response('Unauthorized', { status: 401 })
  return session
}

export async function requireLevel(minLevel: number) {
  const session = await requireAuth()
  if (session.user.level < minLevel) {
    throw new Response(`需要 Lv${minLevel} 及以上`, { status: 403 })
  }
  return session
}

export async function requireRole(role: 'institution' | 'admin') {
  const session = await requireAuth()
  if (session.user.role !== role && session.user.role !== 'admin') {
    throw new Response('权限不足', { status: 403 })
  }
  return session
}
```

---

## 8. 腾讯云 COS 集成（本地用 MinIO）

### 8.1 统一封装（兼容 COS 和 MinIO）

腾讯云 COS SDK v5 与 AWS S3 SDK 协议兼容，MinIO 也兼容 S3 协议，使用同一套封装：

```typescript
// lib/cos.ts
import COS from 'cos-js-sdk-v5'

// 注意：这里使用 Node.js 环境的服务端 SDK
const cos = new COS({
  SecretId:  process.env.STORAGE_ACCESS_KEY!,
  SecretKey: process.env.STORAGE_SECRET_KEY!,
  // 本地 MinIO：指向本地端点
  // 生产 COS：不设置此项，使用默认腾讯云端点
  ...(process.env.NODE_ENV === 'development' ? {
    Protocol: 'http:',
    Domain:   'localhost:9000',
  } : {}),
})

const PRIVATE_BUCKET = process.env.STORAGE_BUCKET_PRIVATE!
const PUBLIC_BUCKET  = process.env.STORAGE_BUCKET_PUBLIC!
const REGION         = process.env.STORAGE_REGION!

// 生成预签名上传 URL（DICOM 文件，有效期 1 小时）
export async function getUploadUrl(key: string, contentType: string) {
  return new Promise<string>((resolve, reject) => {
    cos.getObjectUrl({
      Bucket:  PRIVATE_BUCKET,
      Region:  REGION,
      Key:     key,
      Method:  'PUT',
      Headers: { 'Content-Type': contentType },
      Expires: 3600,
      Sign:    true,
    }, (err, data) => {
      if (err) reject(err)
      else resolve(data.Url)
    })
  })
}

// 生成预签名下载 URL（标注工作台加载 DICOM，有效期 1 小时）
export async function getDownloadUrl(key: string) {
  return new Promise<string>((resolve, reject) => {
    cos.getObjectUrl({
      Bucket:  PRIVATE_BUCKET,
      Region:  REGION,
      Key:     key,
      Method:  'GET',
      Expires: 3600,
      Sign:    true,
    }, (err, data) => {
      if (err) reject(err)
      else resolve(data.Url)
    })
  })
}

// 生成文件 key（按机构/数据集组织目录）
export function buildDicomKey(ownerId: string, datasetId: string, filename: string) {
  return `dicom/${ownerId}/${datasetId}/${filename}`
}

export function buildThumbnailKey(datasetId: string) {
  return `thumbnails/${datasetId}.jpg`
}
```

### 8.2 前端直传流程（Route Handler + 客户端）

```typescript
// app/api/datasets/upload-url/route.ts
import { requireRole } from '@/lib/auth-helpers'
import { getUploadUrl, buildDicomKey } from '@/lib/cos'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  const session = await requireRole('institution')
  const { filename, contentType, datasetId } = await req.json()

  // 校验文件类型
  const allowed = ['application/dicom', 'application/zip', 'application/octet-stream']
  if (!allowed.includes(contentType)) {
    return Response.json({ error: '不支持的文件类型' }, { status: 400 })
  }

  const key = buildDicomKey(session.user.id, datasetId, `${nanoid()}-${filename}`)
  const url = await getUploadUrl(key, contentType)

  return Response.json({ uploadUrl: url, cosKey: key })
}
```

```typescript
// 前端上传逻辑（app/data/upload/page.tsx 中调用）
async function uploadFile(file: File, datasetId: string) {
  // 1. 从后端获取预签名 URL
  const { uploadUrl, cosKey } = await fetch('/api/datasets/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename:    file.name,
      contentType: file.type || 'application/octet-stream',
      datasetId,
    }),
  }).then(r => r.json())

  // 2. 前端直传 COS/MinIO（不经过 Next.js server，零带宽占用）
  await fetch(uploadUrl, {
    method: 'PUT',
    body:   file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  })

  return cosKey
}
```

---

## 9. 实时通知（SSE）

### 9.1 服务端 SSE Handler

```typescript
// app/api/notifications/stream/route.ts
import { requireAuth } from '@/lib/auth-helpers'
import { redis } from '@/lib/redis'

export async function GET(req: Request) {
  const session = await requireAuth()
  const userId  = session.user.id

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // 发送心跳，防止连接超时
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'))
      }, 20_000)

      // 订阅 Redis 频道（该用户专属）
      const channel = `notif:${userId}`
      const subscriber = redis.duplicate()

      subscriber.subscribe(channel, (message) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`))
      })

      // 客户端断开时清理
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        subscriber.unsubscribe(channel)
        subscriber.disconnect()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
```

### 9.2 服务端发送通知

```typescript
// lib/sse.ts
import { redis } from './redis'
import { db } from './db'
import { notifications } from './db/schema'

export async function sendNotification(
  userId: string,
  payload: {
    type:   string
    title:  string
    body:   string
    link?:  string
  }
) {
  // 1. 持久化到数据库
  const [notif] = await db.insert(notifications).values({
    userId,
    type:  payload.type as any,
    title: payload.title,
    body:  payload.body,
    link:  payload.link,
  }).returning()

  // 2. 实时推送（用户在线则立即收到，不在线则下次登录从 DB 读取）
  await redis.publish(`notif:${userId}`, JSON.stringify(notif))
}
```

### 9.3 客户端 Hook

```typescript
// hooks/use-sse.ts
'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useSSENotifications() {
  const qc = useQueryClient()

  useEffect(() => {
    const es = new EventSource('/api/notifications/stream')

    es.onmessage = (e) => {
      const notif = JSON.parse(e.data)
      // 使通知缓存失效，触发重新请求
      qc.invalidateQueries({ queryKey: ['notifications'] })
      // 可选：在页面右下角弹出 toast
    }

    es.onerror = () => {
      es.close()
      // 3 秒后自动重连
      setTimeout(() => {/* 重建连接 */}, 3000)
    }

    return () => es.close()
  }, [qc])
}
```

---

## 10. 标注数据规范

### 数据结构（存储于 `annotations.data` JSONB 字段）

```typescript
interface AnnotationData {
  version:     '1.0'
  caseId:      string
  taskId:      string
  imageWidth:  number          // DICOM 图像宽度（像素）
  imageHeight: number          // DICOM 图像高度（像素）
  annotations: Annotation[]
  note:        string          // 自由文字备注
  savedAt:     string          // ISO 8601
}

interface Annotation {
  id:        string            // nanoid()
  tool:      'RectangleROI'   // 预览版仅支持矩形框选
  label:     string            // 来自 task.labelCategories
  handles: {
    start:   { x: number; y: number }  // 图像坐标系，单位：像素
    end:     { x: number; y: number }
  }
  confidence?: number          // 可选：0-1 信心度
}
```

### 示例

```json
{
  "version": "1.0",
  "caseId": "CASE-042",
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "imageWidth": 512,
  "imageHeight": 512,
  "annotations": [
    {
      "id": "ann_V1StGXR8",
      "tool": "RectangleROI",
      "label": "malignant",
      "handles": {
        "start": { "x": 124, "y": 89 },
        "end":   { "x": 208, "y": 163 }
      },
      "confidence": 0.85
    }
  ],
  "note": "右肺上叶结节，边界不规则，考虑恶性可能大",
  "savedAt": "2026-05-21T10:30:00.000Z"
}
```

---

## 11. 积分结算规范

### 11.1 规则

```
总锁仓 = rewardPerCase × totalCases × maxClaims × 1.05
（5% 平台手续费在发布时一并锁仓，不退还）

审核通过后结算（每个 claim 独立结算）：
  标注者获得 = rewardPerCase × approvedCount
  专家获得   = rewardPerCase × approvedCount × 0.05
  机构退还   = rewardPerCase × rejectedCount（从锁仓中退还）
```

### 11.2 结算函数

```typescript
// app/api/audits/[auditId]/complete/route.ts
import { db } from '@/lib/db'
import { taskClaims, walletTxns, audits } from '@/lib/db/schema'
import { sendNotification } from '@/lib/sse'
import { eq } from 'drizzle-orm'

export async function POST(req: Request, { params }: { params: { auditId: string } }) {
  const session = await requireLevel(5)

  await db.transaction(async (tx) => {
    // 1. 获取审核记录
    const [audit] = await tx
      .select().from(audits)
      .where(eq(audits.id, params.auditId))

    const [claim] = await tx
      .select().from(taskClaims)
      .where(eq(taskClaims.id, audit.claimId))

    const [task] = await tx
      .select().from(tasks)
      .where(eq(tasks.id, claim.taskId))

    const approvedAmount = BigInt(task.rewardPerCase) * BigInt(audit.approvedCount)
    const auditFee       = approvedAmount * 5n / 100n
    const refundAmount   = BigInt(task.rewardPerCase) * BigInt(audit.rejectedCount)

    // 2. 原子写入所有积分流水
    await tx.insert(walletTxns).values([
      // 标注者收益
      { userId: claim.userId, amount: Number(approvedAmount),
        type: 'reward',    refId: claim.id, note: `审核通过 ${audit.approvedCount} 例` },
      // 专家审核费
      { userId: session.user.id, amount: Number(auditFee),
        type: 'audit_fee', refId: audit.id, note: '审核费' },
      // 机构退款（拒绝例）
      ...(refundAmount > 0n ? [{
        userId: task.publisherId, amount: Number(refundAmount),
        type: 'refund' as const, refId: claim.id, note: `拒绝例退款 ${audit.rejectedCount} 例`,
      }] : []),
    ])

    // 3. 更新 claim 状态
    await tx.update(taskClaims)
      .set({ status: 'approved', settledAt: new Date() })
      .where(eq(taskClaims.id, claim.id))

    // 4. 更新 audit 完成时间
    await tx.update(audits)
      .set({ completedAt: new Date() })
      .where(eq(audits.id, params.auditId))
  })

  // 5. 发送通知（事务外，失败不回滚结算）
  await sendNotification(claim.userId, {
    type:  'audit_approved',
    title: '标注审核完成',
    body:  `您的标注已审核，通过 ${audit.approvedCount} 例，获得 ${approvedAmount} 积分`,
    link:  `/me/assets`,
  })
}
```

---

## 12. 标注工作台（Cornerstone3D）

### 12.1 依赖安装

```bash
pnpm add @cornerstonejs/core @cornerstonejs/tools @cornerstonejs/dicom-image-loader dicom-parser
```

### 12.2 初始化（单例，应用启动时执行一次）

```typescript
// lib/cornerstone/init.ts
import { init as csInit }       from '@cornerstonejs/core'
import { init as csToolsInit }  from '@cornerstonejs/tools'
import { init as dicomLoaderInit } from '@cornerstonejs/dicom-image-loader'

let initialized = false

export async function initCornerstone() {
  if (initialized) return
  await csInit()
  await csToolsInit()
  dicomLoaderInit({ maxWebWorkers: 2 })
  initialized = true
}
```

### 12.3 DICOM 加载（从 COS 预签名 URL）

```typescript
// components/annotation/DicomViewer.tsx（关键逻辑）
import { RenderingEngine, Enums, imageLoader } from '@cornerstonejs/core'
import { cornerstoneDicomImageLoader }          from '@cornerstonejs/dicom-image-loader'

async function loadCase(caseId: string, claimId: string) {
  // 1. 从后端获取带权限的临时 URL（有效期 1h）
  const { url } = await fetch(
    `/api/annotations/${claimId}/dicom-url/${caseId}`
  ).then(r => r.json())

  // 2. 构建 imageId（WADOUri 格式）
  const imageId = `wadouri:${url}`

  // 3. 加载并渲染
  const image = await imageLoader.loadAndCacheImage(imageId)
  viewport.setStack([imageId])
  viewport.render()
}
```

### 12.4 标注工具配置（矩形框选）

```typescript
import {
  ToolGroupManager, Enums as ToolEnums,
  RectangleROITool, PanTool, ZoomTool, StackScrollTool,
} from '@cornerstonejs/tools'

const toolGroup = ToolGroupManager.createToolGroup('annotation-group')
toolGroup.addTool(RectangleROITool.toolName)
toolGroup.addTool(PanTool.toolName)
toolGroup.addTool(ZoomTool.toolName)
toolGroup.addTool(StackScrollTool.toolName)

// 默认激活平移
toolGroup.setToolActive(PanTool.toolName, {
  bindings: [{ mouseButton: ToolEnums.MouseBindings.Auxiliary }],
})
// 框选工具
toolGroup.setToolActive(RectangleROITool.toolName, {
  bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
})
```

---

## 13. 部署规范

### 13.1 Dockerfile

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable

# 依赖层
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 构建层
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 运行层（最小镜像）
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### 13.2 next.config.mjs（开启 standalone 输出）

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}
export default nextConfig
```

### 13.3 数据库迁移（部署前执行）

```bash
# 生成迁移文件（开发时）
pnpm drizzle-kit generate

# 执行迁移（生产部署时）
pnpm drizzle-kit migrate
```

### 13.4 Nginx 配置

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/ssl/your-domain.pem;
    ssl_certificate_key /etc/ssl/your-domain-key.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # SSE 需要关闭缓冲
    location /api/notifications/stream {
        proxy_pass         http://127.0.0.1:3000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_buffering    off;
        proxy_cache        off;
        proxy_read_timeout 3600s;  # SSE 长连接，延长超时
    }

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
        client_max_body_size 10m;  # 元数据上传限制（DICOM 走 COS 直传）
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

### 13.5 生产环境 package.json scripts

```json
{
  "scripts": {
    "dev":        "next dev",
    "build":      "next build",
    "start":      "next start",
    "db:migrate": "drizzle-kit migrate",
    "db:seed":    "tsx lib/db/seed.ts",
    "db:studio":  "drizzle-kit studio"
  }
}
```

### 13.6 GitHub Actions CI/CD（.github/workflows/deploy.yml）

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t med-platform:${{ github.sha }} .

      - name: Save and transfer image
        run: |
          docker save med-platform:${{ github.sha }} | gzip > image.tar.gz
          scp -i ${{ secrets.CVM_SSH_KEY }} image.tar.gz ubuntu@${{ secrets.CVM_HOST }}:~/

      - name: Deploy on CVM
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.CVM_HOST }}
          username: ubuntu
          key: ${{ secrets.CVM_SSH_KEY }}
          script: |
            # 加载镜像
            docker load < ~/image.tar.gz
            rm ~/image.tar.gz

            # 执行数据库迁移
            docker run --rm \
              --env-file /home/ubuntu/.env.production \
              med-platform:${{ github.sha }} \
              node -e "require('./lib/db/migrate')"

            # 滚动替换容器（zero-downtime）
            docker stop med-platform-next || true
            docker run -d \
              --name med-platform-next \
              --env-file /home/ubuntu/.env.production \
              -p 3001:3000 \
              med-platform:${{ github.sha }}

            # 健康检查通过后切换流量
            sleep 5
            curl -f http://localhost:3001/api/health || exit 1
            docker stop med-platform || true
            docker rename med-platform-next med-platform
            nginx -s reload

            # 清理旧镜像
            docker image prune -f
```
