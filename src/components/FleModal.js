import React, { useState } from "react";
import { glitch_factor } from "./../assets/fle"

import "./style/Modal.css";

export const FleModal = ({ closeModal, onSubmit, defaultValue }) => {
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
            <label htmlFor="lut6">LUT6</label>
            <textarea
              name="lut6"
              onChange={handleChange}
              value={formState.lut6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="flip_flop">FF/Latch</label>
            <textarea
              name="flip_flop"
              onChange={handleChange}
              value={formState.flip_flop}
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
            <label htmlFor="toggle_rate">Toggle Rate</label>
            <textarea
              name="toggle_rate"
              onChange={handleChange}
              value={formState.toggle_rate}
            />
          </div>
          <div className="form-group">
            <label htmlFor="glitch_factor">Glitch Factor</label>
            <select name="glitch_factor" onChange={handleChange} value={formState.glitch_factor}>
              {
                glitch_factor.map((item, index) => (
                  <option key={item.id} value={item.id}>{item.text}</option>
                ))
              }
            </select>
          </div>
          <button type="submit" className="btn" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default FleModal;