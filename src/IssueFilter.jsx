import React, { useState, useEffect } from 'react';
import URLSearchParams from 'url-search-params';
import { withRouter } from 'react-router-dom';

import {
	Button, Form, InputGroup, ButtonToolbar, Row, Col,
} from 'react-bootstrap';

const IssueFilter = (props) => {
	const { location: { search } } = props;
	const params = new URLSearchParams(search);

	const [state, setState] = useState({
		status: params.get('status') || '',
		effortMin: params.get('effortMin') || '',
		effortMax: params.get('effortMax') || '',
		changed: false,
	});

	useEffect(() => {
		showOriginalFilter();
	}, [search]);

	const onChangeStatus = (e) => {
		setState({ ...state, status: e.target.value, changed: true });
	};

	const applyFilter = () => {
		const { status, effortMin, effortMax } = state;
		const { history, urlBase } = props;

		const params = new URLSearchParams();
		if (status) params.set('status', status);
		if (effortMin) params.set('effortMin', effortMin);
		if (effortMax) params.set('effortMax', effortMax);

		const search = params.toString() ? `?${params.toString()}` : '';
		history.push({
			pathname: urlBase,
			search,
		});
	};

	const showOriginalFilter = () => {
		const { location: { search } } = props;
		const params = new URLSearchParams(search);
		setState({
			...state,
			status: params.get('status') || '',
			changed: false,
		});
	};

	const onChangeEffortMin = (e) => {
		const effortString = e.target.value;
		if (effortString.match(/^\d*$/)) {
			setState({ ...state, effortMin: e.target.value, changed: true });
		}
	};

	const onChangeEffortMax = (e) => {
		const effortString = e.target.value;
		if (effortString.match(/^\d*$/)) {
			setState({ ...state, effortMax: e.target.value, changed: true });
		}
	};

	const {
		status,
		effortMin,
		effortMax,
		changed,
	} = state;
	return (
		<>
			<Row>
				<Col sx={6} sm={4} md={3} lg={2}>
					<Form.Group>
						<Form.Label>Status:</Form.Label>
						<Form.Control
							as="select"
							value={status}
							onChange={onChangeStatus}
						>
							<option value="">(All)</option>
							<option value="New">New</option>
							<option value="Assigned">Assigned</option>
							<option value="Fixed">Fixed</option>
							<option value="Closed">Closed</option>
						</Form.Control>
					</Form.Group>
				</Col>
				<Col sx={6} sm={4} md={3} lg={2}>
					<Form.Group>
						<Form.Label>Effort between:</Form.Label>
						<InputGroup>
							<Form.Control
								value={effortMin}
								onChange={onChangeEffortMin}
							/>
							<InputGroup.Text>-</InputGroup.Text>
							<Form.Control
								value={effortMax}
								onChange={onChangeEffortMax}
							/>
						</InputGroup>
					</Form.Group>
				</Col>
				<Col sx={6} sm={4} md={3} lg={2}>
					<Form.Group>
						<Form.Label>&nbsp;</Form.Label>
						<ButtonToolbar>
							<Button
								bsstyle="primary"
								type="button"
								onClick={applyFilter}
							>
								Apply
							</Button>
							<Button
								bsstyle="primary"
								type="button"
								onClick={showOriginalFilter}
								disabled={!changed}
							>
								Reset
							</Button>
						</ButtonToolbar>
					</Form.Group>
				</Col>
			</Row>
		</>
	);
};

export default withRouter(IssueFilter);
