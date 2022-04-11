import './App.css';
import React from 'react';
import * as seisplotjs from 'seisplotjs';

class myComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tableBody: []
    };
  }

  showGraphic = (event) => {
    const data = event.currentTarget.dataset;
    const dataselectURL = `http://service.iris.edu/fdsnws/dataselect/1/query?` +
      `start=${data.start}&end=${data.end}` +
      `&net=${data.network}&sta=${data.station}&loc=${data.location}&cha=${data.channel}`;

    const elementId = `${data.network}-${data.station}-${data.location}-${data.channel}`;

    fetch(dataselectURL)
      .then(result => result.arrayBuffer())
      .then(seisData => {

        const dataRecords = seisplotjs.miniseed.parseDataRecords(seisData);
        const seismogram = seisplotjs.miniseed.merge(dataRecords);

        const element = seisplotjs.d3.select(document.querySelector(`#graphic__wrapper_${elementId}`));

        const graph = new seisplotjs.seismograph.Seismograph(element, null, seismogram);

        graph.draw();
      });
  }

  componentDidMount() {

    
    const availabilityURL = 'https://service.iris.edu/fdsnws/availability/1/query?start=2022-01-01T00:00:00&end=2022-01-01T12:00:00&sta=YAK&format=json';
    fetch(availabilityURL)
      .then(response => response.json())
      .then(data => {

        const availabilityRows = data.datasources.map((item) => {
          return (
            <tr>
              <td className='table__item'>{item.network}</td>
              <td className='table__item'>{item.station}</td>
              <td className='table__item'>{item.location}</td>
              <td className='table__item'>{item.channel}</td>
              <td className='table__item'>{item.quality}</td>
              <td className='table__item'>{item.samplerate}</td>
              <td className='table__item'>
                <b className="table__subtitle">start:</b>{item.timespans[0][0]}
                <br />
                <b className="table__subtitle">end:</b> {item.timespans[0][1]}
              </td>
              <td className='table__item'>
                <button data-start={item.timespans[0][0]} data-end={item.timespans[0][1]} data-network={item.network}
                  data-station={item.station} data-location={item.location} data-channel={item.channel}
                  className='showGraphic' onClick={this.showGraphic}>
                  Клик
                </button>
              </td>
            </tr>
          );
        });

        const graphicRows = data.datasources.map((item) => {
          const elementId = `${item.network}-${item.station}-${item.location}-${item.channel}`;
          return (
            <tr className='table__graphic'>
              <td colSpan={8} id={`graphic__wrapper_${elementId}`}></td>
            </tr>
          );
        });

        const tableRows = [];
        for (let i = 0; i < availabilityRows.length; i++) {
          tableRows.push(availabilityRows[i]);
          tableRows.push(graphicRows[i]);
        }

        this.setState({ tableBody: tableRows });
      });
  }

  render() {
    return (
      <div className="app">
        <h2 className="app__title">Availability request:</h2>
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header__item">Network</th>
              <th className="table-header__item">Station</th>
              <th className="table-header__item">Location</th>
              <th className="table-header__item">Channel</th>
              <th className="table-header__item">Quality</th>
              <th className="table-header__item">Samplerate</th>
              <th className="table-header__item">Timespans</th>
              <th className="table-header__item">Show Graphic</th>
            </tr>
          </thead>
          <tbody className="table__body">
            {this.state.tableBody}
          </tbody>
        </table>
      </div>
    );
  }
}

export default myComponent;