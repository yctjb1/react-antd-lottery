import React, { Fragment } from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import HomePage from '@pages/HomePage';
// import SettingPage from '@pages/SettingPage';
// import LotteryPage from '@pages/LotteryPage';


const PageMainRouter = (props: any) => <Fragment>
    <Router>
        <Switch>
            <Redirect exact from="/" to="/home" />
            <Route exact path="/home" component={HomePage} />
            {/* 不分页面了，直接一个页面里解决 */}
            {/* <Route exact path="/setting" component={SettingPage} />
            <Route exact path="/lottery" component={LotteryPage} />
            <Route exact path="/demoTailwind" component={DemoTailwindPage} /> */}
        </Switch>
    </Router>

</Fragment>

export default PageMainRouter