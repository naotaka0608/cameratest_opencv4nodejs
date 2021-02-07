"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpencvLibrary = void 0;
var cv = require('opencv4nodejs');
var OpencvLibrary = /** @class */ (function () {
    function OpencvLibrary() {
        var _this = this;
        this.Create = function () {
            _this.cap = new cv.VideoCapture(0);
        };
        this.Release = function () {
            _this.cap.release();
        };
        this.GetVideoCapture = function () {
            _this.frame = _this.cap.read();
            _this.width = _this.frame.cols;
            _this.height = _this.frame.rows;
            _this.depth = _this.frame.depth;
            var frameGray = _this.frame.cvtColor(cv.COLOR_BGR2GRAY);
            var faceResult = _this.faceClassifier.detectMultiScale(frameGray);
            console.log('faceRects:', faceResult.objects);
            console.log('confidences:', faceResult.numDetections);
            if (!faceResult.objects.length) {
                console.log('No faces detected!');
            }
            var minDetections = 10;
            faceResult.objects.forEach(function (faceRect, i) {
                if (faceResult.numDetections[i] < minDetections) {
                    return;
                }
                cv.drawDetection(_this.frame, faceRect, { color: new cv.Vec(0, 0, 255), segmentFraction: 4 });
                var faceRegion = _this.frame.getRegion(faceRect);
                var eyeResult = _this.eyeClassifier.detectMultiScale(faceRegion);
                console.log('eyeRects:', eyeResult.objects);
                console.log('confidences:', eyeResult.numDetections);
                eyeResult.objects.forEach(function (eyeRect, j) {
                    if (eyeResult.numDetections[j] < minDetections) {
                        return;
                    }
                    cv.drawDetection(_this.frame, eyeRect, { color: new cv.Vec(0, 0, 255), segmentFraction: 4 });
                });
            });
            return _this.frame;
        };
        this.faceClassifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_DEFAULT);
        this.eyeClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);
        this.width = 0;
        this.height = 0;
        this.depth = 0;
    }
    return OpencvLibrary;
}());
exports.OpencvLibrary = OpencvLibrary;
//# sourceMappingURL=opencvLibrary.js.map