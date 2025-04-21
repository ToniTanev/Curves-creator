import * as THREE from 'three';
import {scene, sphere} from "../CurveCreator.js";

export const defaultSphereRadius = 10;

export function drawSphere()
{
    const geometry = new THREE.SphereGeometry( defaultSphereRadius );
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

export function getSphereScale()
{
    return sphere.scale.x;
}

export function stickToSphere( pt )
{
    const sphereRadius = defaultSphereRadius * getSphereScale();
    return pt.normalize().multiplyScalar( sphereRadius );
}
