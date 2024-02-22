import React, { useState } from "react";

import { FieldType } from "../assets/common";

import "./style/Modal.css";

const ModalWindow = (props) => {
    const [formState, setFormState] = useState(props.defaultValue);

    const handleChange = (e) => {
        console.log(formState)
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (e) => {
        setFormState({ ...formState, [e.target.name]: parseInt(e.target.value) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        var state = formState;
        if (state.hasOwnProperty('consumption')) {
            delete state['consumption'];
        }
        props.onSubmit(state);
        props.closeModal();
    };

    const handleKeyPress = React.useCallback((event) => {
        if (event.key === 'Escape') {
            props.closeModal()
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
                if (e.target.className === "modal-container") props.closeModal();
            }}
        >
            <div className="modal">
                <form>
                    {
                        props.fields.map((item, index) => {
                            return (item.fieldType === FieldType.textarea) ?
                                <div key={item.id} className="form-group">
                                    <label htmlFor={item.id}>{item.text}</label>
                                    <input
                                        type="text"
                                        name={item.id}
                                        onChange={handleChange}
                                        value={formState[item.id]}
                                    />
                                </div>
                                : (item.fieldType === FieldType.number) ?
                                    <div key={item.id} className="form-group">
                                        <label htmlFor={item.id}>{item.text}</label>
                                        <input
                                            type="number"
                                            name={item.id}
                                            onChange={handleChange}
                                            value={formState[item.id]}
                                        />
                                    </div>
                                    :
                                    <div key={item.id} className="form-group">
                                        <label htmlFor={item.id}>{item.name}</label>
                                        <select name={item.id} onChange={handleSelectChange} value={formState[item.id]}>
                                            {
                                                item.values.map((it, idx) => (
                                                    <option key={it.id} value={it.id}>{it.text}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                        })
                    }
                    <button type="submit" className="btn" onClick={handleSubmit}>
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalWindow;