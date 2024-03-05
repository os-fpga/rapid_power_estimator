import React from "react";
import CPUComponent from "./CPUComponent";
import * as server from "./../utils/serverAPI"

function BCPUComponent({ device, power, stateChanged }) {
    const [name, setName] = React.useState('')
    const [ep0, setEp0] = React.useState(0)
    const [ep1, setEp1] = React.useState(0)
    const [ep2, setEp2] = React.useState(0)
    const [ep3, setEp3] = React.useState(0)

    function fetchEndPoint(href, setEp) {
        server.GET(server.peripheralPath(device, href), (data) => setEp(data.consumption.noc_power))
    }

    React.useEffect(() => {
        if (device !== null) {
            server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
                if (data['bcpu'] !== null) {
                    let href = data['bcpu'][0].href
                    server.GET(server.peripheralPath(device, href), (data) => {
                        setName(data.name)
                        fetchEndPoint(href + '/' + data.ports[0].href, setEp0)
                        fetchEndPoint(href + '/' + data.ports[1].href, setEp1)
                        fetchEndPoint(href + '/' + data.ports[2].href, setEp2)
                        fetchEndPoint(href + '/' + data.ports[3].href, setEp3)
                    })
                }
            })
        }
    }, [stateChanged, device])
    return <CPUComponent title={'BCPU'} power={power.bcpu} name={name} ep0={ep0} ep1={ep1} ep2={ep2} ep3={ep3} />
}

export default BCPUComponent;