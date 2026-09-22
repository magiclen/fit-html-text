import type { ContentSize } from "./measure.ts";
import { getContentSize, isTextControl, measureFontSize } from "./measure.ts";

/**
 * Options for `fitText` and `autoFitText`. Invalid values, such as `0`, negative numbers, and
 * `NaN`, use the defaults.
 */
export interface FitTextOptions {
    /**
     * The minimum font size, in pixels.
     *
     * @default 8
     */
    minFontSize?: number;

    /**
     * The maximum font size, in pixels. `Infinity` means no limit, but the font size never goes
     * above 10000.
     *
     * @default Infinity
     */
    maxFontSize?: number;

    /**
     * The maximum width of the text, in pixels.
     *
     * @default The content width of the element (without its padding and border).
     */
    maxWidth?: number;

    /**
     * The maximum height of the text, in pixels. `Infinity` means no limit.
     *
     * @default The content height of the element if `multiline` is `true`, otherwise `Infinity`.
     */
    maxHeight?: number;

    /**
     * Whether the text can wrap into multiple lines. In this mode, the element needs a fixed
     * height, or `maxHeight` needs to be set.
     *
     * @default false
     */
    multiline?: boolean;
}

const DEFAULT_MIN_FONT_SIZE = 8;

const isPositive = (value: number | undefined): value is number =>
    typeof value === "number" && value > 0;

const isFinitePositive = (value: number | undefined): value is number =>
    isPositive(value) && Number.isFinite(value);

/**
 * Sets the largest font size that makes the text of the element fit into its content box, or into
 * `maxWidth` and `maxHeight`. The text of an `<input>` or a `<textarea>` is its `value`. If the
 * text does not fit even at `minFontSize`, `minFontSize` is used.
 *
 * @returns The font size that is set, in pixels. It is `null` if nothing is changed, because the
 *   element is not rendered, has no text, or has no space.
 */
export const fitText = (
    element: HTMLElement,
    options: Readonly<FitTextOptions> = {},
): number | null => {
    const document = element.ownerDocument;
    const view = document.defaultView;
    const parent = element.parentNode;

    // The measuring element is inserted next to `element`, so `element` needs a parent other than the document.
    if (
        view === null ||
        parent === null ||
        parent === document ||
        element.getClientRects().length === 0
    ) {
        return null;
    }

    const text = isTextControl(element) ? element.value : (element.textContent ?? "");

    if (text.trim().length === 0) {
        return null;
    }

    const style = view.getComputedStyle(element);
    const contentSize = getContentSize(style);
    const multiline = options.multiline === true;

    const maxWidth = isFinitePositive(options.maxWidth) ? options.maxWidth : contentSize.width;
    const maxHeight = isPositive(options.maxHeight)
        ? options.maxHeight
        : multiline
          ? contentSize.height
          : Infinity;

    if (!(maxWidth > 0 && maxHeight > 0)) {
        return null;
    }

    const fontSize = measureFontSize(element, view, style, {
        minFontSize: isFinitePositive(options.minFontSize)
            ? options.minFontSize
            : DEFAULT_MIN_FONT_SIZE,
        maxFontSize: isPositive(options.maxFontSize) ? options.maxFontSize : Infinity,
        maxWidth,
        maxHeight,
        multiline,
    });

    element.style.fontSize = `${fontSize}px`;

    return fontSize;
};

/**
 * Calls `fitText` now, and calls it again when the size of the element, its text, or the loaded
 * fonts change. Changing the text by setting the `value` of an `<input>` or a `<textarea>` in code
 * is not detected, so call `fitText` after doing that.
 *
 * @returns A function that stops watching the changes.
 */
export const autoFitText = (
    element: HTMLElement,
    options: Readonly<FitTextOptions> = {},
): (() => void) => {
    const document = element.ownerDocument;
    const view = document.defaultView;

    if (view === null) {
        return (): void => {};
    }

    // Copy the options, so that later changes to them do not affect this watcher.
    const fitOptions = { ...options };

    let frame: number | undefined;
    let fittedSize: ContentSize | undefined;

    const fit = (): void => {
        frame = undefined;

        fitText(element, fitOptions);

        // The new font size can resize the element, and this size is remembered so that such a resize does not fit the text again.
        fittedSize = getContentSize(view.getComputedStyle(element));
    };

    // Fit the text at most once per frame.
    const scheduleFit = (): void => {
        if (typeof frame === "undefined") {
            frame = view.requestAnimationFrame(fit);
        }
    };

    const resizeObserver = new view.ResizeObserver(() => {
        const size = getContentSize(view.getComputedStyle(element));

        if (size.width !== fittedSize?.width || size.height !== fittedSize.height) {
            scheduleFit();
        }
    });

    const mutationObserver = new view.MutationObserver(scheduleFit);

    fit();

    resizeObserver.observe(element);
    mutationObserver.observe(element, { characterData: true, childList: true, subtree: true });
    element.addEventListener("input", scheduleFit);
    document.fonts.addEventListener("loadingdone", scheduleFit);

    return (): void => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        element.removeEventListener("input", scheduleFit);
        document.fonts.removeEventListener("loadingdone", scheduleFit);

        if (typeof frame !== "undefined") {
            view.cancelAnimationFrame(frame);
            frame = undefined;
        }
    };
};
