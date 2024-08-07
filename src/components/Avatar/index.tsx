import React from 'react'

import './index.less'

interface IAvatar {
  url: string
}

const Avatar: React.FC<IAvatar> = ({ url }) => {
  return (
    <img className="avatar-item" src={url} alt="" />
  )
}

export default Avatar
