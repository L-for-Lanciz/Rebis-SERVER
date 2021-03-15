// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.1;

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
      owner = payable(msg.sender);
  }

  struct Rental {
    uint id;
    address payable renter;
    address payable customer;
    uint fee;
    uint deposit;
    states rentalState;
  }

  function createRental(uint _fee, uint _deposit, address payable _renter, uint _id) public {
    //set a condition, can't have free rentals
    require (_fee > 0, "Transaction can not be void");
    require(rentals[_id].renter == address(0x0), "ID already existing");
    //increment number of rentals, which is also the id
    rentalCounter++;
    //create a new rental
    rentals[_id] = Rental(_id, _renter, payable(address(0)), _fee, _deposit, states.PENDING);
  }

  function rentingCustomer(uint _id, address payable _customer) public payable {
    //check the mutex for reentrancy
    require(!reEntrancyMutex1, "Mutex must be false");
    //target rental must exist
    require(_id> 0); //&& _id<= rentalCounter, "RentalID is out of bound");
    require(rentals[_id].customer != msg.sender, "Customer equals the sender");
    //now we can instantiate the customer
    rentals[_id].customer = _customer;
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
    require(_id> 0); //&& _id<= rentalCounter, "Deposit: target does not exist");
    //transfer eth
    if (msg.value == 0 && rentals[_id].deposit != 0) {
      rentals[_id].deposit = 0;
    } else {
      rentals[_id].renter.transfer(msg.value);
    }
  }

  function endOfRental(uint _id) public payable {
    //check the mutex for reentrancy
    require(!reEntrancyMutex2, "Mutex not available");
    //target rental must exist
    require(_id> 0); //&& _id<= rentalCounter, "End: target does not exist");
    //get the target rental
    Rental memory _rental = rentals[_id];
    require(_rental.rentalState == states.RENTED, "End: state not matching");
    //return deposit
    require (msg.sender.balance >= _rental.deposit, "End: not enough funds");
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
