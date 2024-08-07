import orcaRequest from './'
import { CommonRes } from './interface'


export interface IUser {
  viewDate: string
  roomId: number
  channelId: number
  channelName: string
  uid: string
  nickname: string
  headIco: string
  viewDuration: number
  giftNum: number
  msgNum: number
  userAgent: string
  tsOnline: number
  tsOffline: number
  onlineTime: string
  offlineTime: string
  status: number
  onlineTimes: number
}

interface IQueryUserParams {
  page: number
  pageSize: number
  sort?: string
  roomId?: number
  channelIds: number[]
}

export const queryUserData = (params: IQueryUserParams): Promise<CommonRes<IUser[]>> =>
  orcaRequest.get('/v2/user/records/{roomId}', {
    params,
  })
