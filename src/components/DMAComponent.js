import React from 'react';
import CPUComponent from './CPUComponent';
import * as server from '../utils/serverAPI';
import { subscribe, unsubscribe } from '../utils/events';
import { State } from '../utils/common';
import { useSelection } from '../SelectionProvider';

function DMAComponent({ device }) {
  const [ep0, setEp0] = React.useState(0);
  const [ep1, setEp1] = React.useState(0);
  const [ep2, setEp2] = React.useState(0);
  const [ep3, setEp3] = React.useState(0);
  const [power, setPower] = React.useState(0);
  const { selectedItem } = useSelection();

  function fetchEndPoint(href, setEp) {
    server.GET(server.peripheralPath(device, href), (data) => setEp(data.consumption.noc_power));
  }

  function update() {
    server.GET(server.api.consumption(server.Elem.peripherals, device), (data) => {
      setPower(data.total_dma_power);
    });
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      if (data.dma !== null) {
        fetchEndPoint(`${data.dma[0].href}`, setEp0);
        fetchEndPoint(`${data.dma[1].href}`, setEp1);
        fetchEndPoint(`${data.dma[2].href}`, setEp2);
        fetchEndPoint(`${data.dma[3].href}`, setEp3);
      }
    });
  }

  React.useEffect(() => {
    subscribe('dmaChanged', update);
    return () => { unsubscribe('dmaChanged', update); };
  });

  React.useEffect(() => {
    if (device !== null) update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const dmaEndpoints = [
    'Channel 1', 'Channel 2', 'Channel 3', 'Channel 4',
  ];

  const warn = 0.001; // TBD
  const error = 0.016; // TBD
  const Title = 'DMA';

  function getBaseName() {
    return (selectedItem === Title) ? 'clickable selected' : 'clickable';
  }

  return (
    <State refValue={power} warn={warn} err={error} baseClass={getBaseName()}>
      <CPUComponent
        title={Title}
        power={power}
        name={null}
        ep0={ep0}
        ep1={ep1}
        ep2={ep2}
        ep3={ep3}
        endpointText={dmaEndpoints}
      />
    </State>
  );
}

export default DMAComponent;
