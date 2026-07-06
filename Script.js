/**
 * Senior UX Architecture: Infinite Loop Touch/Drag Responsive Menu Carousel
 */
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const container = document.querySelector('.carousel-track-container');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const originalCards = Array.from(document.querySelectorAll('.menu-card'));
    
    // Configurable Responsive Breakpoints (matching Card Width + Gaps)
    const cardWidth = 160;
    const gap = 24;
    const scrollStep = cardWidth + gap;
    
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationId = 0;
    let autoPlayTimer = null;
    let visibleCardsCount = 6; 

    // --- INFINITE LOOP CLONING ENGINE ---
    // Clone sequences front and back to guarantee seamless dynamic looping vectors
    const cloneCount = 12; 
    for(let i = 0; i < cloneCount; i++) {
        const cloneFirst = originalCards[i % originalCards.length].cloneNode(true);
        const cloneLast = originalCards[originalCards.length - 1 - (i % originalCards.length)].cloneNode(true);
        cloneFirst.classList.add('cloned');
        cloneLast.classList.add('cloned');
        track.appendChild(cloneFirst);
        track.insertBefore(cloneLast, track.firstChild);
    }

    const totalClonesBefore = cloneCount;
    const initialOffset = -(totalClonesBefore * scrollStep);
    
    // Initialize Positioning Tracking Matrix
    currentTranslate = initialOffset;
    prevTranslate = initialOffset;
    setTrackPosition(currentTranslate);

    // --- RESPONSIVE CAPACITY MONITORING ---
    function updateResponsiveView() {
        const width = window.innerWidth;
        if (width >= 1200) visibleCardsCount = 8;
        else if (width >= 992) visibleCardsCount = 6;
        else if (width >= 768) visibleCardsCount = 4;
        else if (width >= 480) visibleCardsCount = 2;
        else visibleCardsCount = 1;
        
        // Dynamically size viewport based on accurate responsive layout structures
        container.style.width = `${(visibleCardsCount * cardWidth) + ((visibleCardsCount - 1) * gap)}px`;
    }
    
    window.addEventListener('resize', () => {
        updateResponsiveView();
        jumpToBoundary();
    });
    updateResponsiveView();

    // --- INTERSECTION OBSERVER (LAZY LOADING) ---
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    }, { root: container, rootMargin: '0px 200px 0px 200px' });

    document.querySelectorAll('.menu-img').forEach(img => lazyImageObserver.observe(img));

    // --- TRANSITION CONTROLLER ---
    function setTrackPosition(trans) {
        track.style.transform = `translateX(${trans}px)`;
    }

    function animateToPosition(target) {
        track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        currentTranslate = target;
        prevTranslate = target;
        setTrackPosition(currentTranslate);
    }

    // Seamless loop resetting without UI flash
    function jumpToBoundary() {
        track.style.transition = 'none';
        const currentElementsCount = originalCards.length;
        const totalTrackWidth = currentElementsCount * scrollStep;

        if (currentTranslate > initialOffset) {
            currentTranslate -= totalTrackWidth;
        } else if (currentTranslate < (initialOffset - totalTrackWidth)) {
            currentTranslate += totalTrackWidth;
        }
        prevTranslate = currentTranslate;
        setTrackPosition(currentTranslate);
    }

    track.addEventListener('transitionend', jumpToBoundary);

    // --- ACTION HANDLERS ---
    function moveNext() {
        animateToPosition(currentTranslate - scrollStep);
    }

    function movePrev() {
        animateToPosition(currentTranslate + scrollStep);
    }

    nextBtn.addEventListener('click', () => { moveNext(); resetAutoplay(); });
    prevBtn.addEventListener('click', () => { movePrev(); resetAutoplay(); });

    // --- AUTOPLAY LOOP MANAGER ---
    function startAutoplay() {
        if(!autoPlayTimer) {
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

    // Pause Carousel during Hover States
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
    startAutoplay();

    // --- ACCESSIBLE KEYBOARD CONTROLS ---
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { moveNext(); resetAutoplay(); }
        if (e.key === 'ArrowLeft') { movePrev(); resetAutoplay(); }
    });

    // --- MOUSE DRAG & TOUCH ACTION CONTROLS ---
    container.addEventListener('mousedown', startDrag);
    container.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, { passive: true });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    function startDrag(e) {
        isDragging = true;
        stopAutoplay();
        startX = getPositionX(e);
        track.style.transition = 'none';
        animationId = requestAnimationFrame(animationLoop);
    }

    function dragMove(e) {
        if (!isDragging) return;
        const currentX = getPositionX(e);
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animationId);

        const movedBy = currentTranslate - prevTranslate;
        // Evaluate threshold snap vector allocations
        if (movedBy < -50) moveNext();
        else if (movedBy > 50) movePrev();
        else animateToPosition(prevTranslate);

        startAutoplay();
    }

    function getPositionX(e) {
        return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    }

    function animationLoop() {
        if (isDragging) {
            setTrackPosition(currentTranslate);
            requestAnimationFrame(animationLoop);
        }
    }
});