import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Alert, Button, Input, InputNumber, Form, Tooltip, Tag, Space, message, Card } from "antd";
import type { InputRef } from "antd"
import EmotionSelector from "@/components/EmotionSelector";
import { GiftOutlined, PlusOutlined } from "@ant-design/icons";
import useOrcaRequest from "@/hooks/useRequest";
import { IGift, queryRoomGiftList } from "@/apis/marketing";
import { IAtmosphere, queryAtmosphere, sendAtmosphere, stopSendAtmosphere } from "@/apis/atmosphere";
import "./control.less"
import { authStore } from "@/stores";
import { CommonRes } from "@/apis/interface";
import { getTimeDiff } from "@/utils/time"

const tagInputStyle: React.CSSProperties = {
  width: 160,
  height: 28,
  marginInlineEnd: 8,
  verticalAlign: 'middle',
};
const tagPlusStyle: React.CSSProperties = {
  height: 28,
  lineHeight: "28px",
  borderStyle: 'dashed',
};
const layout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};
const GiftMsgPrefix = '礼物id:'

const Control = () => {
  const [msgList, setMsgList] = useState<string[]>([]);
  const [giftList, setGiftList] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);
  const [expireTime, setExpireTime] = useState<string>();
  const [allowSend, setAllowSend] = useState<boolean>(true);
  const [atmosphereData, setAtmosphereData] = useState<IAtmosphere | null>(null);
  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
    if (removedTag.indexOf(GiftMsgPrefix) > -1) {
      giftList.splice(giftList.indexOf(removedTag), 1);
      setGiftList(giftList);
    } else {
      msgList.splice(msgList.indexOf(removedTag), 1);
      setMsgList(msgList);
    }
  };
  const handleInputConfirm = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault()
    if (inputValue) {
      if (tags.includes(inputValue)) {
        message.error("请不要添加重复消息！")
      } else {
        setTags([...tags, inputValue]);
        setInputVisible(false);
        setInputValue('');
        if (inputValue.indexOf(GiftMsgPrefix) > -1) {
          setGiftList([...giftList, inputValue])
        } else {
          setMsgList([...msgList, inputValue]);
        }
      }
    }
  };

  const selectEmotion = (emotion: string) => {
    setInputVisible(true);
    setInputValue(inputValue + emotion);
    inputRef.current?.focus()
  }
  const selectGift = (gift: IGift) => {
    const pickGift = `${GiftMsgPrefix}${gift.id}`
    if (tags.includes(pickGift)) {
      return message.error("请不要添加重复礼物！")
    }
    setTags([...tags, pickGift]);
    setGiftList([...giftList, pickGift])
  }
  const [{data: giftRes}] = useOrcaRequest(queryRoomGiftList, {}, {})
  const [{run: getAtmosphere, loading}] = useOrcaRequest(queryAtmosphere, {manual: true}, {
    onSuccess(result: CommonRes<IAtmosphere>) {
      const {data} = result
      setAtmosphereData(data)
      let tags: string[] = []
      if (data) {
        if (data.textContentList) {
          // const msgList = JSON.parse(data.textContent)
          const msgList = data.textContentList
          setMsgList(msgList)
          tags.push(...msgList)
        }
        if (data.giftIdList) {
          // const giftIdList: number[] = JSON.parse(data.giftContent as string)
          const giftIdList = data.giftIdList
          const giftList = giftIdList.map(item => GiftMsgPrefix + item)
          setGiftList(giftList)
          tags.push(...giftList)
        }
        setExpireTime(data.expEndTime)
        setTags(tags)
        form.setFieldValue("quantity", data.quantity);
        form.setFieldValue("textInterval", data.textInterval);
        form.setFieldValue("giftInterval", data.giftInterval);
      }
    }
  })
  const [{run: finishSend}] = useOrcaRequest(stopSendAtmosphere, {manual: true}, {
    onSuccess(result) {
      if (result.code === 200) {
        message.success("场控已停止！")
        setAllowSend(true)
      } else {
        message.error(result.msg)
      }
    }
  })
  const gifts = giftRes?.data || []
  const [form] = Form.useForm()
  const [{run: sendAtmosphereHandler}] = useOrcaRequest(sendAtmosphere, {manual: true}, {
    onSuccess(result) {
      message.success("发送成功！")
      setAtmosphereData(result.data)
      setExpireTime(result.data.expEndTime)
    }
  })

  useEffect(() => {
    if (!authStore.roomId) return
    getAtmosphere(authStore.roomId)
  }, [authStore.roomId])

  const renderGifts = () => {
    return (
      <ul className="robot-send-gift__tooltip-inner">
        {
          gifts.map((gift) => (
            <li
              key={gift.id}
              onClick={() => selectGift(gift)}>
              <img src={gift.img} alt=""/>
            </li>
          ))
        }
      </ul>
    )
  }

  const onFinish = (v: any) => {
    if (!tags.length) {
      return message.error("发送内容不能为空！")
    }
    const giftIds = giftList.map(item => Number(item.split(":")[1]))
    sendAtmosphereHandler({
      roomId: authStore.roomId,
      textContentList: msgList,
      giftIdList: [...new Set(giftIds)],
      textInterval: v.textInterval,
      quantity: v.quantity,
      giftInterval: v.giftInterval,
    })
  }

  useEffect(() => {
    let timeId: any = null
    if (expireTime) {
      const diff = getTimeDiff(expireTime)
      if (diff > 0) {
        setAllowSend(false)
        timeId = setTimeout(() => {
          setAllowSend(true);
        }, diff * 1000);
      } else {
        setAllowSend(true)
      }
    }
    return () => {
      if (timeId) clearTimeout(timeId)
    }
  }, [expireTime]);

  const stopSendHandler = () => {
    if (atmosphereData) {
      finishSend(atmosphereData.id)
    }
  }

  return (
    <Card classNames={{body: "atmosphere-container"}} bordered={false} loading={loading}>
      <Alert
        style={{marginBottom: 6, marginTop: 6}}
        message={(<div
          style={{fontSize: 12}}>该模式以随机数字人身份发送互动消息，可多次触发，配合直播过程中主播的问题进行回复</div>)}
        type="info" showIcon/>
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish}
        form={form}
      >
        <Form.Item label="发送内容" rules={[{required: true}]}>
          <Space size={[4, 4]} wrap>
            {tags.map<React.ReactNode>((tag, index) => {
              const isLongTag = tag.length > 20;
              const tagElem = (
                <Tag
                  key={`${index}:${tag}`}
                  closable={true}
                  style={{userSelect: 'none', height: 28, lineHeight: "28px"}}
                  onClose={() => handleClose(tag)}>
                  <span> {isLongTag ? `${tag.slice(0, 20)}...` : tag} </span>
                </Tag>
              );
              return isLongTag ? (<Tooltip title={tag} key={tag}> {tagElem}</Tooltip>) : (tagElem);
            })}
            {inputVisible ? (
              <Input
                ref={inputRef}
                type="text"
                size="small"
                style={tagInputStyle}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={(e: React.KeyboardEvent) => handleInputConfirm(e)}
              />
            ) : (
              <Tag style={tagPlusStyle} icon={<PlusOutlined/>}
                   onClick={() => setInputVisible(true)}>请添加消息内容</Tag>
            )}
          </Space>
          <div className="extra-btns">
            <EmotionSelector onSelect={selectEmotion}>
              <i className="emoji-icon orca-bg-contain"/>
            </EmotionSelector>
            {
              gifts.length ? (
                <Tooltip
                  className="robot-send-gift__tooltip"
                  color="#FFF"
                  placement="top"
                  trigger="hover"
                  title={renderGifts}
                >
                  <GiftOutlined style={{fontSize: 20}}/>
                </Tooltip>
              ) : null
            }
          </div>
        </Form.Item>
        <Form.Item name="quantity" label="发送数量" rules={[{required: true}]}>
          <InputNumber min={1} max={300} value={1} placeholder="请输入发送数量" addonAfter="条"/>
        </Form.Item>
        <Form.Item name="textInterval" label="消息间隔时间">
          <InputNumber min={1} step={1} value={1} placeholder="请输入消息间隔时间" addonAfter="秒"/>
        </Form.Item>
        <Form.Item name="giftInterval" label="礼物间隔时间">
          <InputNumber min={1} step={1} value={1} placeholder="请输入礼物间隔时间" addonAfter="秒"/>
        </Form.Item>

        <Form.Item wrapperCol={{...layout.wrapperCol, offset: 18}}>
          {
            allowSend ? (
              <Button type="primary" htmlType="submit">发送</Button>
            ) : (<Button type="primary" onClick={() => stopSendHandler()} danger={true}>停止</Button>)
          }
        </Form.Item>
      </Form>
    </Card>
  )
}

export default Control
