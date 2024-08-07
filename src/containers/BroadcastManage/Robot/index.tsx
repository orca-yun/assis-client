import React, { useState, useEffect, useCallback } from 'react'
import { Input, message, Tooltip, Space } from 'antd'
import { useLocalStorageState } from 'ahooks'
import _ from 'lodash'

import useRequest from '@/hooks/useRequest'
import { IRobot, queryRobots, sendMsg } from '@/apis/robot'
import { IGift, queryRoomGiftList, sendGiftFromRobot } from '@/apis/marketing'
import DataToggleModule from '@/components/DataToggleModule'
import { OperationOptions } from '@/constant/locale'
import { ROBOT_MSG_HISTORY } from '@/constant/key'
import { setStorageWithKey } from '@/utils/storage'

import './index.less'

const Robot: React.FC<{ roomId: number | string }> = ({ roomId }) => {
  const [storedMsg] = useLocalStorageState<any>(ROBOT_MSG_HISTORY, { defaultValue: {} })
  const [inputMap, setInputMap] = useState<Record<number, string>>(storedMsg[roomId] || {})
  const [{ data: giftRes }] = useRequest(queryRoomGiftList, {}, {})
  const [{ data: res, loading, runAsync }] = useRequest(queryRobots, {}, {})
  const [{ runAsync: sendMsgAction }] = useRequest(sendMsg, { manual: true }, OperationOptions)
  const [{ runAsync: sendGiftAction }] = useRequest(sendGiftFromRobot, {
    manual: true,
    debounceWait: 300,
  }, OperationOptions)

  const data = res?.data || []
  const gifts = giftRes?.data || []

  useEffect(() => {
    if (!data || !data.length) return
    setInputMap((v) => {
      return data.reduce((a, b) => ({
        ...a,
        [b.id]: v[b.id] || '',
      }), {})
    })
  }, [data])

  const saveToLocalStorage = useCallback(_.debounce((val) => {
    setStorageWithKey(ROBOT_MSG_HISTORY, { [roomId]: val })
  }, 1000), [])

  const handleChange = (val: string, item: IRobot) => {
    setInputMap((v) => ({
      ...v,
      [item.id]: val,
    }))
    saveToLocalStorage({
      ...inputMap,
      [item.id]: val,
    })
  }

  const handleSend = (item: IRobot) => {
    const inputVal = inputMap[item.id]
    if (!inputVal) {
      message.info('发送内容不能为空')
      return
    }
    sendMsgAction({
      robotId: item.id,
      data: inputVal,
    })
  }

  const sendGift = (item: IRobot, gift: IGift) => {
    sendGiftAction({
      id: gift.id,
      robotId: item.id,
    })
  }

  const renderGifts = (item: IRobot) => {
    return (
      <ul className="robot-send-gift__tooltip-inner">
        {
          gifts.map((gift) => (
            <li key={gift.id} onClick={() => { sendGift(item, gift) }}>
              <img src={gift.img} alt="" />
            </li>
          ))
        }
      </ul>
    )
  }

  return (
    <div className="robot-panel">
      <DataToggleModule
        loading={loading}
        empty={!data.length}
        // emptyWrapperHeight={300}
        emptyHintProps={{
          emptyIconFontSize: 100,
          desc: (
            <div>
              暂无机器人，<a onClick={() => { runAsync() }}>刷新</a>试试吧
            </div>
          ),
        }}
      >
        <ul>
          {
            data.map((item) => (
              <li className="robot-item" key={item.id}>
                <div className="orca-flex-center-layout robot-desc">
                  <i className="product-thumb" style={{ backgroundImage: `url(${item.headIco})` }} />
                  <div className="orca-ellipsis-1">{item.nickname}</div>
                </div>
                <div className="orca-flex-center-layout actions">
                  <Input placeholder="请输入内容" value={inputMap[item.id]} onChange={(e) => { handleChange(e.target.value, item) }} />
                  <Space style={{ flex: '0 0 auto', marginLeft: 8 }} size={8}>
                    <a onClick={() => { handleSend(item) }}>发送</a>
                    {
                      gifts.length && (
                        <Tooltip
                          className="robot-send-gift__tooltip"
                          color="#FFF"
                          placement="bottomRight"
                          title={renderGifts(item)}
                        >
                          <a>发送礼物</a>
                        </Tooltip>
                      )
                    }
                  </Space>
                </div>
              </li>
            ))
          }
        </ul>
      </DataToggleModule>
    </div>
  )
}

export default Robot
