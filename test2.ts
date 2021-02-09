import * as net from "net";
import { OpencvLibrary } from "./opencvLibrary";
import * as jpeg from 'jpeg-js';

const port = 3000
let timer: any = null;

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

                const frame: any = opencvLibrary.GetVideoFrame();
                const width: number = opencvLibrary.GetWidth();
                const height: number = opencvLibrary.GetHeight();

                let frameBGRA = opencvLibrary.ConvertRGB2BGRA(frame);
                

                let rawImageData = {
                    data: frameBGRA.getData(),
                    width: width,
                    height: height,
                };

                const jpegImageData = jpeg.encode(rawImageData, 80);

                const jpegDataLength = jpegImageData.data.length;
                let header1_BufSize_ArrayBuffer = new ArrayBuffer(4);
                
                //let header2_SendSize_ArrayBuffer = new ArrayBuffer(4);
                //let header3_SendCount_ArrayBuffer = new ArrayBuffer(4);

                //let count: number = 0;
                //count = Math.floor(jpegDataLength / 1024);

                //if(jpegDataLength % 1024 != 0){
                //    count++;
                //}
                //if(count < 0) count = 1;

                header1_BufSize_ArrayBuffer = conv(jpegDataLength);
                //header2_SendSize_ArrayBuffer = conv(1024);
                //header3_SendCount_ArrayBuffer = conv(count);

                let bufSize = new Uint8Array(header1_BufSize_ArrayBuffer);
                //let sendSize = new Uint8Array(header2_SendSize_ArrayBuffer);
                //let SendCount = new Uint8Array(header3_SendCount_ArrayBuffer);

                //let allSendSize = bufSize.length + sendSize.length + SendCount.length + jpegDataLength;
                let allSendSize = bufSize.length + jpegDataLength;
                let sendData = new Uint8Array(allSendSize);
                //sendData = concatTypedArrays(bufSize, sendSize);
                //sendData = concatTypedArrays(sendData, SendCount);
                sendData = concatTypedArrays(bufSize, jpegImageData.data);

                socket.write(sendData);   
                  
            }, 50);    
        
        }else{
            clearInterval(timer);
            timer = false;
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





const conv = (num: number) : any => {
    let b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
}

const concatTypedArrays = (a: Uint8Array, b: Uint8Array) => { 
    let c = new (Uint8Array)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}