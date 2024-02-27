import React from "react";
import ClockingModal from "../ModalWindows/ClockingModal";
import { api, Elem, peripheralPath } from "../../utils/serverAPI"
import { fixed } from "../../utils/common";
import { PowerCell, SelectionCell } from "./TableCells"
import { TableBase, Actions } from "./TableBase";
import * as per from "../../utils/peripherals"

import "./../style/ComponentTable.css"

const PeripheralsTable = ({ device, totalPowerCallback }) => {
    const [editIndex, setEditIndex] = React.useState(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [peripherals, setPeripherals] = React.useState([]);

    const [allComponents, setAllComponents] = React.useState([]);

    const mainTableHeader = [
        "", "Usage", "Performance", "Bandwidth", "Block Power", "%", "Action"
    ]

    React.useEffect(() => {
        if (device !== null)
            fetchData(device)
    }, [device]);

    function getTableObject(name, usage, usage_values, performance, performance_values,
        calculated_bandwidth, block_power, percentage) {
        return {
            "enable": true,
            "name": name,
            "usage": usage,
            "usage_values": usage_values,
            "performance": performance,
            "performance_values": performance_values,
            "calculated_bandwidth": calculated_bandwidth,
            "block_power": block_power,
            "percentage": percentage,
        }
    }
    function toTableObject(object, elem) {
        return getTableObject(
            object.name,
            object.usage,
            per.usage,
            object.clock_frequency ? object.clock_frequency : (
                object.baudrate ? object.baudrate : (
                    object.bit_rate ? object.bit_rate : (
                        object.io_standard ? object.io_standard : 0
                    )
                )
            ),
            // todo, this need to be done in some other way
            elem === 'i2c' ? per.i2c.clock_frequency : (
                elem === 'spi' ? per.spi.clock_frequency : (
                    elem === 'jtag' ? per.jtag.clock_frequency : (
                        elem === 'uart' ? per.uart.baudrate : (
                            elem === 'usb2' ? per.usb2.bit_rate : (
                                elem === 'gige' ? per.gige.bit_rate : (
                                    elem === 'gpio' || elem === 'pwm' ? per.gpio_pwm.io_type : {}
                                )
                            )
                        )
                    )
                )
            ),
            object.consumption ? object.consumption.calculated_bandwidth : 0,
            object.consumption ? object.consumption.block_power : 0,
            object.consumption ? object.consumption.percentage : 0);
    }

    React.useEffect(() => {
        if (device !== null) {
            var data = []
            for (const elem of allComponents) {
                data.push(toTableObject(elem.data, elem.id))
            }
            setPeripherals(data)
        }
    }, [allComponents]);

    function peripheralMatch(component, data) {
        if (component === 'dma') return; // TODO this will be done inside another table
        if (component === 'memory') return; // TODO this will be done inside another table
        setAllComponents(allComponents => [...allComponents, { id: component, data: data }])
    }

    function fetchPeripherals(deviceId, key, url) {
        fetch(peripheralPath(deviceId, url))
            .then((response) => response.json())
            .then((data) => {
                peripheralMatch(key, data);
            })
    }

    const fetchData = (deviceId) => {
        if (deviceId !== null) {
            setAllComponents([])
            fetch(api.fetch(Elem.peripherals, deviceId))
                .then((response) => response.json())
                .then((data) => {
                    for (var key of Object.keys(data)) {
                        for (var item in data[key]) {
                            fetchPeripherals(deviceId, key, data[key][item].href)
                        }
                    }
                })

            fetch(api.consumption(Elem.peripherals, device))
                .then((response) => response.json())
                .then((data) => {
                    totalPowerCallback(data.total_peripherals_power);
                });
        } else {
        }
    }

    function modifyRow(index, row) {
        // fetch(api.index(Elem.clocking, device, index), {
        //   method: "PATCH",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(row),
        // }).then((response) => {
        //   if (response.ok) {
        //     fetchData(device);
        //   } else {
        //     //
        //   }
        // });
    }

    const handleSubmit = (newRow) => {
        if (editIndex !== null)
            modifyRow(editIndex, newRow);
    };

    return <div className="component-table-head">
        <div className="main-block">
            <div className="layout-head">
                <label>FPGA &gt; Peripherals</label>
            </div>
            <TableBase
                header={mainTableHeader}
                data={
                    peripherals.map((row, index) => {
                        return <tr key={index}>
                            <td className="innerHeader">{row.name}</td>
                            <SelectionCell val={row.usage} values={row.usage_values} />
                            <SelectionCell val={row.performance} values={row.performance_values} />
                            <td>{row.calculated_bandwidth} MB/s</td>
                            <PowerCell val={row.block_power} />
                            <td>{fixed(parseFloat(row.percentage), 0)} %</td>
                            <Actions
                                onEditClick={() => { setEditIndex(index); setModalOpen(true) }}
                                showDelete={false}
                            />
                        </tr>
                    })
                }
            />
            {modalOpen && (<></>)}
        </div>
    </div>
}

export default PeripheralsTable;
