"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.photoRouter = void 0;
var node_crypto_1 = require("node:crypto");
var server_1 = require("@trpc/server");
var v4_1 = require("zod/v4");
var auth_1 = require("@duo-snap/auth");
var db_1 = require("@duo-snap/db");
var schema_1 = require("@duo-snap/db/schema");
var trpc_1 = require("../trpc");
var imageContentTypeSchema = v4_1.z
  .string()
  .regex(/^image\//, "Only image uploads are supported.");
function extensionFrom(fileName, contentType) {
  var _a, _b;
  var fromFile =
    (_a = fileName.split(".").pop()) === null || _a === void 0
      ? void 0
      : _a.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromFile) return fromFile;
  var fromType =
    (_b = contentType.split("/").at(1)) === null || _b === void 0
      ? void 0
      : _b.replace(/[^a-z0-9]/g, "");
  return fromType || "jpg";
}
function signImagePath(path) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, data, error, error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          supabase = (0, auth_1.createSupabaseAdminClient)();
          return [
            4 /*yield*/,
            supabase.storage
              .from(auth_1.SNAP_BUCKET)
              .createSignedUrl(path, 60 * 60),
          ];
        case 1:
          ((_a = _b.sent()), (data = _a.data), (error = _a.error));
          if (error) return [2 /*return*/, null];
          return [2 /*return*/, data.signedUrl];
        case 2:
          error_1 = _b.sent();
          if (error_1 instanceof auth_1.MissingSupabaseConfigError)
            return [2 /*return*/, null];
          throw error_1;
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
exports.photoRouter = {
  list: trpc_1.protectedProcedure.query(function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var rows;
      var ctx = _b.ctx;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              ctx.db.query.photos.findMany({
                with: {
                  profile: true,
                },
                orderBy: function (photo, _a) {
                  var desc = _a.desc;
                  return [desc(photo.createdAt)];
                },
                limit: 60,
              }),
            ];
          case 1:
            rows = _c.sent();
            return [
              2 /*return*/,
              Promise.all(
                rows.map(function (photo) {
                  return __awaiter(void 0, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                      switch (_b.label) {
                        case 0:
                          _a = {
                            id: photo.id,
                            caption: photo.caption,
                            createdAt: photo.createdAt,
                            imagePath: photo.imagePath,
                          };
                          return [4 /*yield*/, signImagePath(photo.imagePath)];
                        case 1:
                          return [
                            2 /*return*/,
                            ((_a.imageUrl = _b.sent()),
                            (_a.author = {
                              id: photo.profile.id,
                              email: photo.profile.email,
                              displayName: photo.profile.displayName,
                              avatarUrl: photo.profile.avatarUrl,
                            }),
                            _a),
                          ];
                      }
                    });
                  });
                }),
              ),
            ];
        }
      });
    });
  }),
  createUploadUrl: trpc_1.protectedProcedure
    .input(
      v4_1.z.object({
        fileName: v4_1.z.string().min(1).max(160),
        contentType: imageContentTypeSchema,
      }),
    )
    .mutation(function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var supabase, extension, path, _c, data, error;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              try {
                supabase = (0, auth_1.createSupabaseAdminClient)();
              } catch (error) {
                if (error instanceof auth_1.MissingSupabaseConfigError) {
                  throw new server_1.TRPCError({
                    code: "PRECONDITION_FAILED",
                    message:
                      "Missing SUPABASE_SERVICE_ROLE_KEY. It is required on the server to create signed upload URLs.",
                  });
                }
                throw error;
              }
              extension = extensionFrom(input.fileName, input.contentType);
              path = ""
                .concat(ctx.user.id, "/")
                .concat(Date.now(), "-")
                .concat((0, node_crypto_1.randomUUID)(), ".")
                .concat(extension);
              return [
                4 /*yield*/,
                supabase.storage
                  .from(auth_1.SNAP_BUCKET)
                  .createSignedUploadUrl(path),
              ];
            case 1:
              ((_c = _d.sent()), (data = _c.data), (error = _c.error));
              if (error) {
                throw new server_1.TRPCError({
                  code: "BAD_REQUEST",
                  message: error.message,
                });
              }
              return [
                2 /*return*/,
                {
                  path: data.path,
                  token: data.token,
                },
              ];
          }
        });
      });
    }),
  create: trpc_1.protectedProcedure
    .input(schema_1.CreatePhotoSchema)
    .mutation(function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var photo;
        var _c;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              if (!input.imagePath.startsWith("".concat(ctx.user.id, "/"))) {
                throw new server_1.TRPCError({
                  code: "FORBIDDEN",
                  message:
                    "Photos can only be attached to the signed upload path for your user.",
                });
              }
              return [
                4 /*yield*/,
                ctx.db
                  .insert(schema_1.photos)
                  .values({
                    userId: ctx.user.id,
                    imagePath: input.imagePath,
                    caption:
                      ((_c = input.caption) === null || _c === void 0
                        ? void 0
                        : _c.trim()) || null,
                  })
                  .returning(),
              ];
            case 1:
              photo = _d.sent()[0];
              return [2 /*return*/, photo];
          }
        });
      });
    }),
  delete: trpc_1.protectedProcedure
    .input(v4_1.z.object({ id: v4_1.z.string().uuid() }))
    .mutation(function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var photo;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                ctx.db
                  .delete(schema_1.photos)
                  .where((0, db_1.eq)(schema_1.photos.id, input.id))
                  .returning(),
              ];
            case 1:
              photo = _c.sent()[0];
              return [
                2 /*return*/,
                photo !== null && photo !== void 0 ? photo : null,
              ];
          }
        });
      });
    }),
};
