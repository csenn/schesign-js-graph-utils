# Schesign graph utils

Schesign allows you to build and host data designs. Data designs can be accessed through the API as a graph in JSON format. See [schesign-js-api](https://github.com/csenn/schesign-js-api) for info on retrieving a graph.

This library contains the graph spec and various utilities to programatically generate and manage a schesign graph.

### Install
```
npm install schesign-js-graph-utils --save
```

### Generating a design
```
  import { Design, ClassNode, PropertyNode } from 'schesign-js-graph-utils'

  const design = new Design()

  const product = new ClassNode({ label: 'Product' })
  const user = new ClassNode({ label: 'User' })
  const shoppingCart = new ClassNode({ label: 'ShoppingCart' })

  const upc = new PropertyNode({ label: 'upc' })

```

Notes
* make sure class cant be added more then once