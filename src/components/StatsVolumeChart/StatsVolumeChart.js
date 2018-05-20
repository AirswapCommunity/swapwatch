import React, { Component } from "react";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { withStyles } from 'material-ui/styles';
import styles from './StatsVolumeChart.css';
import { format } from "d3-format";
import { LineChart, Line, XAxis, YAxis, Tooltip, Label } from 'recharts';

const tokenFormat = format(".4s");

class StatsVolumeChart extends Component {

  createChart = () => {
    let displayData = [];
    let ethData = this.props.tokenVolumeInfo.find(x=>x.name === 'ETH');

    for(let day=ethData.Volume.length-1; day>=0;day--) {
      let dayVolume = ethData.tokenVolume[day]
      displayData.push({
        day: day,
        Volume: dayVolume,
      })
    }

    return (
      <div>
        <LineChart
          width={this.props.width}
          height={this.props.height}
          data={displayData}
          margin={{ top: 0, right: 40, left: 20, bottom: 200 }}>

          <XAxis dataKey="day" tickMargin={5}>
            <Label 
              value="Days ago" position="insideBottom" offset={-10}
            />
          </XAxis>
          <YAxis dataKey="Volume"
                 width={100}
                 type='number'
                 allowDataOverflow={false}>
            <Label 
              value="Ether Volume" angle={270} position='left' style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d0d0d0', strokeWidth: 1, fill: '#f0f0f0' }} offset={-65}/>
          <Line 
            dataKey="Volume"
            dot={false}
          />
        </LineChart>
      </div>
    )
  };

  render() {
    let LineChartElement;
    LineChartElement = this.props.tokenVolumeInfo ? this.createChart() : null;
    return (<div className={styles.StatsVolumeChartContainer}>
      <div className={styles.StatsVolumeChartContainer} ref={this.setRef}>
        {LineChartElement}
      </div>
    </div>);
  }
}

export default fitDimensions(withStyles(styles)(StatsVolumeChart));

const CustomTooltip = (props) => {
  const { active } = props;
  if (active) {
    const { label, payload } = props;
    return (
      <div className={styles.customTooltip}>
        <span className="label">{label} days ago</span>
        <p className="volume"><strong>{tokenFormat(payload[0].payload.Volume)}</strong> ETH</p>
      </div>
    );
  }
  return null;
};