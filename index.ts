import * as net from "net";
import { OpencvLibrary } from "./opencvLibrary";
import * as jpeg from 'jpeg-js';
import * as microtime from "microtime";

const port = 3000
let timer: any = null;
let flgBusy: boolean = false;

const opencvLibrary: OpencvLibrary = new OpencvLibrary();


// Server
const server = net.createServer(socket => {
    // クライアント接続
    console.log('Connected : ' + socket.remoteAddress +':'+ socket.remotePort);
    opencvLibrary.Create();
    console.log('Create opencvLibrary \r\n');


    // データ受信
    socket.on('data', data => {
        console.log('Recive Data : ' + data );
          
        if(data[0] == 49){

            timer = setInterval(() => {

                if(!flgBusy) {
                    flgBusy = true;
                    
                    const start = microtime.now();

                    // Get frame 顔検出と目の検出
                    const frame: any = opencvLibrary.GetVideoFrame();
                    const width: number = opencvLibrary.GetWidth();
                    const height: number = opencvLibrary.GetHeight();

                    
                    // RGB -> BGRA
                    let frameBGRA = opencvLibrary.ConvertRGB2BGRA(frame);

                    console.info('Convert RGB2BGRA time: ' + (microtime.now() - start) / 1000.0 + 'ms');
                    

                    // Byte -> Jpeg
                    let rawImageData = {
                        data: frameBGRA.getData(),
                        width: width,
                        height: height,
                    };

                    const jpegImageData = jpeg.encode(rawImageData, 50);

                    console.info('Jpegencode time: ' + (microtime.now() - start) / 1000.0 + 'ms');



                    // Add header(JpegのバッファサイズをJpegデータの前に付加する)
                    let jpegLength = new ArrayBuffer(4);

                    jpegLength = ConvertInt32toArrayBuffer(jpegImageData.data.length);

                    let jpegBufferSize = new Uint8Array(jpegLength);
                    let allBufferSize = jpegBufferSize.length + jpegImageData.data.length;
                    
                    let sendData = new Uint8Array(allBufferSize);
                    sendData = concatTypedArrays(jpegBufferSize, jpegImageData.data);

                    console.info('Add header time: ' + (microtime.now() - start) / 1000.0 + 'ms');



                    // Send data
                    socket.write(sendData);   

                    console.info('Send data time: ' + (microtime.now() - start) / 1000.0 + 'ms');

                    flgBusy = false;
                }
                  
            }, 10);    
        
        }else{
            if(!flgBusy){
                clearInterval(timer);
                timer = false;    
            }
        }
    });

    // close受信
    socket.on('close', had_error => {
        if(timer == false){
            clearInterval(timer);
        }
        opencvLibrary.Release();
        console.log('Release opencvLibrary \r\n');
        console.log('Closed : ' + had_error + '\r\n');
    });

    // error受信
    socket.on('error', err => {
        console.log('Error : ' + err.stack + '\r\n');
    });

}).listen(port);

console.log('listening on port ' + port);




// Int32 -> ArrayBuffer (Little Endian)
const ConvertInt32toArrayBuffer = (num: number) : any => {
    let b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
}

// Uint8Array 同士の結合
const concatTypedArrays = (a: Uint8Array, b: Uint8Array) => { 
    let c = new (Uint8Array)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}