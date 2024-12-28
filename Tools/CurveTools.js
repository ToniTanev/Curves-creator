import * as THREE from 'three';
import {BezierCurve, offsetPoints, getPlaneAtSpherePoint, raycastMouse, intersectPlaneWithMouse, CubicHermiteCurves} from "../Math.js";
import {drawPoint, drawPolygon, drawVector} from "../Visualizer.js";
import {scene, sphere} from "../CurveCreator.js";
import {deleteObject} from "../MemoryManagement.js";
import {BezierCurveObject, HermiteCurveObject} from "../Objects/CurveObjects.js";
import {ToolResult} from "./ToolsBase.js";


class CurveTool // interface
{
    constructor() {}

    clear() {}

    clearDrawn() {}

    clearInteractive() {}

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

        // interactive objects
        this.interactivePoint = null;

        // the interactive Bezier obj owns only the interactive polys, it doesn't own the points
        // therefore, it shouldn't delete the points
        this.interactiveBezierObj = new BezierCurveObject();
    }

    clearDrawn()
    {
        for( const point of this.meshPoints )
        {
            deleteObject( point );
        }

        this.clearInteractive();
    }

    clearInteractive()
    {
        deleteObject( this.interactivePoint );
        this.interactiveBezierObj.clearPolys();
    }

    revert()
    {
        this.clearDrawn();
        this.clear();
    }

    onInteractive( mouse )
    {
        deleteObject( this.interactivePoint );
        this.interactivePoint = null;

        const currControlPoints = this.controlPoints.slice();

        const intersects = raycastMouse( mouse );

        const inx = intersects.findIndex( intrs => intrs.object === sphere );

        if( inx !== -1 )
        {
            this.interactivePoint = drawPoint( intersects[ inx ].point );
            currControlPoints.push( intersects[ inx ].point );
        }

        if( currControlPoints.length >= 2 )
        {
            this.interactiveBezierObj.controlPoints = currControlPoints;

            this.interactiveBezierObj.redrawPolys();
        }
    }

    pointAdded( mouse )
    {
        const intersects = raycastMouse( mouse );

        const inx = intersects.findIndex( intrs => intrs.object === sphere );

        if( inx !== -1 )
        {
            const pointMesh = drawPoint( intersects[ inx ].point );
            this.meshPoints.push( pointMesh );

            this.controlPoints.push( intersects[ inx ].point );
        }

        return ToolResult.POINT_ADDED;
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
            deleteObject( object );
            this.meshPoints.splice( index, 1 );
            this.controlPoints.splice( index, 1 );
        }
    }

    complete()
    {
        let result = false;

        if( this.controlPoints.length >= 2 )
        {
            // the new Bezier obj becomes owner of the points
            const bezierObj = new BezierCurveObject();
            bezierObj.controlPoints = this.controlPoints;
            bezierObj.meshPoints = this.meshPoints;

            bezierObj.redrawPolys();
            bezierObj.assignParent();

            this.clearInteractive();
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

        // interactive objects
        this.interactivePoint = null;
        this.interactiveVector = null;

        // the interactive Hermite obj owns only the interactive polys, it doesn't own the points and the vectors
        // therefore, it shouldn't delete the points and the vectors
        this.interactiveHermiteObj = new HermiteCurveObject();
    }

    clearDrawn()
    {
        for( const point of this.meshPoints )
        {
            deleteObject( point );
        }

        for( const vector of this.visualVectors )
        {
            deleteObject( vector );
        }

        this.clearInteractive();
    }

    clearInteractive()
    {
        deleteObject( this.interactivePoint );
        deleteObject( this.interactiveVector );
        this.interactiveHermiteObj.clearPolys();
    }

    revert()
    {
        this.clearDrawn();
        this.clear();
    }

    onInteractive( mouse )
    {
        deleteObject( this.interactivePoint );
        this.interactivePoint = null;

        deleteObject( this.interactiveVector );
        this.interactiveVector = null;

        const currControlPoints = this.controlPoints.slice();
        const currControlVectors = this.controlVectors.slice();

        if( this.controlVectors.length === this.controlPoints.length )
        {
            const intersects = raycastMouse( mouse );

            const inx = intersects.findIndex( intrs => intrs.object === sphere );

            if( inx !== -1 )
            {
                this.interactivePoint = drawPoint( intersects[ inx ].point );
                currControlPoints.push( intersects[ inx ].point );
                currControlVectors.push( new THREE.Vector3( 0, 0, 0 ) );
            }
        }
        else if( this.controlVectors.length === this.controlPoints.length - 1 )
        {
            const startPt = this.controlPoints.slice( -1 )[ 0 ];
            const plane = getPlaneAtSpherePoint( startPt );
            const endPt = intersectPlaneWithMouse( mouse, plane );
            
            this.interactiveVector = drawVector( startPt, endPt );
            currControlVectors.push( endPt.sub( startPt ) );
        }

        if( currControlPoints.length >= 2 )
        {
            this.interactiveHermiteObj.controlPoints = currControlPoints;
            this.interactiveHermiteObj.controlVectors = currControlVectors;

            this.interactiveHermiteObj.redrawPolys();
        }
    }

    pointAdded( mouse )
    {
        if( this.controlPoints.length === this.controlVectors.length )
        {
            // should add point
            const intersects = raycastMouse( mouse );

            const inx = intersects.findIndex( intrs => intrs.object === sphere );

            if( inx !== -1 )
            {
                const pointMesh = drawPoint( intersects[ inx ].point );
                this.meshPoints.push( pointMesh );

                this.controlPoints.push( intersects[ inx ].point );
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

        return ToolResult.POINT_ADDED;
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
                deleteObject( this.meshPoints[ index ] );
                this.meshPoints.splice( index, 1 );
                this.controlPoints.splice( index, 1 );
            }
            else
            {
                // the last object is a vector
                deleteObject( this.visualVectors[ index ] );
                this.visualVectors.splice( index, 1 );
                this.controlVectors.splice( index, 1 );
            }
        }
        else if( index !== -1 )// deletes both point and vector at the index
        {
            deleteObject( this.meshPoints[ index ] );
            this.meshPoints.splice( index, 1 );
            this.controlPoints.splice( index, 1 );

            if( index < this.visualVectors.length )
            {
                deleteObject( this.visualVectors[ index ] );
                this.visualVectors.splice(index, 1);
                this.controlVectors.splice(index, 1);
            }
        }

        if( index !== -1 && this.interactiveVector )
        {
            deleteObject( this.interactiveVector );
            this.interactiveVector = null;
        }
    }

    complete()
    {
        let result = false;

        if( this.controlPoints.length >= 2 && this.controlPoints.length === this.controlVectors.length )
        {
            // the new Hermite obj becomes owner of the points and the vectors
            const hermiteObj = new HermiteCurveObject();
            hermiteObj.controlPoints = this.controlPoints;
            hermiteObj.meshPoints = this.meshPoints;
            hermiteObj.controlVectors = this.controlVectors;
            hermiteObj.visualVectors = this.visualVectors;

            hermiteObj.redrawPolys();
            hermiteObj.assignParent();

            this.clearInteractive();
            this.clear();

            result = true;
        }

        return result;
    }
}