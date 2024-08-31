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
exports.post = post;
exports.publicIdFrom = publicIdFrom;
exports.get = get;
exports.unshare = unshare;
const uuid_1 = require("uuid");
const database_1 = require("./database");
/**
 * Adds a credential from a VerifiablePresentation to the database.
 * Requires a signed VP with a holder property (the result of DID Auth).
 *
 * @param vp {VerifiablePresentation}
 *
 * @returns {Promise<StoreCredentialResult>} View and unshare URLs for the
 *   stored credential.
 */
function post(_a) {
    return __awaiter(this, arguments, void 0, function* ({ vp }) {
        const { holder } = vp;
        if (!holder) {
            throw new Error("Missing 'holder' property. DID Authentication is required.");
        }
        // TODO: Authenticate the presenter (make sure the 'holder' did matches the
        //  signature on the VP).
        const Credentials = yield database_1.dbCredentials.open();
        const credential = _extractCredential(vp)[0];
        const publicId = publicIdFrom(holder, credential);
        yield Credentials.insert({
            id: publicId,
            controller: holder,
            createdAt: new Date(),
            vp,
            shared: true
        });
        yield database_1.dbCredentials.close();
        return {
            url: {
                // human-readable HTML view of the credential
                view: `/credentials/${publicId}`,
                // raw JSON GET (used by the html view)
                get: `/api/credentials/${publicId}`,
                // used for DELETE/unshare API
                unshare: `/api/credentials/${publicId}`
            }
        };
    });
}
function publicIdFrom(holder, credential) {
    // Going with UUID for the moment
    // Future work: make this deterministic, a hash(holderDid + hash(credential))
    return (0, uuid_1.v4)();
}
function _extractCredential(vp) {
    return Array.isArray(vp.verifiableCredential)
        ? vp.verifiableCredential
        : [vp.verifiableCredential];
}
/**
 * Loads a credential from database by id.
 *
 * @param credentialId {string}
 *
 * @returns {Promise<GetCredentialResult>}
 */
function get(_a) {
    return __awaiter(this, arguments, void 0, function* ({ publicCredentialId }) {
        const Credentials = yield database_1.dbCredentials.open();
        const result = yield Credentials.findOne({ id: publicCredentialId });
        yield database_1.dbCredentials.close();
        if (!result || !result.shared) {
            const notFound = new Error('Public share of this credential expired, unshared, or not found.');
            notFound.statusCode = 404;
            notFound.statusText = 'Not found';
            throw notFound;
        }
        /**
         * Straight from the db, a result looks like:
         * {
         *   id, // Unique credential id (used in view/unshare URL)
         *   controller, // The DID of the entity who shared the credential (did:key:..., etc)
         *   vp, // The full Verifiable Presentation containing one or more VCs (we only support one at the moment)
         *   shared // boolean flag used for "soft delete" / unshare functionality
         * }
         */
        const credential = _extractCredential(result.vp);
        return Object.assign({ credential }, result);
    });
}
/**
 * Unshares a credential from database by id (performs a "soft delete").
 *
 * @param publicCredentialId {string}
 * @param payload {CredentialPayload} - { vp: signedVerifiablePresentation }
 *
 * @returns {Promise<GetCredentialResult>}
 */
function unshare(_a) {
    return __awaiter(this, arguments, void 0, function* ({ publicCredentialId, payload }) {
        const Credentials = yield database_1.dbCredentials.open();
        const result = yield Credentials.findOne({ id: publicCredentialId });
        if (!result) {
            const notFound = new Error('This credential does not exist, has expired, or has already been unshared.');
            notFound.statusCode = 404;
            notFound.statusText = 'Not found';
            yield database_1.dbCredentials.close();
            throw notFound;
        }
        const filter = { id: publicCredentialId };
        const options = { upsert: false };
        const update = {
            $set: {
                shared: false
            }
        };
        const unshareResult = yield Credentials.updateOne(filter, update, options);
        //console.log('VC unshare result:', JSON.stringify(unshareResult, null, 2));
        yield database_1.dbCredentials.close();
        return Object.assign({}, unshareResult);
    });
}
