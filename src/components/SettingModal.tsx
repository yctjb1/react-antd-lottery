import React, { useState, useEffect } from 'react';
import { Modal, Input, Tabs, Table, InputNumber, Button, message, Tooltip } from 'antd';
import {
    PlusCircleOutlined
} from '@ant-design/icons';
import { importExcel } from "@utils/handleExcel"
const { TabPane } = Tabs;


/**
 * 
 * @param props 
 * state from father:   props.tcOptions_settingModal,
 * state from father & need to back:    awardOptions,memberOptions
 * function from father:    handleSettingModal(status),backFromChild
 */

const SettingModal = (props: any) => {

    const [awardOptions, setAwardOptions] = useState(props.awardOptions);
    const [memberOptions, setMemberOptions] = useState(props.memberOptions);
    const [activePane, setActivePane] = useState("1");
    const [upLoadStatus, setUpLoadStatus] = useState("0")

    const awardColumns: any = [
        {
            dataIndex: 'awardlevel',
            title: '奖品等级',
            render: (text: any, record: any, index: any) => <Input value={text}
                onChange={(e) => updateInputValue("awardOptions", "awardlevel", index, e.target.value)} />

        },
        {
            dataIndex: 'awardname',
            title: '奖品名称',
            render: (text: any, record: any, index: any) => <Input value={text}
                onChange={(e) => updateInputValue("awardOptions", "awardname", index, e.target.value)} />
        },
        {
            dataIndex: 'awardnum',
            title: '奖品数量',
            render: (text: any, record: any, index: any) => <InputNumber value={text}
                min={0}
                onChange={(value) => updateInputValue("awardOptions", "awardnum", index, value)} />
        },
        {
            dataIndex: '操作',
            title: '删除',
            render: (text: any, record: any, index: any) => <Button type="primary" danger
                onClick={() => setAwardOptions(Object.assign({}, awardOptions, {
                    awards: awardOptions.awards.filter((item: any) => item.key !== record.key)
                }))}>
                删除
          </Button>
        }
    ]
    const palyerColumns: any = [
        {
            dataIndex: 'usercode',
            title: '编号',
            render: (text: any, record: any, index: any) => <Input value={text}
                onChange={(e) => updateInputValue("memberOptions", "usercode", index, e.target.value)} />
        },
        {
            dataIndex: 'username',
            title: '姓名',
            render: (text: any, record: any, index: any) => <Input value={record.username}
                onChange={(e) => updateInputValue("memberOptions", "username", index, e.target.value)} />
        },
        {
            dataIndex: '操作',
            title: '删除',
            render: (text: any, record: any, index: any) => <Button type="primary" danger
                onClick={() => setMemberOptions(Object.assign({}, memberOptions, {
                    members: memberOptions.members.filter((item: any) => item.key !== record.key)
                }))}>
                删除
          </Button>
        }
    ]

    const updateInputValue = (statename: any, dataIndex: any, rowindex: any, value: any) => {
        if (statename === "memberOptions") {
            let new_memberOptions = JSON.parse(JSON.stringify(memberOptions));
            new_memberOptions.members[rowindex][dataIndex] = value

            let repeat_flag = false;
            if (dataIndex === "usercode" || dataIndex === "username") {
                let exist_comb: any = [];
                new_memberOptions.members.map((item: any) => {
                    exist_comb.push(item.usercode + "_" + item.username)
                })
                repeat_flag = JSON.stringify(Array.from(new Set(exist_comb))) !== JSON.stringify(exist_comb)
            }

            if (repeat_flag) {
                message.warning("不允许出现“编号+姓名”名称完全一致的行", 5)
            } else {


                setMemberOptions(new_memberOptions)
            }
        } else if (statename === "awardOptions") {
            let new_awardOptions = JSON.parse(JSON.stringify(awardOptions));
            new_awardOptions.awards[rowindex][dataIndex] = value

            if (dataIndex === "awardnum") {
                value = Math.floor(value)
            }

            let repeat_flag = false;
            if (dataIndex === "awardlevel" || dataIndex === "awardname") {
                let exist_comb: any = [];
                new_awardOptions.awards.map((item: any) => {
                    exist_comb.push(item.awardlevel + "_" + item.awardname)
                })

                repeat_flag = JSON.stringify(Array.from(new Set(exist_comb))) !== JSON.stringify(exist_comb)
            }
            if (repeat_flag) {

                message.warning("不允许出现“奖品等级+奖品名称”名称完全一致的行", 5)
            } else {

                setAwardOptions(new_awardOptions)
            }

        }
    }
    const addRow = (activePane: any) => {
        if (activePane === "1") {
            let data = awardOptions.awards;
            let newkey = data.length ? `${Number(data[data.length - 1].key) + 1}` : "1";
            setAwardOptions(Object.assign({}, awardOptions, {
                awards: awardOptions.awards.concat({ awardlevel: "", awardname: "", awardnum: 0, key: newkey })
            }))
        } else if (activePane === "2") {
            let data = memberOptions.members;
            let newkey = data.length ? `${Number(data[data.length - 1].key) + 1}` : "1";
            setMemberOptions(Object.assign({}, memberOptions, {
                members: memberOptions.members.concat({ usercode: "", username: "", key: newkey })
            }))
        }
    }

    const addMemberFromFile = (e_target: any) => {
        // (importExcel(e_target) as Promise<any>).then((addMembers: any) => {
        importExcel(e_target).then((addMembers: any) => {
            if (addMembers && addMembers?.length) {

                let usercode_arr = addMembers.map((item: any) => item.usercode);
                if (JSON.stringify(Array.from(new Set(usercode_arr))) !== JSON.stringify(usercode_arr)) {
                    message.warning("excel中有重复的编号", 5)
                    setUpLoadStatus("2")

                } else {
                    let new_memberOptions = JSON.parse(JSON.stringify(memberOptions));
                    const prev_member = new_memberOptions.members
                    let newkey = prev_member.length ? `${Number(prev_member.slice(-1)[0].key) + 1}` : "1";

                    let exist_comb_record: any = {};//形如 [{'1_甲':number}]
                    prev_member.map((item: any) => {

                        exist_comb_record[item.usercode + "_" + item.username] = 1
                    })


                    let new_exist_comb_record = JSON.parse(JSON.stringify(exist_comb_record))
                    // console.log(new_exist_comb_record)

                    //下面代码除了添加每行excel新数据到旧state中，仅在若新旧数据的comb完全一致，新数据的名字后面加个(n+1)
                    addMembers.map((item: any) => {
                        let new_comb = item.usercode + "_" + item.username;


                        if (new_exist_comb_record[new_comb]) {

                            new_exist_comb_record[new_comb] += 1;
                            //同名出现n+1次 则 改为 名字(n+1)
                            new_memberOptions.members.push({
                                usercode: item.usercode,
                                username: `${item.username}(${new_exist_comb_record[item.usercode + "_" + item.username]})`,
                                key: newkey
                            })
                            newkey = `${Number(newkey) + 1}`;
                        } else {


                            new_exist_comb_record[new_comb] = 1
                            new_memberOptions.members.push({
                                usercode: item.usercode,
                                username: item.username,
                                key: newkey
                            })


                            newkey = `${Number(newkey) + 1}`;
                        }

                    });


                    setUpLoadStatus("1")
                    setMemberOptions(new_memberOptions)
                }




            }
        })
            .catch((e: any) => {
                setUpLoadStatus("2")
                console.log("异常")
                console.log(e)
            })

    }

    return <Modal title="抽奖设置" style={{ paddingTop: 8 }}
        visible={props.tcOptions_settingModal}
        onCancel={() => props.handleSettingModal(false)}
        footer={[
            <Button key="1" onClick={() => props.handleSettingModal(false)}>
                取消
            </Button>,
            <Button key="2" danger onClick={() => props.backFromChild(awardOptions, memberOptions, true)}>
                修改并重置
            </Button>,
            <Button key="3" type="primary" onClick={() => props.backFromChild(awardOptions, memberOptions, false)}>
                修改不重置
            </Button>
        ]}
    >
        <Tabs activeKey={activePane} onChange={(activeKey) => setActivePane(activeKey)}
            tabBarExtraContent={[
                <Button onClick={() => addRow(activePane)} key="2" style={{ marginRight: 4 }}>
                    <PlusCircleOutlined
                        style={{ display: "inline-grid", placeItems: "center" }} />增加行</Button>,
                <Button key="3" danger type="primary"
                    onClick={() => setMemberOptions(Object.assign({}, memberOptions, {
                        members: []
                    }))}>清空人员</Button>
            ]}>
            <TabPane tab="奖品" key="1">
                <Table
                    columns={awardColumns}
                    dataSource={awardOptions.awards}
                    rowKey={(record) => record.key}
                    pagination={false}></Table>
            </TabPane>
            <TabPane tab="人员" key="2">
                <Tooltip title={"excel第一个工作表中左顶格[编号]和[姓名]两列"}>
                    <input
                        type='file'
                        accept='.xlsx, .xls' style={{ display: "inline-block", width: "auto" }} onChange={(e) => {
                            e.persist()
                            addMemberFromFile(e.target)
                            e.target.value = ""//解决重复文件上传不触发onChange
                        }} />
                </Tooltip>
                {upLoadStatus === "1" ?
                    <span style={{ color: "green" }}>上传成功</span>
                    : upLoadStatus === "2" ?
                        <span style={{ color: "red" }}>上传失败</span>
                        : null

                }
                <Table
                    size="small"
                    columns={palyerColumns}
                    dataSource={memberOptions.members}
                    rowKey={(record) => record.key}
                    pagination={false}
                    scroll={{ y: 300 }}></Table>
            </TabPane>

        </Tabs>

    </Modal>
}
export default SettingModal;