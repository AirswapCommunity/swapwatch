import React from "react";
import styles from "./Navbar.css";
import NavigationItem from "../NavigationItem/NavigationItem";
import { withRouter } from 'react-router'

const Navbar = props => {
  return (
    <ul className={styles.Navbar}>
      <NavigationItem link="/" active={props.location.pathname === '/'}>Markets</NavigationItem>
      <NavigationItem link="/MyTrades" active={props.location.pathname === '/MyTrades'}>My Trades</NavigationItem>
    </ul>
  );
};

export default withRouter(Navbar);
