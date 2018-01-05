let net = require('net');
let https = require('https');
let bcproxy_protocol = require('./protocol');
let Web3 = require('web3')
let BigNumber = require('bignumber.js');

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
let provider_addr = "0x8c7aa63f106505fcb6f1e625f89190813925263d";

let oneEth = new BigNumber(1000000000000000000);
let packetPrice = oneEth.dividedBy(1e9);

let server = net.createServer(function(socket) {

  socket.on('data', function(unparsed_data) {
    let data = JSON.parse(unparsed_data);

    if (data.protocol == bcproxy_protocol.REQUEST) {
      if (!data.data.address) {
        return;
      }
      
      try {
        https.get(data.data.url, function(res) {
          res.setEncoding('utf8');
          let body = '';
          res.on('data', d=> {
            body += d;
          });

          res.on('end', () => {
            socket.write(JSON.stringify({
              protocol: bcproxy_protocol.DATA,
              data: {
                data: body,
                gasPrice: web3.eth.gasPrice,
                provider_addr: provider_addr,
                packetPrice: packetPrice,
                packetsUsed: body.length,
                addressTxCount: web3.eth.getTransactionCount(data.data.address)
              }
            }));
          });
        });

      } catch (e) {
        console.log(e);
      }
    } else if (data.protocol == bcproxy_protocol.PAYMENT) {
      web3.eth.sendRawTransaction('0x' + data.data, function(err, hash) {
        console.log(err, hash);
      });
    } else {
      console.log(data);
    }
  });
});

server.listen(1337, '127.0.0.1');
