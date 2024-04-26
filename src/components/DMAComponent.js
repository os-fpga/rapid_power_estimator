import React from 'react';
import CPUComponent from './CPUComponent';
import * as server from '../utils/serverAPI';
import { subscribe, unsubscribe } from '../utils/events';
import { percentage } from '../utils/common';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';
import { useGlobalState } from '../GlobalStateProvider';

function DMAComponent({ device }) {
  const [dev, setDev] = React.useState(null);
  const [ep0, setEp0] = React.useState(0);
  const [ep1, setEp1] = React.useState(0);
  const [ep2, setEp2] = React.useState(0);
  const [ep3, setEp3] = React.useState(0);
  const { selectedItem } = useSelection();
  const { power, dynamicPower } = useSocTotalPower();
  const [dmaEndpoints, setDmaEndpoints] = React.useState([
    'Channel 1', 'Channel 2', 'Channel 3', 'Channel 4',
  ]);
  const { socState } = useGlobalState();

  function fetchEndPoint(href, setEp, index) {
    server.GET(server.peripheralPath(device, href), (data) => {
      setEp(data.consumption.noc_power);
      setDmaEndpoints((prev) => prev.map((item, idx) => {
        if (idx === index) return data.name;
        return item;
      }));
    });
  }

  function update() {
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      if (data.dma !== null) {
        fetchEndPoint(`${data.dma[0].href}`, setEp0, 0);
        fetchEndPoint(`${data.dma[1].href}`, setEp1, 1);
        fetchEndPoint(`${data.dma[2].href}`, setEp2, 2);
        fetchEndPoint(`${data.dma[3].href}`, setEp3, 3);
      }
    });
  }

  React.useEffect(() => {
    subscribe('dmaChanged', update);
    return () => { unsubscribe('dmaChanged', update); };
  });

  if (dev !== device) {
    setDev(device);
    if (device !== null) update();
  }

  const Title = 'DMA';

  function getBaseName() {
    return (selectedItem === Title) ? 'clickable selected' : 'clickable';
  }

  return (
    <State messages={socState.dma} baseClass={getBaseName()}>
      <CPUComponent
        title={Title}
        power={power.total_dma_power}
        percent={percentage(power.total_dma_power, dynamicPower)}
        name=""
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
