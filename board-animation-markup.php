<div class="animation-container board-animation-root" id="animation-container">
    <div class="sticky-wrapper">
        <!-- Left scene -->
        <div class="scene scene-left">
            <div class="board" id="board">
                <div class="face front" id="front-face"></div>
                <div class="face back" id="back-face"></div>
            </div>
            <div class="trapezoid-container">
                <svg id="trapezoid-svg" width="222" height="333" viewBox="0 0 222 333">
                    <defs>
                        <pattern id="knit-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                            <rect width="8" height="8" fill="#f5f5dc"/>
                            <circle cx="2" cy="2" r="0.5" fill="#e8e4d0"/>
                            <circle cx="6" cy="2" r="0.5" fill="#e8e4d0"/>
                            <circle cx="4" cy="6" r="0.5" fill="#e8e4d0"/>
                            <circle cx="0" cy="6" r="0.5" fill="#e8e4d0"/>
                        </pattern>
                    </defs>
                    <polygon id="trapezoid-polygon"
                             points="55.5,0 166.5,0 222,333 0,333"
                             fill="url(#knit-pattern)"
                             stroke="#d2b48c"
                             stroke-width="2"/>
                </svg>
            </div>
        </div>

        <!-- Right scene -->
        <div class="scene scene-right">
            <div class="board" id="right-board">
                <div class="face front" id="right-front-face"></div>
                <div class="face back" id="right-back-face"></div>
            </div>
            <div class="trapezoid-container">
                <svg id="right-trapezoid-svg" width="222" height="333" viewBox="0 0 222 333">
                    <defs>
                        <pattern id="right-knit-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                            <rect width="8" height="8" fill="#f5f5dc"/>
                            <circle cx="2" cy="2" r="0.5" fill="#e8e4d0"/>
                            <circle cx="6" cy="2" r="0.5" fill="#e8e4d0"/>
                            <circle cx="4" cy="6" r="0.5" fill="#e8e4d0"/>
                            <circle cx="0" cy="6" r="0.5" fill="#e8e4d0"/>
                        </pattern>
                    </defs>
                    <polygon id="right-trapezoid-polygon"
                             points="166.5,0 55.5,0 0,333 222,333"
                             fill="url(#right-knit-pattern)"
                             stroke="#d2b48c"
                             stroke-width="2"/>
                </svg>
            </div>
        </div>
    </div>
</div>
