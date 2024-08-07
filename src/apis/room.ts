import orcaRequest from './'
import { CommonRes } from './interface'
import { LiveStatusEnum } from './enums'

export interface IRoomInfo {
  id: number
  orgId: number
  name: string
  sharePwd: string
  livingTime: string
  livingStatus: LiveStatusEnum
  cover: string
  remark: string
  livingType: number
  videoQuality: number
}

// 获取房间信息
export const queryRoomInfo = (): Promise<CommonRes<IRoomInfo>> =>
  orcaRequest.get('/v2/room/meta')

export enum IStreamTypeEnum {
  RTMP = 'rtmp',
  FLV = 'flv',
  M3U8 = 'm3u8',
  WEBRTC = 'webrtc',
}

export type IStream = Record<IStreamTypeEnum, string>

// 拉流地址
export const queryBroadcastStream = (): Promise<CommonRes<IStream>> =>
  orcaRequest.get('/v2/stream/pull/{roomId}')
