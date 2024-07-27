import React from 'react';
import { CPUComponent, CPUComponentDisabled } from './CPUComponent';
import * as server from '../utils/serverAPI';
import { subscribe, unsubscribe } from '../utils/events';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';
import { useGlobalState } from '../GlobalStateProvider';
import { getPeripherals } from '../utils/common';

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
  const dmaType = getPeripherals(peripherals, 'dma');

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
    if (device === '') return;
    setEnable(dmaType.length !== 0);
    if (dmaType.length !== 0) {
      server.GET(server.peripheralPath(device, dmaType[0].href), (data) => {
        fetchEndPoint(`${dmaType[0].href}/${data.channels[0].href}`, setEp0, 0);
        fetchEndPoint(`${dmaType[0].href}/${data.channels[1].href}`, setEp1, 1);
        fetchEndPoint(`${dmaType[0].href}/${data.channels[2].href}`, setEp2, 2);
        fetchEndPoint(`${dmaType[0].href}/${data.channels[3].href}`, setEp3, 3);
      });
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
    if (device !== '') update();
    else {
      setEnable(true);
      setEp0(0);
      setEp1(0);
      setEp2(0);
      setEp3(0);
    }
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
