import React, { useRef, useEffect } from 'react'
import { Chart as AntChart } from '@antv/g2'
import dayjs from 'dayjs'

import { IStatRecord } from '@/apis/data'

interface IChart {
  data: IStatRecord[]
}

const composeData = (data: IStatRecord[]): any[] => {
  const res: any[] = []
  data.forEach((item) => {
    const { onlineNum, senderNum, payedOrderNum, statTime } = item
    const time = dayjs(statTime).format('HH:mm')
    res.push(...[
      {
        time,
        value: onlineNum,
        name: '在线人数',
      },
      {
        time,
        value: senderNum,
        name: '发言人数',
      },
      {
        time,
        value: payedOrderNum,
        name: '下单人数',
      },
    ])
  })
  return res
}

const Chart: React.FC<IChart> = ({ data }) => {
  const el = useRef<any>()

  useEffect(() => {
    if (!el.current) return
    const chart = new AntChart({
      container: el.current,
      height: el.current.getBoundingClientRect().height - 20,
      autoFit: true,
    })

    chart
      .data(composeData(data))
      .encode('x', 'time')
      .encode('y', 'value')
      .encode('color', 'name')
    chart.axis('y', {
      label: null,  // 隐藏 y 轴标签
      tickLine: null,  // 隐藏 y 轴刻度线
      line: null,  // 隐藏 y 轴线
      tick: false,
      title: null,
    })
    chart.axis('x', {
      title: null,
    })
    chart.scale('value', {
      tickInterval: 1,
    })
    chart.line().encode('shape', 'smooth')
    chart.point().encode('shape', 'point').tooltip(false)
    chart.render()
    return () => {
      chart.destroy()
    }
  }, [data])

  return (
    <div ref={el} style={{ width: '100%', height: '100%', boxSizing: 'border-box' }} />
  )
}

export default Chart
