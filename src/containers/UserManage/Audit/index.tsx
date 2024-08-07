import React, { useEffect, useRef, useState } from 'react'
import i18n from 'i18next'
import { Modal } from 'antd'

import useRequest from '@/hooks/useRequest'
import { IMsg, ExamineStatus, auditMsg } from '@/apis/audit'
import { useSetToBL } from '@/hooks/asyncHooks/useBL'
import { useSetToMute } from '@/hooks/asyncHooks/useBanChat'

import AuditMsgItem from './AuditMsgItem'
import './index.less'

interface IAudit {
  onRefresh: () => Promise<any>
  data: IMsg[]
}

const Audit: React.FC<IAudit> = (props) => {
  const { data, onRefresh } = props
  const [msgPool, setMsgPool] = useState<IMsg[]>([])
  const listRef = useRef<any>()
  const isAtBottom = useRef(true)
  const messagesEndRef = useRef<any>()

  const [{ runAsync: auditAction }] = useRequest(auditMsg, {
    manual: true,
  }, {
    loadingMsg: i18n.t('正在操作'),
    loadingSuccessMsg: i18n.t('操作成功'),
    onSuccess: () => {
      onRefresh()
    },
  })

  const [{ runAsync: setToBL }] = useSetToBL({
    onSuccess: () => {
      onRefresh()
    },
  })

  const [{ runAsync: setToMute }] = useSetToMute({
    onSuccess: () => {
      onRefresh()
    },
  })

  const scrollToBottom = () => {
    if (listRef.current) {
      setTimeout(() => {
        listRef.current.scrollTop = listRef.current.scrollHeight
      }, 50)
    }
  }

  useEffect(() => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.target === messagesEndRef.current) {
          isAtBottom.current = entry.isIntersecting
        }
      })
    }, {
      threshold: 0.2,
      root: listRef.current,
    })
    if (messagesEndRef.current) io.observe(messagesEndRef.current)

    return () => {
      if (messagesEndRef.current) io.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!data) return
    // 没有最新的待审核消息 清空待审核消息池
    setMsgPool(data)
    // TODO: 鼠标hover到某个操作项上 不自动滚动
    if (data.length && isAtBottom.current) scrollToBottom()
  }, [data])

  const handleAudit = (auditStatus: ExamineStatus, item: IMsg) => {
    if (!item.id) return
    auditAction({ id: item.id, examineStatus: auditStatus })
  }

  const handleSetBL = (item: IMsg) => {
    Modal.confirm({
      title: '确定要拉黑此人吗?',
      content: `禁言拉黑对象：${item.nickname}`,
      onOk: () => {
        setToBL({
          uid: item.uid,
          nickname: item.nickname,
        })
      },
    })
  }

  const handleSetMute = (item: IMsg) => {
    Modal.confirm({
      title: '确定要禁言此人吗?',
      content: `禁言对象：${item.nickname}`,
      onOk: () => {
        setToMute({
          uid: item.uid,
          nickname: item.nickname,
        })
      },
    })
  }

  return (
    <div className="un-audit-msg-list">
      <div className="list-wrapper" ref={listRef}>
        {
          msgPool.map((item) => (
            <AuditMsgItem
              key={item.msgUid}
              data={item}
              onApprove={(item) => { handleAudit(ExamineStatus.APPROVE, item) }}
              onReject={(item) => { handleAudit(ExamineStatus.DIS_APPROVE, item) }}
              onBanChat={handleSetMute}
              onSetBL={handleSetBL}
            />
          ))
        }
        <div ref={messagesEndRef} style={{ height: '1px', opacity: 0 }} />
      </div>
    </div>
  )
}

export default Audit
