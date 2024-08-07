import React, { useState, useEffect } from 'react'
import { Tooltip } from 'antd'
import videojs, { VideoJsPlayer } from 'video.js'
import ReactDOM, { Root } from 'react-dom/client'
import cls from 'classnames'

import { IStreamTypeEnum } from '@/apis/room'
import { orcaEvent } from '@/utils/event'

export const DEFAULT_STREAM = IStreamTypeEnum.WEBRTC

export const PlayRoutesOptions = [
  {
    label: '线路一',
    value: IStreamTypeEnum.WEBRTC,
  },
  {
    label: '线路二',
    value: IStreamTypeEnum.FLV,
  },
  {
    label: '线路三',
    value: IStreamTypeEnum.M3U8,
  },
]

const vjsComponent = videojs.getComponent('Component')

const SwitchRouteBtn: React.FC<any> = () => {
  const [open, setOpen] = useState(false)
  const [curRoute, setCurRoute] = useState<IStreamTypeEnum>(DEFAULT_STREAM)
  useEffect(() => {
    orcaEvent.on('route-change', (val) => {
      setCurRoute(val)
    })
    return () => {
      orcaEvent.off('route-change', setCurRoute)
    }
  }, [])
  return (
    <Tooltip
      open={open}
      placement="top"
      color="#FFF"
      title={(
        <div style={{ cursor: 'pointer' }} className="switch-route-tip">
          {
            PlayRoutesOptions.map(({ label, value }) => (
              <li
                className={cls('route-item', { selected: value === curRoute })}
                key={value}
                onClick={() => {
                  if (value === curRoute) return
                  setCurRoute(value)
                  orcaEvent.emit('route-change:controlBar', value)
                  setOpen(false)
                }}
              >{label}</li>
            ))
          }
        </div>
      )}
      onOpenChange={setOpen}
    >
      <button style={{ marginTop: 10 }}>{PlayRoutesOptions.find((item) => item.value === curRoute)?.label}</button>
    </Tooltip>
  )
}

let root: Root | null = null

class VjsBridgeComponent extends vjsComponent {
  constructor(player: VideoJsPlayer, options: any) {
    super(player, options)

    // Bind the current class context to the mountReactComponent method
    this.mountReactComponent = this.mountReactComponent.bind(this)

    // When player is ready, call method to mount the React component
    player.ready(() => this.mountReactComponent())

    // Remove the React root when this component is destroyed
    this.on('dispose', () => root?.unmount())
  }

  mountReactComponent() {
    root = ReactDOM.createRoot(this.el())
    root.render(<SwitchRouteBtn vjsBridgeComponent={this} text="切换线路" />)
  }
}

videojs.registerComponent('VjsBridgeComponent', VjsBridgeComponent)
