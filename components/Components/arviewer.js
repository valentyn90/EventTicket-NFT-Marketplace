import React from 'react';

export default class ARViewer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            appRendered: false,
        }
    }

    componentDidMount() {
        // To prevent double initialization
        if (this.state.appRendered) return;

        if (typeof window !== 'undefined') {
            require('aframe')
            require('mind-ar/dist/mindar-image.prod.js')
            require('mind-ar/dist/mindar-image-aframe.prod.js')
            this.setState({ appRendered: true })

            if (AFRAME.components.cloak == undefined) {
                AFRAME.registerComponent('cloak', {
                    init: function () {
                        // make sure the model is loaded first
                        this.el.addEventListener('model-loaded', e => {
                            let mesh = this.el.getObject3D('mesh') // grab the mesh
                            if (mesh === undefined) return;        // return if no mesh :(
                            mesh.traverse(function (node) {         // traverse through and apply settings
                                if (node.isMesh && node.material) {  // make sure the element can be a cloak
                                    node.material.colorWrite = false
                                    node.material.needsUpdate = true;
                                }
                            });
                        });
                    }
                });

                window.addEventListener('click', function () {
                    var v = document.querySelector('#card-video');
                    v.play();
                    var play_button = document.querySelector('#play_image');
                    play_button.setAttribute('visible', 'false');
                });
            }
        }
    }

    render() {
        return (
            <>
                <style jsx global>{`
                    * {
                        box-sizing: border-box;
                    }
  
                    video {
                        max-width: 900%!important;
                    }
                `}</style>
                {this.state.appRendered &&
                    <a-scene mindar-image="imageTargetSrc: ar/targets.mind;" color-space="sRGB"
                        renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false"
                        device-orientation-permission-ui="enabled: false">
                        <a-assets>
                            <a-asset-item id="mask" src="ar/models/mask.obj"></a-asset-item>
                            <video id="card-video" autoPlay webkit-playsinline="true" muted playsInline
                                loop={true} crossOrigin="anonymous" src={this.props.video_link}
                                type="video/mp4">
                            </video>
                        </a-assets>

                        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
                        <a-entity mindar-image-target="targetIndex: 0">
                            <a-image width="0.63" height="1.12875" position="0 0.05 0" src={this.props.image_link} />
                        </a-entity>
                        <a-entity mindar-image-target="targetIndex: 1">
                            <a-video src="#card-video" autoPlay webkit-playsinline="true" muted playsInline
                                loop={true} width={this.props.width} height="1" position="0 0 0"></a-video>
                            <a-entity obj-model="obj: #mask;" rotation="0 -90 0" position="0 0 0.001" cloak></a-entity>
                            <a-image id="play_image" width="0.2" height="0.2" position="0 0.05 0.01" src="ar/images/play.png" />
                        </a-entity>
                    </a-scene>
                }
            </>
        )
    }
}
