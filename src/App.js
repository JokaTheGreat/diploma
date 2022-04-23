import './App.css';
import * as seisplotjs from 'seisplotjs';
import React from 'react';
import moment from 'moment';

const SERVER = '';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      networksAndStations: []
    };
  }

  componentDidMount() {

    const stationURL = SERVER + 'station/1/query?level=channel';

    fetch(stationURL)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'text/xml');
        const networks = xml.childNodes[0].children;

        const networksAndStations = [];
        for (let network of networks) {
          if (network.nodeName === 'Network') {
            const networkCode = network.getAttribute('code');

            const stations = network.children;
            const stationCodes = [];
            for (let station of stations) {
              if (station.nodeName === 'Station') {
                const stationCode = station.getAttribute('code');

                const channels = station.children;
                const channelCodes = [];
                for (let channel of channels) {
                  if (channel.nodeName === 'Channel') {
                    const channelCode = channel.getAttribute('code');
                    channelCodes.push(channelCode);
                  }
                }

                stationCodes.push({ station: stationCode, channel: channelCodes });
              }
            }

            networksAndStations.push({ network: networkCode, stationsAndChannels: stationCodes });
          }
        }

        this.setState({ networksAndStations: networksAndStations });

        const network = this.state.networksAndStations[1].network;
        const station = this.state.networksAndStations[1].stationsAndChannels[0].station;
        const channels = this.state.networksAndStations[1].stationsAndChannels[0].channel;

        const graphArray = [];

        for (let channel of channels) {
          const dataselectURL = SERVER + `dataselect/1/query?network=${network}&station=${station}&channel=${channel}&starttime=2022-04-11T00:00:00&endtime=2022-04-11T00:01:00`;

          fetch(dataselectURL)
            .then(response => response.arrayBuffer())
            .then(seisData => {

              const dataRecords = seisplotjs.miniseed.parseDataRecords(seisData);
              const seismogram = seisplotjs.miniseed.merge(dataRecords);
              const seisTest = seisplotjs.seismogram.SeismogramDisplayData.fromSeismogram(seismogram);

              seisTest.addMarkers([{
                name: 'P',
                time: moment('2022-04-11T00:00:15+00'),
                type: 'predicted',
                desription: 'p marker',
              }, {
                name: 'S',
                time: moment('2022-04-11T00:00:30+00'),
                type: 'other',
                desription: 's marker',
              }]);

              const element = seisplotjs.d3.select(document.querySelector(`#graphic__wrapper_${channel}`));

              const seisConfig = new seisplotjs.seismographconfig.SeismographConfig();
              seisConfig.xLabel = '';
              seisConfig.yLabel = channel;
              seisConfig.yLabelOrientation = 'horizontal';
              seisConfig.doRMean = false;
              seisConfig.ySublabelIsUnits = false;

              seisConfig.isXAxis = false;

              seisConfig.margin.bottom = 0;
              seisConfig.margin.top = 0;
              seisConfig.margin.right = 0;

              const graph = new seisplotjs.seismograph.Seismograph(element, seisConfig, seisTest);

              const prevGraph = graphArray.pop();
              if (prevGraph !== undefined) {
                prevGraph.linkXScaleTo(graph);
              }
              graphArray.push(graph);

              graph.draw();
            });
        }
      });
  }

  render() {
    return (
      <div className="app">
        <h2 className="app__title">Seisgraphs: </h2>
        <div id='graphic__wrapper_HHE'></div>
        <div id='graphic__wrapper_HHN'></div>
        <div id='graphic__wrapper_HHZ'></div>
      </div>
    );
  }
}


export default App;