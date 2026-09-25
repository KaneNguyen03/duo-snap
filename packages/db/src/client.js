"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.MissingDatabaseConfigError = void 0;
exports.requireDb = requireDb;
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var schema = require("./schema");
var MissingDatabaseConfigError = /** @class */ (function (_super) {
    __extends(MissingDatabaseConfigError, _super);
    function MissingDatabaseConfigError(message) {
        if (message === void 0) { message = "DATABASE_URL is not configured."; }
        var _this = _super.call(this, message) || this;
        _this.name = "MissingDatabaseConfigError";
        return _this;
    }
    return MissingDatabaseConfigError;
}(Error));
exports.MissingDatabaseConfigError = MissingDatabaseConfigError;
var databaseUrl = process.env.DATABASE_URL;
var client = databaseUrl
    ? (0, postgres_1.default)(databaseUrl, {
        prepare: false,
        max: 5,
    })
    : null;
exports.db = client
    ? (0, postgres_js_1.drizzle)(client, {
        schema: schema,
        casing: "snake_case",
    })
    : null;
function requireDb(database) {
    if (database === void 0) { database = exports.db; }
    if (!database) {
        throw new MissingDatabaseConfigError("Missing DATABASE_URL. Add your Supabase Postgres connection string to .env.");
    }
    return database;
}
