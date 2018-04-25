var getEthVolume = (trades) => {
  let volume = 0;
  let twentyFourHoursAgo = Date.now() / 1000 - 24*60*60;
  for (let trade of trades) {
    if (trade.timestamp > twentyFourHoursAgo) {
      if(trade.makerSymbol === 'ETH' || trade.makerSymbol === 'WETH') {
        volume += trade.makerAmount;
      } else if(trade.takerSymbol === 'ETH' || trade.takerSymbol === 'WETH') {
        volume += trade.takerAmount;
      }
    }
  }

  return volume;
}

module.exports.Stats = {
  getEthVolume,
}
