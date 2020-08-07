import React, { Fragment } from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import HomePage from '@pages/HomePage';
import SettingPage from '@pages/SettingPage';
import LotteryPage from '@pages/LotteryPage';


const PageMainRouter = (props: any) => <Fragment>
    <Router>
        <Switch>
            <Redirect exact from="/" to="/home" />
            <Route exact path="/home" component={HomePage} />
            <Route exact path="/setting" component={SettingPage} />
            <Route exact path="/lottery" component={LotteryPage} />
        </Switch>
    </Router>

</Fragment>

export default PageMainRouter