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
     * In pixels. Default: the `clientWidth` of the input element.
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
        options.containerMaxWidth = element.clientWidth;
    }

    if (typeof options.containerMaxHeight === "undefined" || !(options.containerMaxHeight > 0)) {
        options.containerMaxHeight = Infinity;
    }

    if (typeof options.multipleLines === "undefined") {
        options.multipleLines = false;
    }

    const style = window.getComputedStyle(element);

    const meassureNode = document.createElement("_measure");

    meassureNode.style.display = "block";
    meassureNode.style.position = "absolute";
    meassureNode.style.top = "-9999px";
    meassureNode.style.left = `-${options.containerMaxWidth}px`;
    meassureNode.style.visibility = "hidden";

    meassureNode.style.padding = style.getPropertyValue("padding");
    meassureNode.style.fontFamily = style.getPropertyValue("font-family");
    meassureNode.style.letterSpacing = style.getPropertyValue("letter-spacing");

    meassureNode.innerHTML = element.innerHTML;
    
    document.body.appendChild(meassureNode);

    let fontSize = options.fontSizeMin + 1;
    let lastFontSize = options.fontSizeMin;

    if (options.multipleLines) {
        meassureNode.style.width = `${options.containerMaxWidth}px`;
        meassureNode.style.wordBreak = style.getPropertyValue("word-break");

        // this counter is used to avoid infinite looping
        let lastClientHeightSameCounter = 0;
        let lastClientHeight = Number.MIN_SAFE_INTEGER;

        while (fontSize <= options.fontSizeMax) {
            meassureNode.style.fontSize = `${fontSize}px`;
    
            if (meassureNode.clientHeight > options.containerMaxHeight) {
                break;
            }

            if (meassureNode.clientHeight === lastClientHeight) {
                lastClientHeightSameCounter += 1;

                if (lastClientHeightSameCounter === 3) {
                    break;
                }
            } else {
                lastClientHeightSameCounter = 0;
            }

            lastClientHeight = meassureNode.clientHeight;

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

            if (meassureNode.clientWidth > options.containerMaxWidth) {
                break;
            }
    
            if (meassureNode.clientHeight > options.containerMaxHeight) {
                break;
            }

            if (meassureNode.clientWidth === lastClientWidth) {
                lastClientWidthSameCounter += 1;

                if (lastClientWidthSameCounter === 3) {
                    break;
                }
            } else {
                lastClientWidthSameCounter = 0;
            }

            const diffWidth = meassureNode.clientWidth - lastClientWidth;
            const diffHeight = meassureNode.clientHeight - lastClientHeight;

            lastClientWidth = meassureNode.clientWidth;
            lastClientHeight = meassureNode.clientHeight;

            lastFontSize = fontSize;

            const step = Math.max(1, Math.floor(Math.min((options.containerMaxWidth - meassureNode.clientWidth) / (diffWidth + 3), (options.containerMaxHeight - meassureNode.clientHeight) / (diffHeight + 3))));

            fontSize += step;
        }
    }

    element.style.fontSize = `${lastFontSize}px`;

    document.body.removeChild(meassureNode);
};
