/**
 * Handles the product fullscreen overlay functionality.
 *
 * This script is CSP-safe and does not use inline styles or scripts.
 *
 * @package TwentyTwentyFive-Child
 */

( function () {
	'use strict';

	// Main initialization function.
	function init() {
		document.body.addEventListener( 'click', handleTriggerClick );
	}

	/**
	 * Handles the click event on the trigger button.
	 *
	 * @param {Event} e The click event.
	 */
	function handleTriggerClick( e ) {
		const trigger = e.target.closest( '.product-fullscreen-trigger' );
		if ( ! trigger ) {
			return;
		}

		e.preventDefault();
		const productId = trigger.dataset.productId;
		if ( ! productId ) {
			return;
		}

		createAndShowOverlay( productId );
	}

	/**
	 * Creates the overlay structure and appends it to the body.
	 *
	 * @param {string} productId The WooCommerce product ID.
	 */
	function createAndShowOverlay( productId ) {
		// 1. Create Overlay Structure: Create all elements programmatically.
		const overlay = document.createElement( 'div' );
		overlay.id = 'product-overlay';
		overlay.className = 'product-overlay';
		overlay.setAttribute( 'role', 'dialog' );
		overlay.setAttribute( 'aria-modal', 'true' );

		const contentContainer = document.createElement( 'div' );
		contentContainer.className = 'product-overlay-content';
		contentContainer.innerHTML = '<p>Loading...</p>'; // Initial loading state.

		const closeButton = document.createElement( 'button' );
		closeButton.className = 'product-overlay-close';
		closeButton.setAttribute( 'aria-label', 'Close' );
		closeButton.innerHTML = '&times;';

		// 2. Assemble Overlay: Append children to the overlay.
		overlay.appendChild( contentContainer );
		overlay.appendChild( closeButton );

		// 3. Add to DOM: Append the overlay to the body.
		document.body.appendChild( overlay );
		document.body.classList.add( 'product-overlay-active' ); // Prevent background scroll.

		// 4. Add Event Listeners: Handle closing the overlay.
		closeButton.addEventListener( 'click', closeOverlay );
		overlay.addEventListener( 'click', function ( e ) {
			if ( e.target === overlay ) {
				closeOverlay();
			}
		} );
		document.addEventListener( 'keydown', handleEscKey );


		// 5. Fetch Product Content.
		fetchProductContent( productId, contentContainer );
	}

	/**
	 * Fetches the product content via AJAX and injects it into the container.
	 *
	 * @param {string} productId The WooCommerce product ID.
	 * @param {HTMLElement} contentContainer The container to inject the HTML into.
	 */
	function fetchProductContent( productId, contentContainer ) {
		const { ajax_url, nonce } = window.productOverlayData;

		const formData = new FormData();
		formData.append( 'action', 'load_product' );
		formData.append( 'nonce', nonce );
		formData.append( 'product_id', productId );

		fetch( ajax_url, {
			method: 'POST',
			body: formData,
		} )
			.then( ( response ) => response.json() )
			.then( ( result ) => {
				if ( result.success ) {
					// 6. Inject HTML: Use innerHTML to inject the fetched content.
					// This is a key part of the required architecture.
					contentContainer.innerHTML = result.data;

					// 7. Initialize Animation: Call the global init function for the board animation.
					// This is idempotent and safe to call multiple times.
					if ( typeof window.initBoardAnimation === 'function' ) {
						window.initBoardAnimation();
					}
				} else {
					contentContainer.innerHTML = `<p>Error: ${ result.data }</p>`;
				}
			} )
			.catch( ( error ) => {
				console.error( 'Error fetching product content:', error );
				contentContainer.innerHTML = '<p>An error occurred while loading the product.</p>';
			} );
	}

	/**
	 * Closes and removes the overlay from the DOM.
	 */
	function closeOverlay() {
		const overlay = document.getElementById( 'product-overlay' );
		if ( overlay ) {
			overlay.remove();
		}
		document.body.classList.remove( 'product-overlay-active' );
		document.removeEventListener( 'keydown', handleEscKey );
	}

	/**
	 * Handles the 'Escape' key press to close the overlay.
	 *
	 * @param {KeyboardEvent} e The keydown event.
	 */
	function handleEscKey( e ) {
		if ( e.key === 'Escape' ) {
			closeOverlay();
		}
	}

	// Run the script once the DOM is ready.
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
