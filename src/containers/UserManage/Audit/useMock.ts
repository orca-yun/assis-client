import React, { useState, useEffect } from 'react'

let id = 0

const MsgsMap = [
  '老师讲的太棒啦',
  '大家觉得如何呢?',
  '哈哈哈',
  '阿克苏发件方垃圾分类',
  'ask发沙发上福利卡',
  '阿森纳发送发发发,' +
  '饿哦我问额u图片无恶徒我饿配图为',
  'ask发顺丰卡激发节流阀',
  '阿斯f艾哈华发股份',
  '阿是法芙娜撒了；撒龙卷风撒； ',
  'asfjajfajfgjagljsa',
]

const useMock = () => {
  const [data, setData] = useState<any>([])

  const genData = () => {
    // 每次mock 1 - 10条数据
    // const randomNum = Math.ceil(Math.random() * 10)
    const randomNum = 100
    setData(
      Array.from({ length: randomNum })
        .map(() => {
          const msgId = id++
          const nickname = `用户_${msgId}_${Math.ceil(Math.random() * 10000)}`
          return {
            id: msgId,
            ts: Date.now(),
            uid: msgId,
            nickname,
            msgType: 'normal',
            msgUid: msgId,
            senderHeadIco: '',
            senderName: nickname,
            senderType: 1,
            senderUid: msgId,
            data: MsgsMap[Math.floor(Math.random() * 11)] || '哈哈哈哈',
            quotaData: 'xxx',
          }
        })
    )
  }

  useEffect(() => {
    genData()
    // 固定5smock一次数据
    setInterval(genData, 5000)
  }, [])
  return [data]
}

export default useMock
