export interface FitTextOptions {
    /**
     * The minimum font size, in pixels.
     *
     * @default 8
     */
    fontMinSize?: number,
    /**
     * The maximum font size, in pixels.
     *
     * Set to `Infinity` means unlimited.
     *
     * @default Infinity
     */
    fontMaxSize?: number,
    /**
     * The maximum width for text, in pixels.
     *
     * @default element.getBoundingClientRect().width
     */
    containerMaxWidth?: number,
    /**
     * The maximum height for text, in pixels.
     *
     * If `multipleLines` is set to `true`, this option should also be set to a reasonable integer.
     *
     * Set to `Infinity` means unlimited.
     *
     * @default Infinity
     */
    containerMaxHeight?: number,
    /**
     * Whether to allow multiple lines.
     *
     * If the text allows line break or multiple lines, this option should be set to `true`.
     *
     * @default false
     */
    multipleLines?: boolean,
}

export const fitText = (element: HTMLElement, options? : FitTextOptions) => {
    if (typeof options === "undefined") {
        options = {};
    }

    if (typeof options.fontMinSize === "undefined" || !(options.fontMinSize > 0) || options.fontMinSize === Infinity) {
        options.fontMinSize = 8;
    }

    if (typeof options.fontMaxSize === "undefined" || !(options.fontMaxSize > 0)) {
        options.fontMaxSize = Infinity;
    }

    if (typeof options.containerMaxWidth === "undefined" || !(options.containerMaxWidth > 0) || options.containerMaxWidth === Infinity) {
        const elementRect = element.getBoundingClientRect();

        options.containerMaxWidth = elementRect.width;
    }

    if (typeof options.containerMaxHeight === "undefined" || !(options.containerMaxHeight > 0)) {
        options.containerMaxHeight = Infinity;
    }

    if (typeof options.multipleLines === "undefined") {
        options.multipleLines = false;
    }

    const style = window.getComputedStyle(element);

    const meassureNode = document.createElement("_measure");

    meassureNode.style.position = "absolute";
    meassureNode.style.top = "-9999px";
    meassureNode.style.left = `-${options.containerMaxWidth}px`;
    meassureNode.style.visibility = "hidden";

    meassureNode.style.border = style.getPropertyValue("border");
    meassureNode.style.boxSizing = style.getPropertyValue("box-sizing");
    meassureNode.style.padding = style.getPropertyValue("padding");
    meassureNode.style.fontFamily = style.getPropertyValue("font-family");
    meassureNode.style.letterSpacing = style.getPropertyValue("letter-spacing");

    if (element instanceof HTMLInputElement) {
        meassureNode.innerText = element.value;
    } else {
        meassureNode.innerHTML = element.innerHTML;
    }
    
    document.body.appendChild(meassureNode);

    let fontSize = options.fontMinSize + 1;
    let lastFontSize = options.fontMinSize;

    if (options.multipleLines) {
        meassureNode.style.display = "block";
        meassureNode.style.width = `${options.containerMaxWidth}px`;
        
        meassureNode.style.wordBreak = style.getPropertyValue("word-break");

        // this counter is used to avoid infinite looping
        let lastClientHeightSameCounter = 0;
        let lastClientHeight = Number.MIN_SAFE_INTEGER;

        while (fontSize <= options.fontMaxSize) {
            meassureNode.style.fontSize = `${fontSize}px`;

            const rect = meassureNode.getBoundingClientRect();
    
            if (rect.height > options.containerMaxHeight) {
                break;
            }

            if (rect.height === lastClientHeight) {
                lastClientHeightSameCounter += 1;

                if (lastClientHeightSameCounter === 3) {
                    break;
                }
            } else {
                lastClientHeightSameCounter = 0;
            }

            lastClientHeight = rect.height;

            lastFontSize = fontSize;

            fontSize += 1;
        }
    } else {
        // this counter is used to avoid infinite looping
        let lastClientWidthSameCounter = 0;
        let lastClientWidth = Number.MIN_SAFE_INTEGER;
        let lastClientHeight = Number.MIN_SAFE_INTEGER;

        while (fontSize <= options.fontMaxSize) {
            meassureNode.style.fontSize = `${fontSize}px`;

            const rect = meassureNode.getBoundingClientRect();

            if (rect.width > options.containerMaxWidth) {
                break;
            }
    
            if (rect.height > options.containerMaxHeight) {
                break;
            }

            if (rect.width === lastClientWidth) {
                lastClientWidthSameCounter += 1;

                if (lastClientWidthSameCounter === 3) {
                    break;
                }
            } else {
                lastClientWidthSameCounter = 0;
            }

            const diffWidth = rect.width - lastClientWidth;
            const diffHeight = rect.height - lastClientHeight;

            lastClientWidth = rect.width;
            lastClientHeight = rect.height;

            lastFontSize = fontSize;

            const step = Math.max(1, Math.floor(Math.min((options.containerMaxWidth - rect.width) / (diffWidth + 3), (options.containerMaxHeight - rect.height) / (diffHeight + 3))));

            fontSize += step;
        }
    }

    document.body.removeChild(meassureNode);

    element.style.fontSize = `${lastFontSize}px`;
};
