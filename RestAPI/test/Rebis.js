const Rebis = artifacts.require("./blockchain/contracts/Rebis.sol");
require('chai').use(require('chai-as-promised')).should();

contract('Rebis', ([renter, customer]) => {
  let rebis;

  before(async() => {
    rebis = await Rebis.deployed();
  })

  describe('deployment', async() => {
    it('deploys succesfully', async() => {
      const address = await rebis.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async() => {
      const name = await rebis.dapp_name()
      assert.equal(name, 'Rebis')
    })
  })

  describe('RENTAL', async() => {
    let counter, creation, result

    it('CREATE', async() => {
      creation = await rebis.createRental(web3.utils.toWei('1', 'Ether'), web3.utils.toWei('2', 'Ether'))
      counter = await rebis.rentalCounter()
      assert.equal(counter, 1, 'id is correct')
      const even = creation.logs[0].args
    })

    it('RENT-fee', async() => {
      result = await rebis.rentingCustomer(counter, {from:customer, value:web3.utils.toWei('1', 'Ether')})
      const event = result.logs[0].args
      assert.equal(event.customer, customer, 'customer is correct')
    })

    it('RENT-deposit', async() => {
      result = await rebis.depositWarranty(counter, {from:customer, value:web3.utils.toWei('2', 'Ether')})
    })

    it('CASHBACK', async() => {
      result = await rebis.endOfRental(counter, {from:renter, value:web3.utils.toWei('2', 'Ether')})
      const eventt = result.logs[0].args
    })
  })

})
