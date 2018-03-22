import React, { Component } from 'react';
import Header from "./components/Header/Header";
import Navbar from "./components/Navigation/Navbar/Navbar";
import styles from './App.css';
import Markets from './components/Markets/Markets';
import MyTrades from './components/MyTrades/MyTrades';
import About from './components/About/About';
import { BrowserRouter as Router, Route } from "react-router-dom";

import PageShell from './hoc/PageShell/PageShell';

class App extends Component {
  render() {
    return (
      <Router>
        <div className={styles.App}>
          <Header />
          <div className={styles.Background}>
            <div className={styles.Container}>
              <Navbar></Navbar>
              <div style={{display: 'flex', height: '100vh'}}>
                <Route exact path="/" component={PageShell(Markets)} />
                <Route path="/MyTrades" component={PageShell(MyTrades, true)} />
                <Route path="/About" component={About} />
              </div>
            </div>
            <footer className={styles.Footer}>This site is not affiliated with AirSwap</footer>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
