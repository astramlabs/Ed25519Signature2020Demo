"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialErrorTypes = void 0;
var CredentialErrorTypes;
(function (CredentialErrorTypes) {
    CredentialErrorTypes["IsNotVerified"] = "Credential is not verified.";
    CredentialErrorTypes["CouldNotBeVerified"] = "Credential could not be checked for verification and may be malformed.";
    CredentialErrorTypes["DidNotInRegistry"] = "Could not find issuer in registry with given DID.";
})(CredentialErrorTypes || (exports.CredentialErrorTypes = CredentialErrorTypes = {}));
