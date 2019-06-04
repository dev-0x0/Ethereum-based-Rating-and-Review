
import React from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../routes';

// This is the website banner on all pages

export default () => {
    return (
        <Menu style={{ marginTop: '40px', marginBottom: '40px' }}>
            <Link route="/">
                <a className="item">BuyStuff.ie</a>
            </Link>

            <Menu.Menu position="right">
                <Link route="/">
                    <a className="item">Browse</a>
                </Link>
            </Menu.Menu>
        </Menu>
    );
};