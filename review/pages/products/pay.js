
import web3 from '../../ethereum/web3';
import React, { Component } from 'react';
import { Card, Form, Button, Message, Icon } from 'semantic-ui-react';
import { Router } from '../../routes';
import Layout from '../../components/layout';
import Vendor from '../../ethereum/vendor';

class Payment extends Component {

    state = {
        errorMessage: '',
        name: '',
        homeAddress: '',
        phoneNumber: '',
        email: '',
        creditCard: '12345',
        loading: false,
        hidden: true,
        disabled: false,
        primary: true
    };

    static async getInitialProps(props) {

        // get product details
        const productID = parseInt(props.query.productID);
        const vendorAddress = props.query.vendorAddress;

        const vendor = new Vendor(vendorAddress);
        const fromAddress = await vendor.methods.vendor().call();
        const product = await vendor.methods.products(productID).call();

        return { productID, vendorAddress, vendor, fromAddress, product };
    }

    // This function has been modified slightly from this version:
    // https://stackoverflow.com/a/7616484/2208850
    hashCode = (str) => {
        let hash = 0, i, char;

        if (str.length === 0) return hash;

        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }

        return hash;
    };

    // With reference to this stackexchange.com answer
    // https://ethereum.stackexchange.com/a/32179/48806
    getCurrentDate = () => {
        const date = new Date();
        return date.toString();
    };

    onSubmit = async event => {
        event.preventDefault();

        try {
            this.setState({primary: false, disabled: true, loading: true,
                hidden: false, errorMessage: '' });  // reset errorMessage


            const { vendorAddress, productID } = this.props;
            const { phoneNumber } = this.state;

            // Creating an ID for the customer
            const customerStr = `${this.state.name}:${this.state.phoneNumber}:${this.state.creditCard}`;
            const customerID = this.hashCode(customerStr);
            // const customerID = '12345'; // This was used during testing..

            // Store the transaction on the blockchain, paid for by the app owner
            fetch('/reviews/addTransaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "phoneNumber": phoneNumber,
                    "vendorAddress": vendorAddress,
                    "customerID": customerID,
                    "productID": productID,
                    "price": this.props.product.price,
                    "date": this.getCurrentDate()
                })
            });

            Router.pushRoute('/products/thankyou');

        } catch (err) {
            this.setState({ errorMessage: err.message });
        }

        this.setState({ primary: true, disabled: false, loading: false, hidden: true });
    };

    render() {
        return (
            <Layout>
                <h3>Your Order</h3>

                <Card
                    header={this.props.product.title}
                    meta={`${this.props.product.price} euro`}
                    description={this.props.product.description}
                />

                <Form method="POST" onSubmit={this.onSubmit} error={!!this.state.errorMessage}
                        style={{marginBottom: '40px'}}>
                    <Form.Input name="name" label="Name" type="text" value={this.state.name}
                                onChange={event => this.setState({ name: event.target.value })} />

                    <Form.Input name="address" label="Address" type="text" value={this.state.homeAddress}
                                onChange={event => this.setState({ homeAddress: event.target.value })} />

                    <Form.Input name="phoneNumber" label="Phone number" type="text" value={this.state.phoneNumber}
                                onChange={event => this.setState({ phoneNumber: event.target.value })} />

                    <Form.Input name="email" label="Email" type="text" value={this.state.email}
                                onChange={event => this.setState({ email: event.target.value })} />

                    <Message error header="Oops!" content={this.state.errorMessage} />
                    <Button primary={this.state.primary} disabled={this.state.disabled}>
                        Pay
                    </Button>
                    <Message compact icon info hidden={this.state.hidden}>
                        <Icon name="circle notched" loading />
                        <Message.Content>
                            <Message.Header>Processing transaction</Message.Header>
                            This may take up to 30 seconds. Thanks for your patience.
                        </Message.Content>
                    </Message>

                </Form>
            </Layout>
        );
    }

}

export default Payment;
