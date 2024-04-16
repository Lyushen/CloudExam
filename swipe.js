function initializeSwipeHandling() {
    let startCoord = 0;
    let isSwiping = false;
    let sens_percent_value = 0.2; // 20% of the screen
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

                // Determine swipe direction and update display accordingly
                if (deltaX > 0) {
                    updateQuestionDisplay(currentIndex + 1); // Swipe left to right (next)
                } else {
                    updateQuestionDisplay(currentIndex - 1); // Swipe right to left (previous)
                }
            }
        }
    };

    const onEnd = () => {
        isSwiping = false;
    };

    // Touch Event Handlers
    document.addEventListener('touchstart', (event) => {
        if (event.target.closest('#question-text')) return;
        const touch = event.touches[0];
        onStart(touch.clientX);
    }, { passive: false });

    document.addEventListener('touchmove', (event) => {
        onMove(event.touches[0].clientX);
        event.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', onEnd);

    // Pointer Event Handlers (for mouse)
    document.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (event.target.closest('#question-text')) return;
        onStart(event.clientX);
        document.addEventListener('pointermove', onPointerMove, { passive: false });
        document.addEventListener('pointerup', onPointerEnd);
    });

    const onPointerMove = (event) => {
        if (event.pointerType === 'mouse') {
            onMove(event.clientX);
            event.preventDefault();
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

document.addEventListener('DOMContentLoaded', initializeSwipeHandling);
