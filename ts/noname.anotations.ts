import { NONAME_ROUTER_CONFIG, NONAME_SYMBOL, NONAME_TYPE, NONAME_TYPE_ROUTER, NONAME_TYPE_SERVICE, NONAME_ENDPOINTS } from './noname.constants';
import { injectable } from "inversify";
import * as KoaRouter from 'koa-router';

export function service(type: symbol) {
    return function(target:any) {
        injectable()(target);
        target.type = type;
        Reflect.defineMetadata(NONAME_TYPE, NONAME_TYPE_SERVICE, target);
        Reflect.defineMetadata(NONAME_SYMBOL, type, target);
        return target;
    }
}

export function router(filter: any) {
    return (target: any) => {
        injectable()(target);
        Reflect.defineMetadata(NONAME_ROUTER_CONFIG, filter, target);
        Reflect.defineMetadata(NONAME_TYPE, NONAME_TYPE_ROUTER, target);
        return target;

    }
}

function createEndpoint(method, filter, target: any, key, descriptor) {

    if(descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    let endpoints = Reflect.getMetadata(NONAME_ENDPOINTS, target);
    if (!endpoints) {
        endpoints = [];
    }

    endpoints.push({
        method: method,
        path: filter.path || filter,
        middlewares: filter.middlewares || [],
        funcName: key
    });
    Reflect.defineMetadata(NONAME_ENDPOINTS, endpoints, target);
    return descriptor;
}

export function get(filter: any) {
    return createEndpoint.bind(null, 'get', filter);
}

export function post(filter: any) {
    return createEndpoint.bind(null, 'post', filter);
}

export function put(filter: any) {
    return createEndpoint.bind(null, 'put', filter);
}

export function path(filter: any) {
    return createEndpoint.bind(null, 'path', filter);
}

export function del(filter: any) {
    return createEndpoint.bind(null, 'delete', filter);
}


