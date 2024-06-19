import React from 'react';
import { CPUComponent, CPUComponentDisabled } from './CPUComponent';
import * as server from '../utils/serverAPI';
import { subscribe, unsubscribe } from '../utils/events';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';
import { useGlobalState } from '../GlobalStateProvider';
import { getPeripherals } from '../utils/common';

function ConnectivityComponent({ device, peripherals }) {
  const [dev, setDev] = React.useState(null);
  const [name, setName] = React.useState('');
  const [ep0, setEp0] = React.useState(0);
  const [ep1, setEp1] = React.useState(0);
  const [ep2, setEp2] = React.useState(0);
  const [ep3, setEp3] = React.useState(0);
  const { selectedItem } = useSelection();
  const { totalConsumption } = useSocTotalPower();
  const endpoints = [
    'Channel 1', 'Channel 2', 'Channel 3', 'Channel 4',
  ];
  const { socState } = useGlobalState();
  const [enable, setEnable] = React.useState(true);
  const fpgaComplex = getPeripherals(peripherals, 'fpga_complex');

  const update = React.useCallback(() => {
    function fetchEndPoint(href, setEp) {
      server.GET(server.peripheralPath(device, href), (data) => setEp(data.consumption.noc_power));
    }
    if (device === null) return;
    setEnable(fpgaComplex.length !== 0);
    if (fpgaComplex.length !== 0) {
      const { href } = fpgaComplex[0];
      setName(fpgaComplex[0].name);
      server.GET(server.peripheralPath(device, href), (fpgaComplexData) => {
        fetchEndPoint(`${href}/${fpgaComplexData.ports[0].href}`, setEp0);
        fetchEndPoint(`${href}/${fpgaComplexData.ports[1].href}`, setEp1);
        fetchEndPoint(`${href}/${fpgaComplexData.ports[2].href}`, setEp2);
        fetchEndPoint(`${href}/${fpgaComplexData.ports[3].href}`, setEp3);
      });
    }
  }, [device, fpgaComplex]);

  React.useEffect(() => update(), [update]);

  React.useEffect(() => {
    subscribe('interconnectChanged', update);
    return () => { unsubscribe('interconnectChanged', update); };
  });

  if (dev !== device) {
    setDev(device);
    if (device !== null) update();
  }

  const Title = 'Connectivity';

  function getBaseName() {
    const base = enable ? 'clickable' : 'disabled';
    return (selectedItem === Title && enable) ? `${base} selected` : base;
  }

  const noc = totalConsumption.processing_complex.dynamic.components.find((elem) => elem.type === 'noc');

  return (
    <State messages={socState.fpga_complex} baseClass={getBaseName()}>
      {enable && (
      <CPUComponent
        title={Title}
        power={noc ? noc.power : 0}
        percent={noc ? noc.percentage : 0}
        name={name}
        ep0={ep0}
        ep1={ep1}
        ep2={ep2}
        ep3={ep3}
        endpointText={endpoints}
      />
      )}
      {!enable && <CPUComponentDisabled title={Title} />}
    </State>
  );
}

export default ConnectivityComponent;
