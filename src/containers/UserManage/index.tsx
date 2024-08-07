import React, { useState, useEffect } from 'react'
import {Tabs} from 'antd'
import { observer } from 'mobx-react-lite'

import { authStore } from '@/stores'
import { settingStore } from '@/stores'
import useRequest from '@/hooks/useRequest'
import { queryUnAuditMsg } from '@/apis/audit'
import { queryAudienceList } from '@/apis/human'
import { queryAssistantOnline } from '@/apis/assis'

import Audit from './Audit'
import OnlineAudience from './OnlineAudience'
import Forbidden from './Forbidden'

import './index.less'

const UserManage = () => {
  const [curTab, setCurTab] = useState('0')
  const { unAuditMsgRefreshTime, onlineAudienceRefreshTime } = settingStore
  const [{ runAsync: queryUnAuditMsgList, data: auditMsgListRes }] = useRequest(queryUnAuditMsg, {
    pollingInterval: unAuditMsgRefreshTime,
    pollingErrorRetryCount: 3,
    manual: true,
  }, {})

  const [{ runAsync: queryOnlineAudienceList, data: queryOnlineAudienceListRes }] = useRequest(queryAudienceList, {
    pollingInterval: onlineAudienceRefreshTime,
    pollingErrorRetryCount: 3,
    manual: true,
  }, {})

  const [{ runAsync: queryAssistantOnlineList, data: queryAssistantOnlineRes }] = useRequest(queryAssistantOnline, {
    pollingInterval: 5000,
    pollingErrorRetryCount: 3,
    manual: true,
  }, {})

  useEffect(() => {
    if (!authStore.roomId) return
    queryOnlineAudienceList()
    queryUnAuditMsgList()
    queryAssistantOnlineList()
  }, [authStore.roomId])

  const { total, data } = queryOnlineAudienceListRes || ({ total: 0, data: [] } as any)
  const { data: unAuditMsgList = [] } = auditMsgListRes || ({} as any)
  const { data: onlineAssistant = [] } = queryAssistantOnlineRes || ({} as any)

  const TabOptions = [
    {
      key: '0',
      label: `审核(${unAuditMsgList.length})`,
    },
    {
      key: '1',
      label: `在线用户(${total + onlineAssistant.length})`,
    },
    {
      key: '2',
      label: '封禁用户',
    },
  ]
  return (
    <div className="user-manage-panel">
      {
        authStore.roomId > 0 && (
          <>
            <Tabs
              activeKey={curTab}
              onChange={setCurTab}
              items={TabOptions}
            />
            <div className="user-manage-panel__content">
              {
                [
                  <Audit
                    key="audit"
                    data={unAuditMsgList}
                    onRefresh={queryUnAuditMsgList}
                  />,
                  <OnlineAudience
                    key="online-user"
                    data={data}
                    assistants={onlineAssistant}
                  />,
                  <Forbidden key="forbidden" />,
                ][Number(curTab)]
              }
            </div>
          </>
        )
      }
    </div>
  )
}

export default observer(UserManage)
