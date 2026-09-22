import { findLargestFitSize } from "./search.ts";

/** The size of the content box of an element, in pixels. */
export interface ContentSize {
    width: number;
    height: number;
}

/** The resolved options of `fitText`. */
export interface MeasureOptions {
    minFontSize: number;
    maxFontSize: number;
    maxWidth: number;
    maxHeight: number;
    multiline: boolean;
}

// Text properties copied from an `<input>` or a `<textarea>` to its measuring element.
const TEXT_PROPERTIES = [
    "font-family",
    "font-style",
    "font-weight",
    "font-stretch",
    "font-variant",
    "font-feature-settings",
    "font-variation-settings",
    "font-kerning",
    "text-transform",
    "tab-size",
    "word-break",
    "overflow-wrap",
    "hyphens",
];

// Text properties whose pixel values are converted to `em`, so that they grow with the font size.
const SCALED_TEXT_PROPERTIES = ["line-height", "letter-spacing", "word-spacing"];

/** Parses a CSS pixel value such as `12.5px`. Returns `0` if it is not a number. */
const toPixels = (value: string): number => {
    const pixels = Number.parseFloat(value);

    return Number.isFinite(pixels) ? pixels : 0;
};

// `important` is used so that `!important` rules in style sheets cannot change the measuring element.
const setStyle = (node: HTMLElement, name: string, value: string): void => {
    node.style.setProperty(name, value, "important");
};

/** Checks whether the element is an `<input>` or a `<textarea>`, whose text is its `value`. */
export const isTextControl = (
    element: HTMLElement,
): element is HTMLInputElement | HTMLTextAreaElement =>
    element.localName === "input" || element.localName === "textarea";

/**
 * Gets the size of the content box (without the padding and the border) from the computed style of
 * an element.
 */
export const getContentSize = (style: CSSStyleDeclaration): ContentSize => {
    let width = toPixels(style.width);
    let height = toPixels(style.height);

    // The resolved `width` and `height` include the padding and the border for `border-box`.
    if (style.boxSizing === "border-box") {
        width -=
            toPixels(style.paddingLeft) +
            toPixels(style.paddingRight) +
            toPixels(style.borderLeftWidth) +
            toPixels(style.borderRightWidth);
        height -=
            toPixels(style.paddingTop) +
            toPixels(style.paddingBottom) +
            toPixels(style.borderTopWidth) +
            toPixels(style.borderBottomWidth);
    }

    return { width, height };
};

/**
 * Creates a hidden element that has the same text and text styles as `element`. Its size is the
 * size of the text, because its padding and border are removed. It needs to be inserted next to
 * `element`, so that it inherits the same styles.
 */
const createMeasureNode = (
    element: HTMLElement,
    style: CSSStyleDeclaration,
    multiline: boolean,
    maxWidth: number,
): HTMLElement => {
    let node: HTMLElement;

    if (isTextControl(element)) {
        // The width of the text in a text control cannot be read, so a `<span>` with the same text styles is used.
        node = element.ownerDocument.createElement("span");
        node.textContent = element.value;

        for (const name of TEXT_PROPERTIES) {
            setStyle(node, name, style.getPropertyValue(name));
        }

        const fontSize = toPixels(style.fontSize);

        for (const name of SCALED_TEXT_PROPERTIES) {
            const value = style.getPropertyValue(name);

            setStyle(
                node,
                name,
                value.endsWith("px") && fontSize > 0 ? `${toPixels(value) / fontSize}em` : value,
            );
        }

        // An `<input>` keeps all spaces in one line, and a `<textarea>` wraps text like itself.
        setStyle(
            node,
            "white-space",
            multiline && element.localName === "textarea"
                ? style.getPropertyValue("white-space")
                : "pre",
        );
    } else {
        // A clone matches the same style rules as `element`, so its text looks the same.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a clone has the same type as the original
        node = element.cloneNode(true) as HTMLElement;

        if (!multiline) {
            setStyle(node, "white-space", "nowrap");
        }
    }

    setStyle(node, "position", "absolute");
    setStyle(node, "top", "0");
    setStyle(node, "left", "0");
    setStyle(node, "right", "auto");
    setStyle(node, "bottom", "auto");
    setStyle(node, "visibility", "hidden");
    setStyle(node, "pointer-events", "none");
    setStyle(node, "margin", "0");
    setStyle(node, "padding", "0");
    setStyle(node, "border", "none");
    setStyle(node, "box-sizing", "content-box");
    setStyle(node, "width", multiline ? `${maxWidth}px` : "max-content");
    setStyle(node, "min-width", "0");
    setStyle(node, "max-width", "none");
    setStyle(node, "height", "auto");
    setStyle(node, "min-height", "0");
    setStyle(node, "max-height", "none");
    // A transition or an animation would delay the new font size.
    setStyle(node, "transition", "none");
    setStyle(node, "animation", "none");

    return node;
};

/**
 * Finds the largest font size that makes the text of `element` fit. It measures a hidden copy of
 * the text next to `element`, and removes the copy before returning.
 */
export const measureFontSize = (
    element: HTMLElement,
    view: Window,
    style: CSSStyleDeclaration,
    options: MeasureOptions,
): number => {
    const { minFontSize, maxFontSize, maxWidth, maxHeight, multiline } = options;
    const node = createMeasureNode(element, style, multiline, maxWidth);

    element.after(node);

    try {
        // A computed style is live, so it can be read again after changing the font size.
        const nodeStyle = view.getComputedStyle(node);

        const fits = (fontSize: number): boolean => {
            setStyle(node, "font-size", `${fontSize}px`);

            if (toPixels(nodeStyle.height) > maxHeight) {
                return false;
            }

            // In multiline mode, the width is fixed, so a long word that cannot wrap makes the content overflow.
            return multiline
                ? node.scrollWidth <= node.clientWidth
                : toPixels(nodeStyle.width) <= maxWidth;
        };

        return findLargestFitSize(fits, minFontSize, maxFontSize);
    } finally {
        node.remove();
    }
};
