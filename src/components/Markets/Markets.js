import React from "react";
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

  getTokenPairTxList = () => {
    let token1address = this.state.selectedToken1.address;
    let token2address = this.state.selectedToken2.address;
    if (this.state.pairedTx && this.state.pairedTx[token1address]
      && this.state.pairedTx[token1address][token2address]) {
      this.setState({
        txList: this.state.pairedTx[token1address][token2address],
      })
    }
  }

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
    // EthereumTokens.AllTokens//['AirSwap', 'Wrapped Eth'];

    if (!this.state.pairedTx) {
      AirSwap.getLogs()
        .then(x => {
          this.evalAirSwapDEXFilledEventLogs(x)
          // this.setState({
          //   'selectedToken1': data[0],
          //   'selectedToken2': data[1],
          // }, this.getTokenPairTxList)
        });
    }

    var txElement = <TradingDataTable txList={this.state.txList } />;

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
              <AutoCompleteInput placeholder="Token 1"
                displayField='name'
                imageField='logo'
                secondaryField='symbol'
                itemSelected={this.handleToken1Selected}
                cleared={this.handleToken1Selected}>
                {data}
              </AutoCompleteInput>
            </div>
            <div style={{ float: 'right', width: '40%' }}>
              <AutoCompleteInput placeholder="Token 2"
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
            <div>
              {txElement}
            </div>
          </div>
        </div>
      </Auxilary>
    );
  }
}
export default Markets;
