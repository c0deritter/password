"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const KeyFileLogic_1 = __importDefault(require("../KeyFileLogic"));
const fs_1 = __importDefault(require("fs"));
class Server {
    constructor() {
        this.app = express_1.default();
        this.keyFileLogic = new KeyFileLogic_1.default('keyFiles');
    }
    init() {
        this.app.get('/keyFile/:keyFileName', (req, res) => {
            let keyFile = this.keyFileLogic.getKeyFile(req.params.keyFileName);
            if (keyFile == null) {
                res.status(404);
            }
            else {
                res.send(keyFile.toJSON());
            }
            res.end();
        });
        this.app.get('/', (_, res) => {
            let indexHtml = fs_1.default.readFileSync('built/browser/index.html', { encoding: 'utf8' });
            res.contentType('html');
            res.send(indexHtml);
            res.end();
        });
        this.app.listen(3333);
    }
}
(new Server).init();
//# sourceMappingURL=Server.js.map