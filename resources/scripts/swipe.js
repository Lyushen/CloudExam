import { updateQuestionDisplay, appSettings } from './app.js';

export function initializeSwipeHandling() {
    let startCoord = 0;
    let isSwiping = false;
    let lastSwipeIndex = 0;
    let sens_percent_value = 0.25; // 25% of the screen width as swipe sensitivity
    let sensitivity = visualViewport.width * sens_percent_value;

    visualViewport.addEventListener('resize', () => {
        sensitivity = visualViewport.width * sens_percent_value;
    });

    const onStart = (startX) => {
        startCoord = startX;
        isSwiping = true;
        lastSwipeIndex = 0; // Reset swipe index on new gesture start
    };

    const onMove = (currentX) => {
        const deltaX = currentX - startCoord;
        const swipeIndex = Math.sign(deltaX) * Math.floor(Math.abs(deltaX) / sensitivity);

        // Update only on changes of swipe index and within the bounds of -1 to 1
        if (swipeIndex !== lastSwipeIndex && Math.abs(swipeIndex) <= 1) {
            updateQuestionDisplay(appSettings.currentQuestion + swipeIndex - lastSwipeIndex);
            lastSwipeIndex = swipeIndex; // Update lastSwipeIndex to the new swipe index
            preventDefaultAndClearSelection(event);
        }
    };

    const onEnd = () => {
        isSwiping = false;
    };

    const preventDefaultAndClearSelection = (event) => {
        // Prevent default to avoid scrolling and other behaviors
        event.preventDefault();

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
    };

    // Touch Event Handlers
    document.addEventListener('touchstart', (event) => {
        onStart(event.touches[0].clientX);
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