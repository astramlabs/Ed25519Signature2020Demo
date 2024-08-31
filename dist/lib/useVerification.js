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
exports.useVerification = void 0;
const react_1 = require("react");
const useVerification = (credential) => {
    const [verificationResult, setVerificationResult] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [timerExpired, setTimerExpired] = (0, react_1.useState)(false);
    const timeout = (0, react_1.useRef)();
    const issuerName = typeof (credential === null || credential === void 0 ? void 0 : credential.issuer) === 'string' ? credential === null || credential === void 0 ? void 0 : credential.issuer : credential === null || credential === void 0 ? void 0 : credential.issuer.name;
    const verifyCredential = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (credential === undefined) {
            return;
        }
        setLoading(true);
        setTimerExpired(false);
        // artificial delay for UI purposes
        timeout.current = window.setTimeout(() => {
            setTimerExpired(true);
        }, 1000);
        const res = yield fetch('/api/verify', {
            method: 'POST',
            body: JSON.stringify(credential)
        });
        const { result } = yield res.json();
        setVerificationResult(result);
        setLoading(false);
    }), [credential]);
    (0, react_1.useEffect)(() => {
        verifyCredential();
        return () => {
            window.clearTimeout(timeout.current);
        };
    }, [verifyCredential]);
    return { loading: loading || !timerExpired, verificationResult, verifyCredential, issuerName };
};
exports.useVerification = useVerification;
