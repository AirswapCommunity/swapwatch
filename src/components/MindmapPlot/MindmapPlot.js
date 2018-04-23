import React, { Component } from "react";
import { withStyles } from 'material-ui/styles';
import cssStyles from './MindmapPlot.css';

import vis from 'vis';
import * as Web3 from 'web3';
// require('vis/dist/vis-network.min.css');


const styles = theme => ({
});

const ERC20_abi = [{"constant": true,"inputs": [],"name": "name","outputs": [{"name": "","type": "string"    }  ],  "payable": false,  "type": "function"},{  "constant": false,  "inputs": [    {"name": "_spender","type": "address"    },    {"name": "_value","type": "uint256"    }  ],  "name": "approve",  "outputs": [    {"name": "success","type": "bool"    }  ],  "payable": false,  "type": "function"},{  "constant": true,  "inputs": [],  "name": "totalSupply",  "outputs": [    {"name": "","type": "uint256"    }  ],  "payable": false,  "type": "function"},{  "constant": false,  "inputs": [    {"name": "_from","type": "address"    },    {"name": "_to","type": "address"    },    {"name": "_value","type": "uint256"    }  ],  "name": "transferFrom",  "outputs": [    {"name": "success","type": "bool"    }  ],  "payable": false,  "type": "function"},{  "constant": true,  "inputs": [],  "name": "decimals",  "outputs": [    {"name": "","type": "uint8"    }  ],  "payable": false,  "type": "function"},{  "constant": true,  "inputs": [],  "name": "version",  "outputs": [    {"name": "","type": "string"    }  ],  "payable": false,  "type": "function"},{  "constant": true,  "inputs": [    {"name": "_owner","type": "address"    }  ],  "name": "balanceOf",  "outputs": [    {"name": "balance","type": "uint256"    }  ],  "payable": false,  "type": "function"},{  "constant": true,  "inputs": [],  "name": "symbol",  "outputs": [    {"name": "","type": "string"    }  ],  "payable": false,  "type": "function"},{  "constant": false,  "inputs": [    {"name": "_to","type": "address"    },    {"name": "_value","type": "uint256"    }  ],  "name": "transfer",  "outputs": [    {"name": "success","type": "bool"    }  ],  "payable": false,  "type": "function"},{  "constant": false,  "inputs": [    {"name": "_spender","type": "address"    },    {"name": "_value","type": "uint256"    },    {"name": "_extraData","type": "bytes"    }  ],  "name": "approveAndCall",  "outputs": [    {"name": "success","type": "bool"    }  ],  "payable": false,  "type": "function"},{  "constant": true,  "inputs": [    {"name": "_owner","type": "address"    },    {"name": "_spender","type": "address"    }  ],  "name": "allowance",  "outputs": [    {"name": "remaining","type": "uint256"    }  ],  "payable": false,  "type": "function"},{  "inputs": [    {"name": "_initialAmount","type": "uint256"    },    {"name": "_tokenName","type": "string"    },    {"name": "_decimalUnits","type": "uint8"    },    {"name": "_tokenSymbol","type": "string"    }  ],  "type": "constructor"},{  "payable": false,  "type": "fallback"},{  "anonymous": false,  "inputs": [    {"indexed": true,"name": "_from","type": "address"    },    {"indexed": true,"name": "_to","type": "address"    },    {"indexed": false,"name": "_value","type": "uint256"    }  ],  "name": "Transfer",  "type": "event"},{  "anonymous": false,  "inputs": [    {"indexed": true,"name": "_owner","type": "address"    },    {"indexed": true,"name": "_spender","type": "address"    },    {"indexed": false,"name": "_value","type": "uint256"    }  ],  "name": "Approval",  "type": "event"},]
const ETH_address = '0x0000000000000000000000000000000000000000';

