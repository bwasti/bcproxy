# bcproxy
blockchain proxy POC for selling internet to people

# provider.js

This simulates the node serving up internet.
The server listens for a request (which contains a URL and a payment address it later charges).
It then serves up the request and sends a receiptwhich includes all the information the client needs to sign a transaction.

# client.js

This simulates the internet-less client who is making
requests and pays for the data by generating signed transactions that deposit into the account.

# usage

1. figure out what you need to `npm install`

(use web3@0.20.1, I couldn't figure out the shitshow that is the current state of documentation
with the web3 project)

2. run the server
```
    node provider.js
```
 3. and in a different place run the client
 ```
    node client.js
 ```
 
 # TODO
 I imagine the server and client won't want to take a ton of fees to process these transactions.
 To solve this the server will have to start proposing consolidated payments.
 Not sure how to do this securely, yet.
