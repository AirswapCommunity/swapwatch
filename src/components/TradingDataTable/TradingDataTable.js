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
            accessor: d => new Date(d.timestamp).toLocaleTimeString()
          },
          {
            Header: "Maker Gives",
            id: "maker",
            accessor: d => { return `${d.makerAmount} ${d.makerSymbol}`; }
          },
          {
            Header: "Taker Gives",
            id: "taker",
            accessor: d => { return `${d.takerAmount} ${d.takerSymbol}`; }
          },
          {
            Header: "Price",
            accessor: "price"
          },
          {
            Header: "Gas Cost",
            accessor: "gasCost"
          },
        ]
        }
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