import React from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import {
	Alert, Col, Form, Card, Button, ButtonToolbar,
} from 'react-bootstrap';

import graphQLFetch from './graphQLFetch.js';
import TextInput from './TextInput.jsx';
import DateInput from './DateInput.jsx';
import NumInput from './NumInput.jsx';
import withToast from './withToast.jsx';
import store from './store.js';
import UserContext from './UserContext.js';

class IssueEdit extends React.Component {
	static async fetchData(match, search, showError) {
		const query = `query issue($id: Int!) {
        issue(id: $id) {
          id title status owner
          effort created due description
        }
      }`;

		const { params: { id } } = match;
		const result = await graphQLFetch(query, { id: parseInt(id, 10) }, showError);
		return result;
	}

	constructor() {
		super();
		const issue = store.initialData ? store.initialData.issue : null;
		delete store.initialData;
		this.state = {
			issue,
			invalidFields: {},
			showingValidation: false,
		};
		this.onChange = this.onChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.onValidityChange = this.onValidityChange.bind(this);
		this.dismissValidation = this.dismissValidation.bind(this);
		this.showValidation = this.showValidation.bind(this);
	}

	componentDidMount() {
		const { issue } = this.state;
		if (issue === null) this.loadData();
	}

	componentDidUpdate(prevProps) {
		const { match: { params: { id: prevId } } } = prevProps;
		const { match: { params: { id } } } = this.props;
		if (id !== prevId) {
			this.loadData();
		}
	}

	onChange(event, naturalValue) {
		const { name, value: textValue } = event.target;
		const value = naturalValue === undefined ? textValue : naturalValue;
		this.setState(prevState => ({
			issue: { ...prevState.issue, [name]: value },
		}));
	}

	onValidityChange(event, valid) {
		const { name } = event.target;
		this.setState((prevState) => {
			const invalidFields = { ...prevState.invalidFields, [name]: !valid };
			if (valid) delete invalidFields[name];
			return { invalidFields };
		});
	}

	async handleSubmit(e) {
		e.preventDefault();
		this.showValidation();
		const { issue, invalidFields } = this.state;
		if (Object.keys(invalidFields).length !== 0) return;

		const query = `mutation issueUpdate(
        $id: Int!
        $changes: IssueUpdateInputs!
      ) {
        issueUpdate(
          id: $id
          changes: $changes
        ) {
          id title status owner
          effort created due description
        }
      }`;

		const { id, created, ...changes } = issue;
		const { showSuccess, showError } = this.props;
		const data = await graphQLFetch(query, { changes, id }, showError);
		if (data) {
			this.setState({ issue: data.issueUpdate });
			showSuccess('Updated issue successfully');
		}
	}

	async loadData() {
		const { match, showError } = this.props;
		const data = await IssueEdit.fetchData(match, null, showError);
		this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
	}

	showValidation() {
		this.setState({ showingValidation: true });
	}

	dismissValidation() {
		this.setState({ showingValidation: false });
	}

	render() {
		const { issue } = this.state;
		if (issue == null) return null;

		const { issue: { id } } = this.state;
		const { match: { params: { id: propsId } } } = this.props;
		if (id == null) {
			if (propsId != null) {
				return <h3>{`Issue with ID ${propsId} not found.`}</h3>;
			}
			return null;
		}

		const { invalidFields, showingValidation } = this.state;
		let validationMessage;
		if (Object.keys(invalidFields).length !== 0 && showingValidation) {
			validationMessage = (
				<Alert bsStyle="danger" onDismiss={this.dismissValidation}>
					Please correct invalid fields before submitting.
				</Alert>
			);
		}

		const { issue: { title, status } } = this.state;
		const { issue: { owner, effort, description } } = this.state;
		const { issue: { created, due } } = this.state;

		const user = this.context;
		return (
			<>
				<Card>
					<Card.Title>
						{`Editing issue: ${id}`}
					</Card.Title>
					<Card.Body>
						<Form onSubmit={this.handleSubmit}>
							<Form.Group>
								<Form.Row>
									<Form.Label column="md" sm={3}>Created</Form.Label>
									<Col sm={9}>
										<Form.Control plaintext readOnly defaultValue={created.toDateString()} />
									</Col>
								</Form.Row>
							</Form.Group>
							<Form.Group>
								<Form.Row>
									<Form.Label column="lg" sm={3}>Status</Form.Label>
									<Col sm={9}>
										<Form.Control
											as="select"
											value={status}
											onChange={this.onChange}
										>
											<option value="New">New</option>
											<option value="Assigned">Assigned</option>
											<option value="Fixed">Fixed</option>
											<option value="Closed">Closed</option>
										</Form.Control>
									</Col>
								</Form.Row>
							</Form.Group>
							<Form.Group>
								<Form.Row>
									<Col sm={3}>Owner</Col>
									<Col sm={9}>
										<Form.Control
											type="text"
											name="owner"
											value={owner}
											onChange={this.onChange}
											key={id}
										/>
									</Col>
								</Form.Row>
							</Form.Group>
							<Form.Group>
								<Form.Row>
									<Col sm={3}>Effort</Col>
									<Col sm={9}>
										<NumInput
											name="effort"
											value={effort}
											onChange={this.onChange}
											key={id}
										/>
									</Col>
								</Form.Row>
							</Form.Group>
							<Form.Group>
								<Form.Row>
									<Col sm={3}>Due</Col>
									<Col sm={9}>
										<DateInput
											name="due"
											value={due}
											onChange={this.onChange}
											onValidityChange={this.onValidityChange}
										/>
									</Col>
								</Form.Row>
							</Form.Group>
							<Form.Group>
								<Form.Row>
									<Col sm={3}>Title</Col>
									<Col sm={9}>
										<Form.Control
											size={50}
											name="title"
											value={title}
											onChange={this.onChange}
											key={id}
										/>
									</Col>
								</Form.Row>
							</Form.Group>
							<Form.Group>
								<Form.Row>
									<Col sm={3}>Description</Col>
									<Col sm={9}>

										<TextInput
											tag="textarea"
											rows={8}
											cols={50}
											name="description"
											value={description}
											onChange={this.onChange}
											key={id}
										/>

									</Col>
								</Form.Row>
							</Form.Group>
							<Form.Group>
								<Form.Row>
									<Col sm={9}>
										{validationMessage}
									</Col>
								</Form.Row>
							</Form.Group>
							<Form.Group>
								<Col sm={6}>
									<ButtonToolbar>
										<Button
											disabled={!user.signedIn}
											bsstyle="primary"
											type="submit"
										>
											Submit
										</Button>
										<LinkContainer to="/issues">
											<Button bsstyle="link">Back</Button>
										</LinkContainer>
									</ButtonToolbar>
								</Col>
							</Form.Group>
						</Form>
					</Card.Body>
				</Card>
				<Link to={`/edit/${id - 1}`}>Prev</Link>
				{ ' | '}
				<Link to={`/edit/${id + 1}`}>Next</Link>
			</>
		);
	}
}

IssueEdit.contextType = UserContext;
const IssueEditWithToast = withToast(IssueEdit);
IssueEditWithToast.fetchData = IssueEdit.fetchData;
export default IssueEditWithToast;
