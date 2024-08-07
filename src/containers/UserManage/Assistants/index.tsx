import React from 'react'

import { IAssistantModel } from '@/apis/assis'
import UserItem from '@/containers/UserManage/OnlineAudience/UserItem'

import './index.less'

const Assistants: React.FC<{ data: IAssistantModel[] }> = ({ data }) => {
  return (
    <div className="online-assis-list">
      <ul className="online-assis-list__wrapper">
        {
          data.map((item) => (
            <UserItem key={item.nickname} data={item} />
          ))
        }
      </ul>
    </div>
  )
}

export default Assistants
