import React, { useState } from "react";
import { dsp_mode, pipelining } from "../assets/dsp";

import "./style/Modal.css";

export const DspModal = ({ closeModal, onSubmit, defaultValue }) => {
  const [formState, setFormState] = useState(defaultValue);

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formState);
    closeModal();
  };

  const handleKeyPress = React.useCallback((event) => {
    if (event.key === 'Escape') {
      closeModal()
    };
  }, []);

  React.useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div
      className="modal-container"
      onClick={(e) => {
        if (e.target.className === "modal-container") closeModal();
      }}
    >
      <div className="modal">
        <form>
        <div className="form-group">
            <label htmlFor="name">Name/Hierarchy</label>
            <textarea
              name="name"
              onChange={handleChange}
              value={formState.name}
            />
          </div>
          <div className="form-group">
            <label htmlFor="number_of_multipliers">Number Of Multipliers</label>
            <textarea
              name="number_of_multipliers"
              onChange={handleChange}
              value={formState.number_of_multipliers}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dsp_mode">DSP Mode</label>
            <select name="dsp_mode" onChange={handleChange} value={formState.dsp_mode}>
              {
                dsp_mode.map((item, index) => (
                  <option key={item.id} value={item.id}>{item.text}</option>
                ))
              }
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="a_input_width">A-Input Width</label>
            <textarea
              name="a_input_width"
              onChange={handleChange}
              value={formState.a_input_width}
            />
          </div>
          <div className="form-group">
            <label htmlFor="b_input_width">B-Input Width</label>
            <textarea
              name="b_input_width"
              onChange={handleChange}
              value={formState.b_input_width}
            />
          </div>
          <div className="form-group">
            <label htmlFor="clock">Clock</label>
            <textarea
              name="clock"
              onChange={handleChange}
              value={formState.clock}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pipelining">Pipeline</label>
            <select name="pipelining" onChange={handleChange} value={formState.pipelining}>
              {
                pipelining.map((item, index) => (
                  <option key={item.id} value={item.id}>{item.text}</option>
                ))
              }
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="toggle_rate">Toggle Rate</label>
            <textarea
              name="toggle_rate"
              onChange={handleChange}
              value={formState.toggle_rate}
            />
          </div>
          <button type="submit" className="btn" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default DspModal;