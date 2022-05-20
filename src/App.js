import { useState, useEffect } from "react";
import { Graphic, Sidebar } from "./components";
import "./App.css";
import properties from "./properties";

async function getStationsData() {
  const url = properties.SERVER + "station/1/query?level=channel";

  const response = await fetch(url);
  const data = await response.text();

  return data;
}

function parseStationsData(data) {
  const stationsData = [];

  const xml = new DOMParser().parseFromString(data, "text/xml");
  const networks = xml.getElementsByTagName("Network");

  for (let network of networks) {
    if (network.nodeName !== "Network") {
      continue;
    }

    const networkCode = network.getAttribute("code");
    if (networkCode !== "KA") {
      continue;
    }

    const stations = network.children;

    for (let station of stations) {
      if (station.nodeName !== "Station") {
        continue;
      }

      const stationCode = station.getAttribute("code");
      const channels = station.children;

      for (let channel of channels) {
        if (channel.nodeName !== "Channel") {
          continue;
        }

        const channelCode = channel.getAttribute("code");
        stationsData.push({
          network: networkCode,
          station: stationCode,
          channel: channelCode,
        });
      }
    }
  }

  return stationsData;
}

async function getStations() {
  const data = await getStationsData();
  return parseStationsData(data);
}

export default function App() {
  const [graphicsData, setGraphicsData] = useState([]);
  let stationsId = [];

  const onGraphicsResize = (e) => {
    setGraphicsData(
      graphicsData.map((item) => {
        return {
          ...item,
          range: [e["xaxis.range[0]"], e["xaxis.range[1]"]],
        };
      })
    );
  };

  const setEventGraphicsData = ({ time, waves }) => {
    const MINUTE_MS = 60000;
    const startTime = new Date(time);
    const endTime = new Date(startTime.getTime() + MINUTE_MS);

    setGraphicsData(
      graphicsData.map((item) => {
        return {
          ...item,
          startTime: startTime,
          endTime: endTime,
        };
      })
    );
  };

  const setDefaultGraphicsData = () => {
    setGraphicsData(
      stationsId.map((item, i) => {
        return {
          key: item.network + item.station + item.channel,
          ...item,
          position:
            i === 0 ? "first" : i === stationsId.length - 1 ? "last" : "",
        };
      })
    );
  };

  useEffect(async () => {
    stationsId = await getStations();
    setDefaultGraphicsData();
  }, []);

  return (
    <div className="app">
      <h2 className="app__title">Seisgraphs: </h2>
      <main className="app__content">
        {<Sidebar onClickCallback={setEventGraphicsData} />}
        <div className="app__graphics">
          {graphicsData.map((item) => {
            return (
              <Graphic
                key={item.key}
                network={item.network}
                station={item.station}
                channel={item.channel}
                position={item.position}
                startTime={item.startTime}
                endTime={item.endTime}
                resize={onGraphicsResize}
                range={item.range}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
