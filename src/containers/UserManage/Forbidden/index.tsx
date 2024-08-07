import React, { useState } from 'react'
import { Radio } from 'antd'

import BlackList from './BlackList'
import MuteList from './MuteList'

import './index.less'

const { Group, Button: RadioButton } = Radio

const Options = [
  {
    value: 'blacklist',
    label: '黑名单',
    comp: BlackList,
  },
  {
    value: 'mute-list',
    label: '禁言',
    comp: MuteList,
  },
]

const Forbidden = () => {
  const [cur, setCur] = useState(Options[0].value)
  const comp = Options.find((item) => item.value === cur)?.comp
  return (
    <div className="forbidden-audience-list">
      <Group value={cur} onChange={(e) => { setCur(e.target.value) }}>
        {
          Options.map((item) => (
            <RadioButton value={item.value} key={item.value}>{item.label}</RadioButton>
          ))
        }
      </Group>
      <div className="forbidden-audience-list__wrapper">
        {
          comp && React.createElement(comp)
        }
      </div>
    </div>
  )
}

export default Forbidden
