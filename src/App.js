import React from 'react';
import Navigation from './components/Navigation';
import { BrowserRouter as Router, Route, BrowserRouter } from 'react-router-dom';
import { Home, Signin, Signup, StartMt, AdminMt } from './pages';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navigation />
      <Router>
        <div>
          <BrowserRouter>
            <Route exact path='/' component={Home}/>
            <Route path='/Signin' component={Signin}/>
            <Route path='/Signup' component={Signup}/>
            <Route path='/StartMt' component={StartMt}/>
            <Route path='/AdminMt' component={AdminMt}/>
          </BrowserRouter>
        </div>
      </Router>
    </div>
  );
}

export default App;