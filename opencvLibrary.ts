const cv = require('opencv4nodejs');

class OpencvLibrary
{
    private faceClassifier: any;
    private eyeClassifier: any;

    private cap: any; 
    private frame: any;

    private width: number;
    private height: number;
    private depth: number;

    constructor() {
        this.faceClassifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_DEFAULT);
        this.eyeClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);

        this.width = 0;
        this.height = 0;
        this.depth = 0;
    }

    public Create = () : void => {
        this.cap = new cv.VideoCapture(0);
    }

    public Release = () : void => {
        this.cap.release()
    }

    public GetWidth = () : number => {
        return this.frame.cols;        
    }

    public GetHeight = () : number => {
        return this.frame.rows;       
    }

    public GetDepth = () : number => {
        return this.frame.depth;      
    }

    public ConvertRGB2RGBA = (frame:any) : any => {
        return frame.cvtColor(cv.COLOR_RGB2RGBA);
    }
    public ConvertRGB2BGRA = (frame:any) : any => {
        return frame.cvtColor(cv.COLOR_RGB2BGRA);
    }

    public GetVideoCapture = () : any => {
        this.frame = this.cap.read();

        this.width = this.frame.cols;
        this.height = this.frame.rows;
        this.depth = this.frame.depth;

        const frameGray = this.frame.cvtColor(cv.COLOR_BGR2GRAY);

        const faceResult = this.faceClassifier.detectMultiScale(frameGray);
        console.log('faceRects:', faceResult.objects);
        console.log('confidences:', faceResult.numDetections);

        if (!faceResult.objects.length) {
            console.log('No faces detected!');
        }


        const minDetections = 10;
        faceResult.objects.forEach((faceRect:any, i:number) => {
            if (faceResult.numDetections[i] < minDetections) {
                return;
            }                    
             
            cv.drawDetection(
                this.frame,
                faceRect,
                { color: new cv.Vec(0, 0, 255), segmentFraction: 4 });

                
            const faceRegion = this.frame.getRegion(faceRect);
            const eyeResult = this.eyeClassifier.detectMultiScale(faceRegion);
            console.log('eyeRects:', eyeResult.objects);
            console.log('confidences:', eyeResult.numDetections);
            
            eyeResult.objects.forEach((eyeRect:any, j:number) => {
                if (eyeResult.numDetections[j] < minDetections) {
                    return;
                }
                cv.drawDetection(
                    faceRegion,
                    eyeRect,
                    { color: new cv.Vec(0, 0, 255), segmentFraction: 4 });                        
            });
            
        });

        return this.frame;
    }
}

export {OpencvLibrary};
