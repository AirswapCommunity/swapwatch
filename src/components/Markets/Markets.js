import React from "react";
import * as d3 from "d3";
import styles from "./Markets.css";
import Auxilary from "../../hoc/Auxilary";
import AutoCompleteInput from "../AutoCompleteInput/AutoCompleteInput";
import MindmapPlot from '../MindmapPlot/MindmapPlot';
import TradingDataTable from "../TradingDataTable/TradingDataTable";
import { timeParse } from "d3-time-format";
import Chart from "../Chart/Chart";
import Button from 'material-ui/Button'

import { AirSwapContract } from '../../services/AirSwap/AirSwap';
import { Stats } from '../../services/Stats/Stats';
// import { EthereumTokens } from '../../services/Tokens/Tokens';

import OptionsMenu from './OptionsMenu';
import TabsBar from './TabsBar';
import StatsBar from '../StatsBar/StatsBar';
import StatsOverview from '../StatsOverview/StatsOverview';


class Markets extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      'hasLoadedData': false,
      'pairedTx': null, // loaded TX of AirSwapDEX sorted as [makerAddress][takerAddress]
      'txList': null, // List containing selected transactions for display
      'tokens': null, // token metadata
      'TokenList': null,
      'TokenPairList': null,
      'ohlcData': null, // Data transformed to OHLC format
      'selectedToken1': null, // currently selected token 1
      'selectedToken2': null, // currently selected token 2
      'viewElement': 'Candlestick', // which Element to display
      'statusMessage': null, // status message shown at top
      'indicator': {
        'BollingerBand': true,
        'EMA': true,
        'Volume': true,
      },
      'totalVolume': 0,
    }
    this.toggleIndicator = this.toggleIndicator.bind(this);
    this.toggleViewElement = this.toggleViewElement.bind(this);


  }

  removeLeadingZeros = (data) => {
    let cleaned_string = data.replace(/0x0*/, '0x');
    while (cleaned_string.length < 42) cleaned_string = cleaned_string.replace('0x', '0x0')
    return cleaned_string;
  }

  evalAirSwapDEXFilledEventLogs = (rawTxList) => {
    let newPairedTx = this.state.pairedTx ? this.state.pairedTx : {};

    let trades = [];
    let wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    let ethAddress = '0x0000000000000000000000000000000000000000';

    // Step 1: Read all transactions and do some first transformations
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
        "takerAddress": this.removeLeadingZeros('0x' + data.slice(2 + 64 * 1, 2 + 64 * 2)),
        "takerAmount": parseInt('0x' + data.slice(2 + 64 * 2, 2 + 64 * 3), 16),
        "takerToken": this.removeLeadingZeros(txData.topics['3']),
        "expiration": '0x' + data.slice(2 + 64 * 3, 2 + 64 * 4),
        "nonce": '0x' + data.slice(2 + 64 * 4, 2 + 64 * 5),
        "gasUsed": parseInt(txData.gasUsed, 16),
        "gasPrice": parseInt(txData.gasPrice, 16),
        "timestamp": parseInt(txData.timeStamp, 16),
      }
      if (trade['makerToken'] === wethAddress)
        trade['makerToken'] = ethAddress
      if (trade['takerToken'] === wethAddress)
        trade['takerToken'] = ethAddress

      trade["gasCost"] = trade.gasPrice * trade.gasUsed / 1e18;

      trades.push(trade);
    }

    // Step 2: Get token metadata

    // let promiseListTokensLoaded = [];
    // let loadedToken = [];
    // let checkIfTokenIsInLocalList = (address) => {
    //   if (!loadedToken.includes(address)) {
    //     loadedToken.push(address);
    //     let tokenProps = EthereumTokens.getTokenByAddress(address);

    //     if (!tokenProps) {
    //       //if tokenProps is undefined, the token info is not in our list
    //       //use web3 to get contract details
    //       let tokenContract = new web3.eth.Contract(EthereumTokens.ERC20ABI,
    //         address);
    //       promiseListTokensLoaded.push(
    //         new Promise((resolve, reject) => {
    //           let tokenInfoPromise = []
    //           tokenInfoPromise.push(tokenContract.methods.name().call());
    //           tokenInfoPromise.push(tokenContract.methods.symbol().call());
    //           tokenInfoPromise.push(tokenContract.methods.decimals().call());

    //           Promise.all(tokenInfoPromise)
    //             .then((tokenDetails) => {
    //               let newToken = {
    //                 "address": address,
    //                 "name": tokenDetails[0],
    //                 "symbol": tokenDetails[1],
    //                 "decimals": parseInt(tokenDetails[2], 10),
    //                 "logo": "",
    //               }
    //               EthereumTokens.addToken(newToken);
    //               console.log(newToken);
    //               resolve();
    //             })
    //             .catch((error) => {
    //               console.log('Failed to fetch info of ' + address +
    //                 ' from contract. Falling back to Ethplorer.');
    //               resolve(EthereumTokens.addTokenByAddressFromEthplorer(address));
    //             })
    //         })
    //       );
    //     }
    //   }
    // }

    // for (let trade of trades) {
    //   checkIfTokenIsInLocalList(trade.makerToken);
    //   checkIfTokenIsInLocalList(trade.takerToken);
    // }

    // Step 3: Once all tokens have been checked to be available. Add their
    // information to the transactions

    // Promise.all(promiseListTokensLoaded)
    const tokens = {};
    fetch('https://token-metadata.airswap.io/tokens')
    .then(res => res.json())
    .then(response => {
      for (const entry in response) {
        if (response[entry]) {
          const token = response[entry];
          const logo = (token.address !== ethAddress) ?
          ('https://raw.githubusercontent.com/TrustWallet/tokens/master/images/' +
            token.address + '.png') :
          ('https://raw.githubusercontent.com/TrustWallet/tokens/master/images/' +
            'ethereum_1.png');

          tokens[token.address] = {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: Number(token.decimals),
            logo: logo
          };
        }
      }
      // EthereumTokens.setTokens(tokens);
    }).then(() => {
      let tokenInList = [];
      let TokenList = [];
      let tokenPairInList = {};
      let TokenPairList = {};

      let addTokenToList = (tokenProps) => {
        // tokenProps.logo = (tokenProps.address !== ethAddress) ?
        //   ('https://raw.githubusercontent.com/TrustWallet/tokens/master/images/' +
        //     tokenProps.address + '.png') :
        //   ('https://raw.githubusercontent.com/TrustWallet/tokens/master/images/' +
        //     'ethereum_1.png');

        tokenInList.push(tokenProps.name);
        TokenList.push(tokenProps);

        tokenPairInList[tokenProps.name] = [];
        TokenPairList[tokenProps.name] = [];
      }
      for (let trade of trades) {
        let makerProps = tokens[trade.makerToken];
        let takerProps = tokens[trade.takerToken];

        if (!tokenInList.includes(makerProps.name)) addTokenToList(makerProps);
        if (!tokenPairInList[makerProps.name].includes(takerProps.name)) {
          tokenPairInList[makerProps.name].push(takerProps.name);
          TokenPairList[makerProps.name].push(takerProps);
        }

        if (!tokenInList.includes(takerProps.name)) addTokenToList(takerProps);
        if (!tokenPairInList[takerProps.name].includes(makerProps.name)) {
          tokenPairInList[takerProps.name].push(makerProps.name);
          TokenPairList[takerProps.name].push(makerProps);
        }

        trade["makerSymbol"] = makerProps.symbol;
        trade["takerSymbol"] = takerProps.symbol;

        trade.makerAmount /= 10 ** makerProps.decimals;
        trade.takerAmount /= 10 ** takerProps.decimals;

        trade["price"] = trade.takerAmount / trade.makerAmount;


        if (!newPairedTx[trade.makerToken]) newPairedTx[trade.makerToken] = {};

        if (!newPairedTx[trade.makerToken][trade.takerToken])
          newPairedTx[trade.makerToken][trade.takerToken] = [];

        newPairedTx[trade.makerToken][trade.takerToken].push(trade);
      }
      let volume = Stats.getEthVolume(trades)


      this.setState({
        pairedTx: newPairedTx,
        statusMessage: null,
        tokens: tokens,
        TokenList: TokenList,
        TokenPairList: TokenPairList,
        totalVolume: volume,
      }, this.checkStatus)
    })
  }

  combineMarkets = (token1address, token2address) => {
    let selectedMarket = [];
    let oppositeMarket = [];
    if (this.state.pairedTx[token1address] && this.state.pairedTx[token1address][token2address])
      selectedMarket = this.state.pairedTx[token1address][token2address];
    if (this.state.pairedTx[token2address] && this.state.pairedTx[token2address][token1address])
      oppositeMarket = this.state.pairedTx[token2address][token1address];

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

    if (this.state.pairedTx &&
      ((this.state.pairedTx[token1address]
        && this.state.pairedTx[token1address][token2address])
        || (this.state.pairedTx[token2address]
          && this.state.pairedTx[token2address][token1address])
      )) {
      let combinedMarket = this.combineMarkets(token1address, token2address);
      let ohlcData = this.convertToOHLC(combinedMarket);

      if (ohlcData.length === 1) {
        // little patchwork: if only a single data point, the candlestick
        // chart doesn't plot... so that point is just doubled in this case
        ohlcData.push(ohlcData[0]);
      }
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
    allDates.forEach(d => {
      let tempObject = {};
      let filteredData = copyData.filter(e => e.timestamp === d);
      tempObject['date'] = parseDate(d);
      tempObject['volume'] = d3.sum(filteredData, e => e.volume);
      tempObject['open'] = filteredData[0].price;
      tempObject['close'] = filteredData[filteredData.length - 1].price;
      tempObject['high'] = d3.max(filteredData, e => e.price);
      tempObject['low'] = d3.min(filteredData, e => e.price);
      result.push(tempObject);
    });
    result['columns'] = ['date', 'volume', 'open', 'close', 'high', 'low']
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
    AirSwapContract.getLogs()
      .then(x => {
        this.evalAirSwapDEXFilledEventLogs(x);
        // this.handleToken1Selected(data[0]);
        // this.handleToken2Selected(data[1]);
      });
    this.checkStatus();
  }

  checkStatus() {
    let statusMsg;
    let hasLoadedData = true;
    if (!this.state.pairedTx) {
      statusMsg = 'Standby. Fetching AirSwap transactions from Etherscan...';
      hasLoadedData = false;
    } else if (!this.state.txList) {
      if (this.state.selectedToken1 && this.state.selectedToken2) {
        statusMsg = 'No data found for the selected token pair';
      } else {
        statusMsg = null//'Please select a token pair';
      }
    }
    this.setState({
      hasLoadedData: hasLoadedData,
      statusMessage: statusMsg
    });
  }

  toggleIndicator(ind) {
    if (ind) {
      var newIndicator = this.state.indicator;
      newIndicator[ind] = !newIndicator[ind]
      this.setState({
        indicator: newIndicator
      })
    }
  }

  toggleViewElement(state) {
    this.setState({
      viewElement: state
    })
  }

  getToken1List() {
    if (this.state.TokenPairList &&
      this.state.selectedToken2 &&
      this.state.TokenPairList[this.state.selectedToken2.name])
      return this.state.TokenPairList[this.state.selectedToken2.name];
    else
      return this.state.TokenList;
  }

  getToken2List() {
    if (this.state.TokenPairList &&
      this.state.selectedToken1 &&
      this.state.TokenPairList[this.state.selectedToken1.name])
      return this.state.TokenPairList[this.state.selectedToken1.name];
    else
      return this.state.TokenList;
  }

  buy = () => {
    window.AirSwap.Trader.render({
      env: 'production',
      mode: 'buy',
      token: this.state.selectedToken1.address,
      amount: 50000,
      onCancel: function () {
        console.info('Trade was canceled.');
      },
      onComplete: function (transactionId) {
        console.info('Trade complete. Thank you, come again.');
      }
    }, 'body');
  }

  sell = () => {
    window.AirSwap.Trader.render({
      env: 'production',
      mode: 'sell',
      token: this.state.selectedToken1.address,
      onCancel: function () {
        console.info('Trade was canceled.');
      },
      onComplete: function (transactionId) {
        console.info('Trade complete. Thank you, come again.');
      }
    }, 'body');
  }

  render() {
    var tabsBarElement = this.state.txList ? <TabsBar
      toggleState={this.toggleViewElement}
    /> : null;

    let candlestickElement = <Chart
      data={this.state.ohlcData}
      makerToken={this.state.selectedToken1}
      takerToken={this.state.selectedToken2}
      indicator={this.state.indicator} />;

    var mindmapElement = <MindmapPlot
      txList={this.state.txList}
      token1={this.state.selectedToken1}
      token2={this.state.selectedToken2}
    />;
    var txTableElement = <TradingDataTable txList={this.state.txList} />;
    var tokenStatsElement = ((this.state.pairedTx && !this.state.txList) ?
      <StatsOverview tokens={this.state.tokens} txList={this.state.pairedTx} /> :
      null);

    var viewElement;
    if (!this.state.txList) viewElement = null;
    else {
      switch (this.state.viewElement) {
        case 'Candlestick':
          viewElement = candlestickElement;
          break;
        case 'Mindmap':
          viewElement = mindmapElement;
          break;
        case 'Table':
          viewElement = txTableElement;
          break;
        default:
          viewElement = null;
      }
    }

    var marketplaceButtons = this.state.selectedToken1 ? (<div style={{ textAlign: 'center' }}>
      <Button className={styles.AirSwapButton} onClick={this.buy} variant='raised' style={{ backgroundColor: '#34f493', color: 'white' }}>Buy</Button>
      <Button className={styles.AirSwapButton} onClick={this.sell} variant='raised' style={{ backgroundColor: '#f54748', color: 'white' }}>Sell</Button>
    </div>) : null;

    var menuElement = (viewElement &&
      this.state.viewElement === 'Candlestick') ? <OptionsMenu
        indicator={this.state.indicator}
        toggleIndicator={this.toggleIndicator}
      /> : null;

    var statusMessageElement = (this.state.statusMessage) ? <div className={styles.TableMessageContainer}>{this.state.statusMessage}</div> : null;
    var spinnerElement = !this.state.hasLoadedData ? <div style={{ textAlign: "center", marginTop: '20px', color: 'rgba(0,0,0,0.6)' }}><i className="fa fa-spinner fa-spin fa-3x"></i></div> : null;

    return (
      <Auxilary>
        <StatsBar totalVolume={this.state.totalVolume} />
        <div className={styles.Outer}>
          <div>
            <div className={styles.AutoCompleteContainer}>
              <AutoCompleteInput placeholder="Maker Token"
                displayField='name'
                imageField='logo'
                secondaryField='symbol'
                disabled={!this.state.hasLoadedData}
                itemSelected={this.handleToken1Selected}
                excludeItem={this.state.selectedToken2}
                cleared={this.handleToken1Selected}
                zIndex='20'>
                {this.getToken1List()}
              </AutoCompleteInput>
            </div>
            <div className={styles.AutoCompleteContainerRight}>
              <AutoCompleteInput placeholder="Taker Token"
                displayField='name'
                imageField='logo'
                secondaryField='symbol'
                disabled={!this.state.hasLoadedData}
                excludeItem={this.state.selectedToken1}
                itemSelected={this.handleToken2Selected}
                cleared={this.handleToken2Selected}
                zIndex='10'>
                {this.getToken2List()}
              </AutoCompleteInput>
            </div>
            {marketplaceButtons}
          </div>
          <div className={styles.TabsBarContainer}>
            {tabsBarElement}
          </div>
          <div className={styles.MenuContainer}>
            {menuElement}
          </div>
          <div>{statusMessageElement}</div>
          <div>{spinnerElement}</div>
          <div className={styles.TableContainer}>
            {tokenStatsElement}
            {viewElement}
          </div>
        </div>
      </Auxilary>
    );
  }
}
export default Markets;
