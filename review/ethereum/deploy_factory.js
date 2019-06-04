
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
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
    console.log('Attempting to deploy from account: ', accounts[0]);
    const factory = await new web3.eth.Contract(JSON.parse(vendorFactory.interface))
        .deploy({data: vendorFactory.bytecode})
        .send( { gas: '3000000', from: accounts[0] });

    console.log('Contract deployed to: ', factory.options.address);
};

deploy();
