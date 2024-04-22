import { updateQuestionDisplay,appSettings } from './app.js';

export function initializeSwipeHandling() {
    const swipeConfig = {
        startCoord: 0,
        isSwiping: false,
        sensitivityPercent: 0.25, // 25% of the screen width
        sensitivity: visualViewport.width * 0.25
    };

    function updateSensitivity() {
        swipeConfig.sensitivity = visualViewport.width * swipeConfig.sensitivityPercent;
    }

    visualViewport.addEventListener('resize', updateSensitivity);

    function handleStart(startX) {
        swipeConfig.startCoord = startX;
        swipeConfig.isSwiping = false;
    }

    function handleMove(currentX, evt) {
        if (!swipeConfig.isSwiping) {
            const deltaX = currentX - swipeConfig.startCoord;
            if (Math.abs(deltaX) > swipeConfig.sensitivity) {
                swipeConfig.isSwiping = true;
                if (deltaX > 0) {
                    updateQuestionDisplay(appSettings.currentQuestion - 1);
                } else {
                    updateQuestionDisplay(appSettings.currentQuestion + 1);
                }
                if (evt.cancelable) {
                    evt.preventDefault();
                }
            }
        }
    }

    function handleEnd() {
        swipeConfig.isSwiping = false;
    }

    // Touch Events
    document.addEventListener('touchstart', (event) => {
        handleStart(event.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchmove', (event) => {
        handleMove(event.touches[0].clientX, event);
    }, { passive: false });

    document.addEventListener('touchend', handleEnd);

    // Pointer Events for mouse
    document.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse' || event.button === 0) {
            handleStart(event.clientX);
            document.addEventListener('pointermove', (evt) => handleMove(evt.clientX, evt), { passive: false });
            document.addEventListener('pointerup', handleEnd);
        }
    });
}