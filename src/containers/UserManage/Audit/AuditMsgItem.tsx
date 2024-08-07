import React, { useRef, useEffect, useState } from 'react'
import { Space } from 'antd'

import { IMsg } from '@/apis/audit'
import OChatItem from '@/components/ChatItem'
import { wxEmotion } from '@/components/EmotionSelector'

import './index.less'

export interface IAuditMsgItem {
  data: IMsg
  onApprove: (item: IMsg) => void,
  onReject: (item: IMsg) => void
  onBanChat: (item: IMsg) => void
  onSetBL: (item: IMsg) => void
}

const AuditMsgItem: React.FC<IAuditMsgItem> = (props) => {
  const { data, onApprove, onReject, onBanChat, onSetBL } = props
  const itemRef = useRef<any>()
  const [height, setHeight] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (!itemRef.current) return
    setHeight(itemRef.current.getBoundingClientRect().height)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === itemRef.current) setShow(entry.isIntersecting)
      })
    }, {
      threshold: 0.2,
      root: itemRef.current.parentNode,
    })

    io.observe(itemRef.current)

    return () => {
      io.disconnect()
    }
  }, [])

  const chatItemData = {

  }

  return (
    <div className="chat-item" ref={itemRef} style={{ height: show ? 'auto' : height }}>
      {
        show && (
          <OChatItem
            data={data}
            actions={
              <Space>
                <a onClick={() => { onApprove(data) }}>通过</a>
                <a onClick={() => { onReject(data) }}>驳回</a>
                <a onClick={() => { onSetBL(data) }}>拉黑</a>
                <a onClick={() => { onBanChat(data) }}>禁言</a>
              </Space>
            }
          >
            <div
              dangerouslySetInnerHTML={{ '__html': wxEmotion.parse(data.data) }}
              className="chat-item__msg"
            />
          </OChatItem>
        )
      }
    </div>
  )
}

export default AuditMsgItem
