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
exports.verifyVerifiableObject = verifyVerifiableObject;
exports.extractCredentialsFrom = extractCredentialsFrom;
const validate_1 = require("./validate");
function isVerifiableCredential(obj) {
    var _a;
    if (obj === undefined) {
        return false;
    }
    return (_a = obj.type) === null || _a === void 0 ? void 0 : _a.includes('VerifiableCredential');
}
function isVerifiablePresentation(obj) {
    if (obj === undefined) {
        return false;
    }
    return obj.type.includes('VerifiablePresentation');
}
function verifyVerifiableObject(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (isVerifiableCredential(obj))
                return (yield (0, validate_1.verifyCredential)(obj)).verified;
            if (isVerifiablePresentation(obj))
                return (yield (0, validate_1.verifyPresentation)(obj)).verified;
        }
        catch (err) {
            console.warn(err);
        }
        return false;
    });
}
function extractCredentialsFrom(obj) {
    if (isVerifiableCredential(obj)) {
        return [obj];
    }
    if (isVerifiablePresentation(obj)) {
        const { verifiableCredential } = obj;
        if (verifiableCredential instanceof Array) {
            return verifiableCredential;
        }
        return [verifiableCredential];
    }
    return null;
}
