import orcaRequest from './'
import { CommonRes } from './interface'

export interface IStatRecord {
  id: number
  statTime: string
  orgId: number
  roomId: number
  roomRecordId: number
  viewPageNum: number
  onlineNum: number
  offlineNum: number
  senderNum: number
  orderNum: number
  giftNum: number
  msgNum: number
  payedOrderNum: number
  waitOrderNum: number
  cancelOrderNum: number
}

export interface IBroadcastData {
  pv: number
  uv: number
  onlineNum: number
  records: IStatRecord[]
}

export const queryBroadcastData = (): Promise<CommonRes<IBroadcastData>> =>
  orcaRequest.get('/v2/data/live/{roomId}')

export interface IFinanceData {
  totalOrderAmount: number
  payedOrderAmount: number
  unPayedOrderAmount: number
  waitOrderAmount: number
}

export const queryFinanceData = (): Promise<CommonRes<IFinanceData>> =>
  orcaRequest.get('/v2/data/finance/{roomId}')
