import { useState, useEffect } from 'react';
import { Graphic, Sidebar } from './components';
import './App.css';
import properties from './properties';

export default function App(props) {
    const [graphics, setGraphics] = useState([]);
    let stationsId = [];
    const [sidebar, setSidebar] = useState(<div className='sidebar'></div>);

    const resizeGraphics = (event, startTime, endTime) => {
        const tempGraphics = [];
        let graphNumber = 0;
        
        for (let station of stationsId) {
            if (station.network === 'KA') {
                let pos = '';
                if (graphNumber++ === 0) {
                    pos = 'first';
                }
                else if (graphNumber === 21) {
                    pos = 'last';
                }
                const key = station.network + station.station + station.channel + startTime.toISOString();
                tempGraphics.push(<Graphic key={key} resize={resizeGraphics} range={[event['xaxis.range[0]'], event['xaxis.range[1]']]} network={station.network} station={station.station} channel={station.channel} startTime={startTime} endTime={endTime} position={pos} />);
            }
        }
        setGraphics([...tempGraphics]);
    };

    const callback = (json) => {
        const MINUTE = 60000;
        const startTime = new Date(json.time);
        const endTime = new Date(startTime.getTime() + MINUTE);

        const tempGraphics = [];
        let graphNumber = 0;

        for (let station of stationsId) {
            if (station.network === 'KA') {
                let pos = '';
                if (graphNumber++ === 0) {
                    pos = 'first';
                }
                else if (graphNumber === 21) {
                    pos = 'last';
                }
                const key = station.network + station.station + station.channel + startTime.toISOString();
                tempGraphics.push(<Graphic key={key} resize={resizeGraphics} range={[startTime, endTime]} network={station.network} station={station.station} channel={station.channel} startTime={startTime} endTime={endTime} position={pos} />);
            }
        }
        setGraphics([...tempGraphics]);
    }

    const getStations = async () => {
        const stationURL = properties.SERVER + 'station/1/query?level=channel';

        const response = await fetch(stationURL);
        const data = await response.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'text/xml');
        const networks = xml.getElementsByTagName('Network');

        const tempStationsId = [];
        for (let network of networks) {
            if (network.nodeName === 'Network') {
                const networkCode = network.getAttribute('code');

                const stations = network.children;
                for (let station of stations) {
                    if (station.nodeName === 'Station') {
                        const stationCode = station.getAttribute('code');

                        const channels = station.children;
                        for (let channel of channels) {
                            if (channel.nodeName === 'Channel') {
                                const channelCode = channel.getAttribute('code');
                                tempStationsId.push({ network: networkCode, station: stationCode, channel: channelCode });
                            }
                        }
                    }
                }
            }
        }
        return tempStationsId;
    };

    const createGraphics = () => {
    };

    useEffect(async () => {
        stationsId = await getStations();
        createGraphics();
        setSidebar(<Sidebar callback={callback} />);
    }, []);

    return (
        <div className="app">
            <h2 className="app__title">Seisgraphs: </h2>
            <main className='app__content'>
                {sidebar}
                <div className='app__graphics'>
                    {graphics}
                </div>
            </main>
        </div>
    );
}