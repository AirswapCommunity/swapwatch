import React from "react";
import styles from "./Navbar.css";
import NavigationItem from "../NavigationItem/NavigationItem";

const Navbar = props => (
  <ul className={styles.Navbar}>
    <NavigationItem link="/" active>Markets</NavigationItem>
    <NavigationItem link="/MyTrades">My Trades</NavigationItem>
  </ul>
);

export default Navbar;
