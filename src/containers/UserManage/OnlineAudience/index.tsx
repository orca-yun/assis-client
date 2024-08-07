import React, {useState} from 'react'
import { Radio } from 'antd'

import { IAudience } from '@/apis/human'
import DataToggleModule from '@/components/DataToggleModule'

import UserItem from './UserItem'
import './index.less'

const { Group, Button: RadioButton } = Radio

interface IOnlineAudience {
  data: IAudience[]
  assistants: IAudience[]
}

const OnlineAudience: React.FC<IOnlineAudience> = (props) => {
  const { data, assistants } = props
  const Options = [
    {
      value: 'online-audience',
      label: `在线用户(${data.length})`,
    },
    {
      value: 'online-assistants',
      label: `在线助理(${assistants.length})`,
    },
  ]
  const [cur, setCur] = useState(Options[0].value)

  const renderUsers = () => {
    const listData = cur === 'online-audience' ? data : assistants
    return (
      <DataToggleModule
        loading={false}
        empty={!listData.length}
        emptyWrapperHeight={300}
        emptyHintProps={{
          emptyIconFontSize: 100,
          desc: '暂无数据',
        }}
      >
        {
          listData.map((item) => (
            <UserItem key={item.nickname} data={item} />
          ))
        }
      </DataToggleModule>
    )
  }

  return (
    <div className="online-audience-list">
      <Group value={cur} onChange={(e) => { setCur(e.target.value) }}>
        {
          Options.map((item) => (
            <RadioButton value={item.value} key={item.value}>{item.label}</RadioButton>
          ))
        }
      </Group>
      <ul className="online-audience-list__wrapper">
        {renderUsers()}
      </ul>
    </div>
  )
}

export default OnlineAudience
