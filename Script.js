/**
 * Infinite Loop Touch/Drag Responsive Menu Carousel Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const container = document.querySelector('.carousel-track-container');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const originalCards = Array.from(track.children);
    
    // Configurable Responsive Breakpoints Metrics
    const cardWidth = 160;
    const gap = 24;
    const scrollStep = cardWidth + gap;
    const totalOriginals = originalCards.length;
    
    let currentIndex = totalOriginals; // Center baseline start position post-cloning
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let autoPlayTimer = null;

    // --- INFINITE LOOP CLONING ENGINE ---
    // Clone complete card set to left and right sides to handle high-width displays cleanly
    originalCards.forEach(card => {
        const cloneLast = card.cloneNode(true);
        cloneLast.classList.add('cloned');
        track.appendChild(cloneLast);
    });

    originalCards.slice().reverse().forEach(card => {
        const cloneFirst = card.cloneNode(true);
        cloneFirst.classList.add('cloned');
        track.insertBefore(cloneFirst, track.firstChild);
    });

    // Update coordinates positions 
    function updatePosition() {
        currentTranslate = -currentIndex * scrollStep;
        prevTranslate = currentTranslate;
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    // Initialize baseline alignment offset position
    track.style.transition = 'none';
    updatePosition();

    // --- RESPONSIVE MAX-WIDTH ADJUSTMENTS ---
    function updateResponsiveView() {
        const width = window.innerWidth;
        let visibleCardsCount = 6;

        if (width >= 1200) visibleCardsCount = 6;
        else if (width >= 992) visibleCardsCount = 5;
        else if (width >= 768) visibleCardsCount = 3;
        else if (width >= 480) visibleCardsCount = 2;
        else visibleCardsCount = 1;

        container.style.maxWidth = `${(visibleCardsCount * cardWidth) + ((visibleCardsCount - 1) * gap)}px`;
        track.style.transition = 'none';
        updatePosition();
    }
    
    window.addEventListener('resize', updateResponsiveView);
    updateResponsiveView();

    // --- CAROUSEL ANIMATOR / CYCLE CONTROLLERS ---
    function moveToIndex(index, animate = true) {
        currentIndex = index;
        if (animate) {
            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
            track.style.transition = 'none';
        }
        updatePosition();
    }

    function moveNext() {
        moveToIndex(currentIndex + 1);
    }

    function movePrev() {
        moveToIndex(currentIndex - 1);
    }

    // Boundary edge warping loops check
    track.addEventListener('transitionend', () => {
        if (currentIndex >= totalOriginals * 2) {
            moveToIndex(currentIndex - totalOriginals, false);
        } else if (currentIndex < totalOriginals) {
            moveToIndex(currentIndex + totalOriginals, false);
        }
    });

    // Arrow controls assignments
    nextBtn.addEventListener('click', () => { moveNext(); resetAutoplay(); });
    prevBtn.addEventListener('click', () => { movePrev(); resetAutoplay(); });

    // --- AUTOPLAY LOOP CONTROLS ---
    function startAutoplay() {
        if (!autoPlayTimer) {
            autoPlayTimer = setInterval(moveNext, 3000);
        }
    }

    function stopAutoplay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Pause on hovering interactions
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
    startAutoplay();

    // Accessible hotkeys bindings
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { moveNext(); resetAutoplay(); }
        if (e.key === 'ArrowLeft') { movePrev(); resetAutoplay(); }
    });

    // --- POINTER / DRAG AND TOUCH CONFIGURATION ---
    container.addEventListener('mousedown', startDrag);
    container.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, { passive: true });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    function getPositionX(e) {
        return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    }

    function startDrag(e) {
        isDragging = true;
        stopAutoplay();
        startX = getPositionX(e);
        track.style.transition = 'none';
    }

    function dragMove(e) {
        if (!isDragging) return;
        const currentX = getPositionX(e);
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        
        const movedBy = currentTranslate - prevTranslate;
        
        // Threshold check to trigger card index switches
        if (movedBy < -50) {
            moveNext();
        } else if (movedBy > 50) {
            movePrev();
        } else {
            moveToIndex(currentIndex); // Snap back to current element
        }
        startAutoplay();
    }
});