
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const vendor = require('./build/Vendor.json');
const vendorFactory = require('./build/VendorFactory.json');

const seedWords = "";  // I have scrubbed these for security reasons - Metamask account seed words
const apiKey = "";     // You can add you own - Infura API key URL acquired through sign up with infura.io
                       // i.e. https://rinkeby.infura.io/etc/etc

// args: mnemonic, url of network to connect to(Rinkeby Infura API key...)
const provider = new HDWalletProvider(seedWords, apiKey);

// Completely enabled for the Rinkeby network. Using truffle hdwallet and Infura etc.
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy Vendor...');

    const factory = new web3.eth.Contract(
        JSON.parse(vendorFactory.interface),            // ABI of VendorFactory contract
        '0x0000000000000000000000000000000000000000'    //  Provide Address of deployed VendorFactory contract
    );

    // deploy a Vendor, and populate with some products
    const products = [
        {
            name: "Quantum Laptop",
            description: "Doesn't quite fit in your lap, but it's very quantum!",
            price: 1000
        },
        {
            name: "BOOMerang Headphones",
            description: "More Boom for yer buck, with these next level headphones!",
            price: 100
        },
        {
            name: "GoldPlume Dehumidifier",
            description: "You don't know what dry is, until you've experienced the anti-damp technology of the century",
            price: 150
        }
    ];

    const vendorAccount = '0x0000000000000000000000000000000000000000';  // provide address

    const vendorAddress = await factory.methods.createVendor(
        vendorAccount, "BuyStuff.ie", "Buy anything your heart desires! Buy stuff!")
        .send({ from: accounts[0], gas: '3000000' });
    console.log('Vendor deployed to: ', vendorAddress);

    console.log('so far, so good');

    const vendorInstance = new web3.eth.Contract(
        JSON.parse(vendor.interface),                  // ABI of VendorFactory contract
        vendorAddress  // Address of deployed VendorFactory contract
    );

    // Store products with the vendor
    for (let i = 0; i < products.length; i++) {
        await vendorInstance.methods.addProduct(
            products[i].name, products[i].description, products[i].price)
            .send({from: vendorAccount, gas: '3000000'});
    }

    // Store customer with the vendor
    await vendorInstance.methods.addCustomer('12345').send(
        {from: vendorAccount, gas: '3000000'});

};

deploy();
