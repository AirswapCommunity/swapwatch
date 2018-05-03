import React, { Component } from "react";
import ReactDOM from 'react-dom';

import { withStyles } from 'material-ui/styles';
import styles from './TokenStats.css';
import { EthereumTokens } from '../../services/Tokens/Tokens';
import {BarChart, Bar, XAxis, YAxis, Tooltip, Rectangle} from 'recharts';

import { format } from "d3-format";

const dollarFormat = format(".0f");
const tokenFormat = format(".0s");

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
                               tokenVolume: tokenVolume[token],
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
                      .slice(0,5); // determine how many should be displayed

    var bottomOffset = 105;
    if (this.state.containerWidth > 600) {
      bottomOffset = 0;
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
          margin={{top: 10, right: 30, left: 20, bottom: 0}}>
                  
          <XAxis dataKey="name"/>
          <YAxis unit='$'/>
          <Tooltip content={<CustomTooltip/>}/>
          <Bar shape={CustomBar} dataKey="Volume" />
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

export default withStyles(styles)(TokenStats);

function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3), 16);
    var G = parseInt(color.substring(3,5), 16);
    var B = parseInt(color.substring(5,7), 16);

    R = parseInt(R * (100 + percent) / 100, 10);
    G = parseInt(G * (100 + percent) / 100, 10);
    B = parseInt(B * (100 + percent) / 100, 10);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

const CustomBar = (props) => {
  const {index} = props;
  let fill = shadeColor('#0090EA', index*10);
  return <Rectangle {...props} fill={fill}/>
};

const CustomTooltip = (props) => {
  const { active } = props;
  if (active) {
    const { label, payload } = props;
    return (
      <div className={styles.customTooltip}>
        <p className="label">{`${label}`}</p>
        <p className="volume">{`${dollarFormat(payload[0].payload.Volume)} $`}</p>
        <p className="tokenVolume">{`${tokenFormat(payload[0].payload.tokenVolume)} ${label}`}</p>
      </div>
    );
  }

  return null;
};