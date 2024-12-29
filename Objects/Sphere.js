import * as THREE from 'three';
import {scene} from "../CurveCreator.js";


export function drawSphere()
{
    const geometry = new THREE.SphereGeometry( 10 );
    const material = new THREE.MeshPhongMaterial( { color: 0x049ef4 } );
    const sphere = new THREE.Mesh( geometry, material );

    scene.add( sphere );

    return sphere;
}

export function drawSphereScaler( height, boxScale )
{
    const material = new THREE.MeshBasicMaterial( { color: 'yellow' } );

    const cylGeometry = new THREE.CylinderGeometry( 0.5, 0.5, height, 32 );
    const cylinder = new THREE.Mesh( cylGeometry, material );
    cylinder.translateY( height / 2 );

    const boxGeometry = new THREE.BoxGeometry( 1.5, 0.8, 1.5 );
    const box = new THREE.Mesh( boxGeometry, material );
    box.translateY( height );

    const scaler = new THREE.Group;
    scaler.name = "scaler";
    cylinder.name = "scaler";
    box.name = "scaler";

    scaler.add( cylinder );
    scaler.add( box );

    return scaler;
}