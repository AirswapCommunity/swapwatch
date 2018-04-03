import React, { Component } from "react";
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";

import { withStyles } from 'material-ui/styles';
import cssStyles from './CandlestickChart.css';


import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
  BarSeries,
  LineSeries,
  BollingerSeries,
  AreaSeries,
  CandlestickSeries
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CrossHairCursor,
  CurrentCoordinate,
  MouseCoordinateX,
  MouseCoordinateY
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip } from "react-stockcharts/lib/tooltip";
import { ema, sma, bollingerBand } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

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
    this.container = null;
    this.state = {
      containerHeight: 100,
      containerWidth: 100,
    }
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
    if (width > 0) {
      this.setState({ containerHeight: height,
                      containerWidth: width })
    }
  };

  getCandlestickChart = () => {
    if (!this.props.data) {
      return null;
    }

    // let isMobile = this.state.containerWidth <= 500;

    const ema20 = ema()
      .options({
        windowSize: 20, // optional will default to 10
        sourcePath: "close", // optional will default to close as the source
      })
      .skipUndefined(true) // defaults to true
      .merge((d, c) => { d.ema20 = c; }) // Required, if not provided, log a error
      .accessor(d => d.ema20) // Required, if not provided, log an error during calculation
      .stroke("blue"); // Optional

    const sma20 = sma()
      .options({ windowSize: 20 })
      .merge((d, c) => { d.sma20 = c; })
      .accessor(d => d.sma20);

    const ema50 = ema()
      .options({ windowSize: 50 })
      .merge((d, c) => { d.ema50 = c; })
      .accessor(d => d.ema50);

    const smaVolume50 = sma()
      .options({ windowSize: 20, sourcePath: "volume" })
      .merge((d, c) => { d.smaVolume50 = c; })
      .accessor(d => d.smaVolume50)
      .stroke("#4682B4")
      .fill("#4682B4");

    const bb = bollingerBand()
      .merge((d, c) => { d.bb = c; })
      .accessor(d => d.bb);

    const calculatedData = ema20(sma20(ema50(smaVolume50(bb(this.props.data)))));
    const xScaleProvider = discontinuousTimeScaleProvider
      .inputDateAccessor(d => d.date);
    const {
      data,
      xScale,
      xAccessor,
      displayXAccessor,
    } = xScaleProvider(calculatedData);
    
    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];

    return (
      <ChartCanvas height={this.state.containerHeight - 30}
        ratio={this.props.ratio}
        width={this.props.width}
        margin={{ left: 50, right: 50, top: 10, bottom: 50 }}
        type={this.props.type}
        seriesName="AirSwapDEXCandlestick"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >
        <Chart id={1}
          yExtents={[d => [d.high, d.low], sma20.accessor(), ema20.accessor(), ema50.accessor(), bb.accessor()]}
          padding={{ top: 10, bottom: 100 }}
        >
          <XAxis axisAt="bottom" orient="bottom" ticks={6} />
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
          <CandlestickSeries />
          <BollingerSeries yAccessor={d => d.bb}
            stroke={bbStroke}
            fill={bbFill} />

          <LineSeries yAccessor={sma20.accessor()} stroke={sma20.stroke()} />
          <LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()} />
          <LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()} />
          <CurrentCoordinate yAccessor={sma20.accessor()} fill={sma20.stroke()} />
          <CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
          <CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} />

          <OHLCTooltip origin={[-40, 0]} ohlcFormat={format(".5f")} />
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
          <AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()} />
          <CurrentCoordinate yAccessor={smaVolume50.accessor()} fill={smaVolume50.stroke()} />
          <CurrentCoordinate yAccessor={d => d.volume} fill="#9B0A47" />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    )
  }

  render() {
    var chart = (this.props.data && this.props.data.length > 0) ? (
      this.getCandlestickChart()) : null;

    return (
      <div className={cssStyles.ChartContainer} ref={this.setRef}>
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