client.getTile(function(data) {
    console.log("data =", data);
    var aData = data.toString().trim().split(",");
    console.log("aData =", aData);
    var playerPos = {
        x: parseInt(aData[0]),
        y: parseInt(aData[1]),
        z: parseInt(aData[2])
    };
    var pos_11 = {
        x: ({
            x: 0,
            y: 0,
            z: 0
        }.x + {
            x: 0,
            y: 0,
            z: 0
        }.x),
        y: ({
            x: 0,
            y: 0,
            z: 0
        }.y + {
            x: 0,
            y: 0,
            z: 0
        }.y),
        z: ({
            x: 0,
            y: 0,
            z: 0
        }.z + {
            x: 0,
            y: 0,
            z: 0
        }.z)
    };
    client.end()
});
