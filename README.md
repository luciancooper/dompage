# dompage


## Buttons

Check out this [example page](https://luciancooper.github.io/dompage/)

### `btn`
The `btn` class can be added to any element to give it the appearance of a button. 

```html
<span class='btn'>I am a Button</span>
```

### `btn-grp`
The `btn-grp` class can be added to any element to give it the appearance of a group of buttons. All of its children will gain the appearance of a button, as if they were given the `btn` class attribute. Giving a `btn-grp` element the additional `x` class attribute will align its children horizontally, while the `y` class will align them vertically. 

```html
<div class='btn-grp y'>
	<span>I am a Grouped Button</span>
	<span>I am another Grouped Button</span>
</div>
```

### `btn-set`
`btn-set` elements can contain both `btn` and `btn-grp` elements, as well as other `btn-set` elements. The root `btn-set` element must also contain an additional class attribute, either `x` to align children horizontally, or `y` to align them vertically. 		

```html
<div class='btn-set y'>
	<span class='btn'>I am a Button in the set</span>
	<div class='btn-grp'>
		<span>I am a Grouped Button within a Set</span>
		<span>I am another Grouped Button within a Set</span>
	</div>
	<span class='btn'>I am another Button in the Set</span>
</div>
```

## Button Themes

The following class attributes can be added to `btn`, `btn-grp`, and `btn-set` elements to theme their appearance.

 * `ui-vib`
 * `ui-flat`
 * `ui-blue`
 * `ui-dark`
