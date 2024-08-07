import React, { useState } from 'react'
import { Tabs } from 'antd'

import Control from './Control'
import Script from './Script'

import './index.less'

const TabOptions = [
  {
    label: '氛围场控',
    key: '1',
    comp: Control,
  },
  {
    label: '剧本场控',
    key: '2',
    comp: Script,
  },
]

const AtmosphereControl = () => {
  const [selectedTab, setSelectedTab] = useState(TabOptions[0].key)

  const comp = TabOptions.find((item) => item.key === selectedTab)?.comp
  return (
    <div className="atmosphere-control">
      <Tabs
        activeKey={selectedTab}
        items={TabOptions}
        onTabClick={setSelectedTab}
      />
      <div className="atmosphere-control__content">
        {
          /* @ts-ignore */
          React.createElement(comp)
        }
      </div>
    </div>
  )
}

export default AtmosphereControl
