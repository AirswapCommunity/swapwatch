import React, { Component } from "react";
import { withStyles } from 'material-ui/styles';
import ReactTable from 'react-table';
import cssStyles from './TradingDataTable.css';
import { fitDimensions } from "react-stockcharts/lib/helper";

const styles = theme => ({
});

class TradingDataTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sort: [{
        id: 'date',
        desc: true,
        pageSize: 25,
      }]
    };

    this.maxHeight = props.height;
    this.maxWidth = props.width;
    this.marginBottom = 220;
    this.bottomOffset = 20;
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentDidMount() {
    this.handleWindowSizeChange();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  componentDidUpdate() {
    this.maxHeight = this.props.height;
    this.maxWidth = this.props.width;
  }

  setRef = (el) => {
    this.container = el;
  }

  handleWindowSizeChange = () => {
    clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => this.forceUpdate(), 500);
  };

  handleSortChanged = (newSort, column, shiftKey) => {
    this.setState({ sort: newSort });
  };

  getTable = () => {
    if (this.props.height < 150) {
      return null
    } else {
      // var offset = 75;
      var fontSize = '.75em';

      if (this.props.width > 600) {
        // offset = 20;
        fontSize = '1em';
      } else if (this.props.width > 320) {
        // offset = 70;
      }

      return (
        <ReactTable
          data={this.props.txList}
          style={{ height: this.maxHeight - this.marginBottom, width: this.maxWidth, fontSize: fontSize }}
          columns={[
            {
              Header: "Date",
              id: "date",
              accessor: d => {
                var timestamp = new Date(d.timestamp * 1000);
                return (
                  <div>
                    <span style={{ float: 'left', marginLeft: '5px' }}>
                      {timestamp.toLocaleDateString()}
                    </span>
                    <span style={{ float: 'right', marginRight: '5px' }}>
                      {timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )
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
          key={this.state.pageSize}
          sorted={this.state.sort}
          defaultPageSize={25}
          showPageSizeOptions={false}
          onSortedChange={this.handleSortChanged}
          className={[cssStyles.Table, '-highlight', '-striped'].join(' ')}>
        </ReactTable>
      )
    }
  }

  render() {
    var table = (this.props.txList && this.props.txList.length > 0) ? (
      this.getTable()) : null;

    return (
      <div className={cssStyles.TableContainer}
        ref={this.setRef} style={{ width: this.maxWidth, height: this.maxHeight - this.marginBottom }}>
        {table}
      </div>
    );
  }
}


export default fitDimensions(withStyles(styles)(TradingDataTable));