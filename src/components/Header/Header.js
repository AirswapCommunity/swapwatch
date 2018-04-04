import React, { Component } from "react";
import styles from "./Header.css";
import { Link } from 'react-router-dom';

class Header extends Component {
  render() {
    return (
      <header className={styles.Header}>
        <div className={styles.Logo}>
          <div className={styles.LogoContainer}>
            <img src={require('../../assets/images/SwapWatchLogo-small.png')} className={styles.LogoImage} alt='Logo' />
          </div>
          <p className={styles.LogoText}>SWAP</p>
          <p className={[styles.LogoText, styles.SemiTransparent, styles.MarginLeft5].join(' ')}>WATCH</p>
          <Link className={[styles.Link, styles.MarginLeft10].join(' ')} to="/Donate">DONATE</Link>
          <Link className={styles.Link} to="/About">ABOUT</Link>
        </div>
      </header>
    );
  }
}

export default Header;
