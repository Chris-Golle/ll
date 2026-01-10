/**
 * Handles the product fullscreen overlay functionality.
 */
( function () {
	'use strict';
	function init() {
		document.body.addEventListener( 'click', handleTriggerClick );
	}
	function handleTriggerClick( e ) {
		const trigger = e.target.closest( '.product-fullscreen-trigger' );
		if ( ! trigger ) return;
		e.preventDefault();
		const productId = trigger.dataset.productId;
		if ( ! productId ) return;
		createAndShowOverlay( productId );
	}
	function createAndShowOverlay( productId ) {
		const overlay = document.createElement( 'div' );
		overlay.id = 'product-overlay';
		overlay.className = 'product-overlay-scroll';
		overlay.setAttribute( 'role', 'dialog' );
		const contentContainer = document.createElement( 'div' );
		contentContainer.className = 'product-overlay-content';
		contentContainer.innerHTML = '<p>Loading...</p>';
		const closeButton = document.createElement( 'button' );
		closeButton.className = 'product-overlay-close';
		closeButton.setAttribute( 'aria-label', 'Close' );
		closeButton.innerHTML = '&times;';
		overlay.appendChild( contentContainer );
		overlay.appendChild( closeButton );
		document.body.appendChild( overlay );
		document.body.classList.add( 'product-overlay-active' );
		overlay.addEventListener('click', function(e) {
			if (e.target.classList.contains('product-overlay-close') || e.target === overlay) {
				closeOverlay();
			}
		});
		document.addEventListener( 'keydown', handleEscKey );
		fetchProductContent( productId, contentContainer );
	}
	function fetchProductContent( productId, contentContainer ) {
		const { ajax_url, nonce } = window.productOverlayData;
		const formData = new FormData();
		formData.append( 'action', 'load_product' );
		formData.append( 'nonce', nonce );
		formData.append( 'product_id', productId );
		fetch( ajax_url, { method: 'POST', body: formData } )
			.then( ( response ) => response.json() )
			.then( ( result ) => {
				if ( result.success ) {
					contentContainer.innerHTML = result.data.html;
					const root = contentContainer.querySelector('.board-animation-root');
					if (root && typeof window.initBoardAnimation === 'function') {
						if (window.boardAnimationData) {
							window.boardAnimationData.messages = result.data.messages;
						}
						requestAnimationFrame(() => {
							requestAnimationFrame(() => {
								window.initBoardAnimation(root);
							});
						});
					}
				} else {
					contentContainer.innerHTML = '<p>An error occurred.</p>';
				}
			} );
	}
	function closeOverlay() {
		const overlay = document.getElementById( 'product-overlay' );
		if ( overlay ) overlay.remove();
		document.body.classList.remove( 'product-overlay-active' );
		document.removeEventListener( 'keydown', handleEscKey );
	}
	function handleEscKey( e ) {
		if ( e.key === 'Escape' ) closeOverlay();
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
