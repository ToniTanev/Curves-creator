import * as THREE from 'three';
import {BezierCurve, offsetPoints} from "./Math.js";
import {drawPolygon} from "./Visualizer.js";
import {scene} from "./CurveCreator.js";


class CurveTool // interface
{
    constructor() {}

    clear() {}

    clearDrawn() {}

    revert() {}

    pointAdded( point, onObject ) {}

    pointRemoved( point = null ) {}

    complete() {}
}
export class BezierCurveTool
{
    constructor()
    {
        this.clear();
    }

    clear()
    {
        this.controlPoints = [];
        this.meshPoints = [];
    }

    clearDrawn()
    {
        for( const point of this.meshPoints )
        {
            scene.remove( point );
        }
    }

    revert()
    {
        this.clearDrawn();
        this.clear();
    }

    pointAdded( point, onObject )
    {
        const geometry = new THREE.SphereGeometry( 1 );
        const material = new THREE.MeshLambertMaterial( {color: 'red'} );
        const pointMesh = new THREE.Mesh( geometry, material );

        pointMesh.position.x = point.x;
        pointMesh.position.y = point.y;
        pointMesh.position.z = point.z;

        scene.add( pointMesh );
        this.meshPoints.push( pointMesh );

        this.controlPoints.push( point );
    }

    pointRemoved( point = null ) // if point is null, deletes the last point
    {
        let index = -1;

        if( point )
        {
            for( let i = 0; i < this.meshPoints.length; i++ )
            {
                if( point === this.meshPoints[i] )
                {
                    index = i;
                }
            }
        }
        else if( this.meshPoints.length > 0 )
        {
            index = this.meshPoints.length - 1;
        }

        if( index !== -1 )
        {
            scene.remove( point );
            this.meshPoints.splice( index, 1 );
            this.controlPoints.splice( index, 1 );
        }
    }

    complete()
    {
        if( this.controlPoints.length >= 2 )
        {
            const curve = new BezierCurve( this.controlPoints );

            const curvePoints = curve.generateCurve();

            offsetPoints( curvePoints );

            drawPolygon( curvePoints, 'green' );

            this.clear();
        }
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

    revert()
    {
        this.clearDrawn();
        this.clear();
    }

    pointAdded( point, onObject )
    {

    }

    pointRemoved( point = null )
    {

    }

    complete()
    {

    }
}