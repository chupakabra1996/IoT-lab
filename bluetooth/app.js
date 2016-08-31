var BTSP = require('bluetooth-serial-port');
var serial = new BTSP.BluetoothSerialPort();

let buffer = '';
let stdin = process.openStdin();

serial.on('found', (address, name) => {

    console.log(`Found device '${name}', MAC : ${address}`);

    serial.findSerialPortChannel(address, (channel) => {

        serial.connect(address, channel, () => {

            console.log(`Connected to ${name}`);

            serial.on('data', (data) => {

               buffer += data;

               if( data.indexOf('\n') != -1 ) {

                  console.log(`Received data : ${buffer}`);

                  buffer = '';
               }

            });


            stdin.addListener("data", data => {
              serial.write(new Buffer(data), (err, bytesWritten) => {
                if (err) console.log(`Error occurred!!!\n ${err}\nwrited bytes : ${bytesWritten}`);
              });
            })


        },  (err) => {
            console.error(err);
        });
    });
});

serial.on('failure', function (err) {
  console.error(err);
})

serial.inquire();
