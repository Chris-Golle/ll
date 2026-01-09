<?php
/**
 * The template for displaying the footer
 *
 * @package WordPress
 * @subpackage Twenty_Twenty_Four
 * @since Twenty Twenty-Four 1.0
 */
?>

        </main><!-- #main -->
    </div><!-- #primary -->
</div><!-- #page -->

<?php wp_footer(); ?>

<script>
    document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('dialog.board-modal').forEach(dialog => {
    if (dialog.parentElement !== document.body) {
      document.body.appendChild(dialog);
    }
  });
});
/**
 * DEFINITIVE MODAL SIZE TEST (Firefox-proof)
 * This bypasses all CSS, layers, and theme constraints.
 */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.board-modal-trigger');
  if (!btn) return;

  const id = btn.dataset.modalId;
  const dlg = document.getElementById('board-modal-' + id);
  if (!dlg) return;

  // Force dialog size
  dlg.style.position = 'fixed';
  dlg.style.inset = '0';
  dlg.style.width = '100vw';
  dlg.style.height = '100vh';
  dlg.style.maxWidth = 'none';
  dlg.style.maxHeight = 'none';
  dlg.style.margin = '0';
  dlg.style.padding = '0';
  dlg.style.border = 'none';

  // Force iframe size
  const iframe = dlg.querySelector('iframe');
  if (iframe) {
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = '0';
    iframe.style.display = 'block';
  }

  dlg.showModal();
});

</script>

</body>
</html>
