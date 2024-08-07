import React from 'react'

import { IAudience } from '@/apis/human'
import { IAssistantModel } from '@/apis/assis'
import DEFAULT_AVATAR from '@/assets/avatar/avatar.jpg'

import './UserItem.less'

interface IUserItem {
  data: IAudience | IAssistantModel
  actions?: React.ReactNode | React.ReactNode[]
}

const UserItem: React.FC<IUserItem> = ({ data, actions }) => {
  return (
    <li className="user-item">
      <span className="user-avatar">{data.nickname ? data.nickname.substring(0, 1) : '看'}</span>
      <div className="user-nick-name">{data.nickname}</div>
      {
        actions && (<div className="user-item__actions">{actions}</div>)
      }
    </li>
  )
}

export default UserItem
