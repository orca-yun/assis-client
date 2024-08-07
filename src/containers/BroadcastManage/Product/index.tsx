import React from 'react'
import { Row, Col, Space, Modal, Button, Tag, message } from 'antd'

import useRequest from '@/hooks/useRequest'
import {
  ICommodity,
  CommoditySellStatusText,
  CommoditySellStatusSetText,
  ICommoditySellStatusEnum,
  queryRoomCommodityList,
  setCommoditySellStatus,
  setBatchCommoditySellStatus,
  recommendCommodity,
  sortCommodity,
} from '@/apis/marketing'
import DataToggleModule from '@/components/DataToggleModule'
import { toZhNumber } from '@/utils/number'
import { OperationOptions } from '@/constant/locale'

import './index.less'

const Product = () => {
  const [{ data: res, loading, runAsync }] = useRequest(queryRoomCommodityList, {}, {})
  const [{ runAsync: recommendAction }] = useRequest(recommendCommodity, { manual: true }, {
    ...OperationOptions,
  })
  const [{ runAsync: setStatusAction }] = useRequest(setCommoditySellStatus, { manual: true }, {
    ...OperationOptions,
    onSuccess: () => {
      runAsync()
    },
  })
  const [{ runAsync: setBatchStatusAction }] = useRequest(setBatchCommoditySellStatus, { manual: true }, {
    ...OperationOptions,
    onSuccess: () => {
      runAsync()
    }
  })
  const [{ loading: isSorting, runAsync: sortAction }] = useRequest(sortCommodity, { manual: true }, {
    ...OperationOptions,
    onSuccess: () => {
      runAsync()
    },
  })
  const data = res?.data || []

  const handleRecommend = (item: ICommodity) => {
    Modal.confirm({
      title: '确定推荐该商品？',
      content: `${item.name}`,
      onOk: () => {
        recommendAction(item.id)
      },
    })
  }

  const handleSetBatchCommodityStatus = (status: ICommoditySellStatusEnum) => {
    Modal.confirm({
      title: `确定要进行一键「${CommoditySellStatusSetText[status]}」操作`,
      content: `您将一键${CommoditySellStatusSetText[status]}所有非售罄商品`,
      onOk: () => {
        setBatchStatusAction({
          sellStatus: status,
        })
      },
    })
  }

  const handleSetCommodityStatus = (status: ICommoditySellStatusEnum, item: ICommodity) => {
    Modal.confirm({
      title: `确定要进行「${CommoditySellStatusSetText[status]}」操作`,
      content: `${item.name}`,
      onOk: () => {
        setStatusAction({
          id: item.id,
          sellStatus: status,
        })
      },
    })
  }

  const handleSort = (item: ICommodity, index: number) => {
    const curIndex = data.findIndex((record) => record.id === item.id)
    const nextList = data.slice()
    nextList[curIndex] = data[curIndex + index]
    nextList[curIndex + index] = item
    sortAction({
      itemIds: nextList.map(({ id }) => id),
    })
  }

  return (
    <div className="product-panel">
      <DataToggleModule
        empty={!data.length}
        loading={loading || isSorting}
        // emptyWrapperHeight={300}
        emptyHintProps={{
          emptyIconFontSize: 100,
          desc: (
            <div>
              暂无商品，<a onClick={() => { runAsync() }}>刷新</a>试试吧
            </div>
          ),
        }}
      >
        <div className="product-table__content">
          <div className="product-table__header">
            <div className="product-table__header-title">商品列表</div>
            <div className="product-table__header-actions">
              <Button type="primary" size="small" onClick={() => { handleSetBatchCommodityStatus(ICommoditySellStatusEnum.ON_SHELVES) }}>一键上架</Button>
              <Button type="primary" size="small" style={{ marginLeft: 8 }} onClick={() => { handleSetBatchCommodityStatus(ICommoditySellStatusEnum.OFF_SHELVES) }}>一键下架</Button>
            </div>
          </div>
          <div className="product-table__body">
            {
              data.map((item, index) => (
                <Row key={item.id} className="product-item-wrapper" gutter={18}>
                  <Col span={5}>
                    <div className="img-container">
                      <i className="product-thumb" style={{ backgroundImage: `url(${item.img})` }} />
                    </div>
                  </Col>
                  <Col span={11}>
                    <div className="product-item-wrapper__title">{item.name}</div>
                    <Tag color="#409EFF">{CommoditySellStatusText[item.sellStatus]}</Tag>
                    <div className="product-item-wrapper__price">
                      <span style={{ fontSize: 14, marginRight: 6 }}>¥</span>
                      {toZhNumber(item.price / 100)}
                    </div>
                  </Col>
                  <Col className="actions-col" span={8}>
                    <Space>
                      <Button size="small" onClick={() => { handleRecommend(item) }}>推荐</Button>
                      {item.sellStatus !== ICommoditySellStatusEnum.ON_SHELVES && (<Button size="small" onClick={() => { handleSetCommodityStatus(ICommoditySellStatusEnum.ON_SHELVES, item) }}>上架</Button>)}
                      { item.sellStatus !== ICommoditySellStatusEnum.OFF_SHELVES && (<Button size="small" onClick={() => { handleSetCommodityStatus(ICommoditySellStatusEnum.OFF_SHELVES, item) }}>下架</Button>)}
                      {item.sellStatus === ICommoditySellStatusEnum.ON_SHELVES && (<Button size="small" onClick={() => { handleSetCommodityStatus(ICommoditySellStatusEnum.SOLD_OUT, item) }}>售罄</Button>)}
                    </Space>
                    <Space style={{ marginTop: 8 }}>
                      {
                        !!index && (<Button size="small" onClick={() => { handleSort(item, -1) }}>上移</Button>)
                      }
                      {
                        index !== data.length && (<Button size="small" onClick={() => { handleSort(item, 1) }}>下移</Button>)
                      }
                    </Space>
                  </Col>
                </Row>
              ))
            }
          </div>
        </div>
      </DataToggleModule>
    </div>
  )
}

export default Product
