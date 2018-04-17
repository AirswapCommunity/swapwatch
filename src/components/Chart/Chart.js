import React from "react";
// import styles from "./Chart.css";
// import Auxilary from "../../hoc/Auxilary";

import { scaleLinear } from "d3-scale";
import { max } from 'd3-array';
import { select } from 'd3-selection';
import { timeParse } from "d3-time-format";
import { fitDimensions } from "react-stockcharts/lib/helper";

// import { AirSwap } from '../../services/AirSwap/AirSwap';
// import { EthereumTokens } from '../../services/Tokens/Tokens';

class Chart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.maxHeight = props.height;
        this.maxWidth = props.width;
        this.marginBottom = 220;

        this.createChart = this.createChart.bind(this);
    }

    componentDidMount() {
        this.createChart()
    }

    componentDidUpdate() {
        this.createChart()
    }

    createChart() {
        let chartHeight = this.maxHeight - this.marginBottom;

        const node = this.node
        const dataMax = max(this.props.data)
        const yScale = scaleLinear()
            .domain([0, dataMax])
            .range([0, chartHeight])
        select(node)
            .selectAll('rect')
            .data(this.props.data)
            .enter()
            .append('rect')

        select(node)
            .selectAll('rect')
            .data(this.props.data)
            .exit()
            .remove()

        select(node)
            .selectAll('rect')
            .data(this.props.data)
            .style('fill', '#fe9922')
            .attr('x', (d, i) => i * 25)
            .attr('y', d => chartHeight - yScale(d))
            .attr('height', d => yScale(d))
            .attr('width', 25)
    }

    render() {

        return <svg ref={node => this.node = node}
            width={this.props.width} height={this.maxHeight - this.marginBottom}>
        </svg>
    }
}

export default fitDimensions(Chart);