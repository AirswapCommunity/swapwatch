import React, { Component } from "react";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { withStyles } from 'material-ui/styles';
import styles from './StatsOverview.css';
import StatsHistogram from '../StatsHistogram/StatsHistogram';
import StatsVolumeChart from '../StatsVolumeChart/StatsVolumeChart';
// import StatsPieChart from '../StatsPieChart/StatsPieChart';
// import StatsTreemap from '../StatsTreemap/StatsTreemap';
import { EthereumTokens } from '../../services/Tokens/Tokens';

class StatsOverview extends Component {

  constructor(props) {
    super(props);
    this.container = null;
    this.state = {
      tokenVolume: null,
      tokenVolumeInfo: null,
    };
  }

  componentWillMount() {
    let txList = this.props.txList;
    let stringOfTokens = ''
    let tokenVolume = {};
    let tokenVolumeInfo = [];
    let twentyFourHours = 24 * 60 * 60;
    let currentTime = Date.now() / 1000;
    let numOfDays = 30;
    let DaysAgo = currentTime - numOfDays*twentyFourHours;

    // Get list of all traded tokens
    for (let token in txList) {
      let tokenProps = EthereumTokens.getTokenByAddress(token);
      (tokenVolume[tokenProps.symbol] = []).length = numOfDays; 
      tokenVolume[tokenProps.symbol].fill(0);
      stringOfTokens = stringOfTokens + tokenProps.symbol + ','
    }

    // Get seperate token volumes within the last 24h
    for (let token in txList) {
      for (let token2 in txList[token]) {
        for (let trade of txList[token][token2]) {
          if (trade.timestamp > DaysAgo){
            let idx = Math.floor(
              (currentTime - trade.timestamp)/twentyFourHours
            );
            tokenVolume[trade.makerSymbol][idx] += trade.makerAmount;
            tokenVolume[trade.takerSymbol][idx] += trade.takerAmount;
          }
        }
      }
    }
    fetch(`https://min-api.cryptocompare.com/data/pricemulti?` +
    `fsyms=` + stringOfTokens + `&tsyms=USD`)
    .then(res => res.json())
    .then(response => {
      for (let token in response) {
        let tokenPriceUSD = response[token].USD;
        
        tokenVolumeInfo.push({
          name: token,
          tokenVolume: tokenVolume[token],
          Volume: tokenVolume[token].map(x => x * tokenPriceUSD),
          tokenVolumeToday: tokenVolume[token][0],
          VolumeToday: tokenVolume[token][0] * tokenPriceUSD,
          logo: EthereumTokens.AllTokens.find(x => x.symbol === token).logo
        });
      }

      this.setState({
        tokenVolume: tokenVolume,
        tokenVolumeInfo: tokenVolumeInfo
      })
    })
  };

  render() {
    return (<div className={styles.StatsOverviewContainer}>
      <p className={styles.UpperText}><u>Swap Statistics</u></p>
      <div className={styles.HistogramContainer}>
        <StatsHistogram tokenVolumeInfo={this.state.tokenVolumeInfo} />
      </div>
      <div className={styles.VolumeChartContainer}>
        <StatsVolumeChart tokenVolumeInfo={this.state.tokenVolumeInfo} />
      </div>
      {/* <div className={styles.HistogramContainer}>
        <StatsPieChart tokenVolumeInfo={this.state.tokenVolumeInfo} />
      </div> */}
      {/* <div className={styles.HistogramContainer}>
        <StatsTreemap tokenVolumeInfo={this.state.tokenVolumeInfo} />
      </div> */}
    </div>);
  }
}

export default fitDimensions(withStyles(styles)(StatsOverview));