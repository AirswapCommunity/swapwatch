const fetch = require('node-fetch')

const AirSwapDEX = '0x8fd3121013a07c57f0d69646e86e7a4880b467b7';
const AirSwapFilledEvent = '0xe59c5e56d85b2124f5e7f82cb5fcc6d28a4a241a9bdd732704ac9d3b6bfc98ab';
const EtherscanAPIKey = 'VR4UPKI119TYM93ZV47GXTTGFSMRRDEVGZ';

const cacheDelay = 60000;
const blockHistory = 5838 * 300; // 28 days

const Logs = {
  entries: [],
  timestamp: null,
  startBlock: 0,
  latestBlock: 0
}

var resetLogs = () => {
  Logs.entries = [];
  Logs.timestamp = null;
  Logs.startBlock = 0;
  Logs.latestBlock = 0;
}

var getLogs = (startBlock, endBlock) => {
  if (Logs.timestamp && Date.now() - Logs.timestamp <= cacheDelay) {
    console.log('getting cached version');
    return;
  }

  var fromBlock;
  var toBlock;
  
  return new Promise((resolve, reject) => {
    if (endBlock > 0) {
      resolve(endBlock);
    } else {
      fetch(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${EtherscanAPIKey}`)
      .then(res => res.json())
      .then(response => {
        resolve(parseInt(response.result, 16));
      })
    }
  }).then(endBlock => {
    toBlock = endBlock;

    if(startBlock > 0) {
      fromBlock = startBlock;
    } else if (Logs.startBlock === 0) { // nothing was passed and no history
      fromBlock = toBlock - blockHistory;
      Logs.startBlock = fromBlock;
    } else { // nothing was passed but history is loaded already
      fromBlock = Logs.latestBlock ? Logs.latestBlock + 1 : Logs.startBlock;
    }

    if(fromBlock < Logs.startBlock) Logs.startBlock = fromBlock;
    if(endBlock > Logs.endBlock) Logs.endBlock = toBlock;

    console.log('getting: ', fromBlock, toBlock)
    return fetch(`https://api.etherscan.io/api?module=logs`+
      `&action=getLogs`+
      `&address=${AirSwapDEX}` +
      `&fromBlock=${fromBlock}` +
      `&toBlock=${toBlock}` +
      `&topic0=${AirSwapFilledEvent}` +
      `&apikey=etherscan_token`)
      
  }).then(res => res.json())
  .then(response => {
    if response.status === '0' {
      // something went wrong
      console.log('Error at fetching Etherscan Data. Retrying...')
      let lastLogsEntry;
      let lastLoadedBlocknumber;
      if(Logs.entries && Logs.entries.length > 0) {
        lastLogsEntry = Logs.entries[Logs.entries.length - 1];
        lastLoadedBlocknumber = parseInt(lastLogsEntry.blockNumber, 16);
      } else {
        lastLoadedBlocknumber= 0;
      }
      return getLogs(lastLoadedBlocknumber, toBlock)
    }
    let newEntries = response.result;

    // only implemented to append new data, no checks for attach in front

    if(newEntries && newEntries.length >0) {
      if(Logs.entries && Logs.entries.length > 0) {
        let lastLogsEntry = Logs.entries[Logs.entries.length - 1];
        while(newEntries.length > 0 &&
              newEntries[0].timeStamp <= lastLogsEntry.timeStamp &&
              newEntries[0].transactionHash !== lastLogsEntry.transactionHash) {
          newEntries.splice(0,1); // remove first entry
        }
        if(newEntries.length > 0 &&
           newEntries[0].transactionHash === lastLogsEntry.transactionHash) 
          newEntries.splice(0,1);

        // another check needed for entries in same timestamp or secured by natural order given from etherscan?
      }
      Logs.entries = Logs.entries.concat(newEntries);
    } 

    let lastLogsEntry = Logs.entries[Logs.entries.length - 1];
    let lastLoadedBlocknumber = parseInt(lastLogsEntry.blockNumber, 16);
    
    if(newEntries && newEntries.length > 0 && lastLoadedBlocknumber <  toBlock) {
      return getLogs(lastLoadedBlocknumber, toBlock)
    } else {
      Logs.timestamp = Date.now();
      return Logs.entries; 
    }
  });
}

getLogs()
.then(logs => console.log(logs))
