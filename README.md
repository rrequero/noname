# Noname library

Library to build your API's / Webs with KoaJS, Inversify and Typescript.
The library creates for you all that you need config to use these libraries..

## Your first api

### Install the library

```bash

npm install --save @noname tsc 
npm install --save-dev @types/node

```

### Controllers

You can define your owns controllers. You only need decorate your controller class with @Controller and your methods with the HTTP verb of each endpoint:

Example:

```

import { router, get } from 'noname';

@router({
    path: '/poc'
})
export class PocRouter {

    @get('/hi')
    hi(ctx){
        ctx.body = 'Hi @noname';
    }
}


```

### Services


