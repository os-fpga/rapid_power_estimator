export let usage = [
    { id: 0, text: "Boot" },
    { id: 1, text: "Debug" },
    { id: 2, text: "Application" },
]

export let spi = {
    usage: [
        { id: 0, text: "Boot" },
        { id: 1, text: "Debug" },
        { id: 2, text: "Application" },
    ],
    clock_frequency: [
        { id: 0, text: "SPI: 1 Mb/s" },
        { id: 1, text: "SPI: 25 Mb/s" },
        { id: 2, text: "SPI: 50 Mb/s" },
        { id: 3, text: "SPI: 100 Mb/s" },
        { id: 4, text: "QSPI: 4 Mb/s" },
        { id: 5, text: "QSPI: 100 Mb/s" },
        { id: 6, text: "QSPI: 200 Mb/s" },
        { id: 7, text: "QSPI: 400 Mb/s" },
    ],
}

export let i2c = {
    usage: [
        { id: 1, text: "Debug" },
        { id: 2, text: "Application" },
    ],
    clock_frequency: [
        { id: 0, text: "10 Mb/S" },
        { id: 1, text: "20 Mb/S" },
        { id: 2, text: "40 Mb/S" },
    ],
}

export let jtag = {
    usage: [
        { id: 1, text: "Debug" },
        { id: 2, text: "Application" },
    ],
    clock_frequency: [
        { id: 0, text: "10 Mb/S" },
        { id: 1, text: "20 Mb/S" },
        { id: 2, text: "40 Mb/S" },
    ],
}

export let uart = {
    usage: [
        { id: 0, text: "Boot" },
        { id: 1, text: "Debug" },
        { id: 2, text: "Application" },
    ],
    baudrate: [
        { id: 0, text: "9600 baud" },
        { id: 1, text: "19200 baud" },
        { id: 2, text: "28800 baud" },
        { id: 3, text: "57600 baud" },
        { id: 4, text: "115200 baud" },
        { id: 5, text: "128000 baud" },
    ],
}

export let usb2 = {
    usage: [
        { id: 1, text: "Debug" },
        { id: 2, text: "Application" },
    ],
    bit_rate: [
        { id: 0, text: "Full Speed (12 Mbps)" },
        { id: 1, text: "High Speed (480 Mbps)" },
    ],
}

export let gige = {
    usage: [
        { id: 1, text: "Debug" },
        { id: 2, text: "Application" },
    ],
    bit_rate: [
        { id: 0, text: "10 Mb/S" },
        { id: 1, text: "100 Mb/S" },
        { id: 2, text: "1000 Mb/S" },
    ],
}

export let gpio_pwm = {
    usage: [
        { id: 1, text: "Debug" },
        { id: 2, text: "Application" },
    ],
    io_standard: [
        { id: 0, text: "LVCMOS 1.8V (HR)" },
        { id: 1, text: "LVCMOS 2.5V" },
        { id: 2, text: "LVCMOS 3.3V" },
        { id: 3, text: "LVTTL" },
        { id: 4, text: "PCI66" },
        { id: 5, text: "PCIX133" },
        { id: 6, text: "SSTL 1.8V Class-I (HR)" },
        { id: 7, text: "SSTL 1.8V Class-II (HR)" },
        { id: 8, text: "SSTL 2.5V Class-I" },
        { id: 9, text: "SSTL 2.5V Class-II" },
        { id: 10, text: "SSTL 3.3V Class-I" },
        { id: 11, text: "SSTL 3.3V Class-II" },
    ],
}