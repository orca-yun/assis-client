import React, { useState } from 'react'
import { Statistic, Button, Row, Col, Card } from 'antd'
import { useToggle } from 'ahooks'

import useOrcaRequest from '@/hooks/useRequest'
import { queryBroadcastData } from '@/apis/data'
import EmptyHint from '@/components/Empty'

import Chart from './Chart'
import UserTable from './UserTable'

import './index.less'

const Data = () => {
  const [visible, { toggle }] = useToggle(false)
  const [{ data: response }] = useOrcaRequest(queryBroadcastData, {
    pollingInterval: 30000,
    pollingErrorRetryCount: 3,
  }, {})
  const data = response?.data
  return (
    <div className="data-module__wrapper">
      <Row className="data-module__wrapper-header">
        <Col span={12}>
          <Statistic
            title="累积观看人数"
            value={data?.uv || 0}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="当前在线人数"
            value={data?.onlineNum || 0}
          />
        </Col>
      </Row>
      <Card
        title="开播数据"
        className="data-module__wrapper-content"
        extra={[
          <Button key="detail" type="link" onClick={() => { toggle() }}>详细数据</Button>,
        ]}
      >
        {
          (data?.records || []).length
            ? <Chart data={data?.records || []} />
            : (
              <EmptyHint desc="暂无数据" emptyIconFontSize={120} />
            )
        }
      </Card>
      {
        visible && (
          <div className="user-data__module">
            <UserTable onClose={toggle} />
          </div>
        )
      }
    </div>
  )
}

export default Data
