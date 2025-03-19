import * as THREE from 'three';
import {scene} from "../CurveCreator.js";


export function drawSphere()
{
    const geometry = new THREE.SphereGeometry( 10 );
    const material = new THREE.MeshPhongMaterial( { color: 0x049ef4 } );
    const sphere = new THREE.Mesh( geometry, material );

    sphere.name = "Sphere";

    scene.add( sphere );

    return sphere;
}

export function isSphereObj( obj )
{
    return obj.name === "Sphere";
}
