"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbCredentials = exports.DatabaseClient = void 0;
const mongodb_1 = require("mongodb");
// Env vars are read in from .env.local
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME || 'verifier-plus';
const DB_COLLECTION = process.env.DB_COLLECTION || 'credentials';
const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}`;
class DatabaseClient {
    constructor(dbServerUri, dbName, dbCollection) {
        this.client = {};
        this.database = {};
        this.dbServerUri = dbServerUri;
        this.dbName = dbName;
        this.dbCollection = dbCollection;
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectServer(this.dbServerUri);
            this.connectDatabase(this.dbName);
            return this.connectCollection(this.dbCollection);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.close();
        });
    }
    connectServer(dbServerUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionOpts = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            };
            // @ts-ignore
            this.client = new mongodb_1.MongoClient(dbServerUri, connectionOpts);
            yield this.client.connect();
        });
    }
    connectDatabase(dbName) {
        this.database = this.client.db(dbName);
    }
    connectCollection(dbCollection) {
        return this.database.collection(dbCollection);
    }
}
exports.DatabaseClient = DatabaseClient;
exports.dbCredentials = new DatabaseClient(DB_URI, DB_NAME, DB_COLLECTION);
