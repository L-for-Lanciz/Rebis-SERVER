// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

contract Rebis {
  string public dapp_name;
  uint public rentalCounter = 0;
  enum states {PENDING, RENTED, ENDED}
  bool reEntrancyMutex1 = false;
  bool reEntrancyMutex2 = false;
  address payable owner;

  mapping(uint => Rental) public rentals;


  modifier onlyOwner() {
    require (msg.sender == owner);
    _;
  }

  constructor() {
      dapp_name = "Rebis";
      owner = msg.sender;
  }

  struct Rental {
    uint id;
    address payable renter;
    address payable customer;
    uint fee;
    uint deposit;
    states rentalState;
  }

  function createRental(uint _fee, uint _deposit) public {
    //set a condition, can't have free rentals
    require (_fee > 0);
    //increment number of rentals, which is also the id
    rentalCounter++;
    //create a new rental
    rentals[rentalCounter] = Rental(rentalCounter, msg.sender, address(0), _fee, _deposit, states.PENDING);
  }

  function rentingCustomer(uint _id) public payable {
    //check the mutex for reentrancy
    require(!reEntrancyMutex1, "Mutex must be false");
    //target rental must exist
    require(_id> 0 && _id<= rentalCounter, "RentalID is out of bound");
    require(rentals[_id].customer != msg.sender, "Customer equals the sender");
    //now we can instantiate the customer
    rentals[_id].customer = msg.sender;
    //customer must have enough money
    uint totalAmount = rentals[_id].fee + rentals[_id].deposit;
    require (msg.sender.balance >= totalAmount, "Not enough ETH in balance");
    require(rentals[_id].rentalState == states.PENDING, "State is not correct");
    //avoid re-entrancy
    reEntrancyMutex1 = true;
    //transfer eth
    rentals[_id].renter.transfer(msg.value);
    rentals[_id].rentalState = states.RENTED;
    //release the reEntrancyMutex1
    reEntrancyMutex1 = false;
  }

  function depositWarranty(uint _id) public payable {
    //target rental must exist
    require(_id> 0 && _id<= rentalCounter);
    //transfer eth
    if (msg.value == 0 && rentals[_id].deposit != 0) {
      rentals[_id].deposit = 0;
    } else {
      rentals[_id].renter.transfer(msg.value);
    }
  }

  function endOfRental(uint _id) public payable {
    //check the mutex for reentrancy
    require(!reEntrancyMutex2);
    //target rental must exist
    require(_id> 0 && _id<= rentalCounter);
    //get the target rental
    Rental memory _rental = rentals[_id];
    require(_rental.rentalState == states.RENTED);
    //return deposit
    require(msg.sender == _rental.renter);
    require (msg.sender.balance >= _rental.deposit);
    //avoid re-entrancy
    reEntrancyMutex2 = true;
    //trasnfer eth
    if (msg.value != 0 && _rental.deposit != 0) {
      _rental.customer.transfer(msg.value);
    }
    //rental ends
    rentals[_id].rentalState = states.ENDED;
    //release the reEntrancyMutex2
    reEntrancyMutex2 = false;
  }

  function rentalsDeployed() public view returns(uint) {
    return rentalCounter;
  }

  function withdraw(uint amount) public onlyOwner returns(bool) {
    require(amount <= address(this).balance);
    owner.transfer(amount);
    return true;
  }

  // Fallback function
  fallback() external payable {
  }

  receive() external payable {
    require(msg.value > 0);
  }

}
