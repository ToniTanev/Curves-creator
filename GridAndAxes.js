import * as THREE from 'three';
import {scene} from "./CurveCreator.js";

export function drawGrid()
{
    const size = 100;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper( size, divisions );
    scene.add( gridHelper );

    return gridHelper;
}