import './App.css';
 import {message} from "antd";
import Dashboard from "./view/dashboard";
import Login from './view/login'
import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import 'antd/dist/antd.css'

message.config({
  duration: 2,
});

const App = props => (
  <Router>
      <Switch>
          <Route exact path='/' component={Login}/>
          <Route exact path='/dashboard' component={Dashboard}/>
      </Switch>
  </Router>
)

export default App;
