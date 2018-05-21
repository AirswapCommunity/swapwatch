import React, { Component } from "react";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { withStyles } from 'material-ui/styles';
import styles from './StatsHistogram.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Rectangle, LabelList } from 'recharts';
import { format } from "d3-format";
import Avatar from 'material-ui/Avatar';

const tokenFormat = format(".4s");
const formatCurrency = (x) => { return x.toLocaleString(undefined, { style: "currency", currency: "USD" }); }

class StatsHistogram extends Component {

  renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    const radius = 32;

    return (
      <g>
        <image x={x + (width / 2) - 16} y={y - radius - 10} href={value} height="32" width="32" />
      </g>
    );
  };

  createChart = () => {
    let displayData = this.props.tokenVolumeInfo
      .sort((a, b) => { return b.VolumeToday - a.VolumeToday })
      .slice(0, 5); // determine how many should be displayed

    return (
      <div>
        <BarChart
          width={this.props.width}
          height={this.props.height}
          data={displayData}
          margin={{ top: 20, right: 11, left: 11, bottom: 0 }}>
        >
          <XAxis dataKey="name" tickMargin={5} />
          <YAxis tickFormatter={formatCurrency} width={100} type='number' allowDataOverflow={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d0d0d0', strokeWidth: 1, fill: '#f0f0f0' }} offset={-65}/>
          <Bar shape={CustomBar} dataKey="VolumeToday">
            <LabelList dataKey="logo" content={this.renderCustomizedLabel} />
          </Bar>
        </BarChart>
      </div>
    )
  };

  render() {
    let barChartElement;
    barChartElement = this.props.tokenVolumeInfo ? this.createChart() : null;
    return (<div className={styles.StatsHistogramContainer}>
      <div className={styles.StatsHistogramContainer}>
        {barChartElement}
      </div>
    </div>);
  }
}

export default fitDimensions(withStyles(styles)(StatsHistogram));

function shadeColor(color, percent) {
  return window.tinycolor(color).darken(percent).desaturate(percent).toString();
}

const CustomBar = (props) => {
  const { index } = props;  
  let fill = shadeColor('#34b5f4', index * 5);
  return <Rectangle className={props.name} {...props} fill={fill} />
};

const CustomTooltip = (props) => {
  const { active } = props;
  if (active) {
    const { label, payload } = props;
    return (
      <div className={styles.customTooltip}>
        <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
          <Avatar src={payload[0].payload.logo} style={{ backgroundColor: 'whitesmoke', padding: '2' }} imgProps={{ height: '32', className: 'avatarImage' }}>
          </Avatar>
        </div>
        <span className="label">{label}</span>
        <p className="volume"><strong>{formatCurrency(payload[0].payload.VolumeToday)}</strong></p>
        <p className="tokenVolume"><strong>{`${tokenFormat(payload[0].payload.tokenVolumeToday)} ${label}`}</strong></p>
      </div>
    );
  }

  return null;
};