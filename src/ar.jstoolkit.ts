declare const ARController: any;

/**
 * @file webar
 * use js-artoolkit5
 */

export default class AR {
    constructor(opts) {
        ARController.getUserMediaThreeScene({
            maxARVideoSize: 320, 
            cameraParam: opts.camera, 
	        onSuccess: function(arScene, arController, arCamera) {
                console.log(111)
            }
        });
    }
}