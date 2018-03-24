import React, { Component } from "react";
import PropTypes from "prop-types";

import { withStyles } from 'material-ui/styles';
// import cssStyles from './CandlestickChart.css';


import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { scaleTime } from "d3-scale";
import { utcDay } from "d3-time";

import { ChartCanvas, Chart } from "react-stockcharts";
import { BarSeries,
         LineSeries,
         BollingerSeries,
         AreaSeries,
         CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CrossHairCursor,
  CurrentCoordinate,
  MouseCoordinateX,
  MouseCoordinateY
} from "react-stockcharts/lib/coordinates";


import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip, MovingAverageTooltip, BollingerBandTooltip  } from "react-stockcharts/lib/tooltip";
import { ema, sma, bollingerBand } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";

const styles = theme => ({
});

const bbStroke = {
  top: "#964B00",
  middle: "#000000",
  bottom: "#964B00",
};

const bbFill = "#4682B4";

class CandlestickChart extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  getCandlestickChart = () => {
    const xAccessor = (d) => d.date;
    const xExtents = [
      xAccessor(last(this.props.data)),
      xAccessor(this.props.data[20])
    ];
    const ema20 = ema()
      .options({
        windowSize: 20, // optional will default to 10
        sourcePath: "close", // optional will default to close as the source
      })
      .skipUndefined(true) // defaults to true
      .merge((d, c) => {d.ema20 = c;}) // Required, if not provided, log a error
      .accessor(d => d.ema20) // Required, if not provided, log an error during calculation
      .stroke("blue"); // Optional

    const sma20 = sma()
      .options({ windowSize: 20 })
      .merge((d, c) => {d.sma20 = c;})
      .accessor(d => d.sma20);

    const ema50 = ema()
      .options({ windowSize: 50 })
      .merge((d, c) => {d.ema50 = c;})
      .accessor(d => d.ema50);

    const smaVolume50 = sma()
      .options({ windowSize: 20, sourcePath: "volume" })
      .merge((d, c) => {d.smaVolume50 = c;})
      .accessor(d => d.smaVolume50)
      .stroke("#4682B4")
      .fill("#4682B4");

    const bb = bollingerBand()
      .merge((d, c) => {d.bb = c;})
      .accessor(d => d.bb);
  
    const calculatedData = ema20(sma20(ema50(smaVolume50(bb(this.props.data)))));
    
    return (
      <ChartCanvas height={450}
          ratio={this.props.ratio}
          width={this.props.width}
          margin={{ left: 80, right: 80, top: 10, bottom: 40 }}
          type={this.props.type}
          seriesName="AirSwapDEXCandlestick"
          data={this.props.data}
          xAccessor={xAccessor}
          xScale={scaleTime()}
          xExtents={xExtents}
        >
        <Chart id={1}
          yExtents={[d => [d.high, d.low], sma20.accessor(), ema20.accessor(), ema50.accessor(), bb.accessor()]}
          padding={{ top: 10, bottom: 100 }}
          >
          <XAxis axisAt="bottom" orient="bottom" ticks={6}/>
          <YAxis axisAt="right" orient="right" ticks={5} />
          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%Y-%m-%d")} />
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".5f")}
          />
          <CandlestickSeries width={timeIntervalBarWidth(utcDay)}/>
          <BollingerSeries yAccessor={d => d.bb}
            stroke={bbStroke}
            fill={bbFill} />

          <LineSeries yAccessor={sma20.accessor()} stroke={sma20.stroke()}/>
          <LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()}/>
          <LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()}/>
          <CurrentCoordinate yAccessor={sma20.accessor()} fill={sma20.stroke()} />
          <CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
          <CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} />

          <OHLCTooltip forChart={1} origin={[-40, 0]} />
        </Chart>
        <Chart id={2}
          yExtents={[d => d.volume, smaVolume50.accessor()]}
          height={150} origin={(w, h) => [0, h - 150]}
        >
          <YAxis
            axisAt="left"
            orient="left"
            ticks={5}
            tickFormat={format(".2s")}
          />

          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".4s")}
          />

          <BarSeries
            yAccessor={d => d.volume}
            fill={d => (d.close > d.open ? "#6BA583" : "#FF0000")}
          />
          <AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()}/>
          <CurrentCoordinate yAccessor={smaVolume50.accessor()} fill={smaVolume50.stroke()} />
          <CurrentCoordinate yAccessor={d => d.volume} fill="#9B0A47" />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    )
  }
  
  render() {
    console.log('Rendering CandlestickChart');
    
    var chart = (this.props.data && this.props.data.length > 0) ? (
      this.getCandlestickChart()) : null;

    return (
      <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        {chart}
      </div>
    );
  }
}

CandlestickChart.propTypes = {
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandlestickChart.defaultProps = {
  type: "hybrid",
};
CandlestickChart = fitWidth(CandlestickChart);

export default withStyles(styles)(CandlestickChart);