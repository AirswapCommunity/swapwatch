import React, { Component } from "react";
import Auxilary from "../../hoc/Auxilary";
import { withStyles } from 'material-ui/styles';
// import cssStyles from './CandlestickChart.css';

import { scaleTime } from "d3-scale";
import { utcDay } from "d3-time";

import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";


const styles = theme => ({
});

class CandlestickChart extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  getCandlestickChart = () => {
    const xAccessor = (d) => d.date;
    const xExtents = [
      xAccessor(last(this.props.ohlcData)),
      xAccessor(this.props.ohlcData[this.props.ohlcData.length - 14]) // correct for less than 14 bars...
    ];
    return (
      <ChartCanvas height={400}
          ratio={1.0909}
          width={1000}
          margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
          type='hybrid'
          seriesName="MSFT"
          data={this.props.ohlcData}
          xAccessor={xAccessor}
          xScale={scaleTime()}
          xExtents={xExtents}>

        <Chart id={1} yExtents={d => [d.high, d.low]}>
          <XAxis axisAt="bottom" orient="bottom" ticks={6}/>
          <YAxis axisAt="left" orient="left" ticks={5} />
          <CandlestickSeries width={timeIntervalBarWidth(utcDay)}/>
        </Chart>
      </ChartCanvas>
    )
  }
  
  render() {
    console.log('Rendering CandlestickChart');

    var chart = (this.props.ohlcData && this.props.ohlcData.length > 0) ? (
      this.getCandlestickChart()) : null;

    return (
      <Auxilary>
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          {chart}
        </div>
      </Auxilary>
    );
  }
}

export default withStyles(styles)(CandlestickChart);