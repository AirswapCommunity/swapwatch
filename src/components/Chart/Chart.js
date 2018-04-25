import React from "react";
import styles from "./Chart.css";
// import Auxilary from "../../hoc/Auxilary";

import { scaleLinear, scaleTime } from "d3-scale";
import { max, min, bisector } from 'd3-array';
import { select } from 'd3-selection';
import { timeParse } from "d3-time-format";
import { fitDimensions } from "react-stockcharts/lib/helper";
import { axisBottom, axisRight, axisLeft } from 'd3-axis';
import { format, mouse } from 'd3';
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
            .each(function () {
                if (this.getBBox().width > maxWidth)
                    maxWidth = this.getBBox().width;
            });

        return maxWidth;
    }

    onMouseMove() {

        if (this.chart) {
            const coords = mouse(this.chart.cursorGroup.node());

            const date = this.chart.xScale.invert(coords[0]);

            let bisectDate = bisector(function (d) { return new Date(d.date); }).left;

            const sortedData = this.props.data.slice(0);

            sortedData.sort((a, b) => {
                return a.date > b.date ? 1 : a.date === b.date ? 0 : -1;
            });

            const index = bisectDate(sortedData, date);

            let closest = sortedData[index];

            if (index > 0) {
                const smaller = sortedData[index - 1];
                const larger = sortedData[index];

                if (!smaller || !larger) {
                    return;
                }

                closest = date - smaller.date < larger.date - date ? smaller : larger;
            }

            // Cursor lines
            this.chart.cursorGroup.select("circle")
                .attr("transform", `translate(${coords[0]}, ${coords[1]})`);

            this.chart.cursorGroup.select(".x-hover-line")
                .attr("x1", coords[0])
                .attr("x2", coords[0])
                .attr("y1", coords[1]);

            this.chart.cursorGroup.select(".y-hover-line")
                .attr("y1", coords[1])
                .attr("y2", coords[1]);

            // Tooltip
            let xOffset = (this.chart.xScale(closest.date) - (this.chart.tooltipWidth / 2)) + 2.5;
            let arrowOffset = (this.chart.xScale(closest.date) - (this.chart.tooltipWidth / 2)) + 2.5;

            if (xOffset < 0) {
                xOffset = -5;
                arrowOffset += 5;
            } else if (xOffset + this.chart.tooltipWidth > this.chart.width) {
                xOffset = this.chart.width - this.chart.tooltipWidth + 10;
                arrowOffset = xOffset - arrowOffset;
            } else {
                arrowOffset = 0;
            }

            let rotate = 0;

            let yOffset = this.chart.yScale(closest.high) - (this.chart.tooltipHeight + this.chart.tooltipArrowHeight);

            if (yOffset < 0) {
                yOffset = this.chart.yScale(closest.low) + this.chart.tooltipArrowHeight;
                rotate = 180;

                if (xOffset > 0) {
                    arrowOffset = -arrowOffset;
                }
            }

            if (yOffset + this.chart.tooltipHeight + this.tooltipArrowHeight > this.chart.height) {
                yOffset = this.chart.height - this.tooltipHeight + this.tooltipArrowHeight;
            }

            this.chart.cursorGroup.select('.tooltip')
                .attr('transform',
                    `translate(${xOffset}, ${yOffset})`);

            this.chart.cursorGroup.select('.tooltip')
                .select('rect')
                .attr('stroke', closest.close < closest.open ? '#f54748' : '#34f493');

            this.chart.cursorGroup.select('.tooltip')
                .select('path')
                .attr('fill', closest.close < closest.open ? '#f54748' : '#34f493')
                .attr('transform', `rotate(${rotate}, ${this.chart.tooltipWidth / 2}, ${this.chart.tooltipHeight / 2}) translate(${-arrowOffset}, 0)`);
        }
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

        // Y-Axis
        const y = select(node)
            .append('g')
            .attr('class', 'axis y1')
            .attr('font-family', 'open sans')
            .attr('font-weight', 'bold')
            .call(this.yGen(axisRight, yScale, this.maxWidth, formatNumber));
        y.select(".domain").remove();
        y.selectAll(".tick:not(:first-of-type) line").attr("stroke", hexToRGBA('#000', 0.15)).attr("stroke-dasharray", "2,4");
        y.selectAll(".tick text").attr("x", 0).attr("dy", -4);

        const y2 = select(node)
            .append('g')
            .attr('class', 'axis y2')
            .attr('font-family', 'open sans')
            .attr('font-weight', 'bold')
            .attr('transform', `translate(${this.maxWidth}, 0)`)
            .call(this.yGen(axisLeft, yScale, this.maxWidth, formatNumber));
        y2.select(".domain").remove();
        y2.selectAll("line").remove();
        y2.selectAll(".tick text").attr("x", 0).attr("dy", -4);

        const yAxisOffsetLeft = this.measureAxis('.y1');
        const yAxisOffsetRight = this.measureAxis('.y2');

        const chartWidth = this.maxWidth - (yAxisOffsetLeft + yAxisOffsetRight + 20);
        const chartOffset = (yAxisOffsetLeft + 10);

        // X-Axis
        const xScale = scaleTime()
            .domain([min(dates), max(dates)])
            .range([0, chartWidth]);

        select(node)
            .append('g')
            .attr('class', 'axis')
            .attr('font-family', 'Open Sans')
            .attr('transform', `translate(${chartOffset}, ${chartHeight})`)
            .attr('width', chartWidth)
            .call(axisBottom(xScale));

        // Chart
        const candleGroup = select(node)
            .append('g')
            .attr('transform', `translate(${chartOffset}, 0)`)

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

        // Candles
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

        // Tooltip group/setup
        select(node)
            .append("rect")
            .attr("transform", "translate(" + chartOffset + "," + 0 + ")")
            .attr("style", "fill: none; pointer-events:all")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .on("mouseover", function () { this.chart.cursorGroup.style("display", null); }.bind(this))
            // .on("mouseout", function () { this.chart.cursorGroup.style("display", "none"); }.bind(this))
            .on("mousemove", this.onMouseMove.bind(this));

        const cursor = select(node)
            .append("g")
            .attr("transform", "translate(" + chartOffset + "," + 0 + ")")
            .attr("class", "focus")
            .style("display", "none")
            .attr('height', chartHeight);

        cursor.append("line")
            .attr("class", "x-hover-line hover-line")
            .attr("style", "stroke: #000; stroke-dasharray: 10,10")
            .attr("y1", 0)
            .attr("y2", chartHeight);

        cursor.append("line")
            .attr("class", "y-hover-line hover-line")
            .attr("style", "stroke: #000; stroke-dasharray: 10,10")
            .attr("x1", -8)
            .attr("x2", chartWidth + 10);

        cursor.append("circle")
            .attr("r", 7.5);

        const tooltip = cursor.append("g")
            .attr("class", "tooltip")
            .attr('style', 'pointer-events: none');

        tooltip.append('rect')
            // .attr('rx', '20')
            // .attr('ry', '20')
            .attr('width', '180')
            .attr('height', '200')
            .attr('fill', 'black')
            .attr('stroke', 'black')
            .attr('stroke-width', '4')
            .attr('opacity', '0.75');

        tooltip.append('path')
            .attr('class', 'arrow')
            .attr('d', 'm 80,200.25 l 10,10 l 10,-10')
            .attr('fill', 'black')
            .attr('opacity', '0.75');

        this.chart = {
            yScale,
            xScale,
            height: chartHeight,
            width: chartWidth,
            cursorGroup: cursor,
            dates,
            axisLeftWidth: yAxisOffsetLeft,
            axisRightWidth: yAxisOffsetRight,
            tooltipWidth: 180,
            tooltipHeight: 200,
            tooltipArrowHeight: 10
        }
    }

    render() {

        return <svg ref={node => this.node = node}
            width={this.props.width} height={this.maxHeight - this.marginBottom}>
        </svg>
    }
}

export default fitDimensions(Chart);