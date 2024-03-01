import React, { useState } from "react";

import { FieldType } from "../../utils/common";

import "./../style/Modal.css";

const ModalWindow = (props) => {
    const [formState, setFormState] = useState(props.defaultValue);
    const handleChange = (name, val) => {
        setFormState({ ...formState, [name]: val });
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


    function generateField(item) {
        if (item.fieldType === FieldType.textarea) {
            return <div key={item.id} className="form-group">
                <label>{item.text}</label>
                <input
                    type="text"
                    onChange={(e) => handleChange(item.id, e.target.value)}
                    value={formState[item.id]}
                />
            </div>
        } else if (item.fieldType === FieldType.number) {
            return <div key={item.id} className="form-group">
                <label>{item.text}</label>
                <input
                    type="number"
                    onChange={(e) => handleChange(item.id, e.target.value)}
                    value={formState[item.id]}
                />
            </div>
        } else if (item.fieldType === FieldType.float) {
            return <div key={item.id} className="form-group">
                <label>{item.text}</label>
                <input
                    type="number"
                    step={item.step ? item.step : 1}
                    onChange={(e) => item.handleChange(item.id, e.target.value / 100)}
                    value={(formState[item.id] * 100).toFixed(item.step ? (item.step >= 1 ? 0 : 1) : 1)}
                />
            </div>
        } else {
            return <div key={item.id} className="form-group">
                <label>{item.text}</label>
                <select onChange={(e) => handleChange(item.id, parseInt(e.target.value))} value={formState[item.id]}>
                    {
                        item.values.map((it) => (
                            <option key={it.id} value={it.id}>{it.text}</option>
                        ))
                    }
                </select>
            </div>
        }
    }

    return (
        <div
            className="modal-container"
            onClick={(e) => {
                if (e.target.className === "modal-container") props.closeModal();
            }}
        >
            <div className="modal">
                <form>
                    {props.title &&
                        <div className="form-group">
                            <label id='form-group-header'>{props.title}</label>
                        </div>
                    }
                    {
                        props.fields.map((item) => {
                            if (item.hasOwnProperty('internal')) {
                                return <div key={item.id} className="form-group">
                                    <fieldset>
                                        <legend>{item.text}</legend>
                                        {
                                            item.internal.map((item) => {
                                                return generateField(item);
                                            })
                                        }
                                    </fieldset>
                                </div>
                            } else {
                                return generateField(item);
                            }
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