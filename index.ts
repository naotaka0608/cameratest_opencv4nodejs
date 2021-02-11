import * as net from "net";
import { OpencvLibrary } from "./opencvLibrary";
import * as jpeg from 'jpeg-js';
import * as microtime from "microtime";

const port = 3000
let timer: any = null;
let flgBusy: boolean = false;
let flgFirstCapture: boolean = true;

const opencvLibrary: OpencvLibrary = new OpencvLibrary();



// Server
const server = net.createServer(socket => {
    // クライアント接続
    console.log('Connected : ' + socket.remoteAddress +':'+ socket.remotePort);
    opencvLibrary.Create();
    console.log('Create opencvLibrary \r\n');
    flgFirstCapture = true;


    // データ受信
    socket.on('data', data => {
        console.log('Recive Data : ' + data );
          
        if( data[0] == '1'.charCodeAt(0) ){

            timer = setInterval(() => {

                if(!flgBusy) {
                    flgBusy = true;
                    
                    const start = microtime.now();

                    // Get frame 顔検出と目の検出
                    let frame: any; 
                        //はじめの２、３枚の取り込み画像の色が緑がかっているので、とりあえず５枚捨てる。
                    if(flgFirstCapture){
                        for(let i=0; i<5; i++){
                            frame = opencvLibrary.GetVideoFrame();
                        }
                        flgFirstCapture = false;
                    }else{
                        frame = opencvLibrary.GetVideoFrame();
                    }

                    console.info('GetVideoFrame time: ' + (microtime.now() - start) / 1000.0 + 'ms');

                    const width: number = opencvLibrary.GetWidth();
                    const height: number = opencvLibrary.GetHeight();

                    //let smooth = 2;
                    //Smooth(frame, smooth);
                    //console.info('Smooth time: ' + (microtime.now() - start) / 1000.0 + 'ms');
                    
                    
                    if( data[1] == '1'.charCodeAt(0) ){
                        frame = opencvLibrary.DetectFace();

                        console.info('DetectFace time: ' + (microtime.now() - start) / 1000.0 + 'ms');
                    }
                

                    
                    // RGB -> BGRA
                    let frameBGRA = opencvLibrary.ConvertRGB2BGRA(frame);

                    console.info('Convert RGB2BGRA time: ' + (microtime.now() - start) / 1000.0 + 'ms');
                    

                    // Byte -> Jpeg
                    let rawImageData = {
                        data: frameBGRA.getData(),
                        width: width,
                        height: height,
                    };

                    const jpegImageData = jpeg.encode(rawImageData, 80);

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

const Smooth = (buf: Uint8Array, smooth: number) : any => {

    let bufTmp = new Uint8Array(buf.length);

    let length = buf.length;

    let temp: number = 0;
    let cnt: number = 0;
    let k: number = 0;

    if (smooth > 0){
        for (let i = 0; i < length; i++){
            bufTmp[i] = buf[i];
        }

        for (let i = 0; i < length; i++){
            temp = 0;
            cnt = 0;
            for (let j = -smooth; j <= smooth; j++){
                k = i + j;
                if (k > 0 && k < length){
                    temp += bufTmp[k];
                    cnt++;
                }
            }
            if (cnt > 0){
                buf[i] = (temp / cnt);
            }else{
                buf[i] = 0;
            }
        }
    }

    return buf;
}