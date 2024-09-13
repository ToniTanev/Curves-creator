import * as THREE from 'three';
import {BezierCurve, offsetPoints} from "./Math.js";
import {drawPolygon} from "./Visualizer.js";
import {scene} from "./CurveCreator.js";

export class BezierCurveToolContext
{
    constructor()
    {
        this.clear();
    }

    clear()
    {
        this.curveDegree = 0;
        this.collectedPoints = [];
    }

    clearDrawn()
    {
        for( const point of this.collectedPoints )
        {
            scene.remove( point );
        }
    }

    pointAdded( point, onObject )
    {
        let finished = false;

        const geometry = new THREE.SphereGeometry(1);
        const material = new THREE.MeshLambertMaterial({color: 'red'});
        const pointMesh = new THREE.Mesh(geometry, material);

        pointMesh.position.x = point.x;
        pointMesh.position.y = point.y;
        pointMesh.position.z = point.z;

        scene.add(pointMesh);

        this.collectedPoints.push( point );

        if( this.collectedPoints.length === this.curveDegree )
        {
            const curve = new BezierCurve( this.collectedPoints );

            const curvePoints = curve.generateCurve();

            offsetPoints( curvePoints );

            drawPolygon( curvePoints, 'green' );

            this.clear();

            finished = true;
        }

        return finished;
    }
}

export class HermiteCurveTool
{
    constructor()
    {
        this.clear();
    }

    clear()
    {

    }

    clearDrawn()
    {

    }

    pointAdded( point, onObject )
    {

    }
}