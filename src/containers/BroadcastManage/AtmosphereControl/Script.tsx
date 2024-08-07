import React, { useState, useEffect, useRef } from 'react'
import { Alert, Button, Space, Table, Input, Modal, message, Tooltip } from 'antd'
import { GiftOutlined } from '@ant-design/icons'
import { useDebounceFn } from 'ahooks'

import useOrcaRequest from '@/hooks/useRequest'
import {
  queryScriptList,
  IScriptModel,
  saveScriptToSend,
  removeScript,
  batchScriptSend,
  batchScriptRemove,
  saveScript,
} from '@/apis/atmosphere'
import Avatar from '@/components/Avatar'
import EmotionSelector from '@/components/EmotionSelector'
import { queryRoomGiftList } from '@/apis/marketing'
import { orcaModal } from '@/Antd'
import { MODAL_ID_MAP, ORCA_MODAL_ID } from '@/Antd/modal'

import { callAddRobotModal } from './AddRobotModal'

import './Script.less'

const GiftMsgPrefix = '礼物id:'

const Script = () => {
  const [msgMap, setMsgMap] = useState<Record<string, string>>({})
  const [selectList, setSelectList] = useState<any[]>([])
  const inputsRef = useRef<any>({})

  const [{ data: response, loading, runAsync: query }] = useOrcaRequest(queryScriptList, {}, {
    onSuccess: () => {
      setSelectList([])
    },
  })
  // 礼物列表
  const [{ data: giftRes }] = useOrcaRequest(queryRoomGiftList, {}, {})
  const [{ runAsync: removeAction, loading: isRemoving }] = useOrcaRequest(removeScript, {
    manual: true,
  }, {
    loadingMsg: '删除',
    loadingSuccessMsg: '删除成功~',
    onSuccess: () => {
      query()
    },
  })
  const [{ runAsync: sendAction, loading: isSending }] = useOrcaRequest(saveScriptToSend, { manual: true }, {
    loadingMsg: '发送',
    loadingSuccessMsg: '发送成功~',
    onSuccess: () => {
      query()
    },
  })
  const [{ runAsync: batchSendAction, loading: isBatchSending }] = useOrcaRequest(batchScriptSend, { manual: true }, {
    loadingMsg: '发送',
    loadingSuccessMsg: '发送成功~',
    onSuccess: () => {
      query()
    },
  })
  const [{ runAsync: batchRemoveAction, loading: isBatchRemoving }] = useOrcaRequest(batchScriptRemove, { manual: true }, {
    loadingMsg: '删除',
    loadingSuccessMsg: '删除成功~',
    onSuccess: () => {
      query()
    },
  })
  const [{ runAsync: saveAction }] = useOrcaRequest(saveScript, { manual: true }, {
    loadingMsg: '正在保存...',
    loadingSuccessMsg: '保存成功~',
    onSuccess: () => {
      query()
    },
  })

  const { run: debouncedSave } = useDebounceFn((payload) => {
    saveAction(payload)
  }, {
    wait: 300,
  })

  const data = response?.data || []
  const gifts = giftRes?.data || []

  useEffect(() => {
    setMsgMap(data.reduce((a, b) => ({
      ...a,
      [b.id]: b.messageType === 2 ? `${GiftMsgPrefix}${b.content}` : (b.content || ''),
    }), {}))
  }, [data])

  const renderGifts = (record: IScriptModel) => {
    return (
      <ul className="robot-send-gift__tooltip-inner">
        {
          gifts.map((gift) => (
            <li
              key={gift.id}
              onClick={() => {
                setMsgMap((v) => ({
                  ...v,
                  [record.id]: `${GiftMsgPrefix}${gift.id}`,
                }))
                debouncedSave({
                  id: record.id,
                  messageType: 2,
                  content: gift.id,
                })
              }}>
              <img src={gift.img} alt="" />
            </li>
          ))
        }
      </ul>
    )
  }

  const columns = [
    {
      title: '序号',
      width: 60,
      render: (_: any, record: any, index: number) => index + 1,
    },
    {
      title: '昵称',
      width: 100,
      dataIndex: 'robotNickname',
    },
    {
      title: '头像',
      dataIndex: 'robotHeadIco',
      render: (val: string) => <Avatar url={val} />,
    },
    {
      title: '发送内容',
      // width: 200,
      render: (_: any, record: IScriptModel) => (
        <div className="send-content">
          <Input
            value={msgMap[record.id]}
            ref={(el) => { inputsRef.current[record.id] = el }}
            onChange={(e) => {
              const value = e.target.value
              setMsgMap((v) => ({
                ...v,
                [record.id]: value,
              }))
              const messageType = value.startsWith(GiftMsgPrefix) ? 2 : 1
              debouncedSave({
                id: record.id,
                messageType,
                content: messageType === 1 ? value : value.replace(GiftMsgPrefix, ''),
              })
            }}
            maxLength={200}
            placeholder="请输入发送内容"
          />
          <EmotionSelector
            onSelect={(str) => {
              const value = `${msgMap[record.id]}${str}`
              setMsgMap((v) => ({
                ...v,
                [record.id]: value,
              }))
              inputsRef.current[record.id].focus()
              debouncedSave({
                id: record.id,
                messageType: 1,
                content: value,
              })
            }}
          >
            <i className="emoji-icon orca-bg-contain" />
          </EmotionSelector>
          {
            gifts.length && (
              <Tooltip
                className="robot-send-gift__tooltip"
                color="#FFF"
                placement="top"
                title={renderGifts(record)}
              >
                <GiftOutlined style={{ fontSize: 20 }} />
              </Tooltip>
            )
          }
        </div>
      ),
    },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      render: (_: any, record: IScriptModel) => (
        <Space>
          <a onClick={() => {
            if (!msgMap[record.id] || !msgMap[record.id].trim()) {
              message.warning('请输入内容')
              return
            }
            const text = msgMap[record.id]
            const messageType = text.startsWith(GiftMsgPrefix) ? 2 : 1
            sendAction({
              id: record.id,
              messageType,
              content: messageType === 1 ? text : text.replace(GiftMsgPrefix, ''),
            })
          }}>发送</a>
          <a
            onClick={() => {
              orcaModal.confirm({
                [ORCA_MODAL_ID]: MODAL_ID_MAP.RemoveDoubleCheck,
                title: '确定要删除?',
                onOk: () => {
                  removeAction(record.id)
                },
              })
            }}
          >删除</a>
        </Space>
      ),
    },
  ]

  const handleAdd = async() => {
    const res = await callAddRobotModal({
      // 暂时用不到
      selected: data.map((item) => item.robotCode),
    })
    if (!res) return
    query()
  }

  const handleBatchSend = () => {
    batchSendAction({
      ids: selectList,
    })
  }

  const handleBatchRemove = () => {
    batchRemoveAction({
      ids: selectList,
    })
  }

  return (
    <div className="script-container">
      <Alert
        style={{ marginBottom: 6, marginTop: 6 }}
        message={(
          <div style={{ fontSize: 12 }}>该模式以指定的数字人身份发送互动消息，模拟对话</div>
        )}
        type="info"
        showIcon
        action={(
          <Space>
            <Button disabled={!selectList.length} size="small" onClick={handleBatchSend}>
              批量发送
            </Button>
            <Button disabled={!selectList.length} size="small" onClick={handleBatchRemove}>
              批量删除
            </Button>
            <Button disabled={loading} size="small" onClick={handleAdd}>
              添加数字人
            </Button>
          </Space>
        )}
      />
      <Table
        rowKey={(record: IScriptModel) => record.id}
        loading={loading || isRemoving || isBatchRemoving || isSending || isBatchSending}
        columns={columns as any[]}
        dataSource={data}
        pagination={false}
        scroll={{
          // x: 200,
        }}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectList,
          onChange: (selectedRows) => {
            setSelectList(selectedRows)
          },
        }}
      />
    </div>
  )
}

export default Script
