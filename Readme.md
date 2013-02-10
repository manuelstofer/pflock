# Pflock

![Pfock](https://raw.github.com/manuelstofer/pflock/master/resources/pflock.jpg)

Pflock is an [component](http://github.com/component/) for binding data to a input
fields, content editables etc.

It works in both directions. When the data changes Pflock
can update the document and the other way around.

[Demo](http://manuelstofer.github.com/pflock/)

## Installation

```
$ component install manuelstofer/pflock
```

## Bindings
Pflock is template language agnostic. Bindings are done using x-bind attribute.


### Bind value

```HTML
<input type="text" x-bind="value:.user.name" />
```

### Bind inner HTML

```HTML
<p contenteditable x-bind=".user.description"></p>
```

### Bind attribute

```HTML
<img src="image.jpg" x-bind="src:.user.image"/>

```

## API

```Javascript
var pflock = require('pflock');
var data = {
  user: {
    name: 'Pflock',
    description: 'two way bindings'
  }
};

var bindings = pflock(document.body, data);
bindings.on('change',  function (path, value) {

});
```
