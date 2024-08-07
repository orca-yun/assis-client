import React, { useState } from 'react'
import { Statistic, Button, Row, Col, Card } from 'antd'
import { useToggle } from 'ahooks'

import useOrcaRequest from '@/hooks/useRequest'
import { queryFinanceData } from '@/apis/data'
import { toZhNumber } from '@/utils/number'
import OrderTable from './OrderTable'

import './index.less'

const Order = () => {
  const [visible, { toggle }] = useToggle(false)
  const [{ data: response }] = useOrcaRequest(queryFinanceData, {
    pollingInterval: 30000,
    pollingErrorRetryCount: 3,
  }, {})
  const data = response?.data
  return (
    <div className="order-module__wrapper">
      <Row className="order-module__wrapper-header">
        <Col span={12}>
          <Statistic
            title="订单总金额"
            value={'¥' + toZhNumber((data?.totalOrderAmount || 0)/100)}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="已支付订单金额"
            value={'¥' + toZhNumber((data?.payedOrderAmount || 0)/100)}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="未支付订单金额"
            value={'¥' + toZhNumber((data?.unPayedOrderAmount || 0)/100)}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="待支付订单金额"
            value={'¥' + toZhNumber((data?.waitOrderAmount || 0)/100)}
          />
        </Col>
      </Row>
      <Card
        title="订单数据统计"
        className="order-module__wrapper-content"
        extra={[
          <Button key="detail" type="link" onClick={() => { toggle() }}>详细数据</Button>,
        ]}
      >
      </Card>
      {
        visible && (
          <div className="order-data__module">
            <OrderTable onClose={toggle} />
          </div>
        )
      }
    </div>
  )
}

export default Order
