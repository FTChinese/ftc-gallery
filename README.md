## Two Ideas
Gallery content can come from:<br>
1. HTML already in the DOM
2. Data passed to javascript via a configuration object

In both cases,there must be an **root element** already in the DOM to construct the Gallery in.

## Three Methods
1. Declaratively from HTML(在HTML中声明)
2. Imperatively from HTML(在HTML中命令)
3. Imperatively from JS data(在JS中命令)

### 1. Declaratively from HTML
If there are already HTML in the page,this way can search for Gallery HTML elements and automatically construct a Gallery for each one:
