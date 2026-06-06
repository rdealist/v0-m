import * as React from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

// 多语言文案
const paginationTexts = {
  "zh-CN": { previous: "上一页", next: "下一页", more: "更多页面" },
  "zh-TW": { previous: "上一頁", next: "下一頁", more: "更多頁面" },
  "en": { previous: "Previous", next: "Next", more: "More pages" },
  "ja": { previous: "前へ", next: "次へ", more: "その他" },
}

type Locale = keyof typeof paginationTexts

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>

function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className,
      )}
      {...props}
    />
  )
}

type PaginationPreviousProps = React.ComponentProps<typeof PaginationLink> & {
  locale?: Locale
}

function PaginationPrevious({
  className,
  locale = "zh-CN",
  ...props
}: PaginationPreviousProps) {
  const text = paginationTexts[locale]
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">{text.previous}</span>
    </PaginationLink>
  )
}

type PaginationNextProps = React.ComponentProps<typeof PaginationLink> & {
  locale?: Locale
}

function PaginationNext({
  className,
  locale = "zh-CN",
  ...props
}: PaginationNextProps) {
  const text = paginationTexts[locale]
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">{text.next}</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

type PaginationEllipsisProps = React.ComponentProps<'span'> & {
  locale?: Locale
}

function PaginationEllipsis({
  className,
  locale = "zh-CN",
  ...props
}: PaginationEllipsisProps) {
  const text = paginationTexts[locale]
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">{text.more}</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
