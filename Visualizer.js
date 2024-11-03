import * as THREE from 'three';
import { scene } from "./CurveCreator.js";
import { Line2 } from './three.js-master/examples/jsm/lines/Line2.js'
import { LineGeometry } from './three.js-master/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from './three.js-master/examples/jsm/lines/LineMaterial.js'
import { vectorEpsilon, vectorsEqual } from "./Math.js";

export function drawPoint( center )
{
    const geometry = new THREE.SphereGeometry( 1 );
    const material = new THREE.MeshLambertMaterial( { color: 'red' } );
    const pointMesh = new THREE.Mesh( geometry, material );

    pointMesh.position.x = center.x;
    pointMesh.position.y = center.y;
    pointMesh.position.z = center.z;

    scene.add( pointMesh );

    return pointMesh;
}
export function drawPolygon( points, color )
{
    const positions = [];
    for(let i = 0; i < points.length - 1; i++)
    {
        positions.push( points[i].x, points[i].y, points[i].z );
    }

    const lineMat = new LineMaterial( { color: color, linewidth: 10 } );
    /*vertexColors: false,
    dashed: false,
    alphaToCoverage: true, } );*/

    lineMat.resolution.set( window.innerWidth, window.innerHeight );

    const lineGeom = new LineGeometry();
    lineGeom.setPositions( positions );

    const polyline = new Line2( lineGeom, lineMat );
    polyline.computeLineDistances();

    scene.add( polyline );

    return polyline;
}

export function drawVector( startPt, endPt, color = 'yellow', cylRadius = 1, useBasicMaterial = false )
{
    const coneRadius = cylRadius * 2;
    const coneHeight = 2.5 * coneRadius;

    const startPtCopy = startPt.clone();
    const endPtCopy = endPt.clone();

    const vecLen = startPtCopy.distanceTo( endPtCopy );

    let material = new THREE.MeshPhongMaterial( { color: color } );
    if( useBasicMaterial )
    {
        material = new THREE.MeshBasicMaterial( { color: color } );
    }

    const cylGeometry = new THREE.CylinderGeometry( cylRadius, cylRadius, vecLen );
    const cylMesh = new THREE.Mesh( cylGeometry, material );
    cylMesh.translateY( vecLen / 2 );

    const coneGeometry = new THREE.ConeGeometry( coneRadius, coneHeight );
    const coneMesh = new THREE.Mesh( coneGeometry, material );
    coneMesh.translateY( vecLen );

    const vectorGroup = new THREE.Group();
    vectorGroup.add( cylMesh );
    vectorGroup.add( coneMesh );

    // the y axis is the up axis in THREE.js
    const yAxis = endPtCopy.clone().sub( startPtCopy.clone() ).normalize();
    let xAxis = new THREE.Vector3( 1, 0, 0 );
    if( vectorsEqual( xAxis, yAxis, vectorEpsilon ) )
    {
        xAxis = new THREE.Vector3( 0, 1, 0 );
    }
    const zAxis = new THREE.Vector3;
    zAxis.crossVectors( xAxis, yAxis ).normalize();
    xAxis.crossVectors( yAxis, zAxis ).normalize();

    const mat4 = new THREE.Matrix4;
    mat4.makeBasis( xAxis, yAxis, zAxis) ;

    vectorGroup.applyMatrix4( mat4 );
    vectorGroup.position.set( startPtCopy.x, startPtCopy.y, startPtCopy.z );

    scene.add( vectorGroup );

    return vectorGroup;
}
