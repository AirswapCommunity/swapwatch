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
  MouseCoordinateY,
  EdgeIndicator
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip } from "react-stockcharts/lib/tooltip";
import { ema, sma, bollingerBand } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

import HoverTooltip from './HoverTooltip';

const styles = theme => ({
});

const bbStroke = {
  top: "#008eff",
  middle: "#000000",
  bottom: "#008eff",
};

const bbFill = '#008eff'//"#4682B4";
const dateFormat = timeFormat("%Y-%m-%d");
const numberFormat = format(".5f");
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
      this.setState({
        containerHeight: height,
        containerWidth: width
      })
    }
  };

  getCandlestickChart = () => {
    if (!this.props.data) {
      return null;
    }

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

    var bottomOffset = 65;

    if (this.state.containerWidth > 321) {
      bottomOffset = 55;
    } else if (this.state.containerWidth > 600) {
      bottomOffset = 30;
    }

    var height = this.state.containerHeight - bottomOffset;

    if (height - 60 < 0) {
      height = 60;
    }

//<EdgeIndicator itemType="last" orient="right" edgeAt="right"
//   yAccessor={sma20.accessor()} fill={sma20.stroke()} displayFormat={numberFormat} />
// <EdgeIndicator itemType="last" orient="right" edgeAt="right"
//   yAccessor={ema20.accessor()} fill={ema20.stroke()} displayFormat={numberFormat} />
// <EdgeIndicator itemType="last" orient="right" edgeAt="right"
//   yAccessor={ema50.accessor()} fill={ema50.stroke()} displayFormat={numberFormat}/>
//<EdgeIndicator itemType="first" orient="left" edgeAt="left"
//   yAccessor={sma20.accessor()} fill={sma20.stroke()} displayFormat={numberFormat}/>
// <EdgeIndicator itemType="first" orient="left" edgeAt="left"
//   yAccessor={ema20.accessor()} fill={ema20.stroke()} displayFormat={numberFormat}/>
// <EdgeIndicator itemType="first" orient="left" edgeAt="left"
//   yAccessor={ema50.accessor()} fill={ema50.stroke()} displayFormat={numberFormat}/>

// <EdgeIndicator itemType="first" orient="left" edgeAt="left"
//   yAccessor={smaVolume50.accessor()} displayFormat={format(".4s")} fill={smaVolume50.fill()} />
// <EdgeIndicator itemType="last" orient="right" edgeAt="right"
//   yAccessor={smaVolume50.accessor()} displayFormat={format(".4s")} fill={smaVolume50.fill()} />
    return (
      <ChartCanvas height={height}
        ratio={this.props.ratio}
        width={this.props.width}
        margin={{ left: 55, right: 55, top: 10, bottom: 50 }}
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
            displayFormat={numberFormat}
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

          <OHLCTooltip className={styles.OHLCTooltip} origin={[-40, 0]} ohlcFormat={numberFormat} />
          <HoverTooltip 
            yAccessor={ema50.accessor()}
            tooltipContent = {tooltipContent([])}
            fontSize={15}
            token1={this.props.token1}
            token2={this.props.token2}
          />
          <EdgeIndicator itemType="first" orient="left" edgeAt="left"
            yAccessor={d => d.open} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} displayFormat={numberFormat}/>
          <EdgeIndicator itemType="last" orient="right" edgeAt="right"
            yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} displayFormat={numberFormat}/>
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

          <EdgeIndicator itemType="first" orient="left" edgeAt="left"
            yAccessor={d => d.volume} displayFormat={format(".4s")} fill="#0F0F0F" />
          <EdgeIndicator itemType="last" orient="right" edgeAt="right"
            yAccessor={d => d.volume} displayFormat={format(".4s")} fill="#0F0F0F" />
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

function tooltipContent(ys) {
  return ({ currentItem, xAccessor }) => {
    return {
      x: dateFormat(xAccessor(currentItem)),
      y: [
        {
          label: "Open",
          value: currentItem.open && numberFormat(currentItem.open)
        },
        {
          label: "High",
          value: currentItem.high && numberFormat(currentItem.high)
        },
        {
          label: "Low",
          value: currentItem.low && numberFormat(currentItem.low)
        },
        {
          label: "Close",
          value: currentItem.close && numberFormat(currentItem.close)
        },
        {
          label: "Volume",
          value: currentItem.volume && format('.0f')(currentItem.volume)
        }

      ]
        .concat(
          ys.map(each => ({
            label: each.label,
            value: each.value(currentItem),
            stroke: each.stroke
          }))
        )
        .filter(line => line.value)
    };
  };
}
export default withStyles(styles)(CandlestickChart);


// ,
//         {
//           label: "",
//           value: currentItem.date && dateFormat(currentItem.date)
//         }