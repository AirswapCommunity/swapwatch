import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { withStyles } from 'material-ui/styles';
import ReactTable from 'react-table';
import cssStyles from './TradingDataTable.css';

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
      }],
      containerHeight: 100,
      containerWidth: 100,
    };
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

  setRef = (el) => {
    this.container = el;
  }

  handleWindowSizeChange = () => {
    var height = ReactDOM.findDOMNode(this.container).clientHeight;
    var width = ReactDOM.findDOMNode(this.container).clientWidth;
    this.setState({ containerHeight: height,
                    containerWidth: width })
  };


  handleSortChanged = (newSort, column, shiftKey) => {
    this.setState({ sort: newSort });
  };

  getTable = () => {
    if(this.state.containerHeight < 150) {
      return null
    } else {
      let tableHeight = this.state.containerHeight - ((this.state.containerHeight-700)*30/(150-700) + 50);
      return (
        <ReactTable
          data={this.props.txList}
          style={{height:tableHeight}}
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
    console.log('Rendering TradingDataTable');
    var table = (this.props.txList && this.props.txList.length > 0) ? (
      this.getTable()) : null;

    return (
      <div className={cssStyles.TableContainer} 
           ref={this.setRef}>
        {table}
      </div>
    );
  }
}


export default withStyles(styles)(TradingDataTable);