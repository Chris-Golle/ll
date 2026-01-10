<?php
/**
 * Template Part for Board Animation Markup
 *
 * This template provides the necessary HTML structure for the board animation.
 * It is loaded via get_template_part() in the AJAX handler for the quick view modal.
 * The animation's scrolling behavior is controlled by the modal's scroll container.
 */
?>
<div id="animation-container" style="height: 400vh; position: relative; width: 100%;">
    <div class="sticky-wrapper" style="position: sticky; top: 0; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center;">

        <div class="scene scene-left" style="position: absolute; left: 10%; width: 350px; height: 200px; perspective: 1000px;">
            <div id="board" class="board" style="width: 100%; height: 100%; position: absolute; transform-style: preserve-3d;">
                <div id="front-face" class="face" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; background: #f9f9f9; border: 2px solid #eee; padding: 20px; text-align: center; font-size: 18px; color: #333; box-sizing: border-box;"></div>
                <div id="back-face" class="face" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; transform: rotateX(180deg); display: flex; align-items: center; justify-content: center; background: #f9f9f9; border: 2px solid #eee; padding: 20px; text-align: center; font-size: 18px; color: #333; box-sizing: border-box;"></div>
            </div>
        </div>

        <div class="scene scene-right" style="position: absolute; right: 10%; width: 350px; height: 200px; perspective: 1000px;">
            <div id="right-board" class="board" style="width: 100%; height: 100%; position: absolute; transform-style: preserve-3d;">
                <div id="right-front-face" class="face" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; background: #f9f9f9; border: 2px solid #eee; padding: 20px; text-align: center; font-size: 18px; color: #333; box-sizing: border-box;"></div>
                <div id="right-back-face" class="face" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; transform: rotateX(180deg); display: flex; align-items: center; justify-content: center; background: #f9f9f9; border: 2px solid #eee; padding: 20px; text-align: center; font-size: 18px; color: #333; box-sizing: border-box;"></div>
            </div>
        </div>

    </div>
</div>
