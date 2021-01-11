import dayjs from 'dayjs'

export interface DateOptions {
  issue: string,
  threshold: number
}

export const checkDate = (opts: DateOptions): boolean => {
  const now = dayjs()
  const threshold = now.subtract(opts.threshold, 'month')

  return dayjs(opts.issue).isBefore(threshold)
}