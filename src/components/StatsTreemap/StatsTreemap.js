import React, { Component } from "react";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { withStyles } from 'material-ui/styles';
import styles from './StatsTreemap.css';
import { Treemap, Tooltip, LabelList } from 'recharts';
import { format } from "d3-format";
import Avatar from 'material-ui/Avatar';

const tokenFormat = format(".4s");
const formatCurrency = (x) => { return x.toLocaleString(undefined, { style: "currency", currency: "USD" }); }

class StatsTreemap extends Component {

  constructor(props) {
    super(props);
    this.container = null;
  }


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
      // .slice(0, 5); // determine how many should be displayed
    var height = this.maxHeight - this.marginBottom;

    if (height - 60 < 0) {
      height = 60;
    }

    return (
      <div>
        <Treemap
          width={this.props.width}
          height={this.props.height}
          data={displayData}
          dataKey="VolumeToday" 
          nameKey="name" 
          fill="#34b5f4" 
        >
          <LabelList dataKey="logo" content={this.renderCustomizedLabel} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d0d0d0', strokeWidth: 1, fill: '#f0f0f0' }} offset={-65}/>
        </Treemap>
      </div>
    )
  };

  render() {
    let barChartElement;
    barChartElement = this.props.tokenVolumeInfo ? this.createChart() : null;
    return (<div className={styles.StatsTreemapContainer}>
      <div className={styles.StatsTreemapContainer}>
        {barChartElement}
      </div>
    </div>);
  }
}

export default fitDimensions(withStyles(styles)(StatsTreemap));

// function shadeColor(color, percent) {
//   return window.tinycolor(color).darken(percent).desaturate(percent).toString();
// }

// const CustomBar = (props) => {
//   const { index } = props;  
//   let fill = shadeColor('#34b5f4', index * 5);
//   return <Rectangle className={props.name} {...props} fill={fill} />
// };

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
        <p className="tokenVolume"><strong>{`${tokenFormat(payload[0].payload.tokenVolumeToday)} ${payload[0].name}`}</strong></p>
      </div>
    );
  }

  return null;
};