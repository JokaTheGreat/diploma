import { useEffect, useState } from "react";
import "./Sidebar.css";
import properties from "../../properties";

async function getEventData() {
  const url = properties.SERVER + "event/1/query?limit=10&includearrivals=true";

  const response = await fetch(url);
  const data = await response.text();

  return data;
}

function parseEventData(data) {
  const eventsInfo = [];
  const xml = new DOMParser().parseFromString(data, "text/xml");

  const magnitudes = [...xml.getElementsByTagName("mag")].map(
    (mag) => mag.textContent
  );
  const origins = [...xml.getElementsByTagName("origin")];
  const events = [...xml.getElementsByTagName("event")];

  for (const [i, event] of events.entries()) {
    const time = [...origins[i].getElementsByTagName("time")].map(
      (tm) => tm.children[0].textContent
    )[0];

    const waves = [...event.getElementsByTagName("pick")].map((pick) => {
      const phase = pick.children[0].textContent;
      const time = pick.children[3].children[0].textContent;
      const waveFormId = pick.children[4];

      return {
        phase: phase,
        time: time,
        network: waveFormId.getAttribute("networkCode"),
        station: waveFormId.getAttribute("stationCode"),
        location: waveFormId.getAttribute("locationCode"),
        channel: waveFormId.getAttribute("channelCode"),
      };
    });

    eventsInfo.push({
      magnitude: magnitudes[i],
      time: time,
      waves: waves,
    });
  }

  return eventsInfo;
}

export function Sidebar({ onClickCallback }) {
  const [data, setData] = useState([]);

  const onClick = (e, itemData) => {
    const element = e.currentTarget;
    if (element.classList.contains("sidebar__element_active")) {
      return;
    }

    const sidebarItems = element.parentNode.children;
    [...sidebarItems].forEach((item) => (item.className = "sidebar__element"));
    element.classList.add("sidebar__element_active");

    onClickCallback(itemData);
  };

  useEffect(async () => {
    const data = await getEventData();
    setData(parseEventData(data));
  }, []);

  return (
    <div className="sidebar">
      {data.map((item) => {
        return (
          <div
            key={"" + item.magnitude + item.time}
            className="sidebar__element"
            onClick={(e) => onClick(e, item)}
          >
            mag: {item.magnitude} <br />
            time: {item.time}
          </div>
        );
      })}
    </div>
  );
}