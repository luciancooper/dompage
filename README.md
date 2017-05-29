# dompage


## Buttons

Check out this [example page](https://luciancooper.github.io/dompage/)

### Individual Buttons

#### `btn`
The `btn` class can be added to any element to give it the appearance of a button. 

```html
<span class='btn'>I am a Button</span>
```

#### `<input>`

The same effect can be applied to `<input>` elements, to take advantage of the `checkbox` and `radio` types to control the button's state. The `value` attribute will act as the button label. Alternatively, the `text` attribute can be specified to override this label.

```html
<input class='btn' type='checkbox' value='Button Value' text='I am a Button'/>
```

#### `<label>`

`<label>` elements can be used for buttons with more complex content that still want to take advantage of the `checkbox` and `radio` input types. The first child of the `<label>` element must an `<input>`, while the second must be a `<span>` element containing all of the button's visible content.

```html
<label class="btn">
	<input type="checkbox" value='Button Value'>
	<span>I am a Button <em>with Emphasis</em></span>
</label>
```

#### `<button>`
All `<button>` elements automatically gain this appearance (`btn` class is not needed). 

```html
<button>I am a Button</button>
```

### Grouped Buttons

#### `btn-grp`
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

#### `tab-grp`
The `tab-grp` class can be added to any element to give it the appearance of a group of tabs. It works exactly like `btn-grp`. By default, `tab-grp` children are aligned horizontally; adding the additional `col` class will align them vertically. 

```html
<div class='tab-grp'>
    <span>Tab</span>
    <input type='checkbox' text='&lt;input&gt; Tab'/>
    <label>
        <input type="checkbox">
        <span>&lt;label&gt; Tab</span>
    </label>
    <button>&lt;button&gt; Tab</button>
</div>
```

#### `btn-set`
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

The following class attributes can be added to individual buttons, `btn-grp`, `tab-grp`, and `btn-set` elements to theme their appearance.

 * `ui-vib`
 * `ui-flat`
 * `ui-blue`
 * `ui-red`
 * `ui-green`
 * `ui-dark`
