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
