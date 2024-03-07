import React from 'react';
import CPUComponent from './CPUComponent';
import * as server from '../utils/serverAPI';

function DMAComponent({
  device, power, stateChanged,
}) {
  const [ep0, setEp0] = React.useState(0);
  const [ep1, setEp1] = React.useState(0);
  const [ep2, setEp2] = React.useState(0);
  const [ep3, setEp3] = React.useState(0);

  function fetchEndPoint(href, setEp) {
    server.GET(server.peripheralPath(device, href), (data) => setEp(data.consumption.noc_power));
  }

  React.useEffect(() => {
    if (device !== null) {
      server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
        if (data.dma !== null) {
          fetchEndPoint(`${data.dma[0].href}`, setEp0);
          fetchEndPoint(`${data.dma[1].href}`, setEp1);
          fetchEndPoint(`${data.dma[2].href}`, setEp2);
          fetchEndPoint(`${data.dma[3].href}`, setEp3);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateChanged, device]);

  const dmaEndpoints = [
    'Channel 1', 'Channel 2', 'Channel 3', 'Channel 4',
  ];

  return (
    <CPUComponent
      title="DMA"
      power={power}
      name={null}
      ep0={ep0}
      ep1={ep1}
      ep2={ep2}
      ep3={ep3}
      endpointText={dmaEndpoints}
    />
  );
}

export default DMAComponent;
