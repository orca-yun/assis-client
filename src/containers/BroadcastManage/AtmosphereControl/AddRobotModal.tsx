import React, { useMemo, useState } from 'react'
import { Modal, Table, message } from 'antd'

import { callModalSync, IModalSharedProps } from '@/utils/callAsyncModal'
import { queryRobots, IRobot } from '@/apis/robot'
import { addScript } from '@/apis/atmosphere'
import useOrcaRequest from '@/hooks/useRequest'
import Avatar from '@/components/Avatar'

import './AddRobotModal.less'

interface IAddRobotModal {
  selected: string[]
}

const AddRobotModal: React.FC<IAddRobotModal & IModalSharedProps> = (props) => {
  const { onCancel, onConfirm } = props
  const [selectList, setSelectList] = useState<any[]>([])
  const [{ data: response, loading }] = useOrcaRequest(queryRobots, {}, {})
  const [{ runAsync: addAction, loading: isAdding }] = useOrcaRequest(addScript, { manual: true }, {
    loadingMsg: '添加',
    loadingSuccessMsg: '添加成功~',
    onSuccess: () => {
      onConfirm()
    },
  })

  const data = useMemo(() => {
    if (!response) return []
    return (response.data || []).map((item, index) => ({
      ...item,
      index: index + 1,
    }))
  }, [response])

  const handleConfirm = () => {
    if (!selectList.length) {
      message.warning('请至少添加一个数字人')
      return
    }
    addAction({
      robotIds: selectList,
    })
  }

  const handleAdd = (record: IRobot) => {
    addAction({
      robotIds: [record.id],
    })
  }

  const columns = [
    {
      title: '编号',
      dataIndex: 'index',
    },
    {
      title: '名称',
      dataIndex: 'nickname',
    },
    {
      title: '头像',
      dataIndex: 'headIco',
      render: (val: string) => <Avatar url={val} />,
    },
    // {
    //   title: '数字人类型',
    // },
    // {
    //   title: '数字人来源',
    // },
    {
      title: '操作',
      render: (val: any, record: IRobot) => (
        <a onClick={() => { handleAdd(record) }}>添加</a>
      ),
    },
  ]

  return (
    <Modal
      className="add-robot__modal"
      open
      title={(
        <div>
          添加数字人
          <span style={{ marginLeft: 20, fontSize: 12, color: 'blue' }}>已选中({selectList.length})</span>
        </div>
      )}
      width={720}
      onCancel={onCancel}
      onOk={handleConfirm}
      okButtonProps={{
        loading: isAdding,
        disabled: isAdding,
      }}
      okText="添加"
    >
      <Table
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={data}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectList,
          onChange: (selectedRows) => {
            setSelectList(selectedRows)
          },
        }}
      />
    </Modal>
  )
}

export const callAddRobotModal = (props: IAddRobotModal) => callModalSync(AddRobotModal, props)
