import React from 'react';
import { Modal } from 'antd';
import { Checkbox } from './components/ComponentsLib';

function Preferences({
  isModalOpen, config, handleOk, handleCancel, handleConfigChange,
}) {
  const [warning, setWarnig] = React.useState(false);
  const [okButtonDisabled, setOkButtonDisabled] = React.useState(false);

  const checkState = React.useCallback((state) => {
    handleConfigChange('useDefaultFile', state);
    setWarnig(true);
    setOkButtonDisabled(!state && (config.device_xml === ''));
  }, [config.device_xml, handleConfigChange]);

  React.useEffect(() => setWarnig(false), [isModalOpen]);
  return (
    <Modal
      title="Preferences"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ disabled: okButtonDisabled }}
    >
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
          value={config.port}
        />
      </div>
      <div className="form-group">
        <label>Devices file</label>
        <Checkbox
          isChecked={config.useDefaultFile}
          label="Use default file"
          checkHandler={checkState}
          id="useDefaultFile"
        />
        <input
          type="text"
          name="device_xml"
          onChange={(e) => {
            handleConfigChange(e.target.name, e.target.value);
            setWarnig(true);
            setOkButtonDisabled(!config.useDefaultFile && (e.target.value === ''));
          }}
          disabled={config.useDefaultFile}
          placeholder="Enter absolute path to devices.xml"
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
