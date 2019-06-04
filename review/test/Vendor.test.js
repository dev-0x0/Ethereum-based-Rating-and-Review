
// Runs with 'npm run test'

// There is a single test file for all contracts aswell as the UI
// This is because of how closely entwined all components are in this project

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

// create web3 actual instance
const web3 = new Web3(ganache.provider());

// require in both contracts from build directory
const compiledFactory = require('../ethereum/build/VendorFactory.json');
const compiledVendor = require('../ethereum/build/Vendor.json');

let accounts;
let factory;
let vendorAddress;
let vendorContract;

getCurrentDate = () => {
    const date = new Date();
    return date.toString();
};

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();


    // deploy instance of a VendorFactory contract
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '3000000' });

    // Use factory to create an instance of a Vendor
    // Tests will need a Vendor instance. Rather than always using a VendorFactory to
    // deploy one for each test, we can deploy one here to be used in all tests.

    await factory.methods.createVendor(accounts[1], 'BuyStuff.ie', 'A great place to buy stuff!')
        .send({ from: accounts[0], gas: '3000000'});

    // sets vendorAddress to the first element in the array returned by the call(array[0])
    [vendorAddress] = await factory.methods.getDeployedVendors().call();

    // Get reference to the already deployed instance of a Vendor contract
    vendorContract = await new web3.eth.Contract(
        JSON.parse(compiledVendor.interface),  // contract interface
        vendorAddress                          // contract address
    );

    // Store customer to the blockchain using customerID
    await vendorContract.methods.addCustomer('12345')
        .send({ from: accounts[1], gas: '3000000'});

    // Store a product on the blockchain
    await vendorContract.methods.addProduct('Laptop', 'Really amazing laptop!', 500)
        .send({ from: accounts[1], gas: '3000000'});

});

// Tests
describe('Vendors', () => {
    it('deploys a factory and a vendor', () => {
        assert.ok(factory.options.address);
        assert.ok(vendorContract.options.address);
    });

    it('marks vendorFactory creator as the vendor creator', async () => {
        const manager = await vendorContract.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('marks a provided vendor address as the vendor manager', async () => {
        const vendor = await vendorContract.methods.vendor().call();
        assert.equal(accounts[1], vendor);
    });

    it('stores vendor data on the blockchain', async () => {
        const vendorData = await vendorContract.methods.vendorData().call();
        const vendor = await vendorContract.methods.vendor().call();
        assert.equal(vendor, vendorData.vendorAddress);
        assert.equal('BuyStuff.ie', vendorData.title);
    });

    it('stores Customer IDs on the blockchain', async () => {
        const customerExists = await vendorContract.methods.customerExists('12345').call();
        assert.equal(true, customerExists);
        const customerDoesNotExist = await vendorContract.methods.customerExists('99999').call();
        assert.equal(false, customerDoesNotExist);
    });

    it('stores products on the blockchain', async () => {
        const product = await vendorContract.methods.products(0).call();
        assert.equal('Laptop', product.title);
    });

    it('stores Transactions on the blockchain', async () => {
        // Record a transaction to the blockchain
        await vendorContract.methods.addTransaction('12345', 0, 500, getCurrentDate())
            .send({ from: accounts[1], gas: '3000000'});

        // check that Transaction exists
        const transactionExists = await vendorContract.methods.transactionExists('12345', 0).call({
            from: accounts[1] // function is restricted to the manager address
        });
        assert.equal(true, transactionExists);
    });

    it('does not store invalid Transactions', async () => {
        // Try to store invalid transactions

        // Invalid customerID
        try {
            await vendorContract.methods.addTransaction('99999', 0, 500, getCurrentDate())
                .send({from: accounts[1], gas: '3000000'});
        } catch (err) {
            // check that Transaction exists
            const transactionExists = await vendorContract.methods.transactionExists('99999', 0).call({
                from: accounts[1] // function is restricted to the manager address
            });
            assert.equal(false, transactionExists);
        }

        // Invalid productID
        try {
            await vendorContract.methods.addTransaction('12345', 1, 500, getCurrentDate())
                .send({from: accounts[1], gas: '3000000'});
        } catch (err) {
            // check that Transaction exists
            const transactionExists = await vendorContract.methods.transactionExists('99999', 0).call({
                from: accounts[1] // function is restricted to the manager address
            });
            assert.equal(false, transactionExists);
        }
    });

    it('Raises an error on attempt to retrieve invalid Transaction', async () => {
        // valid transaction stored
        try {
            await vendorContract.methods.addTransaction('12345', 0, 500, getCurrentDate())
                .send({from: accounts[1], gas: '3000000'});
            // check that Transaction exists
            const transactionExists = await vendorContract.methods.transactionExists('99999', 0).call({
                from: accounts[1] // function is restricted to the manager address
            });
            assert.equal(false, transactionExists);
        } catch (err) {
            assert(false);
        }
    });

    it('stores Reviews on the blockchain', async () => {
        // valid transaction stored
        try {
            await vendorContract.methods.addTransaction('12345', 0, 500, getCurrentDate())
                .send({from: accounts[1], gas: '3000000'});

            // check that Transaction exists
            const transactionExists = await vendorContract.methods.transactionExists('12345', 0).call({
                from: accounts[1] // function is restricted to the manager address
            });

            assert.equal(transactionExists, true);

            // Record a transaction to the blockchain
            await vendorContract.methods.addReview(
                0, getCurrentDate(), vendorAddress, '12345', 'Great laptop!', 4)
                .send({ from: accounts[1], gas: '3000000'});

            // check that Transaction exists
            const review = await vendorContract.methods.getReview(0, 0).call();
            assert.equal('Great laptop!', review[4]);
        } catch (err) {
            assert(false);
        }
    });

    it('rejects reviews for products not bought buy the customer', async () => {
        // valid transaction stored
        try {
            // Attempt to record a transaction to the blockchain for product not purchased
            // by the customer with customerID
            await vendorContract.methods.addReview(
                0, getCurrentDate(), vendorAddress, '12345', 'Great laptop!')
                .send({ from: accounts[1], gas: '3000000'});
            assert(false); // Should not reach this point
        } catch (err) {
            assert(true); // This is desired
        }
    });

});
