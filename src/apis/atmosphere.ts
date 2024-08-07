import orcaRequest from './'
import { CommonRes } from './interface'

/* 剧本 */
// 获取剧本列表
export interface IScriptModel {
  id: number
  robotCode: string
  robotNickname: string
  robotHeadIco: string
  messageType: number
  content: string
}

export const queryScriptList = (): Promise<CommonRes<IScriptModel[]>> =>
  orcaRequest.get('/v2/field/script')

// 添加直播间脚本
export const addScript = (data: { roomId?: number; robotIds: number[] }) =>
  orcaRequest.post('/v2/field/script', data)

// 保存剧本
export const saveScript = (data: { id: number; messageType: number; content: string }) =>
  orcaRequest.post('/v2/field/script/save', data)

// 保存直播间剧本并发送
export const saveScriptToSend = (data: { id: number; messageType: number; content: string }) =>
  orcaRequest.post('/v2/field/script/to-send', data)

// 删除
export const removeScript = (id: number) =>
  orcaRequest.delete(`/v2/field/script/${id}`)

// 批量发送
export const batchScriptSend = (data: { ids: number[] }) =>
  orcaRequest.post('/v2/field/script/to-send/batch', data)

// 批量删除
export const batchScriptRemove = (data: { ids: number[] }) =>
  orcaRequest.post('/v2/field/script/remove/batch', data)

// 获取氛围配置
export interface IAtmosphere{
  id: number
  roomId: number
  textContentList: string[]
  giftIdList: number[]
  quantity: number
  textInterval?: number
  giftInterval?: number
  execStatus: number
  expEndTime: string
}

export interface ISendAtmosphere {
  "roomId": number,
  "textContentList": string[],
  "giftIdList": number[],
  "quantity": number,
  "textInterval": number,
  "giftInterval": number
}


export const queryAtmosphere = (roomId: number): Promise<CommonRes<IAtmosphere>> =>
  orcaRequest.get(`/v2/field/atmosphere/${roomId}`)

export const sendAtmosphere = (data: ISendAtmosphere) =>
  orcaRequest.post('/v2/field/atmosphere/send', data)

export const stopSendAtmosphere = (id: number) =>
  orcaRequest.post(`/v2/field/atmosphere/stop/${id}`)
