import React from 'react';
import { Modal } from 'antd';

function Preferences({
  isModalOpen, config, handleOk, handleCancel, handleConfigChange,
}) {
  const [warning, setWarnig] = React.useState(false);
  React.useEffect(() => setWarnig(false), [isModalOpen]);
  return (
    <Modal title="Preferences" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <div className="form-group">
        <label>Port</label>
        <input
          type="number"
          step={1}
          min={0}
          name="port"
          onChange={(e) => {
            handleConfigChange(e.target.name, parseInt(e.target.value, 10));
            setWarnig(true);
          }}
        // eslint-disable-next-line no-nested-ternary
          value={config.port}
        />
      </div>
      <div className="form-group">
        <label>Devices file</label>
        <input
          type="text"
          name="device_xml"
          onChange={(e) => {
            handleConfigChange(e.target.name, e.target.value);
            setWarnig(true);
          }}
        // eslint-disable-next-line no-nested-ternary
          value={config.device_xml}
        />
      </div>
      {
        warning && <label className="warningLabel">Application will be reloaded</label>
      }
    </Modal>
  );
}

export default Preferences;
