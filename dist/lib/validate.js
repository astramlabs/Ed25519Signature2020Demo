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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPresentation = verifyPresentation;
exports.verifyCredential = verifyCredential;
const ed25519_signature_2020_1 = require("@digitalcredentials/ed25519-signature-2020");
const jsonld_signatures_1 = require("@digitalcredentials/jsonld-signatures");
const vc_status_list_1 = require("@digitalcredentials/vc-status-list");
const vc_1 = __importDefault(require("@digitalcredentials/vc"));
const presentation_1 = require("types/presentation");
const credential_1 = require("types/credential");
const security_document_loader_1 = require("@digitalcredentials/security-document-loader");
const verifiableObject_1 = require("./verifiableObject");
// import { registryCollections, Registry } from '@digitalcredentials/issuer-registry-client';
const documentLoader = (0, security_document_loader_1.securityLoader)({ fetchRemoteContexts: true }).build();
const suite = new ed25519_signature_2020_1.Ed25519Signature2020();
const presentationPurpose = new jsonld_signatures_1.purposes.AssertionProofPurpose();
function verifyPresentation(presentation_2) {
    return __awaiter(this, arguments, void 0, function* (presentation, unsignedPresentation = true) {
        try {
            const result = yield vc_1.default.verify({
                presentation,
                presentationPurpose,
                suite,
                documentLoader,
                unsignedPresentation,
            });
            console.log(JSON.stringify(result));
            return result;
        }
        catch (err) {
            console.warn(err);
            throw new Error(presentation_1.PresentationError.CouldNotBeVerified);
        }
    });
}
function verifyCredential(credential) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const { issuer } = credential;
        const { malformed, message } = checkMalformed(credential);
        if (malformed) {
            return createErrorMessage(credential, message);
        }
        if (((_a = credential === null || credential === void 0 ? void 0 : credential.proof) === null || _a === void 0 ? void 0 : _a.type) === 'DataIntegrityProof') {
            return createErrorMessage(credential, `Proof type not supported: DataIntegrityProof (cryptosuite: ${credential.proof.cryptosuite}).`);
        }
        const issuerDid = typeof issuer === 'string' ? issuer : issuer.id;
        // await registryCollections.issuerDid.fetchRegistries();
        // const isInRegistry = await registryCollections.issuerDid.isInRegistryCollection(issuerDid);
        // if (!isInRegistry) {
        //   // throw new Error(CredentialErrorTypes.DidNotInRegistry);
        //   return createErrorMessage(credential, CredentialErrorTypes.DidNotInRegistry)
        // }
        try {
            const hasRevocation = (_b = (0, verifiableObject_1.extractCredentialsFrom)(credential)) === null || _b === void 0 ? void 0 : _b.find(vc => vc.credentialStatus);
            const result = yield vc_1.default.verifyCredential({
                credential,
                suite,
                documentLoader,
                // Only check revocation status if VC has a 'credentialStatus' property
                checkStatus: hasRevocation ? vc_status_list_1.checkStatus : undefined
            });
            if (((_c = result === null || result === void 0 ? void 0 : result.error) === null || _c === void 0 ? void 0 : _c.name) === 'VerificationError') {
                return createErrorMessage(credential, credential_1.CredentialErrorTypes.CouldNotBeVerified);
            }
            // const registryInfo = await registryCollections.issuerDid.registriesFor(issuerDid)
            // result.registryName  = registryInfo[0].name;
            return result;
        }
        catch (err) {
            console.warn(err);
            throw new Error(credential_1.CredentialErrorTypes.CouldNotBeVerified);
        }
    });
}
function checkMalformed(credential) {
    let message = '';
    // check credential for proof
    if (!credential.proof) {
        message += 'This is not a Verifiable Credential (does not have a digital signature).';
    }
    if (message) {
        return { malformed: true, message: message };
    }
    return { malformed: false, message: message };
}
function createErrorMessage(credential, message) {
    return {
        verified: false,
        results: [
            {
                verified: false,
                credential: credential,
                error: {
                    details: {
                        cause: {
                            message: message,
                            name: 'Error',
                        },
                    },
                    message: message,
                    name: 'Error',
                },
                log: [
                    { id: 'expiration', valid: false },
                    { id: 'valid_signature', valid: false },
                    { id: 'issuer_did_resolves', valid: false },
                    { id: 'revocation_status', valid: false }
                ],
            }
        ]
    };
}
