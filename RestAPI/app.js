  //const definition for the blockchain
 const Web3 = require('web3');
 const Rebis = require('./blockchain/abis/Rebis.json');
  // const definition for the route
 const express = require('express');
 const app = express();
 const contract_address = '0x08d710a0717ed022403BcCc4dD4Ce2e878994FE7';
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
   // truffle console --network ropsten     -to connect to the ropsten testnet
   web3 = new Web3(new Web3.providers.HttpProvider(
    'https://ropsten.infura.io/v3/7a56a2e59589490681f5a5c3826db721'));
   const networkID = await web3.eth.net.getId();
   rebis = new web3.eth.Contract(Rebis.abi, contract_address);
   var rentalsCounterPrinter = setInterval(function() {
      console.log("Current number of rental transactions: ");
      const cnt = rebis.methods.rentalsDeployed().call().then(console.log);
   }, 60000);

   console.log("\nServer Working...");

 }

 // on server initialization
 loadBlockchainData();

 /* Define blockchain methods */
 function createRental(_fee, _deposit, address, id) {
   var fee = web3.utils.toWei(''+_fee+'', 'Ether');
   var deposit = web3.utils.toWei(''+_deposit+'', 'Ether');
   rebis.methods.createRental(fee, deposit).send({ from: address, gas:3000000 })
            .then(console.log);
   console.log("-> ID:"+ id +": Rental CREATED");
 }

 function rentingCustomer(id, fee, address) {
   rebis.methods.rentingCustomer(id).send({ from:address, gas:3000000,
            value:web3.utils.toWei(''+fee+'', 'Ether') }).then(console.log);
   console.log("-> ID:"+ id +": Rental STARTED");
 }

 function depositWarranty(id, deposit, address) {
   rebis.methods.depositWarranty(id).send({ from:address,
            value:web3.utils.toWei(''+deposit+'', 'Ether') });
   console.log("-> ID:"+ id +": Deposit GIVEN");
 }

 function endOfRental(id, deposit, address) {
   rebis.methods.endOfRental(id).send({ from:address, value:web3.utils.toWei(''+deposit+'', 'Ether') })
   console.log("-> Operation: END -of- " + req.body.ID);
 }

  /* handle @GET operations. */
  app.get('/', (req, res) => {
    res.send('This is the \'Main\' directory.');
    createRental(3, 0, '0x2A7aa7Ca23a5E3a5C3557CB1644bb786f261d96E', 1);
  });

  app.get('/rentals', (req, res) => {
    res.send('This is the \'Rentals\' directory');
    rentingCustomer(3, 0, '0x2A7aa7Ca23a5E3a5C3557CB1644bb786f261d96E');
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
