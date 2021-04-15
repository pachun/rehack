interface HackerNewsItem {
  id: number | string

  deleted?: boolean
  type?: "job" | "story" | "comment" | "poll" | "pollopt"
  by?: string
  time?: number
  text?: string
  dead?: boolean
  parent?: HackerNewsItem
  poll?: HackerNewsItem
  kids?: HackerNewsItem[]
  url?: string
  score?: number
  title?: string
  parts?: HackerNewsItem[]
  descendants?: number
}
