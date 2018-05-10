import React from "react";
import styles from "./Chart.css";

import { scaleLinear, scaleTime } from "d3-scale";
import { max, min, bisector } from 'd3-array';
import { select } from 'd3-selection';
import { fitDimensions } from "react-stockcharts/lib/helper";
import { axisBottom, axisRight, axisLeft } from 'd3-axis';
import { format, mouse, line, area } from 'd3';
import { hexToRGBA } from "react-stockcharts/lib/utils";

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
        this.maxHeight = this.props.height;
        this.maxWidth = this.props.width - 10;
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

            let formatNumber = format(".5f");

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

            // Y Indicators
            select(this.node)
                .select('.yIndicators')
                .attr('transform', `translate(0, ${coords[1] - this.chart.indicatorHeight / 2})`);

            select(this.node)
                .selectAll('.indicatorLabel')
                .text(formatNumber(this.chart.yScale.invert(coords[1])));

            // Tooltip
            let xOffset = (this.chart.xScale(closest.date) - (this.chart.tooltipWidth / 2)) + (this.chart.candleWidth / 2);
            let arrowOffset = (this.chart.xScale(closest.date) - (this.chart.tooltipWidth / 2)) + (this.chart.candleWidth / 2);

            if (xOffset < 0) {
                xOffset = 0;//-5;
                // arrowOffset += 5;
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

            // Tooltip data
            let tooltipData = {
                date: closest.date.toLocaleDateString({}, { year: 'numeric', month: 'long', day: 'numeric' }),
                open: closest.open,
                high: closest.high,
                low: closest.low,
                close: closest.close
            };

            select(this.tooltipDiv).selectAll('div').remove();

            const tooltip = select(this.tooltipDiv)
                .style('left', `${xOffset + this.chart.axisLeftWidth + 10}px`)
                .style('top', `${yOffset}px`)
                .selectAll('div')
                .data(Object.entries(tooltipData));

            let rows = tooltip.enter()
                .append('div')
                .attr('class', 'chartTooltipRowContainer');
            rows.append('div')
                .attr('class', 'chartTooltipLabel')
                .text(d => d[0] === 'date' ? '' : d[0]);
            rows.append('div')
                .attr('class', d => d[0] === 'date' ? 'chartTooltipValueCentered' : 'chartTooltipValue')
                .text(d => { return isNaN(d[1]) ? d[1] : formatNumber(d[1]); });

            // Volume Tooltip data
            select('.volumeTooltip').selectAll('*').remove();

            const formatVolume = format(".2f");

            let volumeTipWidth = 0;

            select('.volumeTooltip')
                .append('text')
                .attr('fill', 'black')
                .attr('width', 100)
                .attr('font-size', '8pt')
                .attr('fill', 'white')
                .text(formatVolume(closest.volume))
                .each(function (d, i) {
                    volumeTipWidth = this.getComputedTextLength()
                    this.remove() // remove them just after displaying them
                })

            select('.volumeTooltip')
                .append('rect')
                .attr('fill', 'black')
                .attr('width', volumeTipWidth + 10)
                .attr('height', '16')
                .attr('transform',
                    `translate(${this.chart.xScale(closest.date) + (volumeTipWidth / 2)}, ${this.chart.volumeScale(closest.volume)})`);

            select('.volumeTooltip')
                .append('text')
                .attr('fill', 'black')
                .attr('width', volumeTipWidth)
                .attr('font-size', '8pt')
                .attr('fill', 'white')
                .text(formatVolume(closest.volume))
                .attr('transform',
                    `translate(${this.chart.xScale(closest.date) + (volumeTipWidth / 2) + 5}, ${this.chart.volumeScale(closest.volume) + 12})`);
        }
    }

    calculateBollingerBands(values) {
        const period = 20;
        let bb = [];

        for (let i = 19; i < values.length; i++) {
            let div = period;

            if (i - period < 0) {
                div = i;
            }

            let data = values.map(d => d.close).slice(i - div, i);

            let mean = data.reduce((t, v) => t + v) / data.length;
            let stdDev = Math.sqrt(data.map(v => (v - mean) * (v - mean)).reduce((t, v) => t + v) / data.length);

            bb.push({ date: new Date(values[i].date), sma: mean, upper: mean + (stdDev * 2), lower: mean - (stdDev * 2) });
        }

        return bb;
    }

    createChart() {
        select(this.node).selectAll('*').remove();

        console.log(this.props.makerToken);

        let chartHeight = this.maxHeight - this.marginBottom - this.bottomOffset;
        let formatNumber = format(".5f");

        const node = this.node
        const data = this.props.data;

        const dates = data.map(d => new Date(d.date));
        const values = data.map(d => d.high).concat(data.map(d => d.low)).concat(data.map(d => d.open)).concat(data.map(d => d.close));

        const bb = this.calculateBollingerBands(data.map(d => { return { date: d.date, close: d.close } }));

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

        const candleMargin = 2;
        let candleWidth = (chartWidth - (data.length * (candleMargin * 2))) / data.length;

        if (candleWidth < 1) {
            candleWidth = 1;
        }

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
            .attr('x1', d => xScale(d.date) + candleWidth / 2)
            .attr('x2', d => xScale(d.date) + candleWidth / 2)
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
            .attr('width', candleWidth)
            .attr('height', d => Math.abs(yScale(d.open) - yScale(d.close)))
            .attr('x', d => xScale(d.date))
            .attr('y', d => d.close < d.open ? yScale(d.open) : yScale(d.close))
            .attr('filter', 'url(#f1)')
            .attr('fill', d => d.close < d.open ? '#f54748' : '#34f493');

        // Bollinger Bands
        if (this.props.indicator.BollingerBand || !this.props.indicator) {
            const bollingerGroup = select(node)
                .append('g')
                .attr('transform', `translate(${chartOffset}, 0)`)

            // SMA Line
            const smaLine = line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.sma));

            bollingerGroup
                .append('path')
                .datum(bb)
                .attr('class', 'sma')
                .attr('fill', 'none')
                .attr('stroke', '#000')
                .attr('d', smaLine);

            // Std Deviation and Fill
            const bbArea = area()
                .x(d => xScale(d.date))
                .y0(d => yScale(d.upper))
                .y1(d => yScale(d.lower));

            bollingerGroup
                .append('path')
                .datum(bb)
                .attr('class', 'bbArea')
                .attr('fill', 'rgba(0, 142, 255, 0.1)')
                .attr('stroke', '#008eff')
                .attr('stroke-width', '0')
                .attr('d', bbArea);

            const upperDeviation = line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.upper));

            bollingerGroup
                .append('path')
                .datum(bb)
                .attr('fill', 'none')
                .attr('stroke', '#008eff')
                .attr('d', upperDeviation);

            const lowerDeviation = line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.lower));

            bollingerGroup
                .append('path')
                .datum(bb)
                .attr('fill', 'none')
                .attr('stroke', '#008eff')
                .attr('d', lowerDeviation);
        }

        const volumes = data.map(d => d.volume);

        const volumeScale = scaleLinear()
            .domain([min(volumes), max(volumes)])
            .range([chartHeight, chartHeight - 100]);

        if (this.props.indicator.Volume || !this.props.indicator) {
            // Volume
            const volumeGroup = select(node)
                .append('g')
                .attr('transform', `translate(${chartOffset}, 0)`);

            const volumeLine = line()
                .x(d => xScale(d.date))
                .y(d => volumeScale(d.volume));

            const volumeArea = area()
                .x(d => xScale(d.date))
                .y0(d => volumeScale(d.volume))
                .y1(d => volumeScale(0));

            volumeGroup
                .append('path')
                .datum(data)
                .attr('class', 'volumeArea')
                .attr('fill', 'rgba(0, 0, 0, 0.1)')
                .attr('stroke-width', '0')
                .attr('d', volumeArea);

            volumeGroup
                .append('path')
                .datum(data)
                .attr('class', 'volume')
                .attr('fill', 'none')
                .attr('stroke', '#000')
                .attr('d', volumeLine);
        }

        // Tooltip group/setup
        select(node)
            .append("rect")
            .attr("transform", "translate(" + chartOffset + "," + 0 + ")")
            .attr("style", "fill: none; pointer-events:all")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .on("mouseover", function () { 
                this.chart.cursorGroup.style("display", null); 
                select(this.tooltipDiv).style("display", null);
                this.chart.yIndicators.style("display", null);
                this.chart.volumeTip.style("display", null);
                this.chart.tooltip.style("display", null); 
            }.bind(this))
            .on("mouseout", function () { 
                this.chart.cursorGroup.style("display", "none"); 
                this.chart.tooltip.style("display", "none"); 
                select(this.tooltipDiv).style("display", "none");
                this.chart.yIndicators.style("display", "none");
                this.chart.volumeTip.style("display", "none");
            }.bind(this))
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

        const volumeTip = select(node)
            .append('g')
            .attr('class', 'volumeTooltip')
            .style("display", "none");

        // Drop Shadow
        const filter = select(node)
            .append('defs')
            .append('filter')
            .attr('id', 'f1')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', '200%')
            .attr('height', '200%');

        filter.append('feOffset')
            .attr('result', 'offOut')
            .attr('in', 'SourceAlpha')
            .attr('dx', '0')
            .attr('dy', '0');

        filter.append('feGaussianBlur')
            .attr('result', 'blurOut')
            .attr('in', 'offOut')
            .attr('stdDeviation', '2');

        filter.append('feBlend')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'blurOut')
            .attr('mode', 'normal');

        const tooltip = cursor.append("g")
            .attr("class", "tooltip")
            .attr('style', 'pointer-events: none')
            .style("display", "none");

        tooltip.append('rect')
            .attr('class', 'contentarea')
            .attr('width', '180')
            .attr('height', '200')
            .attr('fill', 'black')
            .attr('stroke', 'black')
            .attr('stroke-width', '6')
            .attr('fill-opacity', '0.75');

        tooltip.append('path')
            .attr('class', 'arrow')
            .attr('d', 'm 80,200.25 l 10,10 l 10,-10')
            .attr('fill', 'black');
        // .attr('fill-opacity', '0.75');

        // Y-Axis Inidicators
        const yIndicators = select(node)
            .append('g')
            .attr('class', 'yIndicators')
            .style("display", "none");

        // Left Indicator
        yIndicators
            .append('rect')
            .attr('fill', 'black')
            .attr('width', yAxisOffsetLeft)
            .attr('height', '16');
        yIndicators.append('path')
            .attr('d', `m ${yAxisOffsetLeft},0 l 10,8 l -10,8`)
            .attr('fill', 'black');
        yIndicators
            .append('text')
            .attr('class', 'indicatorLabel')
            .attr('width', yAxisOffsetLeft)
            .attr('y', '11')
            .attr('font-size', '8pt')
            .attr('fill', 'white')
            .attr('transform', 'translate(2, 0)');

        // Right Indicator
        yIndicators
            .append('rect')
            .attr('fill', 'black')
            .attr('width', yAxisOffsetLeft)
            .attr('height', '16')
            .attr('transform', `translate(${this.maxWidth - yAxisOffsetRight}, 0)`);
        yIndicators.append('path')
            .attr('d', `m ${this.maxWidth - yAxisOffsetRight},0 l -10,8 l 10,8`)
            .attr('fill', 'black');
        yIndicators
            .append('text')
            .attr('class', 'indicatorLabel')
            .attr('width', yAxisOffsetRight)
            .attr('font-size', '8pt')
            .attr('text-anchor', 'right')
            .attr('fill', 'white')
            .attr('transform', `translate(${this.maxWidth - yAxisOffsetRight - 2}, 11)`);

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
            tooltipArrowHeight: 10,
            candleWidth,
            indicatorHeight: 16,
            volumeScale,
            yIndicators,
            volumeTip,
            tooltip
        }
    }

    render() {
        var makerTokenLogo = `/tokens/${this.props.makerToken.logo}`;
        var takerTokenLogo = `/tokens/${this.props.takerToken.logo}`;

        return (
            <div className={styles.ChartContainer}>
                <svg ref={node => this.node = node}
                    width={this.props.width} height={this.maxHeight - this.marginBottom}>
                </svg>
                <div className={styles.TooltipDiv} ref={node => this.tooltipDiv = node}>
                    <p className={styles.TooltipHeader}>
                        <img className={styles.TokenLogo} src={makerTokenLogo} alt='token logo' style={{ width: '24px' }} />
                        <span>in</span>
                        <img className={styles.TokenLogo} src={takerTokenLogo} alt='token logo' style={{ width: '24px' }} />
                    </p>
                </div>
            </div>);
    }
}

export default fitDimensions(Chart);