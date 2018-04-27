import React, { Component } from "react";
import styles from "./StatsBar.css";
import { withStyles } from 'material-ui/styles';
import { format } from "d3-format";

const numberFormat = format(".2s");

class StatsBar extends Component {
  render() {
    let {totalVolume} = this.props
    if(!totalVolume) totalVolume = 0;
    return (
      <ul className={styles.StatsBar}>
        24h Swap Volume: {numberFormat(totalVolume)} ETH
      </ul>
    );
  }
};

export default withStyles(styles)(StatsBar);
