import React from 'react';
import CPUComponent from './CPUComponent';
import * as server from '../utils/serverAPI';
import { subscribe, unsubscribe } from '../utils/events';
import { percentage } from '../utils/common';
import { useSelection } from '../SelectionProvider';
import { useSocTotalPower } from '../SOCTotalPowerProvider';
import { State } from './ComponentsLib';

function ConnectivityComponent({ device }) {
  const [name, setName] = React.useState('');
  const [ep0, setEp0] = React.useState(0);
  const [ep1, setEp1] = React.useState(0);
  const [ep2, setEp2] = React.useState(0);
  const [ep3, setEp3] = React.useState(0);
  const { selectedItem } = useSelection();
  const { power, dynamicPower } = useSocTotalPower();
  const endpoints = [
    'Channel 1', 'Channel 2', 'Channel 3', 'Channel 4',
  ];

  const update = React.useCallback(() => {
    function fetchEndPoint(href, setEp) {
      server.GET(server.peripheralPath(device, href), (data) => setEp(data.consumption.noc_power));
    }
    if (device === null) return;
    server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
      const fpgaComplex = data.fpga_complex;
      const { href } = fpgaComplex[0];
      setName(fpgaComplex[0].name);
      server.GET(server.peripheralPath(device, href), (fpgaComplexData) => {
        fetchEndPoint(`${href}/${fpgaComplexData.ports[0].href}`, setEp0);
        fetchEndPoint(`${href}/${fpgaComplexData.ports[1].href}`, setEp1);
        fetchEndPoint(`${href}/${fpgaComplexData.ports[2].href}`, setEp2);
        fetchEndPoint(`${href}/${fpgaComplexData.ports[3].href}`, setEp3);
      });
    });
  }, [device]);

  React.useEffect(() => {
    subscribe('interconnectChanged', update);
    return () => { unsubscribe('interconnectChanged', update); };
  });

  React.useEffect(() => {
    if (device !== null) update();
  }, [device, update]);

  const warn = 0.003; // TBD
  const error = 0.016; // TBD
  const Title = 'Connectivity';

  function getBaseName() {
    return (selectedItem === Title) ? 'clickable selected' : 'clickable';
  }

  return (
    <State
      refValue={power.total_noc_interconnect_power}
      warn={warn}
      err={error}
      baseClass={getBaseName()}
    >
      <CPUComponent
        title={Title}
        power={power.total_noc_interconnect_power}
        percent={percentage(power.total_noc_interconnect_power, dynamicPower)}
        name={name}
        ep0={ep0}
        ep1={ep1}
        ep2={ep2}
        ep3={ep3}
        endpointText={endpoints}
      />
    </State>
  );
}

export default ConnectivityComponent;
