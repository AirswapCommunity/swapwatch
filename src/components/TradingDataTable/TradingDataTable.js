import React, { Component } from "react";
import { withStyles } from 'material-ui/styles';
// import cssStyles from './TradingDataTable.css';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';

const styles = theme => ({
});

class TradingDataTable extends Component {
  getTable = () => {return(
      <Table height='100%'>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Maker gives</TableCell>
            <TableCell>Taker gives</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Gas Cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.txList.map(tx => {
            return (
              <TableRow key={tx.hash}>
                <TableCell>{tx.timestamp}</TableCell>
                <TableCell>{tx.makerAmount} {tx.makerSymbol}</TableCell>
                <TableCell>{tx.takerAmount} {tx.takerSymbol}</TableCell>
                <TableCell>{tx.price}</TableCell>
                <TableCell>{tx.gasCost}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )}

  render() {
    console.log('Rendering TradingDataTable');
    var table = (this.props.txList && this.props.txList.length>0) ? (
      this.getTable()) : null;

    return (
      <Paper>
        {table}
      </Paper>
    );
  }
}


export default withStyles(styles)(TradingDataTable);