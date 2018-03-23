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
      'pairedTX': null,
    }
  }

  removeLeadingZeros = (data) => {
    let cleaned_string = data.replace(/0x0*/,'0x');
    while(cleaned_string.length < 42) cleaned_string = cleaned_string.replace('0x', '0x0')
    return cleaned_string;
  }

  evalAirSwapDEXFilledEventLogs = (rawTxList) => {
    let newPairedTx = this.state.pairedTX ? this.state.pairedTX : {};
    for(let txData of rawTxList) {
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
        "makerAmount": parseInt(data.slice(0,2+64*1), 16),
        "makerToken": this.removeLeadingZeros(txData.topics['2']),
        "takerAdress": this.removeLeadingZeros('0x'+data.slice(2+64*1,2+64*2)),
        "takerAmount": parseInt('0x'+data.slice(2+64*2,2+64*3), 16),
        "takerToken": this.removeLeadingZeros(txData.topics['3']),
        "expiration": '0x'+data.slice(2+64*3,2+64*4),
        "nonce": '0x'+data.slice(2+64*4,2+64*5),
        "gasUsed": parseInt(txData.gasUsed, 16),
        "gasPrice": parseInt(txData.gasPrice, 16),
        "timestamp": parseInt(txData.timeStamp, 16),        
      }
      trade["gasCost"] = trade.gasPrice * trade.gasUsed / 1e18;

      let makerProps = EthereumTokens.getTokenByAddress(trade.makerToken);
      let takerProps = EthereumTokens.getTokenByAddress(trade.takerToken);
      
      trade["makerSymbol"] = makerProps.symbol;
      trade["takerSymbol"] = takerProps.symbol;

      trade.makerAmount /= 10**makerProps.decimal;
      trade.takerAmount /= 10**takerProps.decimal;

      trade["price"] = trade.takerAmount / trade.makerAmount;

      if(!newPairedTx[trade.makerToken]) {
        newPairedTx[trade.makerToken] = {};
      }

      if(!newPairedTx[trade.makerToken][trade.takerToken]) {
              newPairedTx[trade.makerToken][trade.takerToken] = [];
      }

      newPairedTx[trade.makerToken][trade.takerToken].push(trade);
    }
    this.setState({
      txList: this.state.txList,
      pairedTx: newPairedTx,
    })
  }

  getTokenPairTxList = (tokenAddress1, tokenAddress2) => {
    let loadedTxList = [];
    if(this.state.pairedTx && this.state.pairedTx[tokenAddress1]
       && this.state.pairedTx[tokenAddress1][tokenAddress2]) {
      this.setState({
        txList: this.state.pairedTx[tokenAddress1][tokenAddress2],
        pairedTx: this.state.pairedTx,
      })
    }
  }
  
  render() {
    console.log('Rendering Market.')
    const data = ['AirSwap', 'Wrapped Eth'];
    
    if(!this.state.pairedTx) {
      AirSwap.getLogs()
      .then(x => {
        this.evalAirSwapDEXFilledEventLogs(x);
        this.getTokenPairTxList(
          EthereumTokens.getTokenByName('AirSwap').address,
          EthereumTokens.getTokenByName('Wrapped Ether').address)
      });
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
                itemSelected={(i) => console.log(i)}
                cleared={() => console.log('Token 1 cleared')}>
                {EthereumTokens.AllTokens}
              </AutoCompleteInput>
            </div>
            <div style={{ float: 'right', width: '40%' }}>
              <AutoCompleteInput placeholder="Token 2">{data}</AutoCompleteInput>
            </div>
            <div>
              <CandlestickChart />
            </div>
            <div>
              <TradingDataTable 
                txList={this.state.txList}/>
            </div>
            {/* <p style={{ clear: 'left' }}>This is the Markets Page with a bunch of text that hopefully will wrap and stuff</p> */}
          </div>
        </div>
      </Auxilary>
    );
  }
}
export default Markets;
