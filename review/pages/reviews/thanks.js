
import React, { Component } from 'react';
import { Message } from 'semantic-ui-react';
import Layout from '../../components/layout';
import { Link } from '../../routes';

class ReviewThanks extends Component {

    render() {
        return (
            <Layout>
                <Message positive>
                    <Message.Header>
                        <h3>Thank you for the review!</h3>
                    </Message.Header>
                    <Message.Content>
                        <h4>We value your feedback.</h4>
                    </Message.Content>
                </Message>
                <Link>
                    <a href="/">Home</a>
                </Link>
            </Layout>

        );
    }

}

export default ReviewThanks;