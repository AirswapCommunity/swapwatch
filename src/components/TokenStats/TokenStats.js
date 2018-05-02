import React, { Component } from "react";
import { withStyles } from 'material-ui/styles';
import cssStyles from './TokenStats.css';
import { EthereumTokens } from '../../services/Tokens/Tokens';

class TokenStats extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tokenVolume: null,
      tokenVolumeInUSD: null,
    };
  }

  componentWillMount() {
    let txList = this.props.txList;
    let stringOfTokens = ''
    let tokenVolume = {};
    let tokenVolumeInUSD = {};
  
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

    console.log(tokenVolume);
    fetch(`https://min-api.cryptocompare.com/data/pricemulti?`+
          `fsyms=`+stringOfTokens+`&tsyms=USD`)
    .then(res => res.json())
    .then(response => {
      for(let token in response) {
        let tokenPriceUSD = response[token].USD;
        tokenVolumeInUSD[token] = tokenVolume[token]*tokenPriceUSD;
      }
      console.log(tokenVolumeInUSD);
    })
  }

  render() {
    if (this.state.loadedMindmapData) this.createMindmap();
    return (<div className={cssStyles.TokenStatsContainer}>
            
    </div>);
  }
}


export default withStyles(cssStyles)(TokenStats);