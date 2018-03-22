
// const AirSwapTokenAddress = '0x27054b13b1b798b345b591a4d22e6562d47ea75a';
// const AirSwapDEX = '0x8fd3121013a07c57f0d69646e86e7a4880b467b7';
// const AirSwapFilledEvent = '0xe59c5e56d85b2124f5e7f82cb5fcc6d28a4a241a9bdd732704ac9d3b6bfc98ab';
// const EtherscanAPIKey = '8FWC8GZWSE8SJKY7NBSE77XER4KQ8NXK1Z';
const cacheDelay = 60000;

const TokenList = {
    tokens: [],
    timestamp: null
}

const TokenPairStatistics = {
    statistics: {},
    timestamp: null
}

var getTokenList = () => {
    if (TokenList.timestamp && Date.now() - TokenList.timestamp <= cacheDelay ) {
        console.log('getting cached version');
        return;
    }

    TokenList.timestamp = Date.now();

    console.log('hitting webservice to get tokens');
}

module.exports.AirSwap = {
    getTokenList
}
