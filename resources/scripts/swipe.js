import { updateQuestionDisplay, appSettings } from './app.js';

export function initializeSwipeHandling() {
    let startCoord = 0;
    let isSwiping = false;
    let currentQuestionIndex = appSettings.currentQuestion; // Start with current question index
    let sens_percent_value = 0.25; // 25% of the screen
    let sensitivity = visualViewport.width * sens_percent_value;

    visualViewport.addEventListener('resize', () => {
        sensitivity = visualViewport.width * sens_percent_value;
    });

    const onStart = (startX) => {
        startCoord = startX;
        isSwiping = true;
        currentQuestionIndex = appSettings.currentQuestion; // Refresh current question on start
    };

    const onMove = (currentX) => {
        if (isSwiping) {
            const deltaX = currentX - startCoord;

            if (Math.abs(deltaX) > sensitivity) {
                let steps = Math.floor(deltaX / sensitivity); // Calculate how many steps user swiped
                let newIndex = currentQuestionIndex + steps;
                updateQuestionDisplay(newIndex); // Update the question index based on swiping

                if (window.getSelection) {
                    if (window.getSelection().empty) {  // Chrome
                        window.getSelection().empty();
                    } else if (window.getSelection().removeAllRanges) {  // Firefox
                        window.getSelection().removeAllRanges();
                    }
                } else if (document.selection) {  // IE
                    document.selection.empty();
                }

                // Prevent default behavior to avoid scrolling and other interactions
                event.preventDefault();
            }
        }
    };

    const onEnd = () => {
        isSwiping = false; // Reset swiping state
    };

    // Touch Events
    document.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        onStart(touch.clientX);
    }, { passive: true });

    document.addEventListener('touchmove', (event) => {
        onMove(event.touches[0].clientX);
    }, { passive: false });

    document.addEventListener('touchend', onEnd);

    // Pointer Events for Mouse
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
            event.preventDefault(); // Avoid text selection and other default behaviors
        }
    };

    const onPointerEnd = (event) => {
        if (event.pointerType === 'mouse') {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerEnd);
            onEnd();
        }
    };
}