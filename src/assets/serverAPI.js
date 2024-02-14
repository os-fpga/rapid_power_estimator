const serverUrl = "http://127.0.0.1:5000/devices"

export function GetDevices() {
    var json = [];
    fetch(serverUrl)
        .then((response) => response.json())
        .then((data) => {
            data.forEach(function(item) {
                json.push(item);
            });
        });
    return json;
}