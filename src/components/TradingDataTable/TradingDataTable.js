import React, { Component } from "react";
import { withStyles } from 'material-ui/styles';
import Auxilary from "../../hoc/Auxilary";
import cssStyles from './TradingDataTable.css';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';

class TradingDataTable extends Component {
  getTable = () => {return(
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Maker gives</TableCell>
            <TableCell>Taker gives</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Gas Cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody width='100px'>
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
      <Auxilary>
        <Paper>
          {table}
        </Paper>
      </Auxilary>
    );
  }
}


export default withStyles(cssStyles)(TradingDataTable);