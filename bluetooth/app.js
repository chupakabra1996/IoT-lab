var BTSP = require('bluetooth-serial-port');
var serial = new BTSP.BluetoothSerialPort();

let buffer = '';

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

            serial.write(new Buffer('Can you see this? Huh?'), (err, bytesWritten) => {
               if (err) console.log(`Error occurred!!!\n ${err}\nwrited bytes : ${bytesWritten}`);
            });

        },  (err) => {
            console.error(err);
        });
    });
});

serial.on('failure', function (err) {
  console.error(err);
})

serial.inquire();
