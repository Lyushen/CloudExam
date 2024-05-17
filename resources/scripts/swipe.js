import { updateQuestionDisplay,appSettings } from './app.js';

export function initializeSwipeHandling() {
    let startCoord = 0;
    let isSwiping = false;
    let sens_percent_value = 0.25; // 25% of the screen
    let sensitivity = visualViewport.width * sens_percent_value; // Use % of the visual viewport width

    // Update sensitivity on resize or zoom
    visualViewport.addEventListener('resize', () => {
        sensitivity = visualViewport.width * sens_percent_value;
    });

    const onStart = (startX) => {
        startCoord = startX;
        isSwiping = false;  // Reset swipe state on new gesture start
    };

    const onMove = (currentX) => {
        if (!isSwiping) {
            const deltaX = currentX - startCoord;

            if (Math.abs(deltaX) > sensitivity) {
                isSwiping = true;
                    if (deltaX > 0) {
                        updateQuestionDisplay(appSettings.currentQuestion - 1); // Swipe left to right (previous)
                    } else {
                        updateQuestionDisplay(appSettings.currentQuestion + 1); // Swipe right to left (next)
                    }
                // Prevent default only for significant horizontal movements to not interfere with natural vertical scrolling
                event.preventDefault();
            }
        }
    };

    const onEnd = () => {
        isSwiping = false;
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
        if (event.pointerType === 'mouse' && event.button !== 1) return;
        if (event.target.closest('#question-text')) return;
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
            onEnd();
        }
    };
}