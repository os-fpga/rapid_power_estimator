import React from "react";
import PowerTable from "./PowerTable";
import { FaPlus } from "react-icons/fa6";
import * as server from "../../utils/serverAPI"
import { bcpu_name, clock, load_activity } from "../../utils/cpu"
import { TableBase, Actions, Checkbox } from "./TableBase";
import ABCPUModal from "../ModalWindows/ABCPUModal";
import { PowerCell, SelectionCell, PercentsCell } from "./TableCells"
import { GetText } from "../../utils/common";

import "./../style/ACPUTable.css"

function BCPUTable({ device, onDataChanged }) {
    const [editIndex, setEditIndex] = React.useState(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [powerData, setPowerData] = React.useState([
        ['Active Power', 0, 0],
        ['Boot Power', 0, 0]
    ])
    const [bcpuData, setBcpuData] = React.useState({
        name: '',
        encryption_used: false,
        clock: 0
    })
    const [bootMode, setBootMode] = React.useState(0)
    const [endpoints, setEndpoints] = React.useState([])
    const [endpointsToDisplay, setEndpointsToDisplay] = React.useState([])
    const [href, setHref] = React.useState('')
    const [addButtonDisable, setAddButtonDisable] = React.useState(true)

    function fetchData(device) {
        server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
            let href = data['bcpu'][0].href;
            setHref(href)
        })
    }

    React.useEffect(() => {
        if (device !== null) {
            fetchData(device)
        }
    }, [device])

    React.useEffect(() => {
        endpoints.sort((a, b) => a.ep - b.ep)
        setEndpointsToDisplay(endpoints)
    }, [endpoints])

    function fetchPort(port) {
        server.GET(server.peripheralPath(device, href + '/' + port.href), (data) => {
            if (data.name !== '') {
                setEndpoints(prevVal => [...prevVal, { ep: port.href.slice(-1), data: data }])
            }
        })
    }

    function fetchAcpuData() {
        if (href !== '') {
            server.GET(server.peripheralPath(device, href), (data) => {
                // resolve cycling
                setBootMode(data.consumption.boot_mode)
                if (data.name !== bcpuData.name ||
                    data.encryption_used !== bcpuData.encryption_used ||
                    data.clock !== bcpuData.clock) {
                    setBcpuData({
                        name: data.name,
                        encryption_used: data.encryption_used,
                        clock: data.clock
                    })
                }
                setPowerData([
                    ['Active Power', data.consumption.active_power, 0],
                    ['Boot Power', data.consumption.boot_power, 0]
                ])
                setEndpoints([])
                for (let port of data.ports) {
                    fetchPort(port)
                }
            })
        }
    }

    React.useEffect(() => {
        if (device !== null) {
            fetchAcpuData()
        }
    }, [href])

    React.useEffect(() => {
        setAddButtonDisable(endpoints.length >= 4)
    }, [endpoints])

    React.useEffect(() => {
        if (device !== null && href !== '') {
            server.PATCH(server.peripheralPath(device, href), bcpuData, fetchAcpuData)
        }
    }, [bcpuData])

    const handleChange = (name, val) => {
        setBcpuData({ ...bcpuData, [name]: val })
        onDataChanged()
    };

    const header = ['Endpoint', 'Activity', 'R/W', 'Toggle Rate', 'Bandwidth', 'Noc Power', 'Action']

    function modifyRow(index, row) {
        var data = row;
        data.name = GetText(row.name, bcpu_name)
        server.PATCH(server.peripheralPath(device, href + '/ep/' + endpoints[index].ep), data, fetchAcpuData)
    }

    const deleteRow = (index) => {
        // no delete method for acpu. this is just clear name of the endpoint which mean disable
        let val = endpoints[index].data
        val.name = ''
        server.PATCH(server.peripheralPath(device, href + '/ep/' + endpoints[index].ep), val, fetchAcpuData)
        onDataChanged()
    }

    function findEvailableIndex() {
        let index = 0
        for (let ep of endpoints) {
            if (index < ep.ep)
                return index
            else
                index = index + 1
        }
        return index
    }

    function addRow(newData) {
        if (device !== null) {
            var data = newData;
            data.name = GetText(newData.name, bcpu_name)
            server.PATCH(server.peripheralPath(device, href + '/ep/' + findEvailableIndex()), data, fetchAcpuData)
        }
    }

    const handleSubmit = (newRow) => {
        if (editIndex !== null)
            modifyRow(editIndex, newRow);
        else
            addRow(newRow);
        onDataChanged()
    };

    function encryptionHandler(state) {
        setBcpuData({ ...bcpuData, ['encryption_used']: state })
        onDataChanged()
    }

    const powerHeader = ['Power', '%']
    return <div className="acpu-container">
        <div className="main-block">
            <div className="layout-head">
                <label>FPGA &gt; BCPU</label>
                <button disabled={addButtonDisable} className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
            </div>
            <div className="cpu-container">
                <div className="acpu-group-container">
                    <div className="acpu-group">
                        <label>BCPU name</label>
                        <input type={'text'} onChange={(e) => handleChange('name', e.target.value)} value={bcpuData.name}></input>
                    </div>
                    <div className="acpu-group">
                        <Checkbox
                            isChecked={bcpuData.encryption_used}
                            label={'Encryption'}
                            checkHandler={encryptionHandler}
                            id={'encryption'}
                        />
                    </div>
                    <div className="acpu-group">
                        <label>Boot Mode</label>
                        <input type={'text'} value={bootMode} disabled></input>
                    </div>
                    <div className="acpu-group">
                        <label>Clock</label>
                        <select type={'text'} value={bcpuData.clock} onChange={(e) => handleChange('clock', parseInt(e.target.value))}>
                            {
                                clock.map((it) => (
                                    <option key={it.id} value={it.id}>{it.text}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <TableBase
                    header={header}
                    data={
                        endpointsToDisplay.map((row, index) => {
                            return <tr key={index}>
                                <td>{row.data.name}</td>
                                <SelectionCell val={row.data.activity} values={load_activity} />
                                <PercentsCell val={row.data.read_write_rate} />
                                <PercentsCell val={row.data.toggle_rate} precition={1} />
                                <PowerCell val={row.data.consumption.calculated_bandwidth} />
                                <PowerCell val={row.data.consumption.noc_power} />
                                <Actions
                                    onEditClick={() => { setEditIndex(index); setModalOpen(true) }}
                                    onDeleteClick={() => deleteRow(index)}
                                />
                            </tr>
                        })
                    }
                />
                {modalOpen &&
                    <ABCPUModal
                        closeModal={() => {
                            setModalOpen(false);
                            setEditIndex(null);
                        }}
                        onSubmit={handleSubmit}
                        defaultValue={editIndex !== null && {
                            "name": bcpu_name.indexOf(bcpu_name.find(elem => elem.text == endpoints[editIndex].data.name)),
                            "activity": endpoints[editIndex].data.activity,
                            "read_write_rate": endpoints[editIndex].data.read_write_rate,
                            "toggle_rate": endpoints[editIndex].data.toggle_rate,
                        } || {
                            "name": 0,
                            "activity": 0,
                            "read_write_rate": 0.5,
                            "toggle_rate": 0.125,
                        }}
                        endpoints={bcpu_name}
                    />}
            </div>
        </div>
        <PowerTable title={'BCPU power'}
            total={null}
            resourcesHeaders={powerHeader}
            resources={powerData}
            subHeader="Sub System" />
    </div>
}

export default BCPUTable;