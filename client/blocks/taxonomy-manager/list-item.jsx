/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import PopoverMenuSeparator from 'components/popover/menu-separator';
import Gridicon from 'components/gridicon';
import Count from 'components/count';
import Dialog from 'components/dialog';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';
import { getSite } from 'state/sites/selectors';
import { deleteTerm } from 'state/terms/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import { decodeEntities } from 'lib/formatting';

class TaxonomyManagerListItem extends Component {
	static propTypes = {
		canSetAsDefault: PropTypes.bool,
		deleteTerm: PropTypes.func,
		isDefault: PropTypes.bool,
		onClick: PropTypes.func,
		saveSiteSettings: PropTypes.func,
		siteId: PropTypes.number,
		term: PropTypes.object,
		translate: PropTypes.func,
		siteUrl: PropTypes.string,
		slug: PropTypes.string,
	};

	static defaultProps = {
		onClick: () => {},
	};

	state = {
		showDeleteDialog: false,
	};

	deleteItem = () => {
		this.setState( {
			showDeleteDialog: true
		} );
	};

	closeDeleteDialog = action => {
		if ( action === 'delete' ) {
			const { siteId, taxonomy, term } = this.props;
			this.props.deleteTerm( siteId, taxonomy, term.ID, term.slug );
		}
		this.setState( {
			showDeleteDialog: false
		} );
	};

	setAsDefault = () => {
		const { canSetAsDefault, siteId, term } = this.props;
		if ( canSetAsDefault ) {
			this.props.saveSiteSettings( siteId, { default_category: term.ID } );
		}
	};

	getTaxonomyLink() {
		const { taxonomy, siteUrl, term } = this.props;
		let taxonomyBase = taxonomy;

		if ( taxonomy === 'post_tag' ) {
			taxonomyBase = 'tag';
		}
		return `${ siteUrl }/${ taxonomyBase }/${ term.slug }/`;
	}

	render() {
		const { canSetAsDefault, isDefault, onClick, term, translate } = this.props;
		const name = decodeEntities( term.name ) || translate( 'Untitled' );
		const className = classNames( 'taxonomy-manager__item', {
			'is-default': isDefault
		} );
		const deleteDialogButtons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'delete', label: translate( 'OK' ), isPrimary: true },
		];

		return (
			<div className={ className }>
				<span className="taxonomy-manager__icon" onClick={ onClick }>
					<Gridicon icon={ isDefault ? 'checkmark-circle' : 'folder' } />
				</span>
				<span className="taxonomy-manager__label" onClick={ onClick }>
					<span>{ name }</span>
					{ isDefault &&
						<span className="taxonomy-manager__default-label">
							{ translate( 'default', { context: 'label for terms marked as default' } ) }
						</span>
					}
				</span>
				{ ! isUndefined( term.post_count ) && <Count count={ term.post_count } /> }
				<EllipsisMenu position="bottom left">
					<PopoverMenuItem onClick={ onClick }>
						<Gridicon icon="pencil" size={ 18 } />
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
					<PopoverMenuItem onClick={ this.deleteItem } icon="trash">
						{ translate( 'Delete' ) }
					</PopoverMenuItem>
					<PopoverMenuItem href={ this.getTaxonomyLink() } icon="external">
						{ translate( 'View Posts' ) }
					</PopoverMenuItem>
					{ canSetAsDefault && ! isDefault && <PopoverMenuSeparator /> }
					{ canSetAsDefault && ! isDefault &&
						<PopoverMenuItem onClick={ this.setAsDefault } icon="checkmark-circle">
							{ translate( 'Set as default' ) }
						</PopoverMenuItem>
					}
				</EllipsisMenu>
				<Dialog
					isVisible={ this.state.showDeleteDialog }
					buttons={ deleteDialogButtons }
					onClose={ this.closeDeleteDialog }
				>
					<p>{ translate( 'Are you sure you want to permanently delete this item?' ) }</p>
				</Dialog>
			</div>
		);
	}
}

export default connect(
	( state, { taxonomy, term } ) => {
		const siteId = getSelectedSiteId( state );
		const siteSettings = getSiteSettings( state, siteId );
		const canSetAsDefault = taxonomy === 'category';
		const isDefault = canSetAsDefault && get( siteSettings, [ 'default_category' ] ) === term.ID;
		const siteUrl = get( getSite( state, siteId ), 'URL' );

		return {
			isDefault,
			canSetAsDefault,
			siteId,
			siteUrl,
		};
	},
	{ deleteTerm, saveSiteSettings }
)( localize( TaxonomyManagerListItem ) );
