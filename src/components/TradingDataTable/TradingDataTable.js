import React, { Component } from "react";
import { withStyles } from 'material-ui/styles';
import ReactTable from 'react-table';
import './TradingDataTable.css';

const styles = theme => ({
});

class TradingDataTable extends Component {
  getTable = () => {
    return (
      <ReactTable
        data={this.props.txList}
        columns={[
          {
            Header: "Date",
            id: "date",
            accessor: d => {
              var timestamp = new Date(d.timestamp * 1000);
              return <div><span style={{ float: 'left', marginLeft: '5px' }}>{timestamp.toLocaleDateString()}</span><span style={{ float: 'right', marginRight: '5px' }}>{timestamp.toLocaleTimeString()}</span></div>
            }
          },
          {
            Header: "Maker Gives",
            id: "maker",
            accessor: d => { return `${d.makerAmount.toPrecision(8)} ${d.makerSymbol}`; },
            style: {
              textAlign: 'right'
            }
          },
          {
            Header: "Taker Gives",
            id: "taker",
            accessor: d => { return `${d.takerAmount.toPrecision(8)} ${d.takerSymbol}`; },
            style: {
              textAlign: 'right'
            }
          },
          {
            Header: "Price Per",
            id: "price",
            accessor: d => d.price.toFixed(8),
            style: {
              textAlign: 'right'
            }
          },
          {
            Header: "Gas Cost",
            id: "gas",
            accessor: d => d.gasCost.toFixed(8),
            style: {
              textAlign: 'right'
            }
          },
        ]
        }
        sorted={[{
          id: 'date',
          desc: true
        }]}
        defaultPageSize={10}
        showPageSizeOptions={false}
        className="-highlight -striped"
      />
    )
  }

  render() {
    console.log('Rendering TradingDataTable');
    var table = (this.props.txList && this.props.txList.length > 0) ? (
      this.getTable()) : null;

    return (
      <div>
        {table}
      </div>
    );
  }
}


export default withStyles(styles)(TradingDataTable);