import React, { useRef, useEffect, useLayoutEffect } from 'react'
import cls from 'classnames'
import { useSize } from 'ahooks'
import TCPlayer, { TCPlayerIInstance } from 'tcplayer.js'
import 'tcplayer.js/dist/tcplayer.min.css'

import { IStreamTypeEnum } from '@/apis/room'

import './index.less'

const licenseUrl = 'https://license.vod2.myqcloud.com/license/v2/1312738076_1/v_cube.license'

interface ITCPlayer {
  url: string
  className?: string
  poster?: string
  allRoutes: { src: string; route: IStreamTypeEnum; label: string }[]
  selectedRoute: IStreamTypeEnum
}

const OrcaTCPlayer: React.FC<ITCPlayer> = (props) => {
  const { className, url, poster, allRoutes, selectedRoute } = props
  const wrapperRef = useRef<any>()
  const player = useRef<TCPlayerIInstance>()
  const wrapperSize = useSize(wrapperRef)

  useEffect(() => {
    if (!wrapperSize || player.current) return
    player.current = TCPlayer('tc-player__orca', {
      sources: allRoutes.map(({ src }) => ({ src })),
      poster,
      licenseUrl, // license 地址，参考准备工作部分，在视立方控制台申请 license 后可获得 licenseUrl
      autoplay: true,
      controls: true,
      controlBar: {
        qualitySwitcherMenuButton: true,
      },
      multiResolution: {
        sources: allRoutes.reduce((a, b) => ({
          ...a,
          [b.route]: [{ src: b.src }],
        }), {}),
        labels: allRoutes.reduce((a, b) => ({
          ...a,
          [b.route]: b.label,
        }), {}),
        showOrder: allRoutes.map(({ route }) => route),
        // 配置默认选中的清晰度
        defaultRes: selectedRoute,
      },
    })
    player.current.src(url)
  }, [wrapperSize])

  useEffect(() => {
    return () => {
      player.current && player.current.dispose()
    }
  }, [])

  return (
    <div className={cls(className)} ref={wrapperRef}>
      <video
        id="tc-player__orca"
        width={wrapperSize?.width}
        height={wrapperSize?.height}
        preload="auto"
      />
    </div>
  )
}

export default OrcaTCPlayer
