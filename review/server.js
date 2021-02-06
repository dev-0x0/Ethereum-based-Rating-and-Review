
const express = require('express');
const bodyParser = require('body-parser');
const next = require('next');
const request = require('request');

// Ethereum setup
const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const Web3 = require('web3');
const vendor = require('./ethereum/build/Vendor.json');

const privateKey = "";  // I have scrubbed these for security reasons - Metamask account private key
const apiKey = "";      // You can add you own - Infura API key URL acquired through sign up with infura.io
                        // i.e. https://rinkeby.infura.io/etc/etc

// args: mnemonic, url of network to connect to(Rinkeby Infura API key...)
const provider = new HDWalletProvider(privateKey, apiKey);

// Address of deployed Vendor contract
const vendorAddress = '';  // Provide the address

// Completely enabled for the Rinkeby network. Using truffle hdwallet and Infura etc.
const web3 = new Web3(provider);

const addTransaction = async (customerID, productID, price, date) => {
    try {

        const accounts = await web3.eth.getAccounts();

        const vendorInstance = await new web3.eth.Contract(
            JSON.parse(vendor.interface),
            vendorAddress
        );

        // Use the Vendor to add the Transaction to the Blockchain
        await vendorInstance.methods.addTransaction(
            customerID,
            productID,
            price,
            date
        ).send({
            from: accounts[0].toLowerCase(),
            gas: '3000000'
        });

        console.log('SUCCESS');
    } catch(err) {
        console.log(err.message);
    }
};

// --- End  of Ethereum Setup

// SMS setup -- DISABLED but functional
// Fill in the below fields with details from your Twilio account(works with a free account)
const accountSid = '';  // These have been deleted as they are private.
const authToken = '';
const client = require('twilio')(accountSid, authToken);

// Email setup - Customise with details of the desired source email address
const yourEmailAddr = '';  // Your email address here
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: yourEmailAddr,
        pass: ''                // your email password *********
    }
});

const port = 3000;  // server port
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const routes = require('./routes');
const handler = routes.getRequestHandler(app);

app.prepare().then(async () => {
    const server = express();
    server.use(bodyParser.json());  // supporting JSON
    server.use(bodyParser.urlencoded({ extended: true })); // support encoded body

    server.route('/reviews/addTransaction')
        .post(async (req, res) => {
            const {vendorAddress, customerID, productID, phoneNumber, price, date} = req.body;
            await addTransaction(customerID, productID, price, date)
                .then(result => {
                    const postData = {
                        "phoneNumber": phoneNumber,
                        "vendorAddress": vendorAddress,
                        "customerID": customerID,
                        "productID": productID
                    };
                    const options = {
                        uri: 'http://localhost:3000/reviews/send_sms',
                        body: JSON.stringify(postData),
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };

                    request(options, (error, response) => {
                        console.log(error, response.body);
                    });
                });

            return handler(req, res);
        });

    server.route('/reviews/send_sms')
        .get((req, res) => {
            return handler(req, res);
        })
        .post((req, res) => {

            const { vendorAddress, customerID, productID, phoneNumber } = req.body;
            const url = `http://localhost:3000/reviews/${vendorAddress}/${customerID}/${productID}/new`;

            const mailOptions = {
                from: yourEmailAddr,
                to: yourEmailAddr, // can have comma separated mails
                subject: 'Review Invite from BuyStuff.ie',
                text: `Hi!\nAs a valued customer we would love your feedback.\nPlease submit your review:\n${url}`
                // Can use html tag instead of text tag
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ', info.response);
                }
            });

            // client.messages.create({                               // disabled but functional **********
            //         body: `Hi. Please submit a review at ${url}`,
            //         from: '',
            //         to: `+${req.body.phoneNumber}`
            // }).then(message => console.log(message.sid));

            return handler(req, res);
    });

    server.get('*', (req, res) => {
        return handler(req, res);
    });

    server.post('*', (req, res) => {
        return handler(req, res);
    });

    server.listen(port, err => {
        if (err) throw err;
        console.log("[*] Ready on localhost:", port);
    });

});

