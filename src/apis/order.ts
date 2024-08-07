/* 订单管理 */

import orcaRequest from './'
import { CommonRes } from './interface'

export enum IGoodsTypeEnum {
   VIRTAUL = 1,
   REAL
}

export const GoodsTypeSetText = {
  [IGoodsTypeEnum.VIRTAUL]: '虚拟商品',
  [IGoodsTypeEnum.REAL]: '实物商品',
}


export enum IOrderStatusEnum {
    INIT = 1,
    PAYED,
    CANCEL,
    TIMEOUT
}

export const OrderStatusSetText = {
  [IOrderStatusEnum.INIT]: '待支付',
  [IOrderStatusEnum.PAYED]: '已支付',
  [IOrderStatusEnum.CANCEL]: '已取消',
  [IOrderStatusEnum.TIMEOUT]: '超时未支付',
}


export interface IOrder {
  id: number
  transactionId: string
  roomId: number
  channelId: number
  goodsId: number
  userId: number
  userName: string
  orderTime: string
  timeoutTime: string
  tradeTime: string
  refundTime: string
  type: IGoodsTypeEnum
  originalPrice: number
  coupon: string
  price: number
  realAmt: number
  commissionRatio: number
  paymentFee: number
  subCommission: number
  actualAccountingAmount: number
  orderStatus: IOrderStatusEnum
  recipientName: string
  recipientPhone: string
  recipientAddress: string

  channelName:string
  roomName: string
  goodsName: string
  goodsImage: string
}


interface IQueryOrderParams {
  page: number
  pageSize: number
  sort?: string
  roomId?: number
  channelIds: number[],
  orderDate: string
}

/**
 * 获取房间订单列表
 * */
export const queryRoomOrderList =  (params: IQueryOrderParams): Promise<CommonRes<IOrder[]>> =>
  orcaRequest.get('/v2/order',{
    params
  })
