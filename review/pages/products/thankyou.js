
import React, { Component } from 'react';
import { Message } from 'semantic-ui-react';
import Layout from '../../components/layout';
import { Link } from '../../routes';

class ThankYouComponent extends Component {

    render() {
        return (
            <Layout>
                <Message positive>
                    <Message.Header>
                        <h3>Thank you for your purchase!</h3>
                    </Message.Header>
                    <Message.Content>
                        <h4>We value your feedback. Please keep an eye out for your personal invite to review this product :)</h4>
                    </Message.Content>
                </Message>
                <Link>
                    <a href="/">Home</a>
                </Link>
            </Layout>

        );
    }

}

export default ThankYouComponent;
