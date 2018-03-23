import React, { Component } from "react";
import { withStyles } from 'material-ui/styles';
import Auxilary from "../../hoc/Auxilary";
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';


const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    height: '30vh',
    overflowX: 'auto',
  },
  table: {
    height: '100%'
  },
});

class TradingDataTable extends Component {
  getTable = () => {return(
      <Table className={this.props.classes.table}>
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
      <Auxilary>
        <Paper className={this.props.classes.root}>
          {table}
        </Paper>
      </Auxilary>
    );
  }
}


export default withStyles(styles)(TradingDataTable);