
import React, { Component } from 'react';
import { Form, Icon, Message, Rating } from 'semantic-ui-react';
import { Router } from '../../routes';
import Layout from '../../components/layout';
import Vendor from "../../ethereum/vendor";

class WriteReview extends Component {

    state = {
        review: '',
        rating: 0,
        errorMessage: '',
        loading: false,
        hidden: true,
        disabled: false,
        primary: true
    };

    static async getInitialProps(props) {
        const { vendorAddress, customerID, productID } = props.query;

        // Get Vendor Instance
        // const allVendors = await VendorFactory.methods.getDeployedVendors().call();
        // const vendorAddress = allVendors[0];
        const instance = new Vendor(vendorAddress);

        const fromAddress = await instance.methods.vendor().call();

        // Get the product under review here, based on productID
        const product = await instance.methods.products(productID).call();

        return { vendorAddress, customerID, productID, fromAddress, product };
    }

    getCurrentDate = () => {
        const date = new Date(); // current date/time
        return date.toString();
    };

    onSubmit = async event => {
        event.preventDefault();

        try {
            const { vendorAddress, customerID, productID, fromAddress } = this.props;

            this.setState({primary: false, disabled: true, loading: true,
                hidden: false, errorMessage: '' });  // reset errorMessage

            const instance = new Vendor(vendorAddress);

            // Store review on the blockchain
            await instance.methods.addReview(
                parseInt(productID),
                this.getCurrentDate(),
                vendorAddress,
                customerID,
                this.state.review,
                parseInt(this.state.rating)
            ).send({
                from: fromAddress
            });

            // go to this page
            Router.pushRoute('/reviews/thanks');

        } catch(err) {
            this.setState({ errorMessage: err.message });
        }

        this.setState({ primary: true, disabled: false, loading: false, hidden: true });
    };

    render() {
        return (
            <Layout>
                <h3>As a valued customer, you have been invited to submit a review on your purchase:</h3>
                <h2><em>{this.props.product.title}</em></h2>

                <h3>We value your feedback.</h3>
                <h3>Please write your review</h3>

                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                    {/*<Form.Input*/}
                            {/* PUT A TITLE IN HERE */}
                    {/*/>*/}
                    <Form.TextArea
                        placeholder="Tell us about your experience with this product"
                        style={{ minHeight: 100 }}
                        value={this.state.review}
                        onChange={event => this.setState({ review: event.target.value })}
                    />

                    Rate this item:
                    <Rating
                        icon="star"
                        defaultRating={0}
                        maxRating={5}
                        onRate={
                            (event, {rating, maxRating}) => this.setState({ rating })}
                    />
                    <br /><br />

                    <Message error header="Oops!" content={this.state.errorMessage} />
                    <Form.Button primary={this.state.primary} disabled={this.state.disabled}>Submit</Form.Button>
                    <Message compact icon info hidden={this.state.hidden}>
                        <Icon name="circle notched" loading />
                        <Message.Content>
                            <Message.Header>Processing</Message.Header>
                            This may take up to 30 seconds. Thanks for your patience.
                        </Message.Content>
                    </Message>
                </Form>

            </Layout>
        );
    }

}

export default WriteReview;
