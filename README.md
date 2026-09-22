fit-html-text
==========

[![CI](https://github.com/magiclen/fit-html-text/actions/workflows/ci.yml/badge.svg)](https://github.com/magiclen/fit-html-text/actions/workflows/ci.yml)

Fit text into its surrounding container.

## Usage

```typescript
import { fitText } from "fit-html-text";

const element = document.getElementById("myElement");

const fontSize = fitText(element, {
    minFontSize: 8,
    maxFontSize: 72,
});
```

`fitText` sets the largest font size (`element.style.fontSize`) that makes the text fit into the content box of the element, which is the box without its padding and border. It returns the font size in pixels.

If the element is not rendered (for example, it has `display: none`), has no text, or has no space, `fitText` changes nothing and returns `null`. If the text does not fit even at `minFontSize`, `minFontSize` is used.

For an `<input>` or a `<textarea>`, the text is its `value`.

### Options

| Option        | Default                                                            | Description                                    |
| ------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| `minFontSize` | `8`                                                                | The minimum font size, in pixels.              |
| `maxFontSize` | `Infinity`                                                         | The maximum font size, in pixels.              |
| `maxWidth`    | The content width of the element                                   | The maximum width of the text, in pixels.      |
| `maxHeight`   | The content height of the element in multiline mode, or `Infinity` | The maximum height of the text, in pixels.     |
| `multiline`   | `false`                                                            | Whether the text can wrap into multiple lines. |

Invalid values, such as `0`, negative numbers, and `NaN`, use the defaults. `maxFontSize: Infinity` still never goes above `10000`.

The element needs a width that does not depend on its text, such as a block element. In multiline mode, the element also needs a fixed height, or `maxHeight` needs to be set.

```typescript
fitText(element, {
    multiline: true,
});
```

### Fitting Automatically

`autoFitText` calls `fitText` now, and calls it again when the size of the element, its text, or the loaded fonts change. It returns a function that stops watching the changes.

```typescript
import { autoFitText } from "fit-html-text";

const stop = autoFitText(element, { multiline: true });

// later
stop();
```

Setting the `value` of an `<input>` or a `<textarea>` in code is not detected, so call `fitText` after doing that.

### Web Fonts

The text is measured with the fonts that are loaded at that time. If you call `fitText` yourself, wait for web fonts first.

```typescript
await document.fonts.ready;

fitText(element);
```

## React and Vue

The functions only need the DOM element, so they work with any framework. Call `autoFitText` after the element is mounted, and call the returned function when it is unmounted.

### React

```tsx
import { autoFitText } from "fit-html-text";
import { useLayoutEffect, useRef } from "react";

export function FitTitle({ text, maxFontSize }: { text: string; maxFontSize?: number }) {
    const ref = useRef<HTMLHeadingElement>(null);

    useLayoutEffect(() => {
        if (ref.current === null) {
            return;
        }

        return autoFitText(ref.current, { maxFontSize });
    }, [maxFontSize]);

    return <h1 ref={ref}>{text}</h1>;
}
```

`useLayoutEffect` fits the text before the browser paints it. `text` does not need to be a dependency, because `autoFitText` watches the text itself.

### Vue

```vue
<script setup lang="ts">
import { autoFitText } from "fit-html-text";
import { useTemplateRef, watchEffect } from "vue";

const props = defineProps<{ text: string; maxFontSize?: number }>();
const title = useTemplateRef<HTMLElement>("title");

watchEffect(
    (onCleanup) => {
        if (title.value === null) {
            return;
        }

        onCleanup(autoFitText(title.value, { maxFontSize: props.maxFontSize }));
    },
    { flush: "post" },
);
</script>

<template>
    <h1 ref="title">{{ text }}</h1>
</template>
```

The effect starts again when the element or the options change. `useTemplateRef` needs Vue 3.5 or later.

### Notes

- Do not set `font-size` on the element with the framework, such as `style={{ fontSize }}` in React or `:style` in Vue, because the framework can overwrite the font size set by `fitText`. In Vue, a `:style` string replaces the whole inline style when it changes, so use an object without `fontSize`. Set the base font size with a class or on a parent element instead.
- A controlled input in React and `v-model` in Vue set the `value` in code when the state changes. Typing is detected, but other changes are not, so call `fitText` after the value changes, for example in `useLayoutEffect` with the value as a dependency, or in `watch` with `flush: "post"`.
- jsdom has no layout, so `fitText` returns `null` and `autoFitText` changes nothing there. Tests do not need to mock `ResizeObserver`, `document.fonts`, or `requestAnimationFrame`.

## Migrating from 0.3.x

- The options are renamed: `fontMinSize` to `minFontSize`, `fontMaxSize` to `maxFontSize`, `containerMaxWidth` to `maxWidth`, `containerMaxHeight` to `maxHeight`, and `multipleLines` to `multiline`.
- `maxWidth` and `maxHeight` are the size of the content box (without the padding and border), instead of the size of the whole element.
- In multiline mode, `maxHeight` defaults to the content height of the element instead of `Infinity`.
- `fitText` returns the font size, or `null` if nothing is changed. It no longer changes the options object.
- The `engines` field requires Node.js 24 or later.

## Usage for Browsers

```html
<script src="https://cdn.jsdelivr.net/gh/magiclen/fit-html-text/dist/fit-html-text.min.js"></script>
<script>
    FitHtmlText.autoFitText(document.getElementById("myElement"));
</script>
```

[Source](demo.html)

[Demo Page](https://rawcdn.githack.com/magiclen/fit-html-text/master/demo.html)

## License

[MIT](LICENSE)