class MindmapPlot extends Component {

  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      isConnected: false,
      contractToken1: null,
      contractToken2: null,
      loadedMindmapData: false,
      nodeIdList: null,
      nodeAddressList: null,
      nodeAdjacencyList: null,
      nodeToken1BalanceList: null,
      nodeToken2BalanceList: null,
      Network: null,
      nodes: null,
      edges: null,
    };
  }

  componentWillMount() {
    let web3 = new Web3('https://mainnet.infura.io/506w9CbDQR8fULSDR7H0');
    let {token1, token2} = this.props;
    
    web3.eth.net.isListening()
    .then(connected => {
      let contractToken1;
      let contractToken2;

      if(token1.address !== ETH_address)
        contractToken1 = new web3.eth.Contract(ERC20_abi, token1.address);
      if(token2.address !== ETH_address)
        contractToken2 = new web3.eth.Contract(ERC20_abi, token2.address);
      this.setState({web3: web3,
                     isConnected: connected,
                     contractToken1: contractToken1,
                     contractToken2: contractToken2})
      if(connected) this.calculateMindmapLists(this.props.txList);
    })
  }

  calculateMindmapLists = (txList)  => {
    let nodeIdList = [];
    let nodeAddressList = [];
    let nodeAdjacencyList = [];
    let nodeToken1BalanceList = [];
    let nodeToken2BalanceList = [];
    let numberOfNodes = 0;
    
    let promisesBalance = [];

    let isIdInList = (nodeAddress) => {
      let idxNodeInAddressList = nodeAddressList.indexOf(nodeAddress);
      let node_id;
      if (idxNodeInAddressList > -1) { 
        node_id = idxNodeInAddressList;
      } else {
        node_id = numberOfNodes;
        nodeIdList.push(node_id);
        nodeAddressList.push(nodeAddress);
        nodeAdjacencyList.push([]);
        numberOfNodes++;
      }
      return node_id;
    }

    //reads a txList and sorts its entries to 
    //nodeAddressList and nodeAdjacencyList 
    for(let txData of txList) {
      // check whether addresses have already been seen before
      let idMaker = isIdInList(txData.makerAddress);
      let idTaker = isIdInList(txData.takerAddress);
      txData.idMaker = idMaker;
      txData.idTaker = idTaker;
      // add entry to nodeAdjacencyList
      nodeAdjacencyList[idMaker].push(txData);
    }

    for(let i=0; i<nodeAddressList.length; i++) {
      if(this.state.contractToken1)
        promisesBalance.push(
          this.state.contractToken1.methods.balanceOf(nodeAddressList[i]).call()
          .then((balance) => {
            nodeToken1BalanceList[i] = balance / 10**this.props.token1.decimal;
          })
        )
      else
        promisesBalance.push(
          this.state.web3.eth.getBalance(nodeAddressList[i])
          .then((balance) => {
            nodeToken1BalanceList[i] = balance / 1e18;
          })
        )
      if(this.state.contractToken2)
        promisesBalance.push(
          this.state.contractToken2.methods.balanceOf(nodeAddressList[i]).call()
          .then((balance) => {
            nodeToken2BalanceList[i] = balance / 10**this.props.token2.decimal;
          })
        )
      else
        promisesBalance.push(
          this.state.web3.eth.getBalance(nodeAddressList[i])
          .then((balance) => {
            nodeToken2BalanceList[i] = balance / 1e18;
          })
        )
    }

    Promise.all(promisesBalance)
    .then(() =>{
      // calculate node list
      let min_node_val = Math.min(...nodeToken1BalanceList);
      let max_node_val = Math.max(...nodeToken1BalanceList);
      
      let A = (50-10)/(Math.sqrt(max_node_val) - Math.sqrt(min_node_val));
      let b = 50 - A*Math.sqrt(max_node_val);

      let nodes = [];
      for(let i=0; i< nodeIdList.length; i++){
        let node_id = nodeIdList[i];
        let node_label = '';
        let title;

        title = nodeAddressList[node_id] +
                '<br><u>Balance</u><br>' + nodeToken1BalanceList[node_id] + ' ' + this.props.token1.symbol +
                '<br>' + nodeToken2BalanceList[node_id] + ' ' + this.props.token2.symbol

        let size: number;
        
        size = A * Math.sqrt(nodeToken1BalanceList[node_id]) +b;
        nodes.push({
          id: node_id,
          label: node_label,
          size: size,
          url: 'https://etherscan.io/address/'+nodeAddressList[node_id],
          title: title
        })
      }

      //calculate edge list

      let edges = [];

      let vals = [];
      for (let i=0; i<nodeAdjacencyList.length; i++) {
        let adjacency_list = nodeAdjacencyList[i];
        if (adjacency_list === undefined) continue;
        for(let j=0; j<adjacency_list.length;j++) {
          vals.push(adjacency_list[j].makerAmount);
        }
      }

      let min_edge_value = Math.min(...vals);
      let max_edge_value = Math.max(...vals);

      A = (10-0.1)/(Math.sqrt(max_edge_value) - Math.sqrt(min_edge_value));
      b = 10 - A*Math.sqrt(max_edge_value);

      let edgeRunningId = 0;
      for (let i=0; i<nodeAdjacencyList.length; i++) {
        let adjacency_list = nodeAdjacencyList[i];
        
        if (adjacency_list === undefined) continue;
        for(let j=0; j<adjacency_list.length;j++) {
          let edge = adjacency_list[j];
          let title = edge.hash;
          if(edge.timestamp!==undefined) {
            let timestamp = new Date(edge.timestamp * 1000);
            title = title + '<br>@ ' + timestamp.toLocaleDateString() + ' ' +
                                       timestamp.toLocaleTimeString();
          };
          
          title = title + '<br><i>Gas Used</i>: ' + edge.gasUsed;
          title = title + ' @ ' + edge.gasPrice/1e9 + ' GWei';
          
          title = title + '<br><i>Maker &harr; Taker</i>: ' + edge.makerAmount + ' ' + edge.makerSymbol;
          title = title + ' &harr; ' + edge.takerAmount + ' ' + edge.takerSymbol;
          title = title + '<br><i>Price</i>: ' + edge.price + ' ' + edge.takerSymbol + ' / ' + edge.makerSymbol;

          edges.push({
            id: edgeRunningId,
            from: edge.idMaker, 
            to: edge.idTaker,
            title: title,
            width: A*Math.sqrt(edge.makerAmount) + b,//m*edge.value+b,
            url:  'https://etherscan.io/tx/'+edge.hash
          });
          edgeRunningId++;
        }      
      }
      this.setState({
        loadedMindmapData: true,
        nodeIdList: nodeIdList,
        nodeAddressList: nodeAddressList,
        nodeAdjacencyList: nodeAdjacencyList,
        nodeToken1BalanceList: nodeToken1BalanceList,
        nodeToken2BalanceList: nodeToken2BalanceList,
        nodes: nodes,
        edges: edges
      })
    });
  }

  createMindmap = (nodeList, edgeList) => {
    let nodes = new vis.DataSet(this.state.nodes);
    let edges = new vis.DataSet(this.state.edges);

    var graph = {
      nodes: nodes,
      edges: edges
    };
     
    let options = {
      nodes: {
        shape: 'dot',
        scaling: {
          min: 10,
          max: 25,
          label: {
            min: 5,
            max: 50,
            drawThreshold: 12,
            maxVisible: 20
          }
        },
        font: {
          size: 24,
          face: 'Tahoma'
        },
        color: {
          border: '#154A87',
          background: '#267ECC',
          hover: {
            border:'#2092A8',
            background: '#6CBEF1'
          },
          highlight: {
            border:'#2092A8',
            background: '#6CBEF1'
          }
        }
      },
      edges: {
        arrows: {
          to: true,
          from: true
        }
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.01,
          damping: 0.09,
          avoidOverlap: 0.1
        },
        maxVelocity: 50,
        minVelocity: 0.1,
        solver: 'barnesHut',
        stabilization: {
          enabled: true,
          iterations: 100,
          updateInterval: 50,
          onlyDynamicEdges: false,
          fit: true
        },
        timestep: 0.5,
        adaptiveTimestep: true
                  
      },
      layout: {
        randomSeed: 1,
        improvedLayout: false,
        hierarchical: {
            enabled: false,
            direction: 'UD',
            sortMethod: 'directed'
        }
      },
      interaction: {
        dragNodes: true,
        tooltipDelay: 200,
        hover: true
      }
    };
    
    var network = new vis.Network(this.refs.MindMap, graph, options);
    
    network.on("click", params => {
      if (params.nodes.length === 0 && params.edges.length > 0) {
        let edge = edges.get(params.edges[0]);
        window.open(edge.url, '_blank');
      }
      else if (params.nodes.length === 1) {
          let node = nodes.get(params.nodes[0]);
          window.open(node.url, '_blank');
      }
    })

    network.on("stabilizationProgress", function(params) {
        document.getElementById('progressText').innerHTML = Math.round(params.iterations/params.total*100) + '%';
    });
    network.once("stabilizationIterationsDone", function() {
        document.getElementById('progressText').style.display = 'none';
        document.getElementById('messageText').style.display = 'none';
        document.getElementById('spinner').style.display ='none'
    });
  }

  render() {
    if (this.state.loadedMindmapData) this.createMindmap();
    return (<div className={cssStyles.MindmapContainer}>
      <div id="messageText">Loading Mindmap</div>
      <div id="progressText">0%</div>
      <div id="spinner"><i className="fa fa-spinner fa-spin fa-3x"></i></div>
      <div className={cssStyles.Mindmap} ref='MindMap'></div>
    </div>);
  }
}


export default withStyles(styles)(MindmapPlot);