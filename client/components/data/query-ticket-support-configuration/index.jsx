/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	ticketSupportConfigurationRequest,
} from 'state/ticket-support/configuration/actions';

import {
	isRequestingTicketSupportConfiguration,
} from 'state/help/ticket/selectors';

class QueryTicketSupportConfiguration extends Component {
	componentWillMount() {
		if ( ! this.props.isRequesting ) {
			this.props.ticketSupportConfigurationRequest();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		isRequesting: isRequestingTicketSupportConfiguration( state ),
	} ),
	{ ticketSupportConfigurationRequest }
)( QueryTicketSupportConfiguration );
