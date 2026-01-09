document.addEventListener('click', function(e) {
    const btn = e.target.closest('.board-modal-trigger');
    if (!btn) return;

    const dlg = document.getElementById('board-modal-' + btn.dataset.modalId);
    if (dlg) {
        dlg.showModal();
        // Trigger Animation inside Iframe after open
        const iframe = dlg.querySelector('iframe');
        setTimeout(() => {
            if (iframe.contentWindow && iframe.contentWindow.initBoardAnimation) {
                iframe.contentWindow.initBoardAnimation();
            }
        }, 100);
    }
});

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('board-modal-close')) {
        e.target.closest('dialog').close();
    }
    // Click backdrop to close
    if (e.target.tagName === 'DIALOG') {
        e.target.close();
    }
});
