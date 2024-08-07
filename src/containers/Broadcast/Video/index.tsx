import React, { useEffect, useRef, useState, useMemo } from 'react'
import {useSearchParams} from 'react-router-dom'
import { Spin, Tooltip } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { VideoPlayer } from '@videojs-player/react'
import videojs, { VideoJsPlayer } from 'video.js'
import { observer } from 'mobx-react-lite'
import cls from 'classnames'

import { orcaEvent } from '@/utils/event'
import { authStore } from '@/stores'
import useRequest from '@/hooks/useRequest'
import { IStreamTypeEnum, queryBroadcastStream } from '@/apis/room'
import logo from '@/assets/logo/logo-big.png'

import { FlvJsTech } from './flv-video-tech'
import { DEFAULT_STREAM, PlayRoutesOptions } from './SwitchRouteComponent'
import TCPlayer from './TCPlayer'

// import 'video.js/dist/video-js.css'

import './index.less'

/*
* videojs支持自动播放功能，但是浏览器对于自动播放有严格的限制，因此需要注意一些问题。
首先，浏览器不允许自动播放声音。如果你需要播放音频，则需要等到用户与页面交互后才能自动播放。
其次，不同浏览器对于自动播放的处理方式不同。例如，Chrome浏览器只允许在用户第一次访问站点时自动播放，随后的访问则需要用户手动触发播放。而Firefox和Safari则允许在任何时候自动播放，但需要用户允许。
针对上述限制，videojs提供了一些解决方案：
在video标签中添加"muted"属性，这样即使无法自动播放声音，视频也会自动播放。用户可以手动开启声音。
使用videojs的API，在用户第一次与页面交互时通过代码触发播放事件。
* */

videojs.registerTech('Flvjs', FlvJsTech)

const enum VideoStatus {
  UN_START = '当前未开播',
  ERROR = '出错啦，点击重试',
}

