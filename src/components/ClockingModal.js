import React, { useState } from "react";
import {sources, states, GetText} from "../assets/clocking"

import "./ClockingModal.css";

export const ClockingModal = ({ closeModal, onSubmit, defaultValue }) => {
  const [formState, setFormState] = useState(
    defaultValue || {
      source: 0,
      description: "",
      port: "",
      frequency: 100000000,
      state: 1
    }
  );

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
            <label htmlFor="source">Source</label>
            <select name="source" onChange={handleChange} value={formState.source}>
                {
                    sources.map((item, index) => (
                        <option key={item.id} value={item.id}>{item.text}</option>
                    ))
                }
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              onChange={handleChange}
              value={formState.description}
            />
          </div>
          <div className="form-group">
            <label htmlFor="port">Port/Signal name</label>
            <textarea
              name="port"
              onChange={handleChange}
              value={formState.port}
            />
          </div>
          <div className="form-group">
            <label htmlFor="frequency">Frequency</label>
            <textarea
              name="frequency"
              onChange={handleChange}
              value={formState.frequency}
            />
          </div>
          <div className="form-group">
            <label htmlFor="state">State</label>
            <select name="state" onChange={handleChange} value={formState.state}>
                {
                    states.map((item, index) => (
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

export default ClockingModal;