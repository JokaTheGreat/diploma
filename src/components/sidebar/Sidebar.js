import { useState, useEffect } from 'react';
import './Sidebar.css';
import properties from '../../properties';

export function Sidebar(props) {
    const [content, setContent] = useState([]);

    useEffect(async () => {
        const eventURL = properties.SERVER + 'event/1/query?limit=10&includearrivals=true';
        const response = await fetch(eventURL);
        const data = await response.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'text/xml');
        const eventsInfo = [];
        const events = [...xml.getElementsByTagName('event')];
        const magnitudes = [...xml.getElementsByTagName('mag')].map(mag => mag.textContent);

        for (let i = 0; i < events.length; i++) {
            const time = [...[...xml.getElementsByTagName('origin')][i].getElementsByTagName('time')].map(tm => tm.children[0].textContent)[0];

            const waves = [...events[i].getElementsByTagName('pick')].map(pick => {
                const children = pick.children;

                const phase = children[0].textContent;
                const time = children[3].children[0].textContent;
                const waveFormId = children[4];

                return {
                    phase: phase,
                    time: time,
                    network: waveFormId.getAttribute('networkCode'),
                    station: waveFormId.getAttribute('stationCode'),
                    location: waveFormId.getAttribute('locationCode'),
                    channel: waveFormId.getAttribute('channelCode')
                };
            });

            eventsInfo.push({
                magnitude: magnitudes[i],
                time: time,
                waves: waves
            });
        }

        setContent(eventsInfo.map(el => {
            return <h5 onClick={() => props.callback(el)} className='sidebar__element'>{'mag: ' + el.magnitude}<br />
                {'time: ' + el.time}</h5>;
        }));
    }, []);

    return (
        <div className='sidebar'>
            {content}
        </div>
    );
}