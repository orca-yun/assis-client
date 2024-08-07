import dayjs, { UnitType } from 'dayjs'

export const FULL_FORMAT = 'YYYY-MM-DD HH:mm:ss'

type DateLike = Date | string

export const formatTime = (date: DateLike, format: string = FULL_FORMAT) => dayjs(date).format(format)

export const getTimeDiff = (date: DateLike, unit: UnitType = "seconds") => {
  return dayjs(date).diff(dayjs(), unit)
}
