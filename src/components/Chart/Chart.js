import React from "react";
import styles from "./Chart.css";
// import Auxilary from "../../hoc/Auxilary";

import { scaleLinear, scaleTime } from "d3-scale";
import { max, min } from 'd3-array';
import { select } from 'd3-selection';
import { timeParse } from "d3-time-format";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { axisBottom, axisRight, axisLeft } from 'd3-axis';
import { format } from 'd3';
import { hexToRGBA } from "react-stockcharts/lib/utils";

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
        this.bottomOffset = 20;

        this.createChart = this.createChart.bind(this);
    }

    componentDidMount() {
        this.createChart()
    }

    componentDidUpdate() {
        this.createChart()
    }

    yGen(axisType, scale, width, format) {
        return axisType(scale)
            .tickSize(width)
            .tickFormat(d => {
                var s = format(d);
                return "\xa0" + s;
            });
    }

    measureAxis(className) {
        let maxWidth = 0;
        select(this.node)
            .select(className)
            .selectAll('text')
            .each(function() {
                if (this.getBBox().width > maxWidth)
                    maxWidth = this.getBBox().width;
            });

        return maxWidth;
    }

    createChart() {
        console.log(this.props.data);

        let chartHeight = this.maxHeight - this.marginBottom - this.bottomOffset;
        let formatNumber = format(".5f");

        const node = this.node
        const data = this.props.data;

        const dates = data.map(d => new Date(d.date));
        const values = data.map(d => d.high).concat(data.map(d => d.low)).concat(data.map(d => d.open)).concat(data.map(d => d.close));

        const yScale = scaleLinear()
            .domain([min(values) < 0 ? min(values) : 0, max(values)])
            .range([chartHeight, 0]);

        //Y-Axis
        const y = select(node)
            .append('g')
            .attr('class', 'axis-y1')
            .attr('font-family', 'open sans')
            .attr('font-weight', 'bold')
            .call(this.yGen(axisRight, yScale, this.maxWidth, formatNumber));
        y.select(".domain").remove();
        y.selectAll(".tick:not(:first-of-type) line").attr("stroke", hexToRGBA('#000', 0.15)).attr("stroke-dasharray", "2,4");
        y.selectAll(".tick text").attr("x", 0).attr("dy", -4);

        const y2 = select(node)
            .append('g')
            .attr('class', 'axis-y2')
            .attr('font-family', 'open sans')
            .attr('font-weight', 'bold')
            .attr('transform', `translate(${this.maxWidth}, 0)`)
            .call(this.yGen(axisLeft, yScale, this.maxWidth, formatNumber));
        y2.select(".domain").remove();
        y2.selectAll("line").remove();
        y2.selectAll(".tick text").attr("x", 0).attr("dy", -4);

        const yAxisOffsetLeft = this.measureAxis('.axis-y1');
        const yAxisOffsetRight = this.measureAxis('.axis-y2');

        const chartWidth = this.maxWidth - (yAxisOffsetLeft + yAxisOffsetRight + 20);

        //X-Axis
        const xScale = scaleTime()
            .domain([min(dates), max(dates)])
            .range([0, chartWidth]);

        select(node)
            .append("g")
            .attr('font-family', 'Open Sans')
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(axisBottom(xScale));

        //Chart
        const candleGroup = select(node)
            .append('g')
            .attr('transform', `translate(${yAxisOffsetLeft + 10}, 0)`);

        // Wicks
        candleGroup
            .selectAll('line.wick')
            .data(data)
            .enter()
            .append('line')
            .attr('class', 'wick')
            .attr('x1', d => xScale(d.date) + ((chartWidth / data.length) - 10) / 2)
            .attr('x2', d => xScale(d.date) + ((chartWidth / data.length) - 10) / 2)
            .attr('y2', d => yScale(d.high))
            .attr('y1', d => yScale(d.low))
            .attr('style', d => `stroke:${d.close < d.open ? '#f54748' : '#34f493'};stroke-width:2`);

        //Candles
        candleGroup
            .selectAll('rect.candle')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'candle')
            .attr('width', (chartWidth / data.length) - 10)
            .attr('height', d => Math.abs(yScale(d.open) - yScale(d.close)))
            .attr('x', d => xScale(d.date))
            .attr('y', d => d.close < d.open ? yScale(d.open) : yScale(d.close))
            .attr('fill', d => d.close < d.open ? '#f54748' : '#34f493');
    }

    render() {

        return <svg ref={node => this.node = node}
            width={this.props.width} height={this.maxHeight - this.marginBottom}>
        </svg>
    }
}

export default fitDimensions(Chart);