import React from 'react'
import { Row, Col, Space, Modal } from 'antd'

import useRequest from '@/hooks/useRequest'
import {
  IGift,
  IGiftStatusEnum,
  GiftStatusText,
  GiftStatusSetText,
  queryRoomGiftList,
  setGiftStatus,
  sortGift,
} from '@/apis/marketing'
import DataToggleModule from '@/components/DataToggleModule'
import { toZhNumber } from '@/utils/number'
import { OperationOptions } from '@/constant/locale'

import './index.less'

const ColSpanMap = {
  Name: 6,
  Img: 4,
  Price: 4,
  Status: 3,
  Action: 7,
}

const Gift = () => {
  const [{ data: res, loading, runAsync }] = useRequest(queryRoomGiftList, {}, {})
  const [{ runAsync: setStatusAction }] = useRequest(setGiftStatus, { manual: true }, {
    ...OperationOptions,
    onSuccess: () => {
      runAsync()
    },
  })
  const [{ loading: isSorting, runAsync: sortAction }] = useRequest(sortGift, { manual: true }, {
    ...OperationOptions,
    onSuccess: () => {
      runAsync()
    },
  })
  const data = res?.data || []

  const handleSetCommodityStatus = (status: IGiftStatusEnum, item: IGift) => {
    Modal.confirm({
      title: `确定要进行「${GiftStatusSetText[status]}」操作`,
      content: `${item.name}`,
      onOk: () => {
        setStatusAction({
          id: item.id,
          status,
        })
      },
    })
  }

  const handleSort = (item: IGift, index: number) => {
    const curIndex = data.findIndex((record) => record.id === item.id)
    const nextList = data.slice()
    nextList[curIndex] = data[curIndex + index]
    nextList[curIndex + index] = item
    sortAction({
      itemIds: nextList.map(({ id }) => id),
    })
  }

  return (
    <div className="gift-panel">
      <DataToggleModule
        empty={!data.length}
        loading={loading || isSorting}
        // emptyWrapperHeight={300}
        emptyHintProps={{
          emptyIconFontSize: 100,
          desc: (
            <div>
              暂无礼物，<a onClick={() => { runAsync() }}>刷新</a>试试吧
            </div>
          ),
        }}
      >
        <ul>
          <Row className="gift-table__header">
            <Col span={ColSpanMap.Name}>礼物名</Col>
            <Col span={ColSpanMap.Img}>礼物图</Col>
            <Col span={ColSpanMap.Price}>价格</Col>
            <Col span={ColSpanMap.Status}>状态</Col>
            <Col span={ColSpanMap.Action}>操作</Col>
          </Row>
          <div className="gift-table__body">
            {
              data.map((item, index) => (
                <Row key={item.id} className="gift-table__row">
                  <Col span={ColSpanMap.Name} style={{ textAlign: 'center', justifyContent: 'center' }}>{item.name}</Col>
                  <Col span={ColSpanMap.Img} className="orca-flex-center-layout">
                    <i className="gift-thumb" style={{ backgroundImage: `url(${item.img})` }} />
                  </Col>
                  <Col span={ColSpanMap.Price} className="orca-flex-center-layout">
                    ¥{toZhNumber(item.price / 100)}
                  </Col>
                  <Col span={ColSpanMap.Status} className="orca-flex-center-layout">{GiftStatusText[item.status]}</Col>
                  <Col span={ColSpanMap.Action}>
                    <Space>
                      {item.status !== IGiftStatusEnum.ON_SHELVES && (<a onClick={() => { handleSetCommodityStatus(IGiftStatusEnum.ON_SHELVES, item) }}>上架</a>)}
                      { item.status !== IGiftStatusEnum.OFF_SHELVES && (<a onClick={() => { handleSetCommodityStatus(IGiftStatusEnum.OFF_SHELVES, item) }}>下架</a>)}
                      {
                        !!index && (<a onClick={() => { handleSort(item, -1) }}>上移</a>)
                      }
                      {
                        index !== data.length && (<a onClick={() => { handleSort(item, 1) }}>下移</a>)
                      }
                    </Space>
                  </Col>
                </Row>
              ))
            }
          </div>
        </ul>
      </DataToggleModule>
    </div>
  )
}

export default Gift
