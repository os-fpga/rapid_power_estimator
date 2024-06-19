import React from 'react';
import { CPUComponent, CPUComponentDisabled } from './CPUComponent';
import * as server from '../utils/serverAPI';
import { subscribe, unsubscribe } from '../utils/events';
import { State } from './ComponentsLib';
import { useSelection } from '../SelectionProvider';
import { getPeripherals } from '../utils/common';

function ABCPUComponent({
  device, title, index, power, percent, peripherals, messages,
}) {
  const [dev, setDev] = React.useState(0);
  const [name, setName] = React.useState('');
  const [ep0, setEp0] = React.useState(0);
  const [ep1, setEp1] = React.useState(0);
  const [ep2, setEp2] = React.useState(0);
  const [ep3, setEp3] = React.useState(0);
  const [enable, setEnable] = React.useState(true);
  const { selectedItem } = useSelection();
  const cpu = getPeripherals(peripherals, index);

  function fetchEndPoint(href, setEp) {
    server.GET(server.peripheralPath(device, href), (data) => setEp(data.consumption.noc_power));
  }

  function update() {
    if (device !== null) {
      setEnable(cpu.length !== 0);
      if (cpu.length !== 0) {
        const { href } = cpu[0];
        server.GET(server.peripheralPath(device, href), (cpuData) => {
          setName(cpuData.name);
          fetchEndPoint(`${href}/${cpuData.ports[0].href}`, setEp0);
          fetchEndPoint(`${href}/${cpuData.ports[1].href}`, setEp1);
          fetchEndPoint(`${href}/${cpuData.ports[2].href}`, setEp2);
          fetchEndPoint(`${href}/${cpuData.ports[3].href}`, setEp3);
        });
      }
    }
  }

  function cpuChanged(cpuChangedData) {
    if (cpuChangedData) {
      const { detail } = cpuChangedData;
      if (detail === index) update();
    }
  }

  React.useEffect(() => {
    update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peripherals]);

  React.useEffect(() => {
    subscribe('cpuChanged', cpuChanged);
    return () => { unsubscribe('cpuChanged', cpuChanged); };
  });

  if (dev !== device) {
    setDev(device);
    if (device !== null) update();
  }

  function getBaseName(item) {
    const base = enable ? 'clickable' : 'disabled';
    return (selectedItem === item && enable) ? `${base} selected` : base;
  }

  return (
    <State messages={messages} baseClass={getBaseName(title)}>
      {enable && (
      <CPUComponent
        title={title}
        power={power}
        percent={percent}
        name={name}
        ep0={ep0}
        ep1={ep1}
        ep2={ep2}
        ep3={ep3}
      />
      )}
      {
        !enable && <CPUComponentDisabled title={title} />
      }
    </State>
  );
}

export default ABCPUComponent;
