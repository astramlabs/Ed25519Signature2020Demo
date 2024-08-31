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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const validate_1 = require("./lib/validate");
const app = (0, express_1.default)();
const port = 3000;
// Middleware
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.text());
// POST /api/verify endpoint
app.post('/api/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let credential;
    if (typeof req.body === 'string') {
        try {
            credential = JSON.parse(req.body);
        }
        catch (error) {
            return res.status(400).json({ status: 'Invalid JSON in request body' });
        }
    }
    else {
        credential = req.body;
    }
    try {
        console.log(credential);
        const result = yield (0, validate_1.verifyCredential)(credential);
        res.status(200).json({ result });
    }
    catch (error) {
        res.status(500).json({ status: 'Error verifying credential', error: error.message });
    }
}));
// Handle invalid routes
app.use((req, res) => {
    res.status(404).json({ status: 'Not Found' });
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
