"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noname_constants_1 = require("./noname.constants");
const inversify_1 = require("inversify");
function service(type) {
    return function (target) {
        inversify_1.injectable()(target);
        target.type = type;
        Reflect.defineMetadata(noname_constants_1.NONAME_TYPE, noname_constants_1.NONAME_TYPE_SERVICE, target);
        Reflect.defineMetadata(noname_constants_1.NONAME_SYMBOL, type, target);
        return target;
    };
}
exports.service = service;
function router(filter) {
    return (target) => {
        inversify_1.injectable()(target);
        Reflect.defineMetadata(noname_constants_1.NONAME_ROUTER_CONFIG, filter, target);
        Reflect.defineMetadata(noname_constants_1.NONAME_TYPE, noname_constants_1.NONAME_TYPE_ROUTER, target);
        return target;
    };
}
exports.router = router;
function createEndpoint(method, filter, target, key, descriptor) {
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    let endpoints = Reflect.getMetadata(noname_constants_1.NONAME_ENDPOINTS, target);
    if (!endpoints) {
        endpoints = [];
    }
    endpoints.push({
        method: method,
        path: filter.path || filter,
        middlewares: filter.middlewares || [],
        funcName: key
    });
    Reflect.defineMetadata(noname_constants_1.NONAME_ENDPOINTS, endpoints, target);
    return descriptor;
}
function get(filter) {
    return createEndpoint.bind(null, 'get', filter);
}
exports.get = get;
function post(filter) {
    return createEndpoint.bind(null, 'post', filter);
}
exports.post = post;
function put(filter) {
    return createEndpoint.bind(null, 'put', filter);
}
exports.put = put;
function patch(filter) {
    return createEndpoint.bind(null, 'path', filter);
}
exports.patch = patch;
function del(filter) {
    return createEndpoint.bind(null, 'delete', filter);
}
exports.del = del;
