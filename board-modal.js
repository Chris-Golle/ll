document.addEventListener('DOMContentLoaded', () => {
    console.log('Board Modal JS Loaded');

    const modal = document.getElementById('board-animation-modal');
    if (!modal) {
        console.error('Modal container #board-animation-modal not found.');
        return;
    }

    const modalBody = modal.querySelector('.board-animation-modal-body');
    const closeModalButton = modal.querySelector('.board-animation-modal-close');

    // Event delegation for the trigger button
    document.body.addEventListener('click', async (event) => {
        if (event.target.matches('.board-animation-trigger-button')) {
            console.log('Trigger button clicked.');

            const button = event.target;
            const postId = button.dataset.postId;

            if (!postId) {
                console.error('Post ID not found on button.');
                return;
            }

            // Open modal and show loading state
            modalBody.innerHTML = '<p>Loading...</p>';
            modal.style.display = 'flex';

            const formData = new FormData();
            formData.append('action', 'load_board_content');
            formData.append('nonce', boardAnimation.nonce);
            formData.append('post_id', postId);

            console.log('AJAX Request Start: Fetching content for post_id', postId);

            try {
                const response = await fetch(boardAnimation.ajax_url, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                console.log('AJAX Response:', data);

                if (data.success) {
                    modalBody.innerHTML = `
                        <h2>${data.data.title}</h2>
                        <div>${data.data.content}</div>
                    `;
                } else {
                    modalBody.innerHTML = `<p>Error: ${data.data.message}</p>`;
                }
            } catch (error) {
                console.error('AJAX request failed:', error);
                modalBody.innerHTML = '<p>An error occurred while fetching the content.</p>';
            }
        }
    });

    // Close modal events
    const closeModal = () => {
        modal.style.display = 'none';
        modalBody.innerHTML = ''; // Clear content
    };

    closeModalButton.addEventListener('click', closeModal);

    // Close modal if clicking outside the content area
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});
