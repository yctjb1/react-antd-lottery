import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom'

export const HomeButton = (props: any) => <Link to="/home">
    <Button {...props}>返回首页</Button>
</Link>
export const LotteryButton = (props: any) => <Link to="/lottery">
    <Button type="primary" {...props}>抽奖页</Button>
</Link>
export const SettingButton = (props: any) => <Link to="/setting">
    <Button type="primary" danger {...props}>设置页</Button>
</Link>