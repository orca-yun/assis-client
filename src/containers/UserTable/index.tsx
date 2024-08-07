import React from 'react'
import i18n from 'i18next'
import { Table } from 'antd'

import Module from '@/components/Module'

import Filters from './Filters'

const UserTable = () => {
  const columns = [
    {
      title: '序号',
      dataIndex: '',
    },
    {
      title: '头像/昵称',
      dataIndex: '',
    },
    {
      title: '新老用户',
      dataIndex: '',
    },
    {
      title: '观看时长',
      dataIndex: '',
    },
    {
      title: '互动次数',
      dataIndex: '',
    },
    {
      title: '进入时间',
      dataIndex: '',
    },
    {
      title: '进出次数',
      dataIndex: '',
    },
    {
      title: '城市',
      dataIndex: '',
    },
    {
      title: '渠道',
      dataIndex: '',
    },
    {
      title: '操作',
      dataIndex: '',
    },
  ]
  return (
    <Module
      className="audience-list-panel"
      title={i18n.t('观众列表')}
    >
      <Filters />
      <Table
        columns={columns}
        dataSource={[]}
        pagination={false}
      />
    </Module>
  )
}

export default UserTable