const VideoScreen = () => {
  const videoInstance = useRef<VideoJsPlayer>()
  const [params] = useSearchParams()
  const mode = params.get('mode')
  const { roomMeta } = authStore
  const [error, setError] = useState<VideoStatus | null>(VideoStatus.UN_START)
  const [curPlayRoute, setCurPlayRoute] = useState<IStreamTypeEnum>(DEFAULT_STREAM)
  const [{runAsync: queryBroadcastUrl, data: res, loading}] = useRequest(queryBroadcastStream, {
    manual: true,
  }, {})

  useEffect(() => {
    const update = (route: IStreamTypeEnum) => {
      setCurPlayRoute(route)
      setError(null)
    }
    orcaEvent.on('route-change:controlBar', update)

    return () => {
      orcaEvent.off('route-change:controlBar', update)
    }
  }, [])

  useEffect(() => {
    if (!authStore.isLiving) {
      // 直播未开始
      setError(VideoStatus.UN_START)
      return
    }
    // 直播中
    queryBroadcastUrl()
  }, [authStore.isLiving])

  const { [curPlayRoute]: curUrl } = res?.data || {}

  const allRoutes = useMemo(() => {
    if (!res?.data) return []
    return PlayRoutesOptions
      .filter((item) => res.data[item.value])
      .map((item) => ({
        src: (res.data || {})[item.value],
        route: item.value,
        label: item.label,
      }))
      .filter(Boolean)
  }, [res?.data])

  const replay = () => {
    videoInstance.current?.src(curUrl as string)
    // videoInstance.current?.pause()
    setError(null)
  }

  useEffect(() => {
    if (curUrl) {
      setError(null)
      if (videoInstance.current) {
        replay()
      }
    }
  }, [curUrl])

  const renderTip = () => {
    if (error === VideoStatus.UN_START) {
      return (
        <div onClick={() => { replay() }}>{error}</div>
      )
    }
    if (error === VideoStatus.ERROR) {
      return (
        <div style={{ textAlign: 'center' }}>
          <div onClick={() => { replay() }}>{error}</div>
          <Tooltip
            placement="bottom"
            color="#FFF"
            title={(
              <div style={{ cursor: 'pointer' }} className="switch-route-tip">
                {
                  PlayRoutesOptions.map(({ label, value }) => (
                    <li
                      className={cls('route-item', { selected: value === curPlayRoute })}
                      key={value}
                      onClick={() => {
                        if (value === curPlayRoute) return
                        orcaEvent.emit('route-change', value)
                        setCurPlayRoute(value)
                        setError(null)
                      }}
                    >{label}</li>
                  ))
                }
              </div>
            )}
          >
            <span style={{ textAlign: 'center', fontSize: 14, color: '#FFF' }}>切换线路</span>
          </Tooltip>
        </div>
      )
    }
    return null
  }

  if (!authStore.isLiving) {
    return (
      <div className="orca-video-player">
        <div className="unstart-tip">当前未开播</div>
      </div>
    )
  }

  if (mode !== 'normal') {
    return (
      <div className="orca-video-player">
        {
          curUrl && (
            <TCPlayer
              className="orca-video-player__item tcplay"
              url={curUrl}
              allRoutes={allRoutes}
              poster={/^http(s)?/.test(roomMeta?.cover as string) ? roomMeta?.cover : logo}
              selectedRoute={curPlayRoute}
            />
          )
        }
      </div>
    )
  }

  return (
    <div className="orca-video-player">
      {
        error === VideoStatus.UN_START && (
          <div className="orca-video-player__mask">
            <div className="video-tip">{renderTip()}</div>
          </div>
        )
      }
      {
        curUrl && (
          <VideoPlayer
            className="orca-video-player__item"
            poster={/^http(s)?/.test(roomMeta?.cover as string) ? roomMeta?.cover : logo}
            controls
            loop={false}
            volume={0.6}
            // videoJsChildren={[]}
            preload="auto"
            controlBar={{
              children: [
                'playToggle',
                'volumePanel',
                'currentTimeDisplay',
                'timeDivider',
                'durationDisplay',
                'progressControl',
                // 'pictureInPictureToggle',
                'VjsBridgeComponent',
                'fullscreenToggle',
              ],
              volumePanel: {
                inline: false, // 将音量控件设置为不在控制条中内联显示
              },
            }}
            onError={(e) => {
              setError(VideoStatus.ERROR)
              videoInstance.current?.pause()
            }}
            playsinline
            // 设置src后可播放 否则chrome会限制
            crossorigin="anonymous"
            techOrder={['html5', 'flvjs']}
            onMounted={({ player}) => {
              videoInstance.current = player
            }}
          >
            {({ player, state }) => {
              // console.log(state)
              if (error) {
                return (<div className="orca-video-player__mask">
                  {state?.error?.message && (<div className="error">{state?.error?.message}</div>)}
                  <div className="video-tip">{renderTip()}</div>
                </div>)
              }
              return null
              // 为就绪
              // const unReady = (!state.playing && !state.waiting) || state.waiting
              // return (<div className="customize-control-panel">
              //   {
              //     (unReady || loading) && !error
              //       ? (
              //         <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} />} size="large" tip="加载中..." />
              //       )
              //       : (
              //         <div className="orca-video-player__mask">
              //           <div className="video-tip">{renderTip()}</div>
              //         </div>
              //       )
              //   }
              //   {/*<button onClick={() => state.playing ? player.pause() : player.play()}>*/}
              //   {/*  Play*/}
              //   {/*</button>*/}
              //   {/*<button onClick={() => player.muted(!state.muted)}>*/}
              //   {/*  Mute*/}
              //   {/*</button>*/}
              //   {/* more custom controls elements ... */}
              // </div>)
            }}
          </VideoPlayer>
        )
      }
    </div>
  )
}

export default observer(VideoScreen)
