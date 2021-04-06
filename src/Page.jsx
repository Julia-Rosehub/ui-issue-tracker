import React from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';

import {
	Nav, Navbar, NavDropdown, Container,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Contents from './Contents.jsx';
import IssueAddNavItem from './IssueAddNavItem.jsx';
import SignInNavItem from './SignInNavItem.jsx';
import Search from './Search.jsx';
import UserContext from './UserContext.js';
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';

const NavBar = ({ user, onUserChange }) => (
	<>
		<Navbar bg="light">
			<Navbar.Brand>Issue Tracker</Navbar.Brand>
			<Nav>
				<LinkContainer to="/">
					<Nav.Link>Home</Nav.Link>
				</LinkContainer>
				<LinkContainer to="/issues">
					<Nav.Link>Issue</Nav.Link>
				</LinkContainer>
				<LinkContainer to="/report">
					<Nav.Link>Report</Nav.Link>
				</LinkContainer>
			</Nav>
			<Nav style={{
				position: 'absolute',
				right: 50,
			}}
			>
				<NavDropdown
					id="user-dropdown"
					title={<BsThreeDotsVertical />}
				>
					<LinkContainer to="/about">
						<Nav.Item>About</Nav.Item>
					</LinkContainer>
				</NavDropdown>
				<IssueAddNavItem user={user} />
				<SignInNavItem
					user={user}
					onUserChange={onUserChange}
				/>
			</Nav>
		</Navbar>
		<Search />
	</>
);

const Footer = () => (
	<small>
		<p className="text-center">
			2021
			{' '}
		</p>
	</small>
);

class Page extends React.Component {
	static async fetchData(cookie) {
		const query = `query {user {
            signedIn givenName
        }}`;
		const data = await graphQLFetch(query, null, null, cookie);
		return data;
	}

	constructor(props) {
		super(props);
		const user = store.userData ? store.userData.user : null;
		delete store.userData;
		this.state = { user };

		this.onUserChange = this.onUserChange.bind(this);
	}

	async componentDidMount() {
		const { user } = this.state;
		if (user == null) {
			const data = await Page.fetchData();
			this.setState({ user: data.user });
		}
	}

	onUserChange(user) {
		this.setState({ user });
	}

	render() {
		const { user } = this.state;
		if (user == null) return null;
		return (
			<div>
				<NavBar
					user={user}
					onUserChange={this.onUserChange}
					style={{ maxWidth: 1200 }}
				/>
				<UserContext.Provider value={user}>
					<Container fluid>
						<Contents />
					</Container>
				</UserContext.Provider>
				<Footer />
			</div>
		);
	}
}

export default Page;
