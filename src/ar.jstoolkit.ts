/**
 * @file webar
 * use js-artoolkit5
 */

const ARController = window['ARController'];
export default class AR {
    constructor(opts) {
        ARController.getUserMediaThreeScene({
            maxARVideoSize: 320, 
            cameraParam: opts.camera, 
	        onSuccess: function(arScene, arController, arCamera) {
                alert(111)
            }
        });
    }
}