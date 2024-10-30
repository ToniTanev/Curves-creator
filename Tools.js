import * as THREE from 'three';
import {BezierCurve, offsetPoints, getPlaneAtSpherePoint, raycastMouse, intersectPlaneWithMouse, CubicHermiteCurves} from "./Math.js";
import {drawPolygon, drawVector} from "./Visualizer.js";
import {scene} from "./CurveCreator.js";


class CurveTool // interface
{
    constructor() {}

    clear() {}

    clearDrawn() {}

    revert() {}

    onInteractive( mouse ) {}

    pointAdded( mouse ) {}

    objectRemoved( object = null ) {}

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

    onInteractive( mouse ) {}

    pointAdded( mouse )
    {
        const intersects = raycastMouse( mouse );

        if( intersects.length > 0 )
        {
            const geometry = new THREE.SphereGeometry(1);
            const material = new THREE.MeshLambertMaterial({color: 'red'});
            const pointMesh = new THREE.Mesh(geometry, material);

            const point = intersects[ 0 ].point;
            pointMesh.position.x = point.x;
            pointMesh.position.y = point.y;
            pointMesh.position.z = point.z;

            scene.add(pointMesh);
            this.meshPoints.push(pointMesh);

            this.controlPoints.push(point);
        }
    }

    objectRemoved( object = null ) // if object is null, deletes the last object
    {
        let index = -1;

        if( object )
        {
            for( let i = 0; i < this.meshPoints.length; i++ )
            {
                if( object === this.meshPoints[i] )
                {
                    index = i;
                }
            }
        }
        else if( this.meshPoints.length > 0 )
        {
            index = this.meshPoints.length - 1;
            object = this.meshPoints[ index ];
        }

        if( index !== -1 )
        {
            scene.remove( object );
            this.meshPoints.splice( index, 1 );
            this.controlPoints.splice( index, 1 );
        }
    }

    complete()
    {
        let result = false;

        if( this.controlPoints.length >= 2 )
        {
            const curve = new BezierCurve( this.controlPoints );

            const curvePoints = curve.generateCurve();

            offsetPoints( curvePoints );

            drawPolygon( curvePoints, 'green' );

            this.clear();

            result = true;
        }

        return result;
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
        this.controlPoints = [];
        this.meshPoints = [];
        this.controlVectors = [];
        this.visualVectors = [];
        this.interactiveVector = null;
    }

    clearDrawn()
    {
        for( const point of this.meshPoints )
        {
            scene.remove( point );
        }

        for( const vector of this.visualVectors )
        {
            scene.remove( vector );
        }

        if( this.interactiveVector )
        {
            scene.remove( this.interactiveVector );
        }
    }

    revert()
    {
        this.clearDrawn();
        this.clear();
    }

    onInteractive( mouse )
    {
        if( this.interactiveVector )
        {
            scene.remove( this.interactiveVector );
            this.interactiveVector = null;
        }

        if( this.controlVectors.length === this.controlPoints.length - 1 )
        {
            const plane = getPlaneAtSpherePoint( this.controlPoints.slice( -1 )[ 0 ] );
            const pt = intersectPlaneWithMouse( mouse, plane );
            
            this.interactiveVector = drawVector( this.controlPoints.slice( -1 )[ 0 ], pt );
            scene.add( this.interactiveVector );
        }
    }

    pointAdded( mouse )
    {
        if( this.controlPoints.length === this.controlVectors.length )
        {
            // should add point
            const intersects = raycastMouse( mouse );

            if( intersects.length > 0 )
            {
                const geometry = new THREE.SphereGeometry(1);
                const material = new THREE.MeshLambertMaterial({color: 'red'});
                const pointMesh = new THREE.Mesh(geometry, material);

                const point = intersects[ 0 ].point;
                pointMesh.position.x = point.x;
                pointMesh.position.y = point.y;
                pointMesh.position.z = point.z;

                scene.add(pointMesh);
                this.meshPoints.push(pointMesh);

                this.controlPoints.push(point);
            }
        }
        else
        {
            // should add vector
            const vecStart = this.controlPoints.slice( -1 )[ 0 ];
            const plane = getPlaneAtSpherePoint( vecStart );
            const vecEnd = intersectPlaneWithMouse( mouse, plane );

            const visualVector = drawVector( vecStart, vecEnd );
            this.visualVectors.push( visualVector );

            this.controlVectors.push( vecEnd.sub( vecStart ) );
        }
    }

    objectRemoved( object = null )
    {
        if( this.meshPoints.length === 0 && this.visualVectors.length === 0 ) // nothing to remove
            return;

        let index = -1;

        // we are storing whether we are deleting the last object because if the last object is a vector
        // then we don't have to delete its corresponding point as well
        // in all other cases we delete both the point and the vector at the index
        let isDeletingLastObject = object === null;

        if( object )
        {
            for( let i = 0; i < this.meshPoints.length; i++ )
            {
                if( object === this.meshPoints[i] )
                {
                    index = i;
                }
            }

            for( let i = 0; i < this.visualVectors.length; i++ )
            {
                if( object.parent === this.visualVectors[i] )
                {
                    index = i;

                    if( index === this.visualVectors.length - 1 && this.visualVectors.length === this.meshPoints.length )
                    {
                        // means that the last vector is selected and it is the last object
                        isDeletingLastObject = true;
                    }
                }
            }
        }
        else
        {
            index = this.meshPoints.length - 1;
        }

        if( isDeletingLastObject ) // only deletes the last point or vector
        {
            if( this.meshPoints.length === this.visualVectors.length + 1 )
            {
                // the last object is a point
                scene.remove( this.meshPoints[ index ] );
                this.meshPoints.splice( index, 1 );
                this.controlPoints.splice( index, 1 );
            }
            else
            {
                // the last object is a vector
                scene.remove( this.visualVectors[ index ] );
                this.visualVectors.splice( index, 1 );
                this.controlVectors.splice( index, 1 );
            }
        }
        else if( index !== -1 )// deletes both point and vector at the index
        {
            scene.remove( this.meshPoints[ index ] );
            this.meshPoints.splice( index, 1 );
            this.controlPoints.splice( index, 1 );

            if( index < this.visualVectors.length )
            {
                scene.remove(this.visualVectors[index]);
                this.visualVectors.splice(index, 1);
                this.controlVectors.splice(index, 1);
            }
        }

        if( index !== -1 && this.interactiveVector )
        {
            scene.remove( this.interactiveVector );
            this.interactiveVector = null;
        }
    }

    complete()
    {
        let result = false;

        if( this.controlPoints.length >= 2 )
        {
            const curve = new CubicHermiteCurves( this.controlPoints, this.controlVectors );

            const curvePoints = curve.generateCurves();

            offsetPoints( curvePoints );

            drawPolygon( curvePoints, 'green' );

            this.clear();

            result = true;
        }

        return result;
    }
}