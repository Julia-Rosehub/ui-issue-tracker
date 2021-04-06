import React from 'react';
import { withRouter } from 'react-router-dom';
import {
	Form, NavItem, OverlayTrigger, Tooltip, ButtonToolbar, Button, Modal,
} from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import graphQLFetch from './graphQLFetch.js';
import Toast from './Toast.jsx';

class IssueAddNavItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showing: false,
			toastVisible: false,
			toastMessage: '',
			toastType: 'success',
		};
		this.showModal = this.showModal.bind(this);
		this.hideModal = this.hideModal.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.showError = this.showModal.bind(this);
		this.dismissToast = this.dismissToast.bind(this);
	}

	dismissToast() {
		this.setState({ toastVisible: false });
	}

	showModal() {
		this.setState({ showing: true });
	}

	hideModal() {
		this.setState({ showing: false });
	}

	showError(message) {
		this.setState({
			toastVisible: true, toastMessage: message, toastType: 'danger',
		});
	}

	async handleSubmit(e) {
		e.preventDefault();
		this.hideModal();
		const form = document.forms.issueAdd;
		const issue = {
			owner: form.owner.value,
			title: form.title.value,
			due: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
		};
		const query = `mutation issueAdd($issue: IssueInputs!) {
            issueAdd(issue: $issue) {
                id
            }
        }`;

		const data = await graphQLFetch(query, { issue }, this.showError);
		if (data) {
			const { history } = this.props;
			history.push(`/edit/${data.issueAdd.id}`);
		}

		form.owner.value = ''; form.title.value = '';
	}

	render() {
		const { showing } = this.state;
		const { user: { signedIn } } = this.props;
		const { toastVisible, toastMessage, toastType } = this.state;
		return (
			<>
				<NavItem
					disabled={!signedIn}
					style={{
						position: 'relative',
						top: 4,
					}}
					onClick={this.showModal}
				>
					<OverlayTrigger
						placement="left"
						delay={1000}
						overlay={<Tooltip id="create-issue">Create Issue</Tooltip>}
					>
						<FaPlus />
					</OverlayTrigger>
				</NavItem>
				<Modal keyboard show={showing} onHide={this.hideModal}>
					<Modal.Header closeButton>
						<Modal.Title>Create Issue</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form>
							<Form.Group>
								<Form.Label>Owner:</Form.Label>
								<Form.Control type="text" name="owner" autoFocus placeholder="Owner" />
							</Form.Group>
							<Form.Group>
								<Form.Label>Title:</Form.Label>
								<Form.Control type="text" name="title" placeholder="Title" />
							</Form.Group>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<ButtonToolbar>
							<Button
								type="button"
								bsstyle="primary"
								onClick={this.handleSubmit}
							>
								Submit
							</Button>
							<Button bsstyle="link" onClick={this.hideModal}>Cancel</Button>
						</ButtonToolbar>
					</Modal.Footer>
				</Modal>
				<Toast
					showing={toastVisible}
					onDismiss={this.dismissToast}
					bsStyle={toastType}
				>
					{toastMessage}
				</Toast>
			</>
		);
	}
}

export default withRouter(IssueAddNavItem);
