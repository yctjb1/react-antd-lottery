import React, { Fragment, useEffect, useState } from 'react';
import { Button, Table, Switch, Select, message, Tooltip, Space } from 'antd';
import SettingModal from '@components/SettingModal';
import {
    PlayCircleOutlined, PauseCircleOutlined
} from '@ant-design/icons';
import { exportExcel, downloadTemplate } from "@utils/handleExcel"
import differenceWith from 'lodash/differenceWith';
import intersectionWith from 'lodash/intersectionWith';
import isEqual from 'lodash/isEqual';
import "./index.less"
import { result } from 'lodash';
const { Option } = Select;

interface AwardOptionType {
    awards: object[],
    currentAwardKey: string | number,
    currentAwardLeft: string | number
}

interface ResultType {
    awardKey: string | number,
    awardeeArr: AwardType[],
}

interface AwardType {
    awardlevel: string,
    awardname: string,
    awardnum: string | number,
    key: string | number
}



const getRandomInt = (min: any, max: any) => { //本函数在min和max之间取一个整数随机数(包头包尾)
    min = Math.ceil(min);//Math.ceil() 函数返回大于或等于一个给定数字的最小整数
    max = Math.floor(max);//Math.floor() 返回小于或等于一个给定数字的最大整数
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export default (props: any) => {
    const [tcOptions, setTCOptions] = useState({
        tcRunning: false,
        settingModal: false
    });//是否在旋转
    //tagcanvas的参数
    const [awardOptions, setAwardOptions] = useState({
        awards: [
            { awardlevel: "一等奖", awardname: "摩托", awardnum: 1, key: "1" },
            { awardlevel: "二等奖", awardname: "单车", awardnum: 2, key: "2" }
        ],//localStorage的awards所有奖项数组
        currentAwardKey: "1",//当前奖项在localStorage的awards所有奖项数组中的key
        currentAwardLeft: 0,//当前奖项剩余数量
    });//抽奖的设置参数-奖

    const [memberOptions, setMemberOptions] = useState({
        // players: [],//剩余总人数 ->分组后的剩余参与人员

        // currentPlayersIndex: 1,//当前所在批次(下标+1) 【考虑废弃】
        awardeePlayers: [],//本轮中奖名单

        members: [{ usercode: "01", username: "测试甲", key: "1" },
        { usercode: "02", username: "测试乙", key: "2" }],//总人数

        // batchNumber: 10,//每轮人数原本分批，现在【设置一次后】固定不变了 【考虑废弃】
        currentplayers: [],//当前总人数

        //leftplayersNumber: 10//剩余参与人数 【废弃】

    })//抽奖的设置参数-人

    const [lotterOptions, setLotterOptions] = useState({
        reducemode: true,//剔除中奖人模式
        shownowresult: false,//开关展示当前奖项已经出来的结果
        active_resultsNumber: 0,//指定抽中奖人数 --初值等于最大奖品数
        result: [],//中奖结果 [awardKey,awardeeArr]

    })//抽奖的设置参数-配置

    useEffect(() => {
        if (queryLocalStorage()) {

        } else {
            setMemberOptions(Object.assign({}, memberOptions, { currentplayers: memberOptions.members }))
            let maxNum = createOption(awardOptions)[0];
            setLotterOptions(Object.assign({}, lotterOptions, { active_resultsNumber: maxNum }))
            updateCurrentAwardLeft()
        }

        initTC()
    }, []);

    useEffect(() => {

        // eval(
        //     `TagCanvas.Reload('myCanvas');
        //     `
        // );
        if (tcOptions.tcRunning) {
            initTC("TagCanvas.SetSpeed('myCanvas', [5, 1]);TagCanvas.Reload('myCanvas')")
        } else {

            initTC()
        }

    }, [tcOptions.tcRunning, memberOptions, tcOptions.settingModal, awardOptions, lotterOptions])

    //方法区
    const initTC = (str?: string) => {
        eval(
            `try {
             TagCanvas.Start(
               'myCanvas',
               '',
               {textColour: null,
                dragControl: 1,
                decel: 0.95,
                textHeight: 14,
                minSpeed: 0.01,
                initial: [
                  0.1 * Math.random() + 0.01,
                  -(0.1 * Math.random() + 0.01),
                ]
            });
            ${!str ? "" : str}
           }
           catch(e) {
             document.getElementById('myCanvasContainer').style.display = 'none';
           }`
        );
    }
    const changeSpeed = (status: string) => {
        if (status === "start") {

            setTCOptions(Object.assign({}, tcOptions, { tcRunning: true }))
        } else if (status === "stop") {

            setTCOptions(Object.assign({}, tcOptions, { tcRunning: false }))
        }

    }

    const handleSettingModal = (status: boolean) => {
        setTCOptions(Object.assign({}, tcOptions, { settingModal: status }))
    }

    const backFromChild = (new_awardOptions: any, new_memberOptions: any, resetFlag: boolean) => {
        //剔除某项为空的数据
        new_awardOptions.awards = new_awardOptions.awards.filter((item: any) => {
            if (!item.awardlevel || !item.awardname || !item.awardnum) return false; else return true;
        })
        new_memberOptions.members = new_memberOptions.members.filter((item: any) => {
            if (!item.usercode || !item.username) return false; else return true;
        })






        const prevMembers = memberOptions.members;
        const newMembers = new_memberOptions.members
        const prevAwards = awardOptions.awards
        const newAwards = new_awardOptions.awards

        let diffMembers = differenceWith(prevMembers, newMembers, isEqual);
        let diffAwards = differenceWith(prevAwards, newAwards, isEqual);
        let deleteMembers = differenceWith(prevMembers, diffMembers, isEqual);
        let addMembers = differenceWith(newMembers, diffMembers, isEqual);
        let deleteAwards = differenceWith(prevAwards, diffAwards, isEqual);
        let addAwards = differenceWith(prevAwards, diffAwards, isEqual);




        /*
       【无论是否重置】
        (1)如果全部清空，会出现相同的key，出现相同的key但是awardlevel+awardname不同视为删除，清空result中该奖结果。
        (2)总奖池:剔除diffAwards,其他已经有的不去动,添加addAwards =>直接使用新值
        (3)总人数:剔除diffMembers,其他已经有的不去动，添加addMembers =>直接使用新值
        (4)已中奖的名单里,除了(1)的操作，也要剔除diffMembers  =>与new的总名单取交集

        清空awardeePlayers本轮中奖名单
        更新当前奖项剩余数量

        【不重置】
        啥也不做

        【重置】
        清空奖项
        剩余的参数人数重置
         */

        //(1)
        let special_delete_awardKeys: string[] = [];
        let delete_awardKeys: string[] = deleteAwards.map((item: any) => item.key);
        prevAwards.map((prevAward: any) => {
            newAwards.map((newAward: any) => {
                if (prevAward.key === newAward.key) {
                    if (prevAward.awardlevel !== newAward.awardlevel && prevAward.awardname !== newAward.awardname) {
                        special_delete_awardKeys.push(prevAward.key);
                    }
                }
            })
        })
        let new_lotterOptions = JSON.parse(JSON.stringify(lotterOptions));
        new_lotterOptions.result.map((item: any, index: any) => {
            if (special_delete_awardKeys.indexOf(item.awardKey) > -1
                || delete_awardKeys.indexOf(item.awardKey) > -1) {
                delete new_lotterOptions.result[index]
            }
        })
        new_lotterOptions.result = new_lotterOptions.result.filter((item: any) => item)
        //(4)
        new_lotterOptions.result = new_lotterOptions.result.map((item: any) => {
            item.awardeeArr = intersectionWith(item.awardeeArr, newMembers, isEqual);
        })
        new_memberOptions.awardeePlayers = [];

        //更新剩余数量
        let currentAwardLeft = 0;
        let now_result_item: ResultType[] = new_lotterOptions.result.filter((item: any) => item?.awardKey == new_awardOptions.currentAwardKey);
        let exist_num = now_result_item.length ? now_result_item[0].awardeeArr.length : 0;
        new_awardOptions.awards.map((item: any) => {
            if (item.key === new_awardOptions.currentAwardKey) {
                currentAwardLeft = Number(item.awardnum);
            }
            currentAwardLeft -= exist_num;
        })
        new_awardOptions.currentAwardLeft = currentAwardLeft;



        if (resetFlag) {//重置
            new_lotterOptions.result = [];
            new_memberOptions.currentplayers = new_memberOptions.members;
        } else {//不重置

        }

        handleSettingModal(false)
        setAwardOptions(new_awardOptions)
        setMemberOptions(new_memberOptions)
        setLotterOptions(new_lotterOptions)
    }

    const handleChangeAward = (val: any) => {


        //清空当前中奖者
        setMemberOptions(Object.assign({}, memberOptions, { awardeePlayers: [] }))

        let currentAwardKey: any, new_awardOptions: any;





        if (val === "next") {
            let newindex = -1;
            let data = awardOptions.awards;
            data.map((item: any, index: any) => {
                if (item.key === awardOptions.currentAwardKey) {
                    newindex = index + 1
                }
            })

            if (newindex > -1 && newindex <= data.length - 1) {

                currentAwardKey = data[newindex].key;
            } else {
                return
            }
        } else {
            currentAwardKey = val;
        }


        //更新剩余数量【得手动写一份】
        let currentAwardLeft = 0;
        let now_result_item: ResultType[] = lotterOptions.result.filter((item: any) => item.awardKey == currentAwardKey);
        let exist_num = now_result_item.length ? now_result_item[0].awardeeArr.length : 0;
        awardOptions.awards.map((item: any) => {
            if (item.key === currentAwardKey) {
                currentAwardLeft = Number(item.awardnum);
            }
            currentAwardLeft -= exist_num;
        })
        new_awardOptions = Object.assign({}, awardOptions, { currentAwardKey, currentAwardLeft });

        //每次切换，设置的中奖人数重置为最大值
        let maxNum = createOption(new_awardOptions)[0];
        setLotterOptions(Object.assign({}, lotterOptions, { active_resultsNumber: maxNum }))

        setAwardOptions(new_awardOptions)


    }
    const handleStop = () => {

        let active_resultsNumber = lotterOptions.active_resultsNumber//本轮设置的中奖人数

        const maxAwardNum = createOption(awardOptions)[0];//当前奖品最大数量
        const leftAwardNum = awardOptions.currentAwardLeft   //当前奖项剩余数量
        let temp_leftAwardNum = leftAwardNum;
        let maxMembers = JSON.parse(JSON.stringify(memberOptions.members));//总名单
        let currentplayers = JSON.parse(JSON.stringify(memberOptions.currentplayers));//剩余名单

        let leftplayersNumber = lotterOptions.reducemode ? currentplayers.length : maxMembers.length;//剩下的参与人数

        let now_awardIndex = -1;//当前奖项key所在result中下标

        let new_result: ResultType[] = JSON.parse(JSON.stringify(lotterOptions.result))
        let result_prev_awardees: any[] = [];//各个奖项的已中奖者名单
        new_result.length && new_result.map((item: any, index: any) => {
            if (item.awardKey === awardOptions.currentAwardKey) {
                now_awardIndex = index;
            }
            result_prev_awardees.push(...item.awardeeArr)
        })




        //实际获取随机数的次数
        const RANDOM_NUM = Math.min(active_resultsNumber, maxAwardNum, leftAwardNum, leftplayersNumber);

        let random_num = RANDOM_NUM;
        console.log("受控的理论真正中奖者数量:" + RANDOM_NUM)
        let new_awardeePlayers: any[] = [];//本轮中奖名单
        for (let i = 0; i < random_num && new_awardeePlayers.length < active_resultsNumber; i++) {

            let new_awardeeIndex = getRandomInt(0, leftplayersNumber - 1);
            let new_awardee = lotterOptions.reducemode ? currentplayers[new_awardeeIndex] : maxMembers[new_awardeeIndex];
            // 打印参数
            // console.log(`中奖者下标=${new_awardeeIndex},中奖者名字=${new_awardee?.username},中奖者key=${new_awardee?.key},new_awardeePlayers=${JSON.stringify(new_awardeePlayers)}`)

            if (JSON.stringify(new_awardeePlayers).indexOf(JSON.stringify(new_awardee)) > -1) {//如果在本轮中奖名单里重复
                random_num += 1;//继续抽一次


            } else {

                let batch_prev_awardees = now_awardIndex > -1 ? new_result[now_awardIndex]["awardeeArr"] : [];//如果该奖已经抽过，则传入已经存在的中奖者

                //无论是否是剔除模式，确保每轮抽奖里一个人的名字只会出现一次、同一个奖项里一个人的名字也只出现一次

                if (JSON.stringify(batch_prev_awardees).indexOf(JSON.stringify(new_awardee)) > -1) {//如果已经在当前奖项的中奖者里面

                    random_num += 1;//继续抽一次

                } else if (JSON.stringify(result_prev_awardees).indexOf(JSON.stringify(new_awardee)) > -1) {//如果中过别的奖

                    if (lotterOptions.reducemode) {//剔除模式--剔除模式下如果进了这分支就是有逻辑写错了

                        random_num += 1;//继续抽一次
                    } else {//非剔除模式
                        new_awardeePlayers.push(new_awardee)
                        temp_leftAwardNum--;

                    }
                } else {
                    new_awardeePlayers.push(new_awardee);
                    temp_leftAwardNum--;
                    leftplayersNumber--;
                    lotterOptions.reducemode && currentplayers.splice(new_awardeeIndex, 1)//从抽奖名单中拿掉
                    console.log(`剔除了一次，并查看新的new_awardeeIndex = ${new_awardeeIndex},currentplayers=`)
                    console.log(currentplayers)
                }



                // //如果剩余奖品不为0、而且当前轮中奖数量没达到要求、并且人数还够,则继续抽一次
                // if (leftAwardNum > 0 && currentplayers.length > 0) {
                //     random_num += 1;
                // }
            }
        }












        if (now_awardIndex > -1) {
            new_result[now_awardIndex]?.awardeeArr.push(...new_awardeePlayers)
        } else {
            new_result.push({ awardKey: awardOptions.currentAwardKey, awardeeArr: new_awardeePlayers })
        }


        let new_memberOptions;//state1
        if (lotterOptions.reducemode) {
            new_memberOptions = Object.assign({}, memberOptions, { currentplayers, awardeePlayers: new_awardeePlayers })
            setMemberOptions(new_memberOptions)//剔除模式就更新剩余名单
        } else {
            new_memberOptions = Object.assign({}, memberOptions, { awardeePlayers: new_awardeePlayers })
            setMemberOptions(new_memberOptions)

        }

        let new_lotterOptions = Object.assign({}, lotterOptions, {
            shownowresult: true,
            result: new_result
        })//state2
        setLotterOptions(new_lotterOptions)

        //确保新数据能更新到localStorage，得提前封装一份，所以改成手动再写一遍更新剩余数量
        // updateCurrentAwardLeft(awardOptions.currentAwardKey, RANDOM_NUM)//更新该奖剩余数量

        let new_awardOptions = Object.assign({}, awardOptions, { currentAwardLeft: maxAwardNum - new_awardeePlayers.length });//state3
        setAwardOptions(new_awardOptions)

        let new_tcOptions = Object.assign({}, tcOptions, { tcRunning: false });//state4
        setTCOptions(new_tcOptions);//停止旋转

        //更新localStorage
        updateLocalStorage("updateAll", {
            tcOptions: new_tcOptions,
            awardOptions: new_awardOptions,
            memberOptions: new_memberOptions,
            lotterOptions: new_lotterOptions
        })

    }

    const handleClear = (mode: string, reducemode?: boolean) => {
        if (mode === "all") {

            setMemberOptions(Object.assign({}, memberOptions, { currentplayers: memberOptions.members, awardeePlayers: [] }));
            let new_lotterOptions = Object.assign({}, lotterOptions, {
                shownowresult: false,
                reducemode: reducemode || false,
                result: []
            })

            setLotterOptions(new_lotterOptions)
            updateCurrentAwardLeft(awardOptions.currentAwardKey, 0, new_lotterOptions)
            updateLocalStorage("clearAll")
        }
    }

    const handleReduceMode = (val: boolean) => {
        // setLotterOptions(Object.assign({}, lotterOptions, { reducemode: val }))
        handleClear("all", val)//重置
    }

    const updateCurrentAwardLeft = (awardKey?: any, reduceNum?: any, new_lotterOptions?: any) => {
        let currentAwardKey = awardKey || "1";
        let currentAwardLeft = 0;
        let now_result_item: ResultType[] = (new_lotterOptions || lotterOptions).result.filter((item: any) => item.awardKey === currentAwardKey);
        let exist_num = now_result_item.length ? now_result_item[0].awardeeArr.length : 0;
        awardOptions.awards.map((item: any) => {
            if (item.key === currentAwardKey) {
                currentAwardLeft = Number(item.awardnum);

                if (reduceNum) {
                    currentAwardLeft -= reduceNum;
                }
                currentAwardLeft -= exist_num;

            }
        })

        setAwardOptions(Object.assign({}, awardOptions, { currentAwardLeft }))
    }

    const updateLocalStorage = (flag: string, allState?: any) => {
        if (flag && flag === "clearAll") {
            localStorage.removeItem("react_antd_lottery");
        } else {

            localStorage.setItem("react_antd_lottery", JSON.stringify(allState));
        }

    }

    const queryLocalStorage = (): boolean => {
        let react_antd_lottery: any = localStorage.getItem("react_antd_lottery") || undefined;
        if (react_antd_lottery) {
            react_antd_lottery = JSON.parse(react_antd_lottery)
            setTCOptions(react_antd_lottery.tcOptions)
            setAwardOptions(react_antd_lottery.awardOptions)
            setMemberOptions(react_antd_lottery.memberOptions)
            setLotterOptions(react_antd_lottery.lotterOptions)
            return true
        } else {

            return false
        }
    }

    const handleExport = () => {
        const result = lotterOptions.result;
        const awards = awardOptions.awards;
        let export_json: any = []
        result.map((result_item: any) => {
            let award = awards.filter((item: any) => item.key === result_item.awardKey)[0]
            export_json[award.awardlevel] = result_item.awardeeArr;
        })
        exportExcel(export_json);
    }

    //UI组件区
    const createOption = (awardOptions: AwardOptionType): number[] => {
        let maxNum = 0;
        awardOptions.awards.map((item: any) => {
            if (item.key === awardOptions.currentAwardKey) {
                maxNum = Number(item.awardnum) < 0 ? 0 : Number(item.awardnum);
            }
        })

        let arr: number[] = [];
        for (let i = maxNum; arr.push(i--) < maxNum + 1;) { }
        return arr;
    }


    const LeftPart = () => <Fragment>

        <ul className={"operation_ul"}>
            <li>奖项:
            <Select value={awardOptions.currentAwardKey} style={{ width: 120 }}
                    disabled={tcOptions.tcRunning}
                    onChange={(value) => handleChangeAward(value)}>
                    {awardOptions.awards.map((item: any) => <Option key={item.key} value={item.key}>
                        {item.awardlevel}
                    </Option>
                    )}
                </Select>
            </li>
            <li>
                <Tooltip title={"注:切换剔除将重置中奖结果"}>
                    <Switch disabled={tcOptions.tcRunning}
                        checkedChildren="剔除已中奖" unCheckedChildren="保留已中奖" checked={lotterOptions.reducemode}
                        onChange={(val) => handleReduceMode(val)} />
                        剩余:<b>{memberOptions.currentplayers.length}人</b>
                </Tooltip>
            </li>
            <li>
                {!tcOptions.tcRunning ?
                    <Button onClick={() => changeSpeed("start")}
                        disabled={createOption(awardOptions)[0] <= 0 || awardOptions.currentAwardLeft <= 0 || memberOptions.currentplayers.length === 0}
                        style={{ borderRadius: "25px 0 0 25px" }}
                        icon={<PlayCircleOutlined style={{ display: "inline-grid", placeItems: "center" }} />} >{
                            awardOptions.currentAwardLeft < createOption(awardOptions)[0] ?
                                "继续" : "开始"
                        }</Button>
                    : <Button onClick={() => handleStop()}
                        style={{ borderRadius: "25px 0 0 25px" }}
                        icon={<PauseCircleOutlined style={{ display: "inline-grid", placeItems: "center" }} />}
                    >停止</Button>
                }

                <Button style={{ borderRadius: "0 25px 25px 0" }}
                    disabled={tcOptions.tcRunning || awardOptions.currentAwardKey === awardOptions.awards.slice(-1)[0].key}
                    onClick={() => handleChangeAward("next")}>下一个奖</Button></li>
            <li>

                <Tooltip title={"注:可以选择的范围取决于当前奖品总数"} placement="bottom">
                    <span>本轮中奖人数</span>
                </Tooltip>
                <Select
                    value={lotterOptions.active_resultsNumber}
                    disabled={tcOptions.tcRunning}
                    onChange={(value) => setLotterOptions(Object.assign({}, lotterOptions, { active_resultsNumber: value }))}>

                    {createOption(awardOptions).map((item: any) => <Option key={item} value={item}>
                        {item}
                    </Option>
                    )}
                </Select>

                {/* <br /><span>奖池所剩<b>{awardOptions.currentAwardLeft}</b>个</span> */}
            </li>
            <li>
                <Button style={{ marginRight: 4 }} size="small"
                    disabled={tcOptions.tcRunning}
                    onClick={() => handleSettingModal(true)}>设置</Button>
                <Tooltip title={"注:重置会连同清空本地存储数据，刷新后会丢失，可以中奖人数设0后抽取一次来记录数据"} placement="bottom">
                    <Button style={{ marginRight: 4 }} size="small"
                        disabled={tcOptions.tcRunning}
                        onClick={() => handleClear("all", lotterOptions.reducemode)}>重置所有</Button>
                </Tooltip>
            </li>
            <li>
                <Button size="small" disabled={tcOptions.tcRunning || lotterOptions.result.length === 0}
                    onClick={() => handleExport()}>导出全部</Button>
                <Button size="small" type={"link"}
                    onClick={() => downloadTemplate()}>下载模板</Button>
            </li>
        </ul>
    </Fragment>

    const RightPart = () => {
        let result: ResultType = lotterOptions.result.filter((item: any) => item.awardKey === awardOptions.currentAwardKey)[0];
        return <Fragment>
            {
                lotterOptions.shownowresult && result && result?.awardeeArr.length !== 0 ?
                    <Table
                        title={(currentPageData) => "获奖名单"}
                        columns={[
                            {
                                dataIndex: 'username',
                                title: '姓名',
                                width: 100,
                            },
                            {
                                dataIndex: 'usercode',
                                title: '编号',
                                width: 100,
                            }
                        ]}
                        dataSource={result?.awardeeArr}
                        rowKey={(record) => record?.key}
                        pagination={false}// 考虑前端分页
                        size={"small"}
                        scroll={{ y: 400 }}
                    ></Table>
                    : null
            }
        </Fragment>
    }

    const BodyPart = () => <div>
        <div id="myCanvasContainer">
            <canvas id="myCanvas" height={document.documentElement.clientHeight - 150} width={document.documentElement.clientWidth - 200 - 250}>
                <p>Anything in here will be replaced on browsers that support the canvas element</p>
                {/* 超出一定数量设定截取渲染 */}
                <ul>
                    {
                        memberOptions.currentplayers.length > 400 ?
                            memberOptions.currentplayers.slice(0, 400).map((item: any, index) => <li key={item.usercode}>
                                <a href="#" target="_blank" style={{ color: "#fff" }}>{item.username}</a>
                            </li>)
                            :
                            memberOptions.currentplayers.map((item: any, index) => <li key={item.usercode}>
                                <a href="#" target="_blank" style={{ color: "#fff" }}>{item.username}</a>
                            </li>)}
                </ul>

            </canvas>
        </div>

    </div>

    //return区
    return <div style={{
        background: `url(./bg.jpg)`, backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
    }}>
        {/* 布局 */}
        <div style={{
            display: "grid",
            gridTemplate: "1fr auto / auto 1fr auto"
        }}>
            <div style={{ gridColumn: "1/2", color: "#fff", display: "grid", placeItems: "center" }}>
                <LeftPart />
            </div>
            <div style={{ gridColumn: "2/3", height: "100vh", color: "#fff" }}>
                <BodyPart />
            </div>
            <div style={{ gridColumn: "3/4", color: "#fff", display: "grid", placeItems: "end center" }}>
                <RightPart />
            </div>
            <div style={{ gridColumn: "1/4", height: "0vh", color: "#fff", display: "grid", placeItems: "center" }}>

                {/* 调试用---把0vh改成有效值，同时变更BodyPart上一级div的vh */}
                {/* 当前最大值：{createOption(awardOptions)[0]}<br />
                当前剩余数量:{awardOptions.currentAwardLeft}<br />
                <Button onClick={() => {
                    console.log(JSON.stringify(memberOptions.currentplayers))
                }}>查看剩余参与者名单</Button> */}



            </div>


        </div>
        {tcOptions.settingModal ?
            <SettingModal
                tcOptions_settingModal={tcOptions.settingModal}
                awardOptions={awardOptions}
                memberOptions={memberOptions}
                handleSettingModal={handleSettingModal}
                backFromChild={backFromChild}
            />
            : null}


        {awardOptions.awards.map((item: any) => {
            if (item.key === awardOptions.currentAwardKey) {
                return <div key="1" className="showAward">
                    <b>{item.awardlevel}：{item.awardname}（{awardOptions.currentAwardLeft}/{createOption(awardOptions)[0]}）</b>
                    {/* 本轮中奖名单-展示用 */}
                    <Space size={[8, 16]} wrap style={{
                        width: "80%",
                        placeContent: "center"
                    }}>
                        {memberOptions.awardeePlayers.map((item: any, index) =>
                            <Button key={index} size={"large"}>{item.username}</Button>
                        )}
                    </Space>
                </div>
            }

        })}

    </div>
}



