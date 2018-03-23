import React, { Component } from "react";
import styles from "./Header.css";

class Header extends Component {
  render() {
    return (
        <header className={styles.Header}>
            <div className={styles.Logo}>
                <img src={require('../../assets/images/SwapWatchLogo-small.png')} className={styles.LogoImage} alt='Logo'/>
                <p className={styles.LogoText}>SWAP</p>
                <p className={[styles.LogoText, styles.SemiTransparent, styles.MarginLeft5].join(' ')}>WATCH</p>
                <a className={[styles.Link, styles.MarginLeft10].join(' ')} href="/Donate">DONATE</a>
                <a className={styles.Link} href="/About">ABOUT</a>
            </div>
        </header>
    );
  }
}

export default Header;
