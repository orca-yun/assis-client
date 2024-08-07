import orcaRequest from './'
import { CommonRes } from './interface'

interface IChannelItem {
  id: number
  channelId: number
  channelName: string
}

export const queryChannels = (): Promise<CommonRes<IChannelItem[]>> =>
  orcaRequest.get('/v2/channel/{roomId}')
