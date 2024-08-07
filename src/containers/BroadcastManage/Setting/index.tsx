import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Switch, Modal, Spin, Radio, message } from 'antd'

import { settingStore } from '@/stores'
import { POLLING_INTERVALS } from '@/stores/settingStore'
import { IMuteOperateEnum } from '@/apis/human'
import { loadingEffectGetter } from '@/stores'

import './index.less'

const { Group: RadioGroup } = Radio

interface IField {
  title: React.ReactNode
  children: React.ReactNode
}

const Field: React.FC<IField> = ({ title, children }) => {
  return (
    <div className="field-wrapper">
      <div className="field-wrapper__title">{title}</div>
      <div className="field-wrapper__content">{children}</div>
    </div>
  )
}

const Setting = () => {
  const {
    unAuditMsgRefreshTime,
    setUnAuditMsgRefreshTime,
    onlineAudienceRefreshTime,
    setOnlineAudienceRefreshTime,
  } = settingStore
  const [muteAll, setMuteAll] = useState(false)
  const queryMuteLoading = loadingEffectGetter('SettingStore/queryAllMuteStatus')
  useEffect(() => {
    settingStore.queryAllMuteStatus()
  }, [])

  useEffect(() => {
    setMuteAll(settingStore.allMuteStatus === IMuteOperateEnum.ON)
  }, [settingStore.allMuteStatus])

  const changeAllMuteStatus = (flag: boolean) => {
    Modal.confirm({
      title: flag ? '确定要全员禁言?' : '确定要解除全员禁言?',
      onOk: () => {
        settingStore.setAllMuteStatus(flag ? IMuteOperateEnum.ON : IMuteOperateEnum.OFF)
      },
    })
  }

  return (
    <div className="room-settings">
      <Spin spinning={queryMuteLoading}>
        <Field
          title="全员禁言状态"
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Switch checked={muteAll} onChange={changeAllMuteStatus} />
            <span style={{ marginLeft: 12 }}>{muteAll ? '开' : '关'}</span>
          </div>
        </Field>
        <Field
          title="待审核消息刷新间隔"
        >
          <RadioGroup
            value={unAuditMsgRefreshTime}
            onChange={(e) => {
              setUnAuditMsgRefreshTime(e.target.value)
              message.success('设置成功')
            }}
          >
            {
              POLLING_INTERVALS.map(({ value, label }) => (
                <Radio key={value} value={value}>{label}</Radio>
              ))
            }
          </RadioGroup>
        </Field>
        <Field
          title="在线用户刷新间隔"
        >
          <RadioGroup
            value={onlineAudienceRefreshTime}
            onChange={(e) => {
              setOnlineAudienceRefreshTime(e.target.value)
              message.success('设置成功')
            }}
          >
            {
              POLLING_INTERVALS.map(({ value, label }) => (
                <Radio key={value} value={value}>{label}</Radio>
              ))
            }
          </RadioGroup>
        </Field>
      </Spin>
    </div>
  )
}

export default observer(Setting)
