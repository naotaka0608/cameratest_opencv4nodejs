"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var net = __importStar(require("net"));
var port = 3000;
var timer = null;
var opencvLibrary_1 = require("./opencvLibrary");
var opencvLibrary = new opencvLibrary_1.OpencvLibrary();
// Server
var server = net.createServer(function (socket) {
    // クライアント接続
    console.log('Connected : ' + socket.remoteAddress + ':' + socket.remotePort);
    opencvLibrary.Create();
    console.log('Create opencvLibrary \r\n');
    // データ受信
    socket.on('data', function (data) {
        console.log('Recive Data : ' + data);
        if (data[0] == 49) {
            timer = setInterval(function () {
                var frame = opencvLibrary.GetVideoCapture();
                socket.write(frame.getData());
            }, 600);
        }
        else {
            clearInterval(timer);
            timer = false;
        }
    });
    // close受信
    socket.on('close', function (had_error) {
        if (timer == false) {
            clearInterval(timer);
        }
        opencvLibrary.Release();
        console.log('Release opencvLibrary \r\n');
        console.log('Closed : ' + had_error + '\r\n');
    });
    // error受信
    socket.on('error', function (err) {
        console.log('Error : ' + err.stack + '\r\n');
    });
}).listen(port);
console.log('listening on port ' + port);
//# sourceMappingURL=index.js.map