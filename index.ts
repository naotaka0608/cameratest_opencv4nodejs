import * as net from "net";
const port = 3000
let timer: any = null;


import { OpencvLibrary } from "./opencvLibrary";
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
                const frame: any = opencvLibrary.GetVideoCapture();

                socket.write(frame.getData());   
            }, 600);    
        
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

