let net = require('net');
let bcproxy_protocol = require('./protocol');
let Tx = require('ethereumjs-tx');
let BigNumber = require('bignumber.js');

let client_addr = "0x68621922241312807dfd7e23ac61bd2595793048";
let client_key = new Buffer("9322b9b0c0af3555cae84b2beaa63a9aa1fa8622870b892fa73e58da74481001", 'hex');

class Client {
  constructor(host, port, callback) {
    this.client = new net.Socket();
    this.client.connect(port, host, function() {
      if (callback) callback();
    });

    this.dataEventHandler = {};
    this.client.on('data', (function(unparsed_data) {
      let data = JSON.parse(unparsed_data);
      if (this.dataEventHandler[data.protocol]) {
        this.dataEventHandler[data.protocol](data.data);
      }
    }).bind(this));

    this.client.on('close', function() {
      this.client = null;
    });
  }

  write(protocol, data) {
    let packet = JSON.stringify({
      protocol: protocol,
      data: data
    });

    this.client.write(packet);
  }

  read(protocol, callback) {
    this.dataEventHandler[protocol] = callback;
  }

  close() {
    this.client.destroy();
  }
}

let c = new Client('127.0.0.1', 1337);

c.read(bcproxy_protocol.DATA, function(d) {
  console.log(d);
  let packetsUsed = new BigNumber(d.packetsUsed);
  let packetPrice = new BigNumber(d.packetPrice);
  let price = '0x' + packetsUsed.times(packetPrice).toString(16);
  let rawTx = {
    nonce: d.addressTxCount,
    gasPrice: d.gasPrice,
    gasLimit: '0x15f90', //90000
    from: client_addr,
    to: d.provider_addr,
    value: price,
    data: '0x'
  }
  let tx = new Tx(rawTx);
  tx.sign(client_key);
  c.write(bcproxy_protocol.PAYMENT, tx.serialize().toString('hex'));
});

c.write(bcproxy_protocol.REQUEST, {url: "https://google.com", address: client_addr});


