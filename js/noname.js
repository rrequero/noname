"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var noname_constants_1 = require("./noname.constants");
require("reflect-metadata");
var Koa = require("koa");
var KoaRouter = require("koa-router");
var inversify_1 = require("inversify");
var path_1 = require("path");
var fs_1 = require("fs");
var APP_DIR = path_1.dirname(require.main.filename);
var Noname = /** @class */ (function (_super) {
    __extends(Noname, _super);
    function Noname() {
        var _this = _super.call(this) || this;
        _this.container = new inversify_1.Container();
        return _this;
    }
    Noname.prototype.init = function (middlewares) {
        var _this = this;
        if (middlewares === void 0) { middlewares = []; }
        middlewares.map(function (mid) {
            _this.use(mid);
        });
        console.log('Loading services');
        this.loadServices(APP_DIR);
        console.log('Loading routes');
        this.loadRoutes(APP_DIR);
    };
    Noname.prototype.loadServices = function (path) {
        var _this = this;
        var routesFiles = fs_1.readdirSync(path);
        routesFiles.forEach(function (file) {
            var newPath = path ? path + "/" + file : file;
            var stat = fs_1.statSync(newPath);
            if (!stat.isDirectory()) {
                if (!file.endsWith('.map')) {
                    var classObject_1 = require(newPath);
                    Object.keys(classObject_1).map(function (className) {
                        try {
                            if (Reflect.getMetadata(noname_constants_1.NONAME_TYPE, classObject_1[className]) === noname_constants_1.NONAME_TYPE_SERVICE) {
                                console.log('importando', newPath);
                                var symbol = Reflect.getMetadata(noname_constants_1.NONAME_SYMBOL, classObject_1[className]);
                                _this.container.bind(symbol).to(classObject_1[className]);
                            }
                        }
                        catch (e) {
                        }
                    });
                }
            }
            else {
                _this.loadServices(newPath);
            }
        });
    };
    Noname.prototype.loadRoutes = function (path) {
        var _this = this;
        var routesFiles = fs_1.readdirSync(path);
        routesFiles.forEach(function (file) {
            var newPath = path ? path + "/" + file : file;
            var stat = fs_1.statSync(newPath);
            if (!stat.isDirectory()) {
                if (!file.endsWith('.map')) {
                    var classObject_2 = require(newPath);
                    Object.keys(classObject_2).map(function (className) {
                        try {
                            if (Reflect.getMetadata(noname_constants_1.NONAME_TYPE, classObject_2[className]) === noname_constants_1.NONAME_TYPE_ROUTER) {
                                console.log('importando', newPath);
                                var symbol = Symbol(className + Date.now());
                                _this.container.bind(symbol).to(classObject_2[className]);
                                var routerConfig = Reflect.getMetadata(noname_constants_1.NONAME_ROUTER_CONFIG, classObject_2[className]);
                                var instance_1 = _this.container.get(symbol);
                                var router_1 = KoaRouter({
                                    prefix: routerConfig.path
                                });
                                if (routerConfig.middlewares) {
                                    router_1.use(routerConfig.middlewares);
                                }
                                var endpoints = Reflect.getMetadata(noname_constants_1.NONAME_ENDPOINTS, instance_1);
                                if (endpoints) {
                                    endpoints.map(function (endpoint) {
                                        router_1[endpoint.method].apply(router_1, [endpoint.path].concat(endpoint.middlewares, [instance_1[endpoint.funcName].bind(instance_1)]));
                                    });
                                }
                                _this.use(router_1.middleware());
                            }
                        }
                        catch (e) {
                        }
                    });
                }
            }
            else {
                _this.loadRoutes(newPath);
            }
        });
    };
    return Noname;
}(Koa));
exports.default = Noname;
//# sourceMappingURL=noname.js.map