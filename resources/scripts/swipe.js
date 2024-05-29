import { updateQuestionDisplay, appSettings } from './app.js';

export function initializeSwipeHandling() {
    let startCoord = 0;
    let currentQuestionIndex = appSettings.currentQuestion;
    let isSwiping = false;
    let changeMade = false;
    let sens_percent_value = 0.25; // 25% of the screen
    let sensitivity = visualViewport.width * sens_percent_value; // Use % of the visual viewport width

    // Update sensitivity on resize or zoom
    visualViewport.addEventListener('resize', () => {
        sensitivity = visualViewport.width * sens_percent_value;
    });

    const onStart = (startX) => {
        startCoord = startX;
        currentQuestionIndex = appSettings.currentQuestion; // Capture the current question at start
        isSwiping = true;
        changeMade = false;  // Reset change tracking on new gesture start
    };

    const onMove = (currentX) => {
        if (!isSwiping) return;

        const deltaX = currentX - startCoord;
        let targetIndex = currentQuestionIndex;
        if (!changeMade && Math.abs(deltaX) > sensitivity) {
            if (deltaX > 0) {
                targetIndex = currentQuestionIndex - 1; // Swipe right to go to previous question
            } else {
                targetIndex = currentQuestionIndex + 1; // Swipe left to go to next question
            }
            updateQuestionDisplay(targetIndex);
            changeMade = true;
            appSettings.currentQuestion = targetIndex; // Update the global current question index
        } else if (changeMade && Math.abs(deltaX) <= sensitivity) {
            updateQuestionDisplay(currentQuestionIndex); // Revert to original question if user swipes back within threshold
            appSettings.currentQuestion = currentQuestionIndex;
            changeMade = false;
        }

        // Prevent default action to avoid scrolling and other behaviors
        event.preventDefault();
    };

    const onEnd = () => {
        isSwiping = false;
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