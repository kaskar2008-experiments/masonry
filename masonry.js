window.masonry = (() => {
  /**
   * @type HTMLElement[]
   */
  let nodes = [];
  let columns = 0;
  let cardSize = 100;
  let gap = '10px';
  let afterColumnsUpdateCB = () => {};
  /**
   * @type HTMLElement | null
   */
  const masonryContainer = document.querySelector('.masonry');

  if (!masonryContainer) {
    return;
  }

  fillNodesList();

  function update() {
    const style = getComputedStyle(masonryContainer);
    cardSize = (style.getPropertyValue('--card-width') || cardSize);
    gap = style.getPropertyValue('--gap') || gap;
    calculateColumns(masonryContainer.clientWidth);
  }

  update();

  /**
   *
   * @param {Number} w
   */
  function calculateColumns(w) {
    const gapClean = parseInt(gap);
    const columnsWithoutGaps = Math.floor(w / cardSize);
    const newColumns = Math.floor((w - (gapClean * columnsWithoutGaps)) / cardSize);
    setColumnsCount(newColumns);
  }

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentBoxSize) {
        // Firefox implements `contentBoxSize` as a single content rect, rather than an array
        const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
        calculateColumns(contentBoxSize.inlineSize);
      }
    }
  });

  const cardSizeObserver = new MutationObserver((records) => {
    console.log('cardSizeObserver', records);
    // update();
  });

  function fillNodesList() {
    nodes = document.querySelectorAll('.card');
  }

  function afterColumnsUpdate(cb) {
    afterColumnsUpdateCB = cb;
  }

  /**
   *
   * @param {Number} n
   * @returns
   */
  function setColumnsCount(n) {
    if (columns === n) {
      return;
    }

    columns = n;

    /**
     * @type HTMLElement[]
     */
    const columnNodes = [];

    for (let i = 0; i < columns; i++) {
      const colNode = document.createElement('div');

      colNode.classList.add('column');
      columnNodes.push(colNode);
    }

    nodes.forEach((el, i) => {
      columnNodes[(i+columns)%columns].appendChild(el);
    });

    window.requestAnimationFrame(() => {
      const wrapper = document.createElement('div');
      wrapper.append(...columnNodes);
      masonryContainer.innerHTML = wrapper.innerHTML;
      afterColumnsUpdateCB();
    });
  }
  resizeObserver.observe(masonryContainer);

  setTimeout(() => {
    cardSizeObserver.observe(document.querySelector('.masonry'), {subtree: true, characterDataOldValue: cardSize});
  }, 500);

  return {
    update,
    afterColumnsUpdate,
  }
})();
