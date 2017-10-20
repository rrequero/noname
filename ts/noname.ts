import { NONAME_ROUTER_CONFIG, NONAME_SYMBOL, NONAME_ENDPOINTS, NONAME_TYPE, NONAME_TYPE_SERVICE, NONAME_TYPE_ROUTER } from './noname.constants';
import "reflect-metadata";
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { Container, injectable } from "inversify";
import { dirname } from 'path';
import { readdirSync, statSync } from 'fs';


const APP_DIR = dirname(require.main.filename);


export default class Noname extends Koa {

    container: Container;

    constructor() {
        super();
        this.container = new Container();

    }

    init(middlewares = []) {
        middlewares.map(mid => {
            this.use(mid);
        });
        console.log('Loading services');
        this.loadServices(APP_DIR);
        console.log('Loading routes');
        this.loadRoutes(APP_DIR);
    }

    private loadServices(path) {
        const routesFiles = readdirSync(path);
        routesFiles.forEach(file => {
            const newPath = path ? `${path}/${file}` : file;
            const stat = statSync(newPath);
            if (!stat.isDirectory()) {
                if (!file.endsWith('.map')) {
                    const classObject = require(newPath);
                    Object.keys(classObject).map(className => {
                        try {
                            if (Reflect.getMetadata(NONAME_TYPE, classObject[className]) === NONAME_TYPE_SERVICE) {
                                console.log('importando', newPath);
                                const symbol = Reflect.getMetadata(NONAME_SYMBOL, classObject[className]);
                                this.container.bind(symbol).to(classObject[className]);
                            }
                        } catch(e) {

                        }
                    });
                }
            } else {
                this.loadServices(newPath);
            }
        });
    }

    private loadRoutes(path) {
        const routesFiles = readdirSync(path);
        routesFiles.forEach(file => {
            const newPath = path ? `${path}/${file}` : file;
            const stat = statSync(newPath);
            if (!stat.isDirectory()) {
                if (!file.endsWith('.map')) {
                    const classObject = require(newPath);
                    Object.keys(classObject).map(className => {
                        try {
                            if (Reflect.getMetadata(NONAME_TYPE, classObject[className]) === NONAME_TYPE_ROUTER) {
                                console.log('importando', newPath);
                                let symbol = Symbol(className+Date.now());
                                this.container.bind(symbol).to(classObject[className]);
                                const routerConfig = Reflect.getMetadata(NONAME_ROUTER_CONFIG, classObject[className]);

                                const instance = this.container.get(symbol);
                                const router = KoaRouter({
                                    prefix: routerConfig.path
                                });
                                if (routerConfig.middlewares) {
                                    router.use(routerConfig.middlewares);
                                }
                                const endpoints = Reflect.getMetadata(NONAME_ENDPOINTS, instance);
                                if (endpoints) {
                                    endpoints.map(endpoint => {
                                        router[endpoint.method](endpoint.path, ...endpoint.middlewares, instance[endpoint.funcName].bind(instance));
                                    })
                                }
                                this.use(router.middleware());
                            }
                        } catch(e) {

                        }
                    });
                }
            } else {
                this.loadRoutes(newPath);
            }
        });
    }
}
