import React from "react";
import * as d3 from "d3";
import styles from "./Markets.css";
import Auxilary from "../../hoc/Auxilary";
import AutoCompleteInput from "../AutoCompleteInput/AutoCompleteInput";
import CandlestickChart from "../CandlestickChart/CandlestickChart";
import TradingDataTable from "../TradingDataTable/TradingDataTable";
import { timeParse } from "d3-time-format";

import { AirSwap } from '../../services/AirSwap/AirSwap';
import { EthereumTokens } from '../../services/Tokens/Tokens';

import Switch from 'material-ui/Switch';
import { FormGroup, FormControlLabel } from 'material-ui/Form';

class Markets extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      'hasLoadedData': false,
      'pairedTx': null, // loaded TX of AirSwapDEX sorted as [makerAddress][takerAddress]
      'txList': null, // List containing selected transactions for display
      'ohlcData': null, // Data transformed to OHLC format
      'selectedToken1': null, // currently selected token 1
      'selectedToken2': null, // currently selected token 2
      'viewCandlestick': true, // Display Candlestick or Display Table
      'statusMessage': null // status message shown at top
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
      pairedTx: newPairedTx,
      statusMessage: null
    }, this.checkStatus)
  }

  combineMarkets = (token1address, token2address) => {
    let selectedMarket = this.state.pairedTx[token1address][token2address];
    let oppositeMarket = this.state.pairedTx[token2address][token1address];

    for (let tx of selectedMarket) {
      tx['volume'] = tx.makerAmount;
    }
    if (oppositeMarket && oppositeMarket.length > 0) {
      let copyOppositeMarket = oppositeMarket.map(x => Object.assign({}, x));
      for (let tx of copyOppositeMarket) {
        tx.price = 1 / tx.price;
        tx['volume'] = tx.takerAmount;
      }
      selectedMarket = selectedMarket.concat(copyOppositeMarket);
    }
    let sortedCombinedMarkets =
      selectedMarket.sort((a, b) => d3.ascending(a.timestamp, b.timestamp));
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
        ohlcData: ohlcData
      }, this.checkStatus)
    }
  }

  convertToOHLC(data) {
    let copyData = data.map(x => Object.assign({}, x));
    copyData.sort((a, b) => d3.ascending(a.timestamp, b.timestamp));
    let result = [];
    let format = d3.timeFormat("%Y-%m-%d");
    let parseDate = timeParse("%Y-%m-%d");
    copyData.forEach(d => d.timestamp = format(new Date(d.timestamp * 1000)));
    let allDates = [...Array.from(new Set(copyData.map(d => d.timestamp)))];
    let runningIdx = 0;
    allDates.forEach(d => {
      let tempObject = {};
      let filteredData = copyData.filter(e => e.timestamp === d);
      tempObject['idx'] = runningIdx;
      tempObject['date'] = parseDate(d);
      tempObject['volume'] = d3.sum(filteredData, e => e.volume);
      tempObject['open'] = filteredData[0].price;
      tempObject['close'] = filteredData[filteredData.length - 1].price;
      tempObject['high'] = d3.max(filteredData, e => e.price);
      tempObject['low'] = d3.min(filteredData, e => e.price);
      result.push(tempObject);
      runningIdx++;
    });
    result['columns'] = ['idx', 'date', 'volume', 'open', 'close', 'high', 'low']
    return result;
  };


  handleToken1Selected = (selectedToken) => {
    if (!selectedToken) {
      this.setState({ txList: null });
    }

    this.setState({
      txList: null,
      selectedToken1: selectedToken
    }, () => {
      if (this.state.selectedToken1 && this.state.selectedToken2) this.getTokenPairTxList();
      this.checkStatus();
    })
  }

  handleToken2Selected = (selectedToken) => {
    if (!selectedToken) {
      this.setState({ txList: null });
    }

    this.setState({
      txList: null,
      selectedToken2: selectedToken
    }, () => {
      if (this.state.selectedToken1 && this.state.selectedToken2) this.getTokenPairTxList();
      this.checkStatus();
    })
  }

  handleViewChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };


  componentWillMount() {
    AirSwap.getLogs()
      .then(x => {
        this.evalAirSwapDEXFilledEventLogs(x);
        // this.handleToken1Selected(data[0]);
        // this.handleToken2Selected(data[1]);
      });
    this.checkStatus();
  }

  checkStatus() {
    let statusMsg;
    let hasLoadedData=true;
    if (!this.state.pairedTx) {
      statusMsg = 'Standby. Fetching AirSwap transactions from Etherscan.';
      hasLoadedData = false;
    } else if (!this.state.txList) {
      if (this.state.selectedToken1 && this.state.selectedToken2) {
        statusMsg = 'No data found for the selected token pair';
      } else {
        statusMsg = 'Please select a token pair';
      }
    }
    this.setState({ hasLoadedData: hasLoadedData,
                    statusMessage: statusMsg });
  }

  render() {
    const data = [
      EthereumTokens.getTokenByName('AirSwap'),
      EthereumTokens.getTokenByName('Wrapped Ether')] // which tokens to display in dropdown

    var txTableElement = <TradingDataTable txList={this.state.txList} />;
    var candlestickElement = <CandlestickChart data={this.state.ohlcData} />;

    var statusMessageElement = (this.state.statusMessage) ? <div className={styles.TableMessageContainer}>{this.state.statusMessage}</div> : null;

    var viewElement;
    if (!this.state.txList) viewElement = null;
    else viewElement = this.state.viewCandlestick ? candlestickElement : txTableElement;

    var switchElement = this.state.txList ? <FormControlLabel
      control={
        <Switch
          checked={this.state.viewCandlestick}
          onChange={this.handleViewChange('viewCandlestick')}
          value="viewCandlestick"
          color="primary"
        />
      }
      label="Show transactions as candlesticks"
    /> : null;
    return (
      <Auxilary>
        <div className={styles.Outer}>
          <div className={styles.PageContainer}>
            <div>
              <div style={{ float: 'left', width: '40%' }}>
                <AutoCompleteInput placeholder="Maker Token"
                  displayField='name'
                  imageField='logo'
                  secondaryField='symbol'
                  disabled={!this.state.hasLoadedData}
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
                  disabled={!this.state.hasLoadedData}
                  itemSelected={this.handleToken2Selected}
                  cleared={this.handleToken2Selected}>
                  {data}
                </AutoCompleteInput>
              </div>
            </div>
            <div className={styles.SwitchContainer}>
              {switchElement}
            </div>
            {statusMessageElement}
            <div className={styles.TableContainer}>
              {viewElement}
            </div>
          </div>
        </div>
      </Auxilary>
    );
  }
}
export default Markets;
