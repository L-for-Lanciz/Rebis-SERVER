  //const definition for the blockchain
 const Web3 = require('web3');
 const Rebis = require('./blockchain/abis/Rebis.json');
  // const definition for the route
 const express = require('express');
 const app = express();
 const infuraUrl = 'https://ropsten.infura.io/v3/7a56a2e59589490681f5a5c3826db721';
 const contract_address = '0x291197c18BD6cfBD3eF4945fb2A96423e6ad933D';
 

  // create a route
  // listen on this port
 app.listen(3100);

  /* MIDDLEWARES */
 app.use(express.urlencoded({ extended: true }));
 app.use(express.json());

  // global var assigned in loadBlockchainData and used in routes
 var rebis;
 var rentalCounter;
 var web3;
 var networkID;

 async function loadBlockchainData() {
   // truffle console --network ropsten     -to connect to the ropsten testnet
   web3 = new Web3(infuraUrl);

   networkID = await web3.eth.net.getId();
   rebis = new web3.eth.Contract(Rebis.abi, Rebis.networks[networkID].address);

   var rentalsCounterPrinter = setInterval(function() {
      console.log("Current number of rental transactions: ");
      const cnt = rebis.methods.rentalsDeployed().call().then(console.log);
   }, 60000); //SET TO 60

   console.log("\nServer Working...");
 }

 // on server initialization
 loadBlockchainData();

 /* Define blockchain methods */

 async function createRental(_fee, _deposit, address, id, privateKey) {
   var fee = web3.utils.toWei(''+_fee+'', 'Ether');
   var deposit = web3.utils.toWei(''+_deposit+'', 'Ether');

   const tx = rebis.methods.createRental(fee, deposit);
   handleTransaction(tx, address, fee, privateKey, false);
   console.log("-> ID:"+ id +": Rental CREATED");
 }

 async function rentingCustomer(id, _fee, address, privateKey) {
   var fee = web3.utils.toWei(''+_fee+'', 'Ether');

   const tx = rebis.methods.rentingCustomer(id);
   handleTransaction(tx, address, fee, privateKey, true);
   console.log("-> ID:"+ id +": Rental STARTED");
 }

 function depositWarranty(id, deposit, address, privateKey) {
   var deposit = web3.utils.toWei(''+_deposit+'', 'Ether');

   const tx = rebis.methods.depositWarranty(id);
   handleTransaction(tx, address, deposit, privateKey, true);
   console.log("-> ID:"+ id +": Deposit GIVEN");
 }

 function endOfRental(id, deposit, address, privateKey) {
   var deposit = web3.utils.toWei(''+_deposit+'', 'Ether');
   const tx = rebis.methods.endOfRental(id);
   handleTransaction(tx, address, deposit, privateKey, true);
   console.log("-> Operation: END -of- " + req.body.ID);
 }

 async function handleTransaction(tx, address, fee, privateKey, doPay) {
   web3.eth.accounts.wallet.add(privateKey);

   const estimimatedgas = await tx.estimateGas({ from: address });
   const gas = estimimatedgas + 15000;
   const gasPrice = await web3.eth.getGasPrice();
   const data = tx.encodeABI();
   const nonce = await web3.eth.getTransactionCount(address);
   var value = 0;
   if (doPay)
      value = fee;

   const txData = {
        from: address,
        to: rebis.options.address,
        data,
        gas,
        gasPrice,
        value,
        nonce,
        chain: 'ropsten',
        hardfork: 'istanbul'
   };
   const receipt = await web3.eth.sendTransaction(txData);
   console.log('Transaction hash: ' + receipt.transactionHash);
 }

 async function handleSIGNEDTransaction(tx, address, fee, privateKey, doPay) {
   const gas = await tx.estimateGas({ from: address });
   const gasPrice = await web3.eth.getGasPrice();
   const data = tx.encodeABI();
   const nonce = await web3.eth.getTransactionCount(address);
   var value = 0;
   if (doPay)
      value = fee;

   const signedTx = await web3.eth.accounts.signTransaction(
     {
        to: rebis.options.address,
        data,
        gas,
        gasPrice,
        value,
        nonce,
        chainId: networkID
      },
      privateKey
   );
   const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
   console.log('Transaction hash: ' + receipt.transactionHash);
 }

  /* handle @GET operations. */
  app.get('/', (req, res) => {
    res.send('This is the \'Main\' directory.');
  });

  app.get('/rentals', (req, res) => {
    res.send('This is the \'Rentals\' directory');
  });

  /* handle @POST operations. */
  /* POST ROUTE for rentals creation and initialization */
  app.post('/rentals', (req, res) => {
    console.log("\n *** NEW TRANSACTION IN PROGRESS *** ");
    // Test if item actually passes
    console.log("-> Req: Renter: " + req.body.Addressrenter);
    console.log("-> Req: Customer: " + req.body.Addresscustomer);
    // Instantiate the item
    const rentalItem = {
      renter: req.body.Renter,
      customer: req.body.Customer,
      adrRenter: req.body.Addressrenter,
      adrCustomer: req.body.Addresscustomer,
      rID: req.body.ID,
      date: req.body.Date,
      days: req.body.Days,
      Fee: req.body.Fee,
      Deposit: req.body.Deposit,
      state: req.body.State
    };

    createRental(rentalItem.Fee, rentalItem.Deposit, rentalItem.adrRenter, rentalItem.rID);
    rentingCustomer(rentalItem.rID, rentalItem.Fee, rentalItem.adrCustomer);
    if (rentalItem.Deposit > 0)
      depositWarranty(rentalItem.rID, rentalItem.Deposit, rentalItem.adrCustomer);
    else
      console.log("-> ID:"+ rentalItem.rID + ": NO Deposit Given");

    res.status(200).json(rentalItem);
  });

  /* POST ROUTE for rentals ending */
  app.post('/ending', (req, res) => {
    // Instantiate the item
    const rentalItem = {
      renter: req.body.Renter,
      customer: req.body.Customer,
      adrRenter: req.body.Addressrenter,
      adrCustomer: req.body.Addresscustomer,
      rID: req.body.ID,
      date: req.body.Date,
      days: req.body.Days,
      Fee: req.body.Fee,
      Deposit: req.body.Deposit,
      state: req.body.State
    };
    endOfRental(rentalItem.rID, rentalItem.Deposit, rentalItem.adrRenter);
    res.status(200).json(rentalItem);
  })
