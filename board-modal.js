document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('board-animation-modal');
    if (!modal) return;

    const modalBody = modal.querySelector('.board-modal-body');
    const closeModalButton = modal.querySelector('.board-modal-close');

    // Function to open the modal and load content
    const openModal = async (postId) => {
        modal.showModal();
        modalBody.innerHTML = '<div class="board-modal-loading">Loading...</div>';

        try {
            const formData = new FormData();
            formData.append('action', 'load_board_animation');
            formData.append('post_id', postId);
            formData.append('nonce', boardAnimationData.nonce);

            const response = await fetch(boardAnimationData.ajax_url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const result = await response.json();

            if (result.success) {
                modalBody.innerHTML = result.data;
                // Important: Initialize the animation script AFTER the content is loaded
                if (window.initBoardAnimation) {
                    window.initBoardAnimation();
                }
            } else {
                throw new Error(result.data || 'Failed to load animation content.');
            }
        } catch (error) {
            console.error('Error loading board animation:', error);
            modalBody.innerHTML = '<p class="error">Sorry, we could not load the animation. Please try again later.</p>';
        }
    };

    // Function to close the modal
    const closeModal = () => {
        modal.close();
        modalBody.innerHTML = ''; // Clean up content
    };

    // Event listener for all trigger buttons
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.board-modal-trigger');
        if (trigger && trigger.dataset.postId) {
            openModal(trigger.dataset.postId);
        }
    });

    // Event listener for the close button
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    // Event listener to close the modal by clicking on the backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});
