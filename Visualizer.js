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
