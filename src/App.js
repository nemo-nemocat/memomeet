import React, { Component } from 'react';
import { BrowserRouter as Router, Route, BrowserRouter } from 'react-router-dom';
import { Home, Signin, Signup } from './pages';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
      <Router>
        <div>
          <BrowserRouter>
            <Route exact path='/' component={Home}/>
            <Route path='/Signin' component={Signin}/>
            <Route path='/Signup' component={Signup}/>
          </BrowserRouter>
        </div>
      </Router>
    </div>


    );
  }
}

export default App;