
import React, { Component } from 'react';
import { Line } from 'react-chartjs';
import Vendor from '../../ethereum/vendor';

class ChartComponent extends Component {

    static getInitialProps(props) {
        const { vendorAddress, productID } = props.query;
        // create Vendor instance
        const vendor = Vendor(vendorAddress);
        // retrieve the reviews for the product with productID

        return {  };
    }

    render() {
        return (
            <Line data={this.props.data} width="600" height="250" />
        );
    }
}

export default ChartComponent;
