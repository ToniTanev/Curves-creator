import * as THREE from 'three';
import { scene } from "./CurveCreator.js";
import { Line2 } from './three.js-master/examples/jsm/lines/Line2.js'
import { LineGeometry } from './three.js-master/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from './three.js-master/examples/jsm/lines/LineMaterial.js'

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
}

// visible vector constants
const cylRadius = 1;
const coneRadius = cylRadius * 2;
const coneHeight = 2.5 * coneRadius;

export function drawVector( startPt, endPt )
{
    const startPtCopy = startPt.clone();
    const endPtCopy = endPt.clone();

    const vecLen = startPtCopy.distanceTo( endPtCopy );

    const material = new THREE.MeshPhongMaterial( { color: 'yellow' } );
    const cylGeometry = new THREE.CylinderGeometry( cylRadius, cylRadius, vecLen );
    const cylMesh = new THREE.Mesh( cylGeometry, material );
    cylMesh.translateY( vecLen / 2 );

    const coneGeometry = new THREE.ConeGeometry( coneRadius, coneHeight );
    const coneMesh = new THREE.Mesh( coneGeometry, material );
    coneMesh.translateY( vecLen );

    const vectorGroup = new THREE.Group();
    vectorGroup.add( cylMesh );
    vectorGroup.add( coneMesh );

    vectorGroup.lookAt( endPtCopy.x, endPtCopy.y, endPtCopy.z );
    vectorGroup.translateX(startPtCopy.x);
    vectorGroup.translateY(startPtCopy.y);
    vectorGroup.translateZ(startPtCopy.z);

    scene.add( vectorGroup );
}
