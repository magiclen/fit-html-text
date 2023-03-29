export type FitTextOptions = {
    /**
     * In pixels. Default: `8`.
     */
    fontSizeMin?: number,
    /**
     * In pixels. Default: `Infinity`.
     */
    fontSizeMax?: number,
    /**
     * In pixels. Default: the client width of the input element.
     */
    containerMaxWidth?: number,
    /**
     * In pixels. Default: `Infinity`.
     */
    containerMaxHeight?: number,
    /**
     * Allow multiple lines. Default: `false`.
     */
    multipleLines?: boolean,
};

export const fitText = (element: HTMLElement, options? : FitTextOptions) => {
    const elementRect = element.getBoundingClientRect();

    if (typeof options === "undefined") {
        options = {};
    }

    if (typeof options.fontSizeMin === "undefined" || !(options.fontSizeMin > 0) || options.fontSizeMin === Infinity) {
        options.fontSizeMin = 8;
    }

    if (typeof options.fontSizeMax === "undefined" || !(options.fontSizeMax > 0)) {
        options.fontSizeMax = Infinity;
    }

    if (typeof options.containerMaxWidth === "undefined" || !(options.containerMaxWidth > 0) || options.containerMaxWidth === Infinity) {
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

    meassureNode.innerHTML = element.innerHTML;
    
    document.body.appendChild(meassureNode);

    let fontSize = options.fontSizeMin + 1;
    let lastFontSize = options.fontSizeMin;

    if (options.multipleLines) {
        meassureNode.style.display = "block";
        meassureNode.style.width = `${options.containerMaxWidth}px`;
        
        meassureNode.style.wordBreak = style.getPropertyValue("word-break");

        // this counter is used to avoid infinite looping
        let lastClientHeightSameCounter = 0;
        let lastClientHeight = Number.MIN_SAFE_INTEGER;

        while (fontSize <= options.fontSizeMax) {
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

        while (fontSize <= options.fontSizeMax) {
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

    element.style.fontSize = `${lastFontSize}px`;

    document.body.removeChild(meassureNode);
};
