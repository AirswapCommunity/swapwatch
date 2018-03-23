import React from "react";
import * as d3 from "d3";
import styles from "./Markets.css";
import Auxilary from "../../hoc/Auxilary";
import AutoCompleteInput from "../AutoCompleteInput/AutoCompleteInput";
import CandlestickChart from "../CandlestickChart/CandlestickChart";
import TradingDataTable from "../TradingDataTable/TradingDataTable";

import { AirSwap } from '../../services/AirSwap/AirSwap';
import { EthereumTokens } from '../../services/Tokens/Tokens';

class Markets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'txList': null,
      'ohlcData': null,
      'pairedTx': null,
      'selectedToken1': null,
      'selectedToken2': null,
    }
  }

  removeLeadingZeros = (data) => {
    let cleaned_string = data.replace(/0x0*/, '0x');
    while (cleaned_string.length < 42) cleaned_string = cleaned_string.replace('0x', '0x0')
    return cleaned_string;
  }

  evalAirSwapDEXFilledEventLogs = (rawTxList) => {
    let newPairedTx = this.state.pairedTx ? this.state.pairedTx : {};
    for (let txData of rawTxList) {
      // from AirSwapDEX contract:
      // event Filled(address indexed makerAddress,
      //   uint makerAmount, address indexed makerToken,
      //   address takerAddress, uint takerAmount,
      //   address indexed takerToken, uint256 expiration,
      //   uint256 nonce);
      let data = txData.data;
      let trade = {
        "hash": txData.transactionHash,
        "makerAddress": this.removeLeadingZeros(txData.topics['1']),
        "makerAmount": parseInt(data.slice(0, 2 + 64 * 1), 16),
        "makerToken": this.removeLeadingZeros(txData.topics['2']),
        "takerAdress": this.removeLeadingZeros('0x' + data.slice(2 + 64 * 1, 2 + 64 * 2)),
        "takerAmount": parseInt('0x' + data.slice(2 + 64 * 2, 2 + 64 * 3), 16),
        "takerToken": this.removeLeadingZeros(txData.topics['3']),
        "expiration": '0x' + data.slice(2 + 64 * 3, 2 + 64 * 4),
        "nonce": '0x' + data.slice(2 + 64 * 4, 2 + 64 * 5),
        "gasUsed": parseInt(txData.gasUsed, 16),
        "gasPrice": parseInt(txData.gasPrice, 16),
        "timestamp": parseInt(txData.timeStamp, 16),
      }
      trade["gasCost"] = trade.gasPrice * trade.gasUsed / 1e18;

      let makerProps = EthereumTokens.getTokenByAddress(trade.makerToken);
      let takerProps = EthereumTokens.getTokenByAddress(trade.takerToken);

      trade["makerSymbol"] = makerProps.symbol;
      trade["takerSymbol"] = takerProps.symbol;

      trade.makerAmount /= 10 ** makerProps.decimal;
      trade.takerAmount /= 10 ** takerProps.decimal;

      trade["price"] = trade.takerAmount / trade.makerAmount;

      if (!newPairedTx[trade.makerToken]) {
        newPairedTx[trade.makerToken] = {};
      }

      if (!newPairedTx[trade.makerToken][trade.takerToken]) {
        newPairedTx[trade.makerToken][trade.takerToken] = [];
      }

      newPairedTx[trade.makerToken][trade.takerToken].push(trade);
    }
    this.setState({
      pairedTx: newPairedTx
    })
  }

  combineMarkets = (token1address, token2address) => { 
    let combinedMarket = [];
    let selectedMarket = this.state.pairedTx[token1address][token2address];
    let oppositeMarket = this.state.pairedTx[token2address][token1address];
    
    for(let tx of selectedMarket) {
      tx['volume'] = tx.makerAmount;
    }
    if (oppositeMarket && oppositeMarket.length > 0) {
      let copyOppositeMarket = oppositeMarket.map(x => Object.assign({}, x));
      for(let tx of copyOppositeMarket) {
        tx.price = 1/tx.price;
        tx['volume'] = tx.takerAmount;
      }
      selectedMarket = selectedMarket.concat(copyOppositeMarket);
    }  
    let sortedCombinedMarkets = selectedMarket.sort((obj1, obj2) => {
      if(obj1.timestamp > obj2.timestamp) return 1;
      if(obj1.timestamp < obj2.timestamp) return -1;
      return 0;
    })
    return sortedCombinedMarkets;
  }

  getTokenPairTxList = () => {
    let token1address = this.state.selectedToken1.address;
    let token2address = this.state.selectedToken2.address;
    if (this.state.pairedTx && this.state.pairedTx[token1address]
      && this.state.pairedTx[token1address][token2address]) {
      let combinedMarket = this.combineMarkets(token1address, token2address);
      let ohlcData = this.convertToOHLC(combinedMarket);
      this.setState({
        txList: combinedMarket,
        ohlcData: ohlcData,
      })
    }
  }

  convertToOHLC(data) {
    let copyData = data.map(x => Object.assign({}, x));
    copyData.sort((a, b) => d3.ascending(a.timestamp, b.timestamp));
    let result = [];
    let format = d3.timeFormat("%Y-%m-%d");
    copyData.forEach(d => d.timestamp = format(new Date(d.timestamp * 1000)));
    let allDates = [...Array.from(new Set(copyData.map(d => d.timestamp)))];
    allDates.forEach(d => {
        let tempObject = {};
        let filteredData = copyData.filter(e => e.timestamp === d);

        tempObject['timestamp'] = d;
        tempObject['volume'] = d3.sum(filteredData, e=> e.volume);
        tempObject['open'] = filteredData[0].price;
        tempObject['close'] = filteredData[filteredData.length - 1].price;
        tempObject['high'] = d3.max(filteredData, e => e.price);
        tempObject['low'] = d3.min(filteredData, e => e.price);
        result.push(tempObject);
    });
    return result;
  };


  handleToken1Selected = (selectedToken) => {
    if (!selectedToken) {
      this.setState({ txList: null });
    }

    this.setState({ 'selectedToken1': selectedToken },
      () => {
        if (this.state.selectedToken1 && this.state.selectedToken2) {
          this.getTokenPairTxList();
        }
      }
    )
  }

  handleToken2Selected = (selectedToken) => {
    if (!selectedToken) {
      this.setState({ txList: null });
    }

    this.setState({ 'selectedToken2': selectedToken },
      () => {
        if (this.state.selectedToken1 && this.state.selectedToken2) {
          this.getTokenPairTxList();
        }
      }
    )
  }

  render() {
    console.log('Rendering Market.')
    const data = [EthereumTokens.getTokenByName('AirSwap'),
    EthereumTokens.getTokenByName('Wrapped Ether'),
    ]
    if (!this.state.pairedTx) {
      AirSwap.getLogs()
        .then(x => this.evalAirSwapDEXFilledEventLogs(x));
    }

    var txElement = (<div className={styles.TableContainer}>
      <TradingDataTable txList={this.state.txList} />
    </div>);

    if (!this.state.txList) {
      var msg = 'Please select a token pair';

      if (this.state.selectedToken1 && this.state.selectedToken2) {
        msg = 'No data found for the selected token pair';
      }

      txElement = <div className={styles.TableMessageContainer}>{msg}</div>
    }

    return (
      <Auxilary>
        <div className={styles.Outer}>
          <div className={styles.PageContainer}>
            <div style={{ float: 'left', width: '40%' }}>
              <AutoCompleteInput placeholder="Maker Token"
                displayField='name'
                imageField='logo'
                secondaryField='symbol'
                itemSelected={this.handleToken1Selected}
                cleared={this.handleToken1Selected}>
                {data}
              </AutoCompleteInput>
            </div>
            <div style={{ float: 'right', width: '40%' }}>
              <AutoCompleteInput placeholder="Taker Token"
                displayField='name'
                imageField='logo'
                secondaryField='symbol'
                itemSelected={this.handleToken2Selected}
                cleared={this.handleToken2Selected}>
                {data}
              </AutoCompleteInput>
            </div>
            <div>
              <CandlestickChart />
            </div>
            {txElement}
          </div>
        </div>
      </Auxilary>
    );
  }
}
export default Markets;
