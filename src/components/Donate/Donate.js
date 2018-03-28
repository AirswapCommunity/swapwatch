import React from "react";
import Auxilary from "../../hoc/Auxilary";
import { withStyles } from 'material-ui/styles';
import cssStyles from "./Donate.css";

import TextField from 'material-ui/TextField';
import List, {
  ListItem,
  ListItemText,
} from 'material-ui/List';

import * as Web3 from 'web3';
import * as d3 from "d3";

class Donate extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      'web3': null,
      'isConnected': false,
      'Network': null,
      'alias:': null,
      'message:': null,
      'donation:': null,
      'guestbookMessages': null,
    }
  }

  componentWillMount() {
    let web3;
    if(window.web3) { // Metamask
      web3 = new Web3(window.web3.currentProvider);
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
          }
        })
      }
    })  
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };
  
  generate(element) {
    return [0, 1, 2].map(value =>
      React.cloneElement(element, {
        key: value,
        secondary: value
      }),
    );
  }

  loadGuestbookContract() {
    let guestbookAddress = '0xdc20B1256E2def911B1B6Db7dc98F62878dCAFD2';
    let guestbookABI = [{"constant":true,"inputs":[],"name":"minimum_donation","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_new_storage","type":"address"}],"name":"changeDonationWallet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"running_id","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_new_owner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"entries","outputs":[{"name":"owner","type":"address"},{"name":"alias","type":"string"},{"name":"timestamp","type":"uint256"},{"name":"blocknumber","type":"uint256"},{"name":"donation","type":"uint256"},{"name":"message","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_minDonation","type":"uint256"}],"name":"changeMinimumDonation","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"entry_id","type":"uint256"}],"name":"getEntry","outputs":[{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_alias","type":"string"},{"name":"_message","type":"string"}],"name":"createEntry","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"donationWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}];
    let guestbookContract = new this.state.web3.eth.Contract(guestbookABI, guestbookAddress);
    guestbookContract.methods.running_id().call()
    .then(numEntries => {
      let promiseList = [];      
      for(let i=0; i<numEntries; i++) {
        promiseList.push(
          guestbookContract.methods.getEntry(i).call()
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
        this.setState({guestbookMessages: messages})
      })
    })
  }

  getGuestbook() {
    if(!this.state.isConnected){
      return (<p className={cssStyles.p}>Connection to Ethereum via Infura seems to have failed. You're supposed to see the guestbook here.</p>)
    }
    else {
      let guestbookWriteElement;
      if(!window.web3) {
        guestbookWriteElement = (
          <div>
            <a className={cssStyles.a} href='http://metamask.io' target="_blank">
            <img src='https://github.com/MetaMask/metamask-extension/blob/master/app/images/icon-128.png?raw=true'/>
            </a>            
            <p className={cssStyles.p}>Install the <a className={cssStyles.a} href='http://metamask.io' target="_blank">Metamask</a> browser plugin to write to the donation guestbook.</p> 
          </div>
        )
      } else {
        guestbookWriteElement = (
          <div>
            <TextField
              id="alias"
              label="Alias"
              className={this.props.textField}
              value={this.state.alias}
              onChange={this.handleChange('alias')}
              margin="normal"
              defaultValue="Anonymous"
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
              defaultValue="0.05"
              inputProps={{ min: "0", step: "0.01" }}
            />
          </div>
        )
      }


      let guestbookMessagesElement;
      if(this.state.guestbookMessages) {
        let listElems = [];
        for(let message of this.state.guestbookMessages) {
          var timestamp = new Date(message.timestamp * 1000);
          listElems.push((
            <ListItem key={message.id}>
              <ListItemText 
                primary={message.alias+" donated "+message.donation/1e18+" Ξ @ "+ timestamp.toLocaleTimeString()}
                secondary={message.message}
                    />
            </ListItem>
        ))}
        guestbookMessagesElement = (
          <List>
            {listElems}
          </List>
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
