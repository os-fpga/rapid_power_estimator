import React, { useState } from "react";

import { FieldType } from "../../utils/common";

import "./../style/Modal.css";

const ModalWindow = (props) => {
    const [formState, setFormState] = useState(props.defaultValue);

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleFloatChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value / 100 });
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


    function generateField(item) {
        if (item.fieldType === FieldType.textarea) {
            return <div key={item.id} className="form-group">
                <label htmlFor={item.id}>{item.text}</label>
                <input
                    type="text"
                    name={item.id}
                    onChange={handleChange}
                    value={formState[item.id]}
                />
            </div>
        } else if (item.fieldType === FieldType.number) {
            return <div key={item.id} className="form-group">
                <label htmlFor={item.id}>{item.text}</label>
                <input
                    type="number"
                    name={item.id}
                    onChange={handleChange}
                    value={formState[item.id]}
                />
            </div>
        } else if (item.fieldType === FieldType.float) {
            return <div key={item.id} className="form-group">
                <label htmlFor={item.id}>{item.text}</label>
                <input
                    type="number"
                    step={item.step ? item.step : 1}
                    name={item.id}
                    onChange={handleFloatChange}
                    value={(formState[item.id] * 100).toFixed(1)}
                />
            </div>
        } else {
            return <div key={item.id} className="form-group">
                <label htmlFor={item.id}>{item.name}</label>
                <select name={item.id} onChange={handleSelectChange} value={formState[item.id]}>
                    {
                        item.values.map((it, idx) => (
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