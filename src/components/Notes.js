import React, { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

import './style/Modal.css';

function Notes({ defaultValue, onSubmit, closeModal }) {
  const [formState, setFormState] = useState(defaultValue);
  const handleChange = (val) => {
    setFormState(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formState);
    closeModal();
  };

  const handleKeyPress = React.useCallback((event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeModal]);

  React.useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="modal-container">
      <div className="modal">
        <form>
          <div className="form-group-row">
            <label id="form-group-header-note">Notes</label>
            <IoCloseOutline onClick={() => closeModal()} className="close-btn" />
          </div>
          <div className="form-group">
            <textarea
              onChange={(e) => handleChange(e.target.value)}
              value={formState}
              className="notes-input"
            />
          </div>
          <button type="submit" className="btn" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Notes;
