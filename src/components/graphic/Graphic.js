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

  const defaultLayout = {
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
      fixedrange: true,
      linecolor: "#61dafb",
      linewidth: 1,
      mirror: true,
      gridcolor: "#61dafb44",
    },
    xaxis: {
      linecolor: "61dafb",
      linewidth: 1,
      mirror: true,
      gridcolor: "#61dafb44",
      showticklabels: props.position === "" ? false : true,
      side: props.position !== "first" ? "bottom" : "top",
    },
  };

  const [layout, setLayout] = useState(defaultLayout);

  const classname =
    props.position === ""
      ? "graphic__wrapper"
      : "graphic__wrapper_" + props.position;

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

  useEffect(() => {
    if (!props.waves) {
      return;
    }

    setLayout({
      ...layout,
      shapes: [
        ...props.waves.map((wave) => {
          return {
            fillcolor: "white",
            line: { color: "white" },
            yref: "paper",
            xsizemode: "pixel",
            xanchor: wave.time,
            y0: 0.8,
            y1: 1,
            x0: 0,
            x1: 15,
            opacity: 1,
          };
        }),
        ...props.waves.map((wave) => {
          return {
            line: { color: "white" },
            yref: "paper",
            y0: 0,
            y1: 1,
            x0: wave.time,
            x1: wave.time,
            opacity: 1,
          };
        }),
      ],
      annotations: [
        ...props.waves.map((wave) => {
          return {
            xanchor: "left",
            x: wave.time,
            yref: 'paper',
            y: 1.02,
            text: wave.phase,
            showarrow: false,
            font: { size: 16, color: "#282c34" }
          };
        })
      ]
    });
  }, [props.waves]);

  const setRange = (newRange, autorange) => {
    setLayout({
      ...layout,
      xaxis: { ...layout.xaxis, autorange: autorange, range: newRange },
    });
  };

  useEffect(() => {
    if (props.range) {
      if (props.range[0] === props.startTime.toISOString()) {
        setRange(props.range, true);
        return;
      }
      setRange(props.range, false);
    }
  }, [props.range]);

  return (
    <Plot
      onClick={(e) => {
        if (e.event.shiftKey) {
          props.resize(
            props.startTime.toISOString(),
            props.endTime.toISOString()
          );
        }
      }}
      onRelayout={(e) => {
        props.resize(e["xaxis.range[0]"], e["xaxis.range[1]"]);
      }}
      className={classname}
      data={data}
      layout={layout}
      config={{
        modeBarButtonsToRemove: [
          "toImage",
          "zoom2d",
          "pan2d",
          "zoomIn2d",
          "zoomOut2d",
          "autoScale2d",
        ],
        displaylogo: false,
        doubleClick: false, //не работает
        scrollZoom: true,
      }}
    />
  );
}
