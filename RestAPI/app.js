  //const definition for the blockchain
 const Web3 = require('web3');
 const Rebis = require('./blockchain/abis/Rebis.json');
  // const definition for the route
 const express = require('express');
 const app = express();
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

 async function loadBlockchainData() {
   web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
   const networkID = await web3.eth.net.getId();
   const mainAddr = '0x043B59e59A25a9659ecb738F9e4147DE5f9fA2d0';
   rebis = new web3.eth.Contract(Rebis.abi, mainAddr);
// HOW TO GET CORRECT VALUE FROM RENTALCOUNTER.SOL
   //rebis.methods.rentalsDeployed().call({ from:mainAddr }).then(console.log);
   console.log("\nServer Working...");
 }

 // on server initialization
 loadBlockchainData();

 /* Define blockchain methods */
// ETH VENGONO TRASFERITI AL CONTRATTO E NON ALL'UTENTE.
// I REQUIRES IN SOLIDITY NON GENERANO ERRORE (es. id=0).
 function createRental(_fee, _deposit, address, id) {
   var fee = web3.utils.toWei(''+_fee+'', 'Ether');
   var deposit = web3.utils.toWei(''+_deposit+'', 'Ether');
   rebis.methods.createRental(fee, deposit).send({ from: address })
   console.log("-> ID:"+ id +": Rental CREATED");
 }

 function rentingCustomer(id, fee, address) {
   rebis.methods.rentingCustomer(id).send({ from:address, value:web3.utils.toWei(''+fee+'', 'Ether') })
   console.log("-> ID:"+ id +": Rental STARTED");
 }

 function depositWarranty(id, deposit, address) {
   rebis.methods.depositWarranty(id).send({ from:address, value:web3.utils.toWei(''+deposit+'', 'Ether') })
   console.log("-> ID:"+ id +": Deposit GIVEN");
 }

 function endOfRental(id, deposit, address) {
   rebis.methods.endOfRental(id).send({ from:address, value:web3.utils.toWei(''+deposit+'', 'Ether') })
   console.log("Rental ENDED");
 }

  /* handle @GET operations. */
  app.get('/', (req, res) => {
    res.send('This is the \'Main\' directory.');
  });

  app.get('/rentals', (req, res) => {
    res.send('This is the \'Rentals\' directory');
  });

  /* handle @POST operations. */
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
