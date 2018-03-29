import React from "react";
import Auxilary from "../../hoc/Auxilary";
import { withStyles } from 'material-ui/styles';
import cssStyles from "./Donate.css";

import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

import Card, { CardActions, CardContent } from 'material-ui/Card';

import * as Web3 from 'web3';
import * as d3 from "d3";

var guestbookAddress = '0xdc20B1256E2def911B1B6Db7dc98F62878dCAFD2';
var guestbookABI = [{"constant":true,"inputs":[],"name":"minimum_donation","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_new_storage","type":"address"}],"name":"changeDonationWallet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"running_id","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_new_owner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"entries","outputs":[{"name":"owner","type":"address"},{"name":"alias","type":"string"},{"name":"timestamp","type":"uint256"},{"name":"blocknumber","type":"uint256"},{"name":"donation","type":"uint256"},{"name":"message","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_minDonation","type":"uint256"}],"name":"changeMinimumDonation","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"entry_id","type":"uint256"}],"name":"getEntry","outputs":[{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_alias","type":"string"},{"name":"_message","type":"string"}],"name":"createEntry","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"donationWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}];

class Donate extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      'web3': null,
      'isConnected': false,
      'Network': null,
      'connectedAccount': null,
      'accountBalance': null,
      'guestbookContract': null,
      'guestbookMessages': [],
      'alias': "Anonymous",
      'message': "",
      'donation': "0.05",
      'idxMessage': null,
    }

    this.donate = this.donate.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.changeMessageIdx = this.changeMessageIdx.bind(this);
  }

  componentWillMount() {
    let web3;
    if(window.web3) { // Metamask
      web3 = new Web3(window.web3.currentProvider);
      web3.eth.getAccounts()
      .then(accs => {
        let account = accs[0] ? accs[0] : null;
        this.setState({connectedAccount: account});
        return accs[0];
      }).then(connectedAccount => {
        let balance = connectedAccount ? web3.eth.getBalance(connectedAccount) : null
        return balance
      }).then(balance => {
        if(balance) {
          this.setState({accountBalance: web3.utils.fromWei(balance, 'ether')})
        }
      })
    } else { // Infura
      web3 = new Web3('https://ropsten.infura.io/506w9CbDQR8fULSDR7H0');
    }
    web3.eth.net.isListening()
    .then(connected => {
      this.setState({web3: web3,
                     isConnected: connected})
      if(connected) {
        let connectedToNetwork;
        web3.eth.net.getId()
        .then(id => {
          switch(id) {
            case 1: connectedToNetwork = 'Mainnet'; break;
            case 3: connectedToNetwork = 'Ropsten'; break;
            case 4: connectedToNetwork = 'Rinkeby'; break;
            case 42: connectedToNetwork = 'Kovan'; break;
            default: connectedToNetwork = null;
          }
          this.setState({Network: connectedToNetwork})
          if(connectedToNetwork === 'Ropsten') {
            this.loadGuestbookContract();
            this.interval = setInterval(this.refreshData, 5000);
          }
        })
      }
    })  
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  refreshData() {
    this.state.guestbookContract.methods.running_id().call()
    .then(numEntries => {
      if(numEntries > this.state.guestbookMessages.length) {
        this.loadGuestbookEntries(numEntries);
      }
    })
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };
  
  loadGuestbookEntries(numEntries) {
    let promiseList = [];
    for(let i=this.state.guestbookMessages.length; i<numEntries; i++) {
      promiseList.push(
        this.state.guestbookContract.methods.getEntry(i).call()
        .then(entry => {
          return {
            id: i,
            address: entry[0],
            alias: entry[1],
            blocknumber: entry[2],
            timestamp: entry[3],
            donation: entry[4],
            message: entry[5]
          }
        })
      )
    }
    Promise.all(promiseList).then((messages) => {
      messages = messages.sort((a, b) => d3.descending(a.timestamp, b.timestamp));
      this.setState({
        guestbookMessages: messages.concat(this.state.guestbookMessages),
        idxMessage: 0,
      })
    })
  }

  loadGuestbookContract() { 
  // fresh load of the guestbook
    let guestbookContract = new this.state.web3.eth.Contract(guestbookABI, guestbookAddress);
    this.setState({guestbookContract: guestbookContract,
                   guestbookMessages: []},
    () => {
      guestbookContract.methods.running_id().call()
      .then(numEntries => this.loadGuestbookEntries(numEntries))
    })
  }

  donate() {
    this.state.guestbookContract.methods
    .createEntry(this.state.alias, this.state.message)
    .estimateGas({from: this.state.connectedAccount,
                  value:this.state.donation*1e18, 
                  gasPrice:4e9})
    .then(estimatedGasPrice => 
      this.state.guestbookContract.methods
        .createEntry(this.state.alias, this.state.message)
        .send({from: this.state.connectedAccount,
               value: this.state.donation*1e18,
               gas: Math.round(estimatedGasPrice*1.1),
               gasPrice: 4e9})
    );
    
  }

  changeMessageIdx(changeBy) {
    let newIdx = (this.state.idxMessage + changeBy) % this.state.guestbookMessages.length;
    if (newIdx<0) newIdx += this.state.guestbookMessages.length;
    this.setState({
      idxMessage: newIdx
    })
  }

  getGuestbook() {
    if(!this.state.isConnected){
      return (<p className={cssStyles.failedMessage}>Connecting to Ethereum via Infura seems to have failed. You're supposed to see our guestbook here. Check if your internet provider is blocking or come into contact with us, so we can trace this down.</p>)
    }
    else {
      let guestbookWriteElement;
      if(!window.web3) {
        guestbookWriteElement = (
          <div>
            <a className={cssStyles.a} href='http://metamask.io' target="_blank" rel="noopener noreferrer">
            <img 
              src='https://github.com/MetaMask/metamask-extension/blob/master/app/images/icon-128.png?raw=true'
              alt="Metamask" 
            />
            </a>            
            <p className={cssStyles.p}>Install the <a className={cssStyles.a} href='http://metamask.io' target="_blank" rel="noopener noreferrer">Metamask</a> browser plugin to write to the donation guestbook.</p> 
          </div>
        )
      } else {
        if(this.state.connectedAccount) {
          guestbookWriteElement = (
            <form className={this.props.container} noValidate autoComplete="off">
              <TextField
                id="alias"
                label="Alias"
                className={this.props.textField}
                value={this.state.alias}
                InputProps={{onChange:this.handleChange('alias')}}
                margin="normal"
                fullWidth
              />
              <TextField
                id="message"
                label="Message"
                multiline
                className={this.props.textField}
                value={this.state.message}
                onChange={this.handleChange('message')}
                margin="normal"
                fullWidth
              />
              <TextField
                id="donation"
                label="Donation"
                className={this.props.textField}
                value={this.state.donation}
                onChange={this.handleChange('donation')}
                margin="normal"
                type="number"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{ min: "0", step: "0.01" }}
              />
              <Button 
                className={this.props.button} 
                variant="raised" 
                color="primary"
                onClick={this.donate}>
                Donate <i className="fa fa-heart"></i>
              </Button>
            </form>
          )
        // <FontAwesomeIcon style={{float: 'right', marginLeft:'5px'}} icon={faHeart}/>
        } else {
          guestbookWriteElement = (
            <div>
              <p className={cssStyles.p}>
                You are not connected in Metamask. Please log in if you want to donate.
              </p>
            </div>
          )
        }
      }


      let guestbookMessagesElement;
      if(this.state.guestbookMessages && this.state.guestbookMessages.length>0) {
        let guestbookEntry = this.state.guestbookMessages[this.state.idxMessage];
        let timestamp = new Date(guestbookEntry.timestamp * 1000);
        let msg = guestbookEntry.message ? guestbookEntry.message : '-'; 
        guestbookMessagesElement = (
          <div>
            <p className={cssStyles.p}>Received Donations</p> 
            <Card className={this.props.card} style={{height:'100%'}}>
              <CardContent>
                <p>{guestbookEntry.alias} donated {guestbookEntry.donation/1e18} Ξ</p>
                <p style={{fontStyle:'italic'}}>{msg}</p>
                <p>{timestamp.toLocaleDateString()}</p>
              </CardContent>
              <CardActions style={{ marginLeft:'auto'}}>
                <i onClick={()=>this.changeMessageIdx(-1)} className="fa fa-chevron-left"></i>
                <i onClick={()=>this.changeMessageIdx(+1)} className="fa fa-chevron-right"></i>
                <span>{this.state.idxMessage+1} / {this.state.guestbookMessages.length}</span>
              </CardActions>
            </Card>
          </div>
        )
      } else {
        guestbookMessagesElement = (
          <div style={{marginTop:'100px'}}>Loading Guestbook...</div>
        )
      }
      return (
        <div className={cssStyles.Guestbook}>
          <div className={cssStyles.GuestbookEnterMessage}>
            {guestbookWriteElement}
          </div>
          <div className={cssStyles.GuestbookReadMessages}>
            {guestbookMessagesElement}
          </div>
        </div>
      )
    }
  }

  render() {
    var guestbook = this.getGuestbook();
    return (
      <Auxilary>
        <div className={cssStyles.Outer}>
          <div className={cssStyles.PageContainer}>
            <p className={[cssStyles.Heading, cssStyles.p].join(' ')}>Donate</p>
            <p className={cssStyles.p}>This project is community driven and is financed purely by ourselves & donations.</p>
            <p className={cssStyles.p}>If you want to contribute feel free to donate ether or tokens to <a className={cssStyles.a} href="https://etherscan.io/address/0x63c477114690b31a90715e34416819ab860bf0a0">SwapWatch.eth</a>.</p>
            <div>{guestbook}</div>
          </div>
        </div>
      </Auxilary>
    );
  }
}

export default withStyles(cssStyles)(Donate);