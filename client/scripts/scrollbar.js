let updateScroller = () => { };

const initScroller = () => {
    const scrollContainer = document.querySelector('.scrollable');
    const scrollContentWrapper = document.querySelector('.scrollable .content-wrapper');
    let contentPosition = 0;
    let scrollerBeingDragged = false;
    let scroller;
    let topPosition;
    let scrollerHeight;
    let inited = false;

    const calculateScrollerHeight = () => {
        const visibleRatio = scrollContainer.offsetHeight / scrollContentWrapper.scrollHeight;
        return visibleRatio * scrollContainer.offsetHeight;
    }

    const moveScroller = (evt) => {
        const scrollPercentage = evt.target.scrollTop / scrollContentWrapper.scrollHeight;
        topPosition = scrollPercentage * (scrollContainer.offsetHeight - 5);
        scroller.style.top = topPosition + 'px';
    }

    const startDrag = (evt) => {
        normalizedPosition = evt.pageY;
        contentPosition = scrollContentWrapper.scrollTop;
        scrollerBeingDragged = true;
    }

    const stopDrag = (evt) => {
        scrollerBeingDragged = false;
    }

    const scrollBarScroll = (evt) => {
        if (scrollerBeingDragged === true) {
            const mouseDifferential = evt.pageY - normalizedPosition;
            const scrollEquivalent = mouseDifferential * (scrollContentWrapper.scrollHeight / scrollContainer.offsetHeight);
            scrollContentWrapper.scrollTop = contentPosition + scrollEquivalent;
        }
    }

    const createScroller = () => {
        scroller = document.createElement("div");
        scroller.className = 'scroller';
        scroller.id = 'chat_scroller';
        scrollerHeight = calculateScrollerHeight();
        if (scrollerHeight / scrollContainer.offsetHeight < 1) {
            scroller.style.height = scrollerHeight + 'px';
            scrollContainer.appendChild(scroller);
            inited = true;
            scrollContainer.className += ' showScroll';
            scroller.addEventListener('mousedown', startDrag);
            window.addEventListener('mouseup', stopDrag);
            window.addEventListener('mousemove', scrollBarScroll)
        }
    }

    updateScroller = () => {
        if (!inited)
            createScroller();
        else {
            scrollerHeight = calculateScrollerHeight();
            if (scrollerHeight / scrollContainer.offsetHeight < 1) {
                scroller.style.height = scrollerHeight + 'px';
                topPosition = 100 * (scrollContainer.offsetHeight - 5)
                scroller.style.top = topPosition + 'px'; //TODO
                scroller.hidden = false;
            }
            else {
                scroller.hidden = true;
            }
        }
    }

    createScroller();
    scrollContentWrapper.addEventListener('scroll', moveScroller);
}
initScroller();