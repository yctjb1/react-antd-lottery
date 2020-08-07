import React from 'react';
import { Button } from 'antd';
import SettingPage from '@pages/SettingPage'
import './App.less';

function App() {
  return (
    <div className="App">
      <header className="App-header">

        <Button type="primary">Learn React</Button>
        <SettingPage />
      </header>
    </div>
  );
}

export default App;
