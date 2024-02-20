import React from "react";

import "./style/CPUComponent.css"

function CPUComponent({name}) {
    return <div className="cpu-component-top">
        <div className="cpu-component-l1">
            <div className="cpu-component-title">{name}</div>
            <div className="cpu-component-power">X.XXX W</div>
        </div>
        <div className="cpu-component-l2">
            <div className="cpu-component-power">some text</div>
        </div>
        <div className="cpu-component-l3">
            <div className="cpu-component-power">Endpoint 1</div>
            <div className="cpu-component-power">X.XXX W</div>
        </div>
        <div className="cpu-component-l3">
            <div className="cpu-component-power">Endpoint 2</div>
            <div className="cpu-component-power">X.XXX W</div>
        </div>
        <div className="cpu-component-l3">
            <div className="cpu-component-power">Endpoint 3</div>
            <div className="cpu-component-power">X.XXX W</div>
        </div>
        <div className="cpu-component-l3">
            <div className="cpu-component-power">Endpoint 4</div>
            <div className="cpu-component-power">X.XXX W</div>
        </div>
    </div>
}

export default CPUComponent;