/// <reference path="../node_modules/@types/jquery/index.d.ts" />
import * as THREE from 'three';

/**
 * @file webar
 * use js-aruco
 * http://bhollis.github.io/aruco-marker/demos/angular.html
 */

declare const Aruco: any;

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
export default class AR {
    detector: any;
    posit: any;
    video: any;
    webgl: any;
    render: any;
    scene: any;
    camera: any;
    mesh: any;
    painter: any;

    constructor(opts) {
        const constraints = {audio: false, video: {facingMode: 'environment'}};
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            const video = this.video;

            if ('srcObject' in video) {
                video.srcObject = stream;
            } else {
                video.src = window.URL.createObjectURL(stream);
            }

           video.play();
        }).catch(function(err) {
            alert(err);
        });

        this.createDom();
        this.createRender(opts.texurl);
        
        this.detector = new Aruco.AR.Detector();
        this.posit = new Aruco.POS1.Posit(35, winWidth);
        this.tick();
    }

    createDom() {
        const video = this.video = $(`<video class="ar-video" style="position:relative;z-index:1;" autoplay playsinline></video>`).get(0);
        const canvas:any = $(`<canvas width="300" height="300"></canvas>`).get(0);
        this.painter = canvas.getContext('2d');

        document.body.appendChild(video);
    }

    createRender(texurl) {
        const webgl = this.webgl = new THREE.WebGLRenderer({alpha: true, antialias: true});
        const render = this.render = webgl.domElement;

        webgl.setPixelRatio(window.devicePixelRatio);
        webgl.setSize(winWidth, winHeight);
        $(render).css({
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: '999'
        });

        document.body.appendChild(render);

        const scene = this.scene = new THREE.Scene();
        const camera = this.camera = new THREE.PerspectiveCamera(80, winWidth / winHeight, 1, 1000);
        camera.position.set(0, 0, 600);
        
        const texture = new THREE.TextureLoader().load(texurl);
        const geometry = new THREE.BoxBufferGeometry(200, 200, 200);
        const material = new THREE.MeshBasicMaterial({map: texture});
        const mesh = this.mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);

        webgl.render(scene, camera);
    }

    tick() {
        requestAnimationFrame(this.tick.bind(this));

        this.webgl.render(this.scene, this.camera);
        this.mesh.rotation.x += 0.005;
        this.mesh.rotation.y += 0.01;

        const painter = this.painter;
        painter.drawImage(this.video, 0, 0, 300, 300);
        const markers = this.detector.detect(painter.getImageData(0, 0, 300, 300));
        
        markers.length ? this.show3d(markers[0]) : this.hide3d();
    }

    show3d(marker) {
        const corners = marker.corners;
        const mesh = this.mesh;

        corners.forEach(data => {
            data.x = data.x - (winWidth / 2);
            data.y = (winHeight / 2) - data.y;
        });

        const pos = this.posit.pose(corners);
        mesh.position.set(pos.bestTranslation[0], pos.bestTranslation[1], pos.bestTranslation[2]);
        mesh.visible = true;
    }

    hide3d() {
        this.mesh.visible = false;
    }
}