  //const definition for the blockchain
 const Web3 = require('web3');
 const Rebis = require('./blockchain/abis/Rebis.json');
  // const definition for the route
 const express = require('express');
 const app = express();
 const infuraUrl = 'https://ropsten.infura.io/v3///';
 const fetch = require('node-fetch');
 const firebase = require('firebase');
 //contract_address = '';

 var HDWalletProvider = require("truffle-hdwallet-provider");
 const owner_address = '0xB5b86278B448922CfA09C11B6a27B22c27Aa80b3';
 const private_key = '//';
 var Provider = new HDWalletProvider(private_key, infuraUrl);
// truffle migrate -reset --network ropsten

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




 // define firebase config
 var firebaseConfig = {
   apiKey: "//",
   authDomain: "rebis-9aeb6.firebaseapp.com",
   databaseURL: "https://rebis-9aeb6-default-rtdb.firebaseio.com",
   projectId: "rebis-9aeb6",
   storageBucket: "rebis-9aeb6.appspot.com",
   messagingSenderId: "627613124461",
   appId: "1:627613124461:web:9e7490e23b48ed0aa6fc64"
 };
 // Initialize Firebase
 firebase.initializeApp(firebaseConfig);
 let database = firebase.database();



// Define blockchain config data
 async function loadBlockchainData() {
   // connect to the net and inject web3 thorugh infura
   web3 = new Web3(infuraUrl);
   networkID = await web3.eth.net.getId();
   // get the contract ref
   rebis = new web3.eth.Contract(Rebis.abi, Rebis.networks[networkID].address);

   // const function to show current number of rentals every min
   var rentalsCounterPrinter = setInterval(function() {
      console.log("Current number of rental transactions: ");
      const cnt = rebis.methods.rentalsDeployed().call().then(console.log);
   }, 60000); //SET TO 60s
   // server ready to go
   console.log("\nServer Working...");
 }

 // on server initialization
 loadBlockchainData();





 /* Define blockchain methods */
// TO CREATE RENTAL (RENTER)
 async function createRental(_fee, _deposit, _adrsrenter, _id) {
   var fee = web3.utils.toWei(''+_fee+'', 'Ether');
   var deposit = web3.utils.toWei(''+_deposit+'', 'Ether');

   const wweb3 = new Web3(Provider);
   const networkId = await wweb3.eth.net.getId();
   const myContract = new wweb3.eth.Contract(Rebis.abi, Rebis.networks[networkId].address);
   try {
      const receipt = await myContract.methods.createRental(fee, deposit, _adrsrenter, _id).send({from:owner_address});
   } catch (error) {
      console.log("Impossible to create the rental");
   }
   console.log('Transaction hash: ' + receipt.transactionHash);
   console.log("-> ID:"+ _id +": Rental CREATED");
 }

// TO START A RENTAL (CUSTOMER)
 async function rentingCustomer(_id, _fee, _adrcust) {
   var feetaxed = _fee*0.98;
   var fee = web3.utils.toWei(''+feetaxed+'', 'Ether');

   const wweb3 = new Web3(Provider);
   const networkId = await wweb3.eth.net.getId();
   const myContract = new wweb3.eth.Contract(Rebis.abi, Rebis.networks[networkId].address);
   try {
      const receipt = await myContract.methods.rentingCustomer(_id, _adrcust).send({from:owner_address, value:fee});
   } catch (error) {
      console.log("Impossible to confirm the rental");
   }
   console.log('Transaction hash: ' + receipt.transactionHash);
   console.log("-> ID:"+ _id +": Rental STARTED");
 }

// IN CASE OF DEPOSIT (CUSTOMER)
 async function depositWarranty(_id, _deposit) { //Not usefull(?)
   var deposit = web3.utils.toWei(''+_deposit+'', 'Ether');

   const wweb3 = new Web3(Provider);
   const networkId = await wweb3.eth.net.getId();
   const myContract = new wweb3.eth.Contract(Rebis.abi, Rebis.networks[networkId].address);

   const receipt = await myContract.methods.depositWarranty(_id).send({from:owner_address, value:deposit});

   console.log('Transaction hash: ' + receipt.transactionHash);
   console.log("-> ID:"+ _id +": Deposit GIVEN");
 }

