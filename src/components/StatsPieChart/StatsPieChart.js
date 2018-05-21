import React, { Component } from "react";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { withStyles } from 'material-ui/styles';
import styles from './StatsPieChart.css';
import { PieChart, Pie } from 'recharts';

class StatsPieChart extends Component {

  constructor(props) {
    super(props);
    this.container = null;
    
    this.maxHeight = props.height;
    this.maxWidth = props.width;
    this.marginBottom = 220;
    this.bottomOffset = 20;
  }

  componentDidUpdate() {
    this.maxHeight = this.props.height;
    this.maxWidth = this.props.width - 10;
  }

  setRef = (el) => {
    this.container = el;
  };

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
        <PieChart
          width={this.props.width}
          height={height}
        >
          <Pie 
            data={displayData}
            dataKey="VolumeToday" 
            nameKey="name" 
            cx="50%" 
            cy="50%"
            outerRadius={Math.min(height, this.props.width)/2}
            fill="#34b5f4" 
          />
        </PieChart>  
          {/* margin={{ top: 10, right: 10, left: 10, bottom: 0 }}> */}

          {/* <XAxis dataKey="name" tickMargin={5} /> */}
          {/* <YAxis tickFormatter={formatCurrency} width={100} type='number' allowDataOverflow={false} /> */}
          {/* <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d0d0d0', strokeWidth: 1, fill: '#f0f0f0' }} offset={-65}/> */}
          {/* <Bar shape={CustomBar} dataKey=""> */}
            {/* <LabelList dataKey="logo" content={this.renderCustomizedLabel} /> */}
          {/* </Bar> */}
        {/* </BarChart> */}
      </div>
    )
  };

  render() {
    let barChartElement;
    barChartElement = this.props.tokenVolumeInfo ? this.createChart() : null;
    return (<div className={styles.StatsPieChartContainer}>
      <div className={styles.StatsPieChartContainer} ref={this.setRef}>
        {barChartElement}
      </div>
    </div>);
  }
}

export default fitDimensions(withStyles(styles)(StatsPieChart));

// function shadeColor(color, percent) {
//   return window.tinycolor(color).darken(percent).desaturate(percent).toString();
// }

// const CustomBar = (props) => {
//   const { index } = props;  
//   let fill = shadeColor('#34b5f4', index * 5);
//   return <Rectangle className={props.name} {...props} fill={fill} />
// };

// const CustomTooltip = (props) => {
//   const { active } = props;
//   if (active) {
//     const { label, payload } = props;
//     return (
//       <div className={styles.customTooltip}>
//         <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
//           <Avatar src={payload[0].payload.logo} style={{ backgroundColor: 'whitesmoke', padding: '2' }} imgProps={{ height: '32', className: 'avatarImage' }}>
//           </Avatar>
//         </div>
//         <span className="label">{label}</span>
//         <p className="volume"><strong>{formatCurrency(payload[0].payload.Volume)}</strong></p>
//         <p className="tokenVolume"><strong>{`${tokenFormat(payload[0].payload.tokenVolume)} ${label}`}</strong></p>
//       </div>
//     );
//   }

//   return null;
// };