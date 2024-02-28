import React from "react";
import { Table, fixed } from "../utils/common";
import { api, Elem, peripheralPath } from "../utils/serverAPI";

import "./style/Peripherals.css"

function Peripherals({ setOpenedTable, power, device }) {
    const [i2c, setI2c] = React.useState(0);
    const [spi, setSpi] = React.useState(0);
    const [pwm, setPWM] = React.useState(0);
    const [usb2, setUsb2] = React.useState(0);
    const [jtag, setJtag] = React.useState(0);
    const [gige, setGige] = React.useState(0);
    const [uart0, setUart0] = React.useState(0);
    const [uart1, setUart1] = React.useState(0);
    const [gpio, setGPIO] = React.useState(0);

    function fetchPeripherals(deviceId, key, url) {
        console.log(key)
        fetch(peripheralPath(deviceId, url))
            .then((response) => response.json())
            .then((data) => {
                if (key === 'i2c')
                    setI2c(data.consumption.block_power)
                if (key === 'spi')
                    setSpi(data.consumption.block_power)
                if (key === 'pwm')
                    setPWM(data.consumption.block_power)
                if (key === 'usb2')
                    setUsb2(data.consumption.block_power)
                if (key === 'jtag')
                    setJtag(data.consumption.block_power)
                if (key === 'gige')
                    setGige(data.consumption.block_power)
                if (key === 'uart') {
                    if (url.slice(-1) === '0')
                        setUart0(data.consumption.block_power)
                    else
                        setUart1(data.consumption.block_power)
                }
                if (key === 'gpio')
                    setGPIO((prev) => prev + data.consumption.block_power)
            })
    }
    React.useEffect(() => {
        if (device !== null) {
            setGPIO(0)
            fetch(api.fetch(Elem.peripherals, device))
                .then((response) => response.json())
                .then((data) => {
                    for (var key of Object.keys(data)) {
                        for (var item in data[key]) {
                            fetchPeripherals(device, key, data[key][item].href)
                        }
                    }
                });
        }
    }, [device]);

    return <div className="periph-top" onClick={() => setOpenedTable(Table.Peripherals)}>
        <div className="periph-row-head">
            <div>Peripherals</div>
            <div id="peripherals-power">{fixed(power)} W</div>
        </div>
        <div className="periph-row">
            <div className="periph-rowx">
                <div className="periph-internal-font-header">UART0</div>
                <div className="periph-internal-font">{fixed(uart0)} W</div>
            </div>
            <div className="periph-rowx">
                <div className="periph-internal-font-header">UART1</div>
                <div className="periph-internal-font">{fixed(uart1)} W</div>
            </div>
            <div className="periph-rowx">
                <div className="periph-internal-font-header">USB 2.0</div>
                <div className="periph-internal-font">{fixed(usb2)} W</div>
            </div>
        </div>
        <div className="periph-row">
            <div className="periph-rowx">
                <div className="periph-internal-font-header">I2C</div>
                <div className="periph-internal-font">{fixed(i2c)} W</div>
            </div>
            <div className="periph-rowx">
                <div className="periph-internal-font-header">GPIO</div>
                <div className="periph-internal-font">{fixed(gpio)} W</div>
            </div>
            <div className="periph-rowx">
                <div className="periph-internal-font-header">PWM</div>
                <div className="periph-internal-font">{fixed(pwm)}W</div>
            </div>
        </div>
        <div className="periph-row">
            <div className="periph-rowx">
                <div className="periph-internal-font-header">SPI/QSPI</div>
                <div className="periph-internal-font">{fixed(spi)}W</div>
            </div>
            <div className="periph-rowx">
                <div className="periph-internal-font-header">JTAG</div>
                <div className="periph-internal-font">{fixed(jtag)} W</div>
            </div>
            <div className="periph-rowx">
                <div className="periph-internal-font-header">GigI</div>
                <div className="periph-internal-font">{fixed(gige)} W</div>
            </div>
        </div>
    </div>
}

export default Peripherals;