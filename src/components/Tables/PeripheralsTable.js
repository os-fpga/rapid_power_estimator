import React from "react";
import PeripheralsModal from "../ModalWindows/PeripheralsModal";
import * as server from "../../utils/serverAPI"
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

    const elements = [
        {
            id: 'spi',
            usage: per.spi.usage,
            performance: per.spi.clock_frequency,
        },
        {
            id: 'jtag',
            usage: per.jtag.usage,
            performance: per.jtag.clock_frequency,
        },
        {
            id: 'i2c',
            usage: per.i2c.usage,
            performance: per.i2c.clock_frequency,
        },
        {
            id: 'uart',
            usage: per.uart.usage,
            performance: per.uart.baudrate,
        },
        {
            id: 'usb2',
            usage: per.usb2.usage,
            performance: per.usb2.bit_rate,
        },
        {
            id: 'gige',
            usage: per.gige.usage,
            performance: per.gige.bit_rate,
        },
        {
            id: 'gpio',
            usage: per.gpio_pwm.usage,
            performance: per.gpio_pwm.io_standard,
        },
        {
            id: 'pwm',
            usage: per.gpio_pwm.usage,
            performance: per.gpio_pwm.io_standard,
        },
    ]

    React.useEffect(() => {
        if (device !== null)
            fetchData(device)
    }, [device]);

    function getTableObject(id, url, name, usage, usage_values, performance, performance_values,
        calculated_bandwidth, block_power, percentage) {
        return {
            id: id,
            url: url,
            enable: true,
            name: name,
            usage: usage,
            usage_values: usage_values,
            performance: performance,
            performance_values: performance_values,
            calculated_bandwidth: calculated_bandwidth,
            block_power: block_power,
            percentage: percentage,
        }
    }
    function toTableObject(object, elem, url) {
        var item = elements.find((item) => item.id === elem)
        return getTableObject(
            elem,
            url,
            object.name,
            object.usage,
            item.usage,
            object.clock_frequency ? object.clock_frequency : (
                object.baudrate ? object.baudrate : (
                    object.bit_rate ? object.bit_rate : (
                        object.io_standard ? object.io_standard : 0
                    )
                )
            ),
            item.performance,
            object.consumption ? object.consumption.calculated_bandwidth : 0,
            object.consumption ? object.consumption.block_power : 0,
            object.consumption ? object.consumption.percentage : 0);
    }

    React.useEffect(() => {
        if (device !== null) {
            var data = []
            let tmp = allComponents;
            // sort for corrrect table order since we receive data async
            tmp.sort((a, b) => {
                if (a.id === b.id) {
                    let a_id = a.url.slice(-1)
                    let b_id = b.url.slice(-1)
                    return a_id - b_id;
                } else {
                    return elements.indexOf(elements.find((elem) => elem.id === a.id)) -
                        elements.indexOf(elements.find((elem) => elem.id === b.id))
                }
            })
            for (const id of elements) {
                tmp.map((elem) => {
                    if (elem.id === id.id) {
                        data.push(toTableObject(elem.data, elem.id, elem.url))
                    }
                })
            }
            setPeripherals(data)
        }
    }, [allComponents]);

    function peripheralMatch(component, data, url) {
        setAllComponents(allComponents => [...allComponents, { id: component, url: url, data: data }])
    }

    function fetchPeripherals(deviceId, key, url) {
        server.GET(server.peripheralPath(deviceId, url),
            (data) => peripheralMatch(key, data, url))
    }

    const fetchData = (deviceId) => {
        if (deviceId !== null) {
            setAllComponents([])
            server.GET(server.api.fetch(server.Elem.peripherals, deviceId), (data) => {
                delete data['dma'];
                delete data['memory'];
                delete data['acpu'];
                delete data['bcpu'];
                for (var key of Object.keys(data)) {
                    for (var item in data[key]) {
                        fetchPeripherals(deviceId, key, data[key][item].href)
                    }
                }
            })
            server.GET(server.api.consumption(server.Elem.peripherals, device), (data) => {
                totalPowerCallback(data.total_peripherals_power)
            })
        }
    }

    function modifyRow(index, row) {
        let data = {};
        if (row.id === 'i2c' || row.id === 'spi' || row.id === 'jtag')
            data = {
                usage: row.usage,
                clock_frequency: row.performance
            }
        else if (row.id === 'uart')
            data = {
                usage: row.usage,
                baudrate: row.performance
            }
        else if (row.id === 'usb2' || row.id === 'gige')
            data = {
                usage: row.usage,
                bit_rate: row.performance
            }
        else if (row.id === 'gpio' || row.id === 'pwm')
            data = {
                usage: row.usage,
                io_standard: row.performance
            }
        else return
        server.PATCH(server.peripheralPath(device, row.url), data, () => fetchData(device))
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
            {modalOpen && (
                <PeripheralsModal
                    closeModal={() => {
                        setModalOpen(false);
                        setEditIndex(null);
                    }}
                    onSubmit={handleSubmit}
                    defaultValue={editIndex !== null && peripherals[editIndex] ||
                    {
                        enable: true,
                        name: '',
                        usage: 0,
                        usage_values: [],
                        performance: 0,
                        performance_values: [],
                        calculated_bandwidth: 0,
                        block_power: 0,
                        percentage: 0,
                    }
                    }
                />
            )}
        </div>
    </div>
}

export default PeripheralsTable;
