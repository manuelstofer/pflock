# Pflock

![Build status](https://api.travis-ci.org/manuelstofer/pflock.png)

![Pfock](https://raw.github.com/manuelstofer/pflock/master/resources/pflock.jpg)

Pflock is a [component](http://github.com/component/) for binding data to input
fields, content editables etc.

It works in both directions. When the data changes Pflock
can update the document and the other way around.

[Demo](http://manuelstofer.github.com/pflock/)

## Installation

```
$ component install manuelstofer/pflock
```


## Binding Syntax

Bindings are done using x-bind attribute. It uses [json pointers](http://tools.ietf.org/html/rfc6901) to
describe the path in an object.


### Bind value

```HTML
<input type="text" x-bind="value:/user/name" />
```

### Bind inner HTML

```HTML
<p contenteditable x-bind="/user/description"></p>
```

### Bind attribute

```HTML
<img src="image.jpg" x-bind="src:/user/image"/>

```

### Bind arrays
Pflock can handle arrays. Thanks to [t8g](https://github.com/t8g)

```Javascript
var data = {
    users: [
        {name: 'Laurence', age:37},
        {name: 'Thomas', age:38},
        {name: 'Sarah', age:1},
    ]
};
```

When using the x-each Pflock will use the the child node as a template and clone it for every item.

```Html
<ul x-each="/users">
  <li><span x-bind="/users/x/name"></span> [<span  x-bind="/users/x/age"></span>]</li>
</ul>

<ul x-each="/users">
  <li x-bind="/users/x/name"></li>
</ul>
```


## Usage

```Javascript
var pflock = require('pflock');
var data = {
  user: {
    name: 'Pflock',
    description: 'two way bindings'
  }
};

var bindings = pflock(document.body, data);

bindings.on('path-changed',  function (path, value) {

});

bindings.on('changed',  function (data) {

});
```

### Backbone models
There is an Adapter to use Pflock with Backbone models: [Backbone-Pflock](http://github.com/manuelstofer/backbone-pflock)


## Templating
Pflock has no built in template engine. Any engine will work just fine.

[Richard Parker](http://github.com/manuelstofer/richardparker) was built
to be used together with Pflock. It makes it easy to create the bindings by
keeping track over the binding pointer when you iterate over objects or arrays.
