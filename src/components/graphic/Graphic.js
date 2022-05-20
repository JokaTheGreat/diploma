import Plot from "react-plotly.js";
import * as seisplotjs from "seisplotjs";
import { useState, useEffect } from "react";
import "./Graphic.css";
import properties from "../../properties";

async function getGraphicData(network, station, channel, startTime, endTime) {
  const url =
    properties.SERVER +
    `dataselect/1/query?` +
    `network=${network}&station=${station}&channel=${channel}` +
    `&starttime=${startTime.toISOString()}&endtime=${endTime.toISOString()}`;

  const response = await fetch(url);
  const data = await response.arrayBuffer();

  return data;
}

function parseGraphicData(data, startTime, endTime) {
  const dataRecords = seisplotjs.miniseed.parseDataRecords(data);
  const seismogram = seisplotjs.miniseed.merge(dataRecords);

  const x = [];
  const y = seismogram._segmentArray[0].y;
  const step = (endTime - startTime) / y.length;

  y.forEach((item, i) => {
    x.push(new Date(Math.round(startTime.getTime() + step * i)));
  });

  return { x, y };
}

export function Graphic(props) {
  const [data, setData] = useState([]);

  const classname =
    props.position === ""
      ? "graphic__wrapper"
      : "graphic__wrapper_" + props.position;

  const layout = {
    margin: {
      t: props.position !== "first" ? 1 : 30,
      r: 1,
      b: props.position !== "last" ? 1 : 20,
      l: 40,
    },
    font: {
      color: "#61dafb",
    },
    paper_bgcolor: "#282c34",
    plot_bgcolor: "#282c34",
    yaxis: {
      linecolor: "#61dafb",
      linewidth: 1,
      mirror: true,
      gridcolor: "#61dafb44",
    },
    xaxis: {
      range: props.range,
      linecolor: "61dafb",
      linewidth: 1,
      mirror: true,
      gridcolor: "#61dafb44",
      showticklabels: props.position === "" ? false : true,
      side: props.position !== "first" ? "bottom" : "top",
    },
  };

  useEffect(async () => {
    if (!props.startTime || !props.endTime) {
      return;
    }

    const seisData = await getGraphicData(
      props.network,
      props.station,
      props.channel,
      props.startTime,
      props.endTime
    );

    if (!seisData.byteLength) {
      setData([]);
      return;
    }

    const { x, y } = parseGraphicData(seisData, props.startTime, props.endTime);

    setData([
      {
        x: x,
        y: y,
        type: "scatter",
        mode: "lines",
        hoverinfo: "none",
        marker: {
          color: "#61dafb",
        },
      },
    ]);
  }, [props.startTime, props.endTime]);

  return (
    <Plot
      onRelayout={(e) => {
        props.resize(e);
      }}
      className={classname}
      data={data}
      layout={layout}
    />
  );
}
