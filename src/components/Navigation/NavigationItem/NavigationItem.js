import React from 'react';
import styles from './NavigationItem.css';
import {Link} from 'react-router-dom';
const navigationItem = (props) => (
  <li className={styles.NavigationItem}>
    <Link to={props.link} className={props.active ? styles.active : null}>
      {props.children}
      <span />
    </Link>
  </li>
);

export default navigationItem;
