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
		overlay.className = 'product-overlay-scroll'; // Use the scroll class
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

		// 4. Add Event Listeners using Delegation: Handle closing the overlay.
		overlay.addEventListener('click', function(e) {
			// Close if the close button or the overlay backdrop is clicked.
			if (e.target.classList.contains('product-overlay-close') || e.target === overlay) {
				closeOverlay();
			}
		});
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
					// Inject the HTML from the server.
					contentContainer.innerHTML = result.data.html;

					// Find the root element for the animation within the new content.
					const root = contentContainer.querySelector('.board-animation-root');
					if (root && typeof window.initBoardAnimation === 'function') {
						// Use a double requestAnimationFrame to ensure the DOM is painted
						// before we initialize the animation. This is a robust way to
						// handle initialization on dynamically loaded content.
						requestAnimationFrame(() => {
							requestAnimationFrame(() => {
								window.initBoardAnimation(root);
							});
						});
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
