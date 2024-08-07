import React from 'react'
import { Modal } from 'antd'
import i18n from 'i18next'

import DataToggleModule from '@/components/DataToggleModule'
import useRequest from '@/hooks/useRequest'
import { IAudience, queryBLList } from '@/apis/human'
import { useRecoveryFromBL } from '@/hooks/asyncHooks/useBL'

import UserItem from '../../OnlineAudience/UserItem'

const BlackList = () => {
  const [{ data: res, runAsync, loading }] = useRequest(queryBLList, {}, {})
  const { data = [] } = res || {}

  const [{ runAsync: action }] = useRecoveryFromBL({
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
    <div className="black-list">
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
              actions={<a onClick={() => { handleSet(item) }}>解除黑名单</a>}
            />
          ))
        }
      </DataToggleModule>
    </div>
  )
}

export default BlackList
