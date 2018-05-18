import React, { Component } from "react";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { withStyles } from 'material-ui/styles';
import styles from './TokenStats.css';
import { EthereumTokens } from '../../services/Tokens/Tokens';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Rectangle, LabelList } from 'recharts';
import { format } from "d3-format";
import Avatar from 'material-ui/Avatar';

const tokenFormat = format(".4s");
const formatCurrency = (x) => { return x.toLocaleString(undefined, { style: "currency", currency: "USD" }); }

class TokenStats extends Component {

  constructor(props) {
    super(props);
    this.container = null;
    this.state = {
      tokenVolume: null,
      tokenVolumeInUSD: null,
    };

    this.maxHeight = props.height;
    this.maxWidth = props.width;
    this.marginBottom = 220;
    this.bottomOffset = 20;
  }

  componentWillMount() {
    let txList = this.props.txList;
    let stringOfTokens = ''
    let tokenVolume = {};
    let tokenVolumeInUSD = [];

    let twentyFourHoursAgo = Date.now() / 1000 - 24 * 60 * 60;

    for (let token in txList) {
      let tokenProps = EthereumTokens.getTokenByAddress(token)
      tokenVolume[tokenProps.symbol] = 0;
      stringOfTokens = stringOfTokens + tokenProps.symbol + ','
    }
    for (let token in txList) {
      for (let token2 in txList[token]) {
        for (let trade of txList[token][token2]) {
          if (trade.timestamp < twentyFourHoursAgo) continue;
          tokenVolume[trade.makerSymbol] += trade.makerAmount;
          tokenVolume[trade.takerSymbol] += trade.takerAmount;
        }
      }
    }

    fetch(`https://min-api.cryptocompare.com/data/pricemulti?` +
      `fsyms=` + stringOfTokens + `&tsyms=USD`)
      .then(res => res.json())
      .then(response => {
        for (let token in response) {
          let tokenPriceUSD = response[token].USD;
          tokenVolumeInUSD.push({
            name: token,
            tokenVolume: tokenVolume[token],
            Volume: tokenVolume[token] * tokenPriceUSD,
            logo: EthereumTokens.AllTokens.find(x => x.symbol === token).logo
          });
        }
        this.setState({
          tokenVolume: tokenVolume,
          tokenVolumeInUSD: tokenVolumeInUSD
        })
      })
  };

  componentDidUpdate() {
    this.maxHeight = this.props.height;
    this.maxWidth = this.props.width - 10;
  }

  setRef = (el) => {
    this.container = el;
  };

  renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    const radius = 32;

    return (
      <g>
        <image x={x + (width / 2) - 16} y={y - radius - 10} href={value} height="32" width="32" />
      </g>
    );
  };

  createChart = () => {
    let displayData = this.state.tokenVolumeInUSD
      .sort((a, b) => { return b.Volume - a.Volume })
      .slice(0, 5); // determine how many should be displayed

    var height = this.maxHeight - this.marginBottom;

    if (height - 60 < 0) {
      height = 60;
    }

    return (
      <div>
        <BarChart
          width={this.props.width}
          height={height}
          data={displayData}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>

          <XAxis dataKey="name" tickMargin={5} />
          <YAxis tickFormatter={formatCurrency} width={100} type='number' allowDataOverflow={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d0d0d0', strokeWidth: 1, fill: '#f0f0f0' }} offset={-65}/>
          <Bar shape={CustomBar} dataKey="Volume">
            <LabelList dataKey="logo" content={this.renderCustomizedLabel} />
          </Bar>
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

export default fitDimensions(withStyles(styles)(TokenStats));

function shadeColor(color, percent) {
  return window.tinycolor(color).darken(percent).desaturate(percent).toString();
}

const CustomBar = (props) => {
  const { index } = props;  
  let fill = shadeColor('#34b5f4', index * 5);
  return <Rectangle className={props.name} {...props} fill={fill} />
};

const CustomTooltip = (props) => {
  const { active } = props;
  if (active) {
    const { label, payload } = props;
    return (
      <div className={styles.customTooltip}>
        <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
          <Avatar src={payload[0].payload.logo} style={{ backgroundColor: 'whitesmoke', padding: '2' }} imgProps={{ height: '32', className: 'avatarImage' }}>
          </Avatar>
        </div>
        <span className="label">{label}</span>
        <p className="volume"><strong>{formatCurrency(payload[0].payload.Volume)}</strong></p>
        <p className="tokenVolume"><strong>{`${tokenFormat(payload[0].payload.tokenVolume)} ${label}`}</strong></p>
      </div>
    );
  }

  return null;
};