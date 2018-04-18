import * as THREE from 'three';

/**
 * @file webar
 * use js-artoolkit5
 * @TODO: renderon output ar marker only
 */

const ARController = window['ARController'];
export default class AR {
    constructor(opts) {
        ARController.getUserMediaThreeScene({
            facingMode: 'environment',
            cameraParam: opts.camera, 
	        onSuccess: function(arScene, arController, arCamera) {  
                document.body.className = arController.orientation;
                              
                const renderer = new THREE.WebGLRenderer({antialias: true});
                renderer.setSize(arController.videoWidth, arController.videoHeight);
                document.body.appendChild(renderer.domElement);

                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.5, 8, 8),
                    new THREE.MeshNormalMaterial()
                );
                sphere.position.z = 0.5;

                arController.loadMarker(opts.marker, function(markerId) {
                    const markerRoot = arController.createThreeMarker(markerId);
                    markerRoot.add(sphere);
                    arScene.scene.add(markerRoot);
                });

                const tick = function() {
                    arScene.process();
                    arScene.renderOn(renderer);

                    requestAnimationFrame(tick);
                };

                tick();
            }
        });
    }
}