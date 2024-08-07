import React from 'react'

import ChatMessageModule from '@/containers/ChatMessageModule'
import BroadcastManage from '@/containers/BroadcastManage'
import UserManage from '@/containers/UserManage'
import UserTable from '@/containers/UserTable'
import VideoScreen from '@/containers/Broadcast/Video'

import './index.less'

const Home = () => {
  return (
    <div className="orca-ass-control-page">
      <div className="orca-ass-control-page__left">
        <div className="video-screen__module">
          <VideoScreen />
        </div>
        <ChatMessageModule />
      </div>
      <BroadcastManage />
      <UserManage />
      {/*<UserTable />*/}
    </div>
  )
}

export default Home
