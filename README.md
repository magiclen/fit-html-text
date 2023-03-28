fit-html-text
==========

[![CI](https://github.com/magiclen/fit-html-text/actions/workflows/ci.yml/badge.svg)](https://github.com/magiclen/fit-html-text/actions/workflows/ci.yml)

Fit text into its surrounding container.

## Usage

```typescript
import { fitText } from "fit-html-text";

const element = document.getElementById("myElement");

fitText(element, {
    fontSizeMin: 8,
    fontSizeMax: 72,
    containerMaxWidth: 300,
    containerMaxHeight: 300,
    multipleLines: false,
});
```

## Usage for Browsers

[Source](demo.html)

[Demo Page](https://rawcdn.githack.com/magiclen/fit-html-text/master/demo.html)

## License

[MIT](LICENSE)