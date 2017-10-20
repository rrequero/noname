"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noname_constants_1 = require("./noname.constants");
require("reflect-metadata");
const Koa = require("koa");
const KoaRouter = require("koa-router");
const inversify_1 = require("inversify");
const path_1 = require("path");
const fs_1 = require("fs");
const APP_DIR = path_1.dirname(require.main.filename);
class Noname extends Koa {
    constructor() {
        super();
        this.container = new inversify_1.Container();
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
    loadServices(path) {
        const routesFiles = fs_1.readdirSync(path);
        routesFiles.forEach(file => {
            const newPath = path ? `${path}/${file}` : file;
            const stat = fs_1.statSync(newPath);
            if (!stat.isDirectory()) {
                if (!file.endsWith('.map')) {
                    const classObject = require(newPath);
                    Object.keys(classObject).map(className => {
                        try {
                            if (Reflect.getMetadata(noname_constants_1.NONAME_TYPE, classObject[className]) === noname_constants_1.NONAME_TYPE_SERVICE) {
                                console.log('importando', newPath);
                                const symbol = Reflect.getMetadata(noname_constants_1.NONAME_SYMBOL, classObject[className]);
                                this.container.bind(symbol).to(classObject[className]);
                            }
                        }
                        catch (e) {
                        }
                    });
                }
            }
            else {
                this.loadServices(newPath);
            }
        });
    }
    loadRoutes(path) {
        const routesFiles = fs_1.readdirSync(path);
        routesFiles.forEach(file => {
            const newPath = path ? `${path}/${file}` : file;
            const stat = fs_1.statSync(newPath);
            if (!stat.isDirectory()) {
                if (!file.endsWith('.map')) {
                    const classObject = require(newPath);
                    Object.keys(classObject).map(className => {
                        try {
                            if (Reflect.getMetadata(noname_constants_1.NONAME_TYPE, classObject[className]) === noname_constants_1.NONAME_TYPE_ROUTER) {
                                console.log('importando', newPath);
                                let symbol = Symbol(className + Date.now());
                                this.container.bind(symbol).to(classObject[className]);
                                const routerConfig = Reflect.getMetadata(noname_constants_1.NONAME_ROUTER_CONFIG, classObject[className]);
                                const instance = this.container.get(symbol);
                                const router = KoaRouter({
                                    prefix: routerConfig.path
                                });
                                if (routerConfig.middlewares) {
                                    router.use(routerConfig.middlewares);
                                }
                                const endpoints = Reflect.getMetadata(noname_constants_1.NONAME_ENDPOINTS, instance);
                                if (endpoints) {
                                    endpoints.map(endpoint => {
                                        router[endpoint.method](endpoint.path, ...endpoint.middlewares, instance[endpoint.funcName].bind(instance));
                                    });
                                }
                                this.use(router.middleware());
                            }
                        }
                        catch (e) {
                        }
                    });
                }
            }
            else {
                this.loadRoutes(newPath);
            }
        });
    }
}
exports.default = Noname;
