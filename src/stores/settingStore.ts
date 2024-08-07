import { makeObservable, observable, action } from 'mobx'

import { asyncFetch } from '@/utils/asyncFetch'
import { IMuteOperateEnum, muteAllAudience, queryAllMuteStatus } from '@/apis/human'
import { OperationOptions } from '@/constant/locale'

import { createLoadingEffect } from './loading'

export const POLLING_INTERVALS = [
  {
    value: 1000,
    label: '1秒',
  },
  {
    value: 3000,
    label: '3秒',
  },
  {
    value: 5000,
    label: '5秒',
  },
  {
    value: 10000,
    label: '10秒',
  },
]

class SettingStore {
  constructor() {
    makeObservable(this)
    return createLoadingEffect(this, 'SettingStore')
  }

  // 全体禁言状态
  @observable allMuteStatus: IMuteOperateEnum = IMuteOperateEnum.OFF

  @action
  async queryAllMuteStatus() {
    await asyncFetch(queryAllMuteStatus, {
      onSuccess: ({ data }) => {
        this.allMuteStatus = data
      },
    })
  }

  @action
  async setAllMuteStatus(status: IMuteOperateEnum) {
    await asyncFetch(muteAllAudience.bind(null, status), {
      ...OperationOptions,
      onSuccess: () => {
        this.queryAllMuteStatus()
      },
    })
  }

  @observable unAuditMsgRefreshTime: number = POLLING_INTERVALS[1].value
  @observable onlineAudienceRefreshTime: number = POLLING_INTERVALS[1].value

  @action
  setUnAuditMsgRefreshTime(value: number) {
    this.unAuditMsgRefreshTime = value
  }

  @action
  setOnlineAudienceRefreshTime(value: number) {
    this.onlineAudienceRefreshTime = value
  }
}

export default new SettingStore()
