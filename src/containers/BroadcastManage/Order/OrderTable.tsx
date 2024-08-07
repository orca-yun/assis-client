import React, { useState, useRef, useEffect } from 'react'
import { Table, Card, TableProps } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

import { queryRoomOrderList, IOrder, IOrderStatusEnum, OrderStatusSetText } from '@/apis/order'
import { queryChannels } from '@/apis/channel'
import useOrcaRequest from '@/hooks/useRequest'
import { toZhNumber } from '@/utils/number'
import Avatar from '@/components/Avatar'
import dayjs from 'dayjs'

const OrderTable: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const tableRef = useRef<any>()
  const [filters, setFilters] = useState<{
    current: number
    pageSize: number
    channelIds: number[]
    orderDate: string
  }>({
    current: 1,
    pageSize: 20,
    channelIds: [],
    orderDate: dayjs().format('YYYY-MM-DD')
  })
  const [tableMaxHeight, setTableMaxHeight] = useState(0)
  const [{ data: response, loading }] = useOrcaRequest(() => {
    const { current, pageSize, channelIds } = filters
    return queryRoomOrderList({
      page: current,
      pageSize,
      channelIds,
      orderDate: dayjs().format('YYYY-MM-DD')
    })
  }, {
    refreshDeps: [filters],
  }, {})
  const [{ data: channelResponse, loading: isQueryingChannels }] = useOrcaRequest(queryChannels, {}, {})

  const data = response?.data || []
  const total = response?.total || 0

  const channels = (channelResponse?.data || []).map((item) => ({
    text: item.channelName,
    value: item.channelId,
  }))
  const columns: any[] = [
    {
      width: 120,
      title: '渠道',
      fixed: 'left',
      dataIndex: 'channelIds',
      filters: channels,
      render: (val: any, record: IOrder) => record.channelName,
    },
    {
      width: 140,
      title: '姓名',
      dataIndex: 'recipientName',
    },
    {
      width: 140,
      title: '手机号',
      dataIndex: 'recipientPhone',
    },
    {
      title: '下单人',
      width: 150,
      dataIndex: 'userName',
    },
    {
      title: '商品',
      width: 150,
      dataIndex: 'goodsName',
      render: (val: any, record: IOrder) => (
        <div className="order-table__goodsName">
          <Avatar url={record.goodsImage} />
          {record.goodsName}
        </div>
      ),
    },
    {
      title: '订单状态',
      width: 150,
      dataIndex: 'orderStatus',
      render: (val: IOrderStatusEnum) => OrderStatusSetText[val],
    },
    {
      width: 160,
      title: '下单时间',
      dataIndex: 'orderTime',
    },
    {
      width: 160,
      title: '成交时间',
      dataIndex: 'tradeTime',
    },
    {
      width: 140,
      title: '支付金额',
      dataIndex: 'realAmt',
      render: (val: number) => '¥' + toZhNumber(val / 100),
    },
    {
      width: 140,
      title: '商品原价',
      dataIndex: 'originalPrice',
      render: (val: number) => '¥' + toZhNumber(val / 100),
    },
    {
      width: 140,
      title: '现价',
      dataIndex: 'price',
      render: (val: number) => '¥' + toZhNumber(val / 100),
    },
  ]

  useEffect(() => {
    if (!tableRef.current) return
    // table header + pagination 高度
    setTableMaxHeight(tableRef.current.getBoundingClientRect().height - 55 - 60)
  }, [isQueryingChannels])

  const handleChange: TableProps['onChange'] = (pagination, filterParams) => {
    const nextChannelIds: any[] = filterParams?.channelIds || []
    const channelIdsNotChanged = (filters.channelIds.length === nextChannelIds.length) && filters.channelIds.every((id) => nextChannelIds.includes(id))
    setFilters((v) => ({
      ...v,
      ...pagination,
      channelIds: nextChannelIds,
      ...(!channelIdsNotChanged ? {
        current: 1
      } : {}),
    }))
  }

  return (
    <Card
      title="数据详情"
      loading={isQueryingChannels}
      extra={[
        <CloseOutlined key="close-icon" style={{ cursor: 'pointer' }} onClick={onClose} />
      ]}
    >
      <div className="table-wrapper" ref={tableRef}>
        <Table
          rowKey={(record) => `${record.id}-${record.userId}`}
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{
            x: 620,
            y: tableMaxHeight,
          }}
          pagination={{
            total,
            pageSize: filters.pageSize,
            current: filters.current,
          }}
          onChange={handleChange}
        />
      </div>
    </Card>
  )
}

export default OrderTable
