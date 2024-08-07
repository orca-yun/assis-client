import React from 'react'
import { Modal } from 'antd'
import i18n from 'i18next'

import DataToggleModule from '@/components/DataToggleModule'
import useRequest from '@/hooks/useRequest'
import { IAudience, queryMuteList } from '@/apis/human'
import { useRecoveryFromMute } from '@/hooks/asyncHooks/useBanChat'

import UserItem from '../../OnlineAudience/UserItem'

const MuteList = () => {
  const [{ data: res, runAsync, loading }] = useRequest(queryMuteList, {}, {})
  const { data = [] } = res || {}

  const [{ runAsync: action }] = useRecoveryFromMute({
    onSuccess: () => {
      runAsync()
    },
  })

  const handleSet = (item: IAudience) => {
    Modal.confirm({
      title: i18n.t('确定该操作?'),
      content: `${i18n.t('操作对象')}：${item.nickname || item.uid}`,
      onOk: () => {
        action(item)
      },
    })
  }

  return (
    <div className="mute-list">
      <DataToggleModule
        loading={loading}
        empty={!data.length}
        emptyWrapperHeight={300}
        emptyHintProps={{
          emptyIconFontSize: 100,
          desc: '暂无数据',
        }}
      >
        {
          data.map((item) => (
            <UserItem
              data={item}
              key={item.uid}
              actions={<a onClick={() => { handleSet(item) }}>解除禁言</a>}
            />
          ))
        }
      </DataToggleModule>
    </div>
  )
}

export default MuteList
