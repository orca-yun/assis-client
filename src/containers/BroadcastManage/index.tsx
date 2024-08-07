import React, { useState, useMemo } from 'react'
import cls from 'classnames'
import { observer } from 'mobx-react-lite'

import { authStore } from '@/stores'
import ProductImg from '@/assets/icon/product.png'
import SettingImg from '@/assets/icon/setting.png'
import GiftImg from '@/assets/icon/gift.png'
import PayImg from '@/assets/icon/pay.png'
import DataImg from '@/assets/icon/data.png'
import ControlImg from '@/assets/icon/control.png'

import Product from './Product'
import Gift from './Gift'
import Setting from './Setting'
import AtmosphereControl from './AtmosphereControl'
import Data from './Data'
// import Order from './Order'

import './index.less'
import Order from './Order'

const Options = [
  {
    key: 'robot',
    icon: ControlImg,
    label: '场控',
    comp: AtmosphereControl,
  },
  {
    key: 'production',
    icon: ProductImg,
    label: '商品',
    comp: Product,
  },
  {
    key: 'order',
    icon: PayImg,
    label: '订单',
    comp: Order,
  },
  {
    key: 'data',
    icon: DataImg,
    label: '数据',
    comp: Data,
  },
  {
    key: 'gift',
    icon: GiftImg,
    label: '礼物',
    comp: Gift,
  },
  {
    key: 'settings',
    icon: SettingImg,
    label: '设置',
    comp: Setting,
  },
]

interface IField {
  selected: boolean
  icon: string
  label: React.ReactNode
  onClick: () => void
}

const Field: React.FC<IField> = ({ selected, icon, label, onClick }) => {
  return (
    <div className={cls('field-wrapper', { selected })} onClick={onClick}>
      <i className="icon-bg" style={{ backgroundImage: `url(${icon})` }} />
      <div className="label">{label}</div>
    </div>
  )
}

const BroadcastManage = () => {
  const [cur, setCur] = useState(Options[0].key)

  const curComp = useMemo(() => Options.find((item) => item.key === cur)?.comp, [cur])

  return (
    <div className="broadcast-manage-panel">
      {
        authStore.roomId > 0 && (
          <>
            <div className="broadcast-manage-panel__video-wrapper">
              <div className="broadcast-manage-panel__video-wrapper-actions">
                {
                  Options.map(({ key, icon, label }) => (
                    <Field
                      key={key}
                      selected={key === cur}
                      icon={icon}
                      label={label}
                      onClick={() => { setCur(key) }}
                    />
                  ))
                }
              </div>
            </div>
            <div className="broadcast-manage-panel__dynamic-content">
              {
                React.createElement(curComp as any, {
                  roomId: authStore.roomId,
                })
              }
            </div>
          </>
        )
      }
    </div>
  )
}

export default observer(BroadcastManage)