// END RENTAL - GIVE DEPOSIT BACK (RENTER)
 async function endOfRental(_id, _deposit) {
   var deptaxed = _deposit*0.99;
   var deposit = web3.utils.toWei(''+deptaxed+'', 'Ether');

   const wweb3 = new Web3(Provider);
   const networkId = await wweb3.eth.net.getId();
   const myContract = new wweb3.eth.Contract(Rebis.abi, Rebis.networks[networkId].address);
   try {
     const receipt = await myContract.methods.endOfRental(_id).send({from:owner_address, value:deposit});
   } catch (error) {
     console.log("Impossible to end the rental");
   }
   console.log('Transaction hash: ' + receipt.transactionHash);
   console.log("-> Operation: END -of- " + _id);
 }





  // ROUTES
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
    // Instantiate the item
    const payloadItem = {
      rentalItem: req.body.rentalItem,
      mnemonic: req.body.mnemonic
    }
    const rentalObject = {
      renter: payloadItem.rentalItem.Renter,
      customer: payloadItem.rentalItem.Customer,
      adrRenter: payloadItem.rentalItem.Addressrenter,
      adrCustomer: payloadItem.rentalItem.Addresscustomer,
      rID: payloadItem.rentalItem.ID,
      date: payloadItem.rentalItem.Date,
      days: payloadItem.rentalItem.Days,
      Fee: payloadItem.rentalItem.Fee,
      Deposit: payloadItem.rentalItem.Deposit,
      state: payloadItem.rentalItem.State
    };
    // Test if item actually passes
    console.log("-> Req: Renter: " + rentalObject.adrRenter);
    res.status(200).json(payloadItem);

    setTimeout(
      function() {
        fetchDataFromEtherscan(rentalObject, payloadItem.mnemonic, 0); },
      30000
    );

  });

  /* POST ROUTE for rentals ending */
  app.post('/ending', (req, res) => {
    // Instantiate the item
    const payloadItem = {
      rentalItem: req.body.rentalItem,
      mnemonic: req.body.mnemonic
    }
    const rentalObject = {
      renter: payloadItem.rentalItem.Renter,
      customer: payloadItem.rentalItem.Customer,
      adrRenter: payloadItem.rentalItem.Addressrenter,
      adrCustomer: payloadItem.rentalItem.Addresscustomer,
      rID: payloadItem.rentalItem.ID,
      date: payloadItem.rentalItem.Date,
      days: payloadItem.rentalItem.Days,
      Fee: payloadItem.rentalItem.Fee,
      Deposit: payloadItem.rentalItem.Deposit,
      state: payloadItem.rentalItem.State
    };
    //endOfRental(rentalItem.rID, rentalItem.Deposit, rentalItem.adrRenter);
    console.log("-> Req: Customer: " + rentalObject.adrCustomer);
    res.status(200).json(payloadItem);

    if (rentalObject.Deposit == 0) {
      // UPDATE DATA ON FIREBASE
      console.log('Updating database: ITEM #'+rentalObject.rID+' ...');
      database.ref('RENTALS/'+rentalObject.rID+'/State').set('ended');
    } else {
      setTimeout(
        function() {
          fetchDataFromEtherscan(rentalObject, payloadItem.mnemonic, 1); },
        30000
      );
    }
  })


  function fetchDataFromEtherscan(rentobj, valueandnonce, type) {
    const API_KEY = "//";

    var urlGetTrx = 'https://api-ropsten.etherscan.io/api?module=account&action=txlist&address='+
          owner_address+'&startblock=0&endblock=99999999&page=1&offset=8&sort=desc&apikey='+API_KEY;

    var intervalID = setIntervalX( function() {
        var fetchedData;
        fetch(urlGetTrx)
            .then(res => res.json())
            .then(json => {
                fetchedData = json;
                if (type == 0)
                    parseDataFromEtherscanIN(fetchedData, rentobj, valueandnonce, intervalID);
                else
                    parseDataFromEtherscanEND(fetchedData, rentobj, valueandnonce, intervalID);
            });
        }, 15000,
        8
      );
  }

  async function parseDataFromEtherscanIN(_json, _itemR, _valueandnonce) {
      // parse the json in a string obj
      var json = JSON.stringify(_json);
      // get the correct value of the trx in wei\
      var value = web3.utils.toWei(_valueandnonce, 'Ether');
      // look for the trx according to the stated par: value= amount and nonce
      if (json.includes('\"value\":\"'+value+'\"')) {
          // if the trx exists
          console.log('Updating database: ITEM #'+_itemR.rID+' ...');
          // UPDATE DATA ON FIREBASE
          database.ref('RENTALS/'+_itemR.rID+'/Customer').set(_itemR.customer);
          // call smart contract functions
          createRental(_itemR.Fee, _itemR.Deposit, _itemR.adrRenter, _itemR.rID);
          rentingCustomer(_itemR.rID, _itemR.Fee, _itemR.adrCustomer);
          // if a deposit must be payed
          //if (_itemR.Deposit > 0)
          //  depositWarranty(_itemR.rID, _itemR.Deposit);

      } else {
          console.log("Not matching");
      }
  }

  async function parseDataFromEtherscanEND(_json, _itemR, _valueandnonce) {
      var json = JSON.stringify(_json);
      var tot = _itemR.Fee + _itemR.Deposit;
      var value = web3.utils.toWei(''+tot, 'Ether');
      if (json.includes('\"value\":\"'+value+'\"')) {
          // UPDATE DATA ON FIREBASE
          console.log('Updating database: ITEM #'+_itemR.rID+' ...');
          database.ref('RENTALS/'+_itemR.rID+'/State').set('ended');
          endOfRental(_itemR.rID, _itemR.Deposit);

      } else {
          console.log("#" + _itemR.rID + "not matching...");
      }
  }

  function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = setInterval(function () {

       callback();

       if (++x === repetitions) {
           clearInterval(intervalID);
       }
    }, delay);
  }
