


import React, { Component } from 'react';
import Layout from '../../components/layout';
import Vendor from '../../ethereum/vendor';

class ProductDetail extends Component {

    static async getInitialProps(props) {
        // get product details
        const productID = parseInt(props.query.productID);
        const vendorAddress = props.query.vendorAddress;

        const vendor = new Vendor(vendorAddress);
        const product = await vendor.methods.products(productID).call();

        return { product, productID, vendorAddress };
    }

    render() {
        return (
            <Layout>
                <h3>{this.props.productID}</h3>
                <h3>{this.props.vendorAddress}</h3>
                <h3>{this.props.product.name}</h3>
            </Layout>
        );
    }

}

export default ProductDetail;
