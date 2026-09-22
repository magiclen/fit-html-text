/** The largest size to search when there is no maximum size. */
export const MAX_SEARCH_SIZE = 10_000;

/**
 * Finds the largest size that fits, from `min` to `max` in steps of 1. It uses a binary search, so
 * `fits` must be monotonic: if a size fits, every smaller size fits too. Returns `min` if no larger
 * size fits, even if `min` itself does not fit.
 */
export const findLargestFitSize = (
    fits: (size: number) => boolean,
    min: number,
    max: number,
): number => {
    // The search works on the number of steps above `min`.
    let low = 0;
    let high = Math.floor(Math.min(max, MAX_SEARCH_SIZE) - min);

    while (low < high) {
        // Round up so that the loop always makes progress when `low = mid`.
        const mid = Math.ceil((low + high) / 2);

        if (fits(min + mid)) {
            low = mid;
        } else {
            high = mid - 1;
        }
    }

    return min + low;
};
