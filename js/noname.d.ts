import "reflect-metadata";
import * as Koa from 'koa';
import { Container } from "inversify";
export default class Noname extends Koa {
    container: Container;
    constructor();
    init(middlewares?: any[]): void;
    private loadServices(path);
    private loadRoutes(path);
}
