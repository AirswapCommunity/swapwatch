
// const AirSwapTokenAddress = '0x27054b13b1b798b345b591a4d22e6562d47ea75a';
const AirSwapDEX = '0x8fd3121013a07c57f0d69646e86e7a4880b467b7';
const AirSwapFilledEvent = '0xe59c5e56d85b2124f5e7f82cb5fcc6d28a4a241a9bdd732704ac9d3b6bfc98ab';
const EtherscanAPIKey = 'VR4UPKI119TYM93ZV47GXTTGFSMRRDEVGZ';

const cacheDelay = 60000;
const blockHistory = 5838 * 14; // 14 days

const TokenList = {
    tokens: [],
    timestamp: null
}

const TokenPairStatistics = {
    statistics: {},
    timestamp: null
}

const Logs = {
    entries: null,
    timestamp: null,
    startBlock: 0,
    latestBlock: 0
}

var getTokenList = () => {
    if (TokenList.timestamp && Date.now() - TokenList.timestamp <= cacheDelay) {
        console.log('getting cached version');
        return;
    }

    TokenList.timestamp = Date.now();

    console.log('hitting webservice to get tokens');
}

var getLogs = () => {
    // if (Logs.timestamp && Date.now() - Logs.timestamp <= cacheDelay) {
    //     console.log('getting cached version');
    //     return;
    // }

    // Logs.timestamp = Date.now();

    return fetch(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${EtherscanAPIKey}`)
        .then(res => res.json())
        .then(response => {
            console.log(response.result);
            return parseInt(response.result, 16);
        }).then(latestBlock => {
            if (Logs.startBlock === 0) {
                Logs.startBlock = latestBlock - blockHistory;
            }

            var fromBlock = Logs.latestBlock ? Logs.latestBlock + 1 : Logs.startBlock;

            Logs.latestBlock = latestBlock;

            return fetch(`https://api.etherscan.io/api?module=logs&action=getLogs&address=${AirSwapDEX}` +
                `&fromBlock=${fromBlock}` +
                `&toBlock=${latestBlock}` +
                `&topic0=${AirSwapFilledEvent}` +
                `&apikey=etherscan_token`)
                .then(res => res.json())
                .then(response => {
                    Logs.entries = response.result;
                    return response.result;
                });
        });
}

module.exports.AirSwap = {
    getTokenList,
    getLogs
}
