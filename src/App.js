import React, { Component } from 'react';
import { BrowserRouter as Router, Route, BrowserRouter } from 'react-router-dom';
import { Home, Signup, Main, Main2 } from './pages';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
      <Router>
        <div>
          <BrowserRouter>
            <Route exact path='/' component={Home}/>
            <Route path='/Signup' component={Signup}/>
            <Route path='/Main' component={Main}/>
            <Route path='/Main2' component={Main2}/>
          </BrowserRouter>
        </div>
      </Router>
    </div>


    );
  }
}

export default App;