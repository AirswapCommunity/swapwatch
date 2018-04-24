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
 
            const date = this.chart.xScale.invert(coords[0] + this.chart.axisLeftWidth);

            let bisectDate = bisector(function (d) { return new Date(d.date); }).left;

            const index = bisectDate(this.props.data, date, 1);

            console.log(this.props.data[index]);

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
            const ohlc = this.props.data[index];

            this.chart.cursorGroup.select('.tooltip')
            .attr('transform', `translate(${this.chart.xScale(date) - this.chart.axisLeftWidth}, ${this.chart.yScale(ohlc.high)})`);
        }

        // let bisectDate = bisector(function(d) { return d.date; }).left;

        // const data = this.props.data;

        // let chartHeight = this.maxHeight - this.marginBottom - this.bottomOffset;

        // const dates = data.map(d => new Date(d.date));
        // const values = data.map(d => d.high).concat(data.map(d => d.low)).concat(data.map(d => d.open)).concat(data.map(d => d.close));

        // const yScale = scaleLinear()
        //     .domain([min(values) < 0 ? min(values) : 0, max(values)])
        //     .range([chartHeight, 0]);

        // const yAxisOffsetLeft = this.measureAxis('.y1');
        // const yAxisOffsetRight = this.measureAxis('.y2');

        // const chartWidth = this.maxWidth - (yAxisOffsetLeft + yAxisOffsetRight + 20);

        // const xScale = scaleTime()
        //     .domain([min(dates), max(dates)])
        //     .range([0, chartWidth]);

        // var x0 = xScale.invert(mouse(this.CursorGroup.node())[0]),
        //     i = bisectDate(data, x0, 1),
        //     d0 = data[i - 1],
        //     d1 = data[i],
        //     d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        // this.CursorGroup.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d.low) + ")");
        // // focus.select("text").text(function () { return d.value; });
        // this.CursorGroup.select(".x-hover-line").attr("y2", chartHeight - yScale(d.low));
        // this.CursorGroup.select(".y-hover-line").attr("x2", chartWidth + chartWidth);
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

        // X-Axis
        const xScale = scaleTime()
            .domain([min(dates), max(dates)])
            .range([0, chartWidth]);

        select(node)
            .append('g')
            .attr('class', 'axis')
            .attr('font-family', 'Open Sans')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(axisBottom(xScale));

        // Chart
        const candleGroup = select(node)
            .append('g')
            .attr('transform', `translate(${yAxisOffsetLeft + 10}, 0)`)

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
            .attr("transform", "translate(" + yAxisOffsetLeft + 10 + "," + 0 + ")")
            .attr("style", "fill: none; pointer-events:all")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .on("mouseover", function () { this.chart.cursorGroup.style("display", null); }.bind(this))
            // .on("mouseout", function () { this.chart.cursorGroup.style("display", "none"); }.bind(this))
            .on("mousemove", this.onMouseMove.bind(this));

        const cursor = select(node)
            .append("g")
            .attr("transform", "translate(" + yAxisOffsetLeft + 10 + "," + 0 + ")")
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
            .attr("x1", 2)
            .attr("x2", chartWidth + 10);

        cursor.append("circle")
            .attr("r", 7.5);

        const tooltip = cursor.append("g")
            .attr("class", "tooltip")
            .attr('style', 'pointer-events: none');

        tooltip.append('rect')
            .attr('rx', '20')
            .attr('ry', '20')
            .attr('width', '180')
            .attr('height', '200')
            .attr('style', 'fill:black;stroke:black;stroke-width:5;opacity:0.5');

        this.chart = {
            yScale,
            xScale,
            height: chartHeight,
            width: chartWidth,
            cursorGroup: cursor,
            dates,
            axisLeftWidth: yAxisOffsetLeft,
            axisRightWidth: yAxisOffsetRight
        }
    }

    render() {

        return <svg ref={node => this.node = node}
            width={this.props.width} height={this.maxHeight - this.marginBottom}>
        </svg>
    }
}

export default fitDimensions(Chart);