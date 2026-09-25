"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
var v4_1 = require("zod/v4");
var auth_1 = require("@duo-snap/auth");
var trpc_1 = require("../trpc");
exports.authRouter = {
    status: trpc_1.publicProcedure.query(function () { return (0, auth_1.getConfigStatus)(); }),
    canRequestSignIn: trpc_1.publicProcedure
        .input(v4_1.z.object({ email: v4_1.z.string().email() }))
        .query(function (_a) {
        var input = _a.input;
        var allowedEmailCount = (0, auth_1.getAllowedEmails)().size;
        var allowed = (0, auth_1.isAllowedEmail)(input.email);
        return {
            allowed: allowed,
            message: allowed
                ? "Email is allowed for Duo Snap."
                : allowedEmailCount === 0
                    ? "ALLOWED_EMAILS is not configured yet."
                    : "This Duo Snap is private and only accepts the two configured emails.",
        };
    }),
    me: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return ctx.user;
    }),
};
