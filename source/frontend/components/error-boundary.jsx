import React from 'react';
import { useNavigate, useLocation } from 'react-sprout';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../errors/http';
import Error from '../pages/error';
import Login from '../pages/login';
import NotFound from '../pages/not-found';
import Forbidden from '../pages/forbidden';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.handleContinue = this.handleContinue.bind(this);
		this.clearError = this.clearError.bind(this);
	}

	handleContinue(reload) {
		if (reload) {
			this.props.location.reload(true);
		}

		this.setState({ error: undefined });
	}

	clearError() {
		this.setState({ ...this.state, error: undefined });
	}

	componentDidMount() {
		window.addEventListener('popstate', this.clearError);
	}

	componentWillUnmount() {
		window.removeEventListener('popstate', this.clearError);
	}

	componentDidCatch(error) {
		this.setState({ ...this.state, error });
	}

	render() {
		if (this.state.error) {
			if (this.state.error instanceof NotFoundError) {
				return <NotFound />;
			}

			if (this.state.error instanceof ForbiddenError) {
				return <Forbidden />;
			}

			if (this.state.error instanceof UnauthorizedError) {
				return <Login />;
			}

			return <Error error={this.state.error} />;
		}

		return this.props.children;
	}
}

// eslint-disable-next-line
export default function (props) {
	let navigate = useNavigate();
	let location = useLocation();

	return <ErrorBoundary {...props} navigate={navigate} location={location} />;
}
