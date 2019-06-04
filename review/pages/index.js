
import React, { Component } from 'react';
import { Button, Card } from 'semantic-ui-react';
import { Link, Router } from '../routes';
import Layout from '../components/layout';
import VendorFactory from '../ethereum/vendorfactory';
import Vendor from '../ethereum/vendor';

// Main index page

class VendorIndex extends Component {

    // Returns an object called 'props', accessible by the Component
    static async getInitialProps() {
        const allVendors = await VendorFactory.methods.getDeployedVendors().call();
        const vendorAddress = allVendors[0];
        const vendor = new Vendor(vendorAddress);
        const productCount = await vendor.methods.getProductsCount().call();

        const products = await Promise.all(
            Array(parseInt(productCount)).fill().map((element, index) => {
                return vendor.methods.products(index).call()
            })
        );

        return { products, vendorAddress };
    }

    renderInventory() {
        const inventoryList = this.props.products.map( product => {
            return {
                header: product.title,
                meta: `${product.price} euro`,
                description: (
                    <div>
                        {product.description}
                        <Link route={`/reviews/${this.props.vendorAddress}/${product.productID}/all/0/show`}>
                            <Button
                                icon="right arrow"
                                labelPosition="right"
                                floated="right"
                                content="See reviews"
                            />
                        </Link>
                        <br /><br />
                        <Link route={`/products/${this.props.vendorAddress}/${product.productID}/pay`}>
                            <Button
                                primary
                                compact
                                content="Buy"
                            />
                        </Link>

                    </div>
                ),
                fluid: true,
                style: { overflowWrap: 'break-word' }
            };
        });

        return <Card.Group items={inventoryList} />;
    }

    render() {
        return (
            <Layout>
                <div>
                    <h3>Browse products</h3>
                    <br />
                    {this.renderInventory()}
                </div>
            </Layout>
        );
    }
}

export default VendorIndex;