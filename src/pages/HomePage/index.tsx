import React, { Fragment } from 'react';
import { LotteryButton, SettingButton } from '@components/commonButton'
const HomePage = (props: any) => <Fragment>
    <div style={{
        display: "grid",
        placeItems: "center",
        height: "100vh"
    }}>
        <div style={{ textAlign: "center" }}>
            <LotteryButton style={{ marginRight: 10 }} />
            <SettingButton style={{ marginLeft: 10 }} />
        </div>

    </div>

</Fragment>

export default HomePage