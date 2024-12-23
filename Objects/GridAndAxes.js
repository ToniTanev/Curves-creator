import * as THREE from 'three';
import {scene} from "../CurveCreator.js";
import {drawVector} from "../Visualizer.js";

export function drawGrid()
{
    const size = 100;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper( size, divisions );
    gridHelper.name = "gridHelper";
    scene.add( gridHelper );

    return gridHelper;
}

export function drawAxes()
{
    const vecLen = 25;
    const vecThickness = 0.25;

    const xAxis = drawVector( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( vecLen, 0, 0 ), 'red', vecThickness, true );
    const yAxis = drawVector( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, vecLen ), 'green', vecThickness, true );
    const zAxis = drawVector( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, vecLen, 0 ), 'blue', vecThickness, true );

    xAxis.name = "xAxis";
    yAxis.name = "yAxis";
    zAxis.name = "zAxis";

    return [ xAxis, yAxis, zAxis ];
}

export function isGridObj( obj )
{
    return obj.name === "gridHelper";
}

export function isAxisObj( obj )
{
    return obj.name === "xAxis" || obj.name === "yAxis" || obj.name === "zAxis" ||
        obj.parent.name === "xAxis" || obj.parent.name === "yAxis" || obj.parent.name === "zAxis";
}