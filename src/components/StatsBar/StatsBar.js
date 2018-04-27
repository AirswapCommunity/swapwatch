import React, { Component } from "react";
import styles from "./StatsBar.css";
import { withStyles } from 'material-ui/styles';
import { format } from "d3-format";

const numberFormat = format(".2s");

class StatsBar extends Component {
  render() {
    let {totalVolume} = this.props
    let volumeString = '... Loading ...';
    if(totalVolume) volumeString = numberFormat(totalVolume) + ' ETH';
    return (
      <ul className={styles.StatsBar}>
        24h Swap Volume: {volumeString}
      </ul>
    );
  }
};

export default withStyles(styles)(StatsBar);
