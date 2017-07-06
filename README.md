# dompage

## Page Guide

This is a simple library for structuring basic webpages with minimial setup. It can be added to a webpage with the following:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/luciancooper/dompage/dist/page.min.css">
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/luciancooper/dompage/dist/page.min.js"></script>
```

### Basic Usage 

These attributes are added to `<body>` to specify the `id` of particular components within the page:

 * `page-main`
 * `page-panel-left`
 * `page-panel-right`
 * `page-topbar`
    
The only requirement for this library to function is the `page-main` attribute must be specified to the `id` of an existing child element of the `<body>`. The following is a simple example:

```html
<body page-main='main'>
    <main id='main'>
        ...
    </main>
</body>
```

#### Top Bar

A top bar can be added to a page using the `page-topbar` attribute like this:

```html
<body page-main='main' page-topbar='topbar'>
    <header id='topbar'>
        ...
    </header>
    <main id='main'>
        ...
    </main>
</body>
```

#### Left/Right Panels

Left and right panels can be specified using the `page-panel-left` and `page-panel-right` attributes. These elements must also be children of the `<body>`:

```html
<body page-main='main' page-panel-left='left' page-panel-right='right'>
    <section id='left'>
        ...
    </section>
    <section id='right'>
        ...
    </section>
    <main id='main'>
        ...
    </main>
</body>
```

Panel display toggling can be setup by adding the `hide-toggle` attribute to the panel element. It must be set to the `id` of either an `input[type='checkbox']` or `label` element elsewhere in the page:

```html
...
<header id='topbar'>
    <label id='left-toggle'>&#8801;</label>
</header>
<section id='left' hide-toggle='left-toggle'>
    ...
</section>
...
```

#### Tabbed Content

The content of the `page-main` element can be separated into distinct tabs by adding the `page-tabbed` attribute. It must be set to the `id` of a `<form>` containing a set of `<input type='radio' name='tab'>` elements. The `value` attribute of each `<input>` element must be set to the `id` of an existing child of the `page-main` element, or else that `<input>` will be disabled.

```html
<body page-main='main' page-panel-left='left'>
    <section id='left'>
        <form id='tabs' class='side-nav'>
            <input type='radio' name='tab' value='tab1'>
            <input type='radio' name='tab' value='tab2'>
            <input type='radio' name='tab' value='tab3'>
        </form>
    </section>
    <main id='main' page-tabbed='tabs'>
        <div id='tab1'> ... </div>
        <div id='tab2'> ... </div>
        <div id='tab3'> ... </div>
    </main>
</body>
```

## Buttons

Include button styling in a page with this stylesheet:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/luciancooper/dompage/dist/buttons.min.css">
```

Check out this [example page](https://luciancooper.github.io/dompage/)

### Individual Buttons

The `btn` class can be added to any element to give it the appearance of a button. 

```html
<span class='btn'>I am a Button</span>
```

The same effect can be applied to `<input>` elements, to take advantage of the `checkbox` and `radio` types to control the button's state. The `value` attribute will act as the button label. Alternatively, the `text` attribute can be specified to override this label.

```html
<input class='btn' type='checkbox' value='Button Value' text='I am a Button'/>
```

`<label>` elements can be used for buttons with more complex content that still want to take advantage of the `checkbox` and `radio` input types. The `<input>` in this case must be the first child the `<label>` element. All of the button's visible content must be placed in a container element (such as a `<span>` or `<div>`) that is the last child of the `<label>`. 

```html
<label class="btn">
	<input type="checkbox" value='Button Value'>
	<span>I am a Button <em>with Emphasis</em></span>
</label>
```

All `<button>` elements automatically gain this appearance (`btn` class is not needed). 

```html
<button>I am a Button</button>
```

### Grouped Buttons

The `btn-grp` class can be added to any element to give it the appearance of a group of buttons. All of its children will gain the appearance of the buttons described above, but specifying the `btn` class is not needed. By default, `btn-grp` children are aligned horizontally; adding the additional `col` class will align them vertically.

```html
<div class='btn-grp'>
    <span>Grouped Button</span>
    <input type='checkbox' text='Grouped &lt;input&gt; Button'/>
    <label>
        <input type="checkbox">
        <span>Grouped &lt;label&gt; Button</span>
    </label>
    <button>Grouped &lt;button&gt; Button</button>
</div>
```

Optionally, `btn-grp` elements can be styled like tabs by adding the `tabs` class.

`btn-set` elements can contain both `btn` and `btn-grp` elements, as well as other `btn-set` elements. By default, `btn-set` children are aligned horizontally; adding the additional `col` class to the root `btn-set` will align them vertically. 		

```html
<div class='btn-set'>
	<span class='btn'>I am a Button in the set</span>
	<div class='btn-grp'>
		<span>I am a Grouped Button within a Set</span>
		<span>I am another Grouped Button within a Set</span>
	</div>
	<span class='btn'>I am another Button in the Set</span>
</div>
```

### Button Themes

The following class attributes can be added to individual buttons, `btn-grp`, and `btn-set` elements to theme their appearance.

 * [`ui-vib`](https://luciancooper.github.io/dompage/index.html#vib)
 * [`ui-flat`](https://luciancooper.github.io/dompage/index.html#flat)
 * [`ui-blue`](https://luciancooper.github.io/dompage/index.html#blue)
 * [`ui-red`](https://luciancooper.github.io/dompage/index.html#red)
 * [`ui-green`](https://luciancooper.github.io/dompage/index.html#green)
 * [`ui-dark`](https://luciancooper.github.io/dompage/index.html#dark)
