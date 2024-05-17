import React from 'react';
import { CPUComponent, CPUComponentDisabled } from './CPUComponent';
import * as server from '../utils/serverAPI';
import { subscribe, unsubscribe } from '../utils/events';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';
import { useGlobalState } from '../GlobalStateProvider';

function DMAComponent({ device, peripherals }) {
  const [dev, setDev] = React.useState(null);
  const [ep0, setEp0] = React.useState(0);
  const [ep1, setEp1] = React.useState(0);
  const [ep2, setEp2] = React.useState(0);
  const [ep3, setEp3] = React.useState(0);
  const { selectedItem } = useSelection();
  const { totalConsumption } = useSocTotalPower();
  const [dmaEndpoints, setDmaEndpoints] = React.useState([
    'Channel 1', 'Channel 2', 'Channel 3', 'Channel 4',
  ]);
  const { socState } = useGlobalState();
  const [enable, setEnable] = React.useState(true);

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
    if (peripherals === null) return;
    setEnable(peripherals.dma !== undefined);
    if (peripherals.dma !== undefined) {
      fetchEndPoint(`${peripherals.dma[0].href}`, setEp0, 0);
      fetchEndPoint(`${peripherals.dma[1].href}`, setEp1, 1);
      fetchEndPoint(`${peripherals.dma[2].href}`, setEp2, 2);
      fetchEndPoint(`${peripherals.dma[3].href}`, setEp3, 3);
    }
  }

  React.useEffect(() => {
    update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peripherals]);

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
    const base = enable ? 'clickable' : 'disabled';
    return (selectedItem === Title && enable) ? `${base} selected` : base;
  }

  const dma = totalConsumption.processing_complex.dynamic.components.find((elem) => elem.type === 'dma');

  return (
    <State messages={socState.dma} baseClass={getBaseName()}>
      {enable && (
      <CPUComponent
        title={Title}
        power={dma ? dma.power : 0}
        percent={dma ? dma.percentage : 0}
        name=""
        ep0={ep0}
        ep1={ep1}
        ep2={ep2}
        ep3={ep3}
        endpointText={dmaEndpoints}
      />
      )}
      {
        !enable && <CPUComponentDisabled title={Title} />
      }
    </State>
  );
}

export default DMAComponent;
