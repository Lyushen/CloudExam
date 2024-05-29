import { updateQuestionDisplay, appSettings } from './app.js';

export function initializeSwipeHandling() {
    let startCoord = 0;
    let lastQuestionIndex = 0; // Track the last question index shown
    let updateLocked = false; // Lock updates after the first successful swipe change
    let sens_percent_value = 0.25; // 25% of the screen
    let sensitivity = visualViewport.width * sens_percent_value; // Use % of the visual viewport width

    // Update sensitivity on resize or zoom
    visualViewport.addEventListener('resize', () => {
        sensitivity = visualViewport.width * sens_percent_value;
    });

    const onStart = (startX) => {
        startCoord = startX;
        lastQuestionIndex = appSettings.currentQuestion; // Start swiping from the current question
        updateLocked = false; // Unlock on new swipe start
    };

    const onMove = (currentX) => {
        if (!updateLocked) {
            const deltaX = currentX - startCoord;
            const stepIndex = Math.sign(deltaX) * Math.floor(Math.abs(deltaX) / sensitivity);

            if (Math.abs(stepIndex) == 1) { // Ensure only -1 or 1 step
                const newQuestionIndex = lastQuestionIndex + stepIndex;

                if (newQuestionIndex !== appSettings.currentQuestion) {
                    updateQuestionDisplay(newQuestionIndex);
                    appSettings.currentQuestion = newQuestionIndex; // Update the global current question index
                    updateLocked = true; // Lock updates after one successful change
                }

                // Clear text selection
                if (window.getSelection) {
                    if (window.getSelection().empty) {  // Chrome
                        window.getSelection().empty();
                    } else if (window.getSelection().removeAllRanges) {  // Firefox
                        window.getSelection().removeAllRanges();
                    }
                } else if (document.selection) {  // IE
                    document.selection.empty();
                }

                // Prevent default to avoid unwanted behaviors like scrolling
                event.preventDefault();
            }
        }
    };

    const onEnd = () => {
        // No action needed here for locking, it resets on start
    };

    // Touch Event Handlers
    document.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        onStart(touch.clientX);
    }, { passive: true });

    document.addEventListener('touchmove', (event) => {
        onMove(event.touches[0].clientX);
    }, { passive: false });

    document.addEventListener('touchend', onEnd);

    // Pointer Event Handlers (for mouse)
    document.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (event.target.closest('#question-text') || event.target.closest('#explanations-container')) return;
        onStart(event.clientX);
        document.addEventListener('pointermove', onPointerMove, { passive: false });
        document.addEventListener('pointerup', onPointerEnd);
    });

    const onPointerMove = (event) => {
        if (event.pointerType === 'mouse') {
            onMove(event.clientX);
            event.preventDefault(); // Prevent default for mouse interactions to avoid selecting text or other mouse-specific behaviors
        }
    };

    const onPointerEnd = (event) => {
        if (event.pointerType === 'mouse') {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerEnd);
        }
    };
}