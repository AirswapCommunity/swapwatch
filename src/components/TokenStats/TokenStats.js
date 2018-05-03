import React, { Component } from "react";
import ReactDOM from 'react-dom';

import { withStyles } from 'material-ui/styles';
import styles from './TokenStats.css';
import { EthereumTokens } from '../../services/Tokens/Tokens';
import {BarChart, Bar, XAxis, YAxis, Tooltip} from 'recharts';

class TokenStats extends Component {

  constructor(props) {
    super(props);
    this.container = null;
    this.state = {
      tokenVolume: null,
      tokenVolumeInUSD: null,
      containerHeight: 100,
      containerWidth: 100,
    };
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);

    let txList = this.props.txList;
    let stringOfTokens = ''
    let tokenVolume = {};
    let tokenVolumeInUSD = [];
  
    let twentyFourHoursAgo = Date.now() / 1000 - 24*60*60;

    for (let token in txList) {
      let tokenProps = EthereumTokens.getTokenByAddress(token)
      tokenVolume[tokenProps.symbol] = 0;
      stringOfTokens = stringOfTokens + tokenProps.symbol +','
    }
    for (let token in txList) {
      for(let token2 in txList[token]) {
        for(let trade of txList[token][token2]) {
          if(trade.timestamp < twentyFourHoursAgo) continue;
          tokenVolume[trade.makerSymbol] += trade.makerAmount;
          tokenVolume[trade.takerSymbol] += trade.takerAmount;
        }
      }
    }

    fetch(`https://min-api.cryptocompare.com/data/pricemulti?`+
          `fsyms=`+stringOfTokens+`&tsyms=USD`)
    .then(res => res.json())
    .then(response => {
      for(let token in response) {
        let tokenPriceUSD = response[token].USD;
        tokenVolumeInUSD.push({name: token,
                               Volume: tokenVolume[token]*tokenPriceUSD});
      }
      this.setState({
        tokenVolume: tokenVolume,
        tokenVolumeInUSD: tokenVolumeInUSD
      })
    })
  };

  componentDidMount() {
    this.handleWindowSizeChange();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }


  setRef = (el) => {
    this.container = el;
  };

  handleWindowSizeChange = () => {
    var height = ReactDOM.findDOMNode(this.container).clientHeight;
    var width = ReactDOM.findDOMNode(this.container).clientWidth;
    console.log(height, width);
    if (width > 0) {
      this.setState({
        containerHeight: height,
        containerWidth: width
      })
    }
  };

  createChart = () => {
    let displayData = this.state.tokenVolumeInUSD
                      .sort((a,b)=> {return b.Volume - a.Volume})
                      .slice(0,7);

    var bottomOffset = 65;
    if (this.state.containerWidth > 321) {
      bottomOffset = 55;
    } else if (this.state.containerWidth > 600) {
      bottomOffset = 30;
    }
    var height = this.state.containerHeight - bottomOffset;

    if (height - 60 < 0) {
      height = 60;
    }
    return (
      <div>
        <BarChart 
          width={this.state.containerWidth} 
          height={height} 
          data={displayData}
          margin={{top: 50, right: 30, left: 20, bottom: 10}}>
                  
          <XAxis dataKey="name"/>
          <YAxis unit='$'/>
          <Tooltip/>
          <Bar dataKey="Volume" fill="#92c5de" />
        </BarChart>
      </div>
    )
  };

  render() {
    let barChartElement;
    barChartElement = this.state.tokenVolumeInUSD ? this.createChart() : null;
    return (<div className={styles.TokenStatsContainer}>
      <p className={styles.UpperText}><u>Swap Statistics</u></p>
      <div className={styles.TokenStatsContainer} ref={this.setRef}>
        {barChartElement}
      </div>
    </div>);
  }
}
// TokenStats.propTypes = {
//   width: PropTypes.number.isRequired,
// };

// TokenStats = fitWidth(TokenStats);
export default withStyles(styles)(TokenStats);