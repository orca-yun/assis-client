import React, { useState, useRef, useEffect } from 'react'
import { Table, Card, TableProps } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

import { queryUserData, IUser } from '@/apis/users'
import { queryChannels } from '@/apis/channel'
import useOrcaRequest from '@/hooks/useRequest'
import Avatar from '@/components/Avatar'

const UserTable: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const tableRef = useRef<any>()
  const [filters, setFilters] = useState<{
    current: number
    pageSize: number
    channelIds: number[]
  }>({
    current: 1,
    pageSize: 20,
    channelIds: [],
  })
  const [tableMaxHeight, setTableMaxHeight] = useState(0)
  const [{ data: response, loading }] = useOrcaRequest(() => {
    const { current, pageSize, channelIds } = filters
    return queryUserData({
      page: current,
      pageSize,
      channelIds,
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
      title: '观众',
      width: 150,
      dataIndex: 'nickname',
      fixed: 'left',
      render: (val: any, record: IUser) => (
        <div className="user-table__nickname">
          <Avatar url={record.headIco} />
          {record.nickname}
        </div>
      ),
    },
    {
      width: 120,
      title: '渠道',
      dataIndex: 'channelIds',
      filters: channels,
      render: (val: any, record: IUser) => record.channelName,
    },
    {
      width: 160,
      title: '进入时间',
      dataIndex: 'onlineTime',
    },
    {
      width: 140,
      title: '观看时长(分钟)',
      dataIndex: 'viewDuration',
      render: (val: number) => (val / 60).toFixed(),
    },
    {
      width: 100,
      title: '发言次数',
      dataIndex: 'msgNum',
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
          rowKey={(record) => `${record.uid}-${record.channelId}`}
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

export default UserTable
