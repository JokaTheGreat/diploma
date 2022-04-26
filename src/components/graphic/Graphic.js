import Plot from 'react-plotly.js';
import * as seisplotjs from 'seisplotjs';
import { useState, useEffect } from 'react';
import './Graphic.css';
import properties from '../../properties';

export function Graphic(props) {
    const [data, setData] = useState([]);

    const classname = props.position === '' ? 'graphic__wrapper' : 'graphic__wrapper_' + props.position;
    const layout = {
        margin: {
            t: props.position !== 'first' ? 1 : 30,
            r: 1,
            b: props.position !== 'last' ? 1 : 20,
            l: 40
        },
        font: {
            color: '#61dafb',
        },
        paper_bgcolor: '#282c34',
        plot_bgcolor: '#282c34',
        yaxis: {
            linecolor: '#61dafb',
            linewidth: 1,
            mirror: true,
            gridcolor: '#61dafb44',
        },
        xaxis: {
            linecolor: '61dafb',
            linewidth: 1,
            mirror: true,
            gridcolor: '#61dafb44',
            showticklabels: props.position === '' ? false : true,
            side: props.position !== 'first' ? 'bottom' : 'top'
        },/*
      grid: {
        rows: 2,
        columns: 1,
        subplots: [['xy'], ['xy2']],
        pattern: 'independent'
      },
      showlegend: false*/
    };

    useEffect(async () => {
        const dataselectURL = properties.SERVER + `dataselect/1/query?` +
            `network=${props.network}&station=${props.station}&channel=${props.channel}` +
            `&starttime=${props.startTime.toISOString()}&endtime=${props.endTime.toISOString()}`;

        const response = await fetch(dataselectURL);
        const seisData = await response.arrayBuffer();

        const dataRecords = seisplotjs.miniseed.parseDataRecords(seisData);
        const seismogram = seisplotjs.miniseed.merge(dataRecords);

        const x = [];
        const y = seismogram._segmentArray[0].y;
        const step = (props.endTime - props.startTime) / y.length;
        for (let i = 0; i < y.length; i++) {
            x.push(new Date(Math.round(props.startTime.getTime() + step * i)));
        }

        setData([{
            x: x,
            y: y,
            type: 'scatter',
            mode: 'lines',
            hoverinfo: 'none',
            marker: {
                color: '#61dafb'
            }
        }/*,
      {
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines',
        hoverinfo: 'none',
        marker: {
          color: '#61dafb'
        },
        yaxis: 'y2'
      }*/]);

    }, []);

    return (
        <Plot
            className={classname}
            data={data}
            layout={layout}
        />
    );
}