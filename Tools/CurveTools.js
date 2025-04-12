import * as THREE from 'three';
import {BezierCurve, offsetPoints, getPlaneAtSpherePoint, raycastMouse, intersectPlaneWithMouse, CubicHermiteCurves} from "../Math.js";
import {drawPoint, drawPolygon, drawVector} from "../Visualizer.js";
import {scene, sphere} from "../CurveCreator.js";
import {deleteObject} from "../MemoryManagement.js";
import {BezierCurveObject, HermiteCurveObject} from "../Objects/CurveObjects.js";
import {ToolResult} from "./ToolsBase.js";
import {BezierSettings, HermiteSettings} from "../Data/Settings.js";


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
        this.curve = new BezierCurveObject();
    }

    revert()
    {
        this.curve.clearAll();
    }

    onInteractive( mouse )
    {
        const intersects = raycastMouse( mouse );

        const inx = intersects.findIndex( intrs => intrs.object === sphere );

        if( inx !== -1 )
        {
            if( this.curve.meshPoints.length > 0 )
            {
                deleteObject( this.curve.meshPoints[ this.curve.meshPoints.length - 1 ] );
                this.curve.meshPoints.pop();
                this.curve.controlPoints.pop();
            }

            this.curve.meshPoints.push( drawPoint( intersects[ inx ].point ) );
            this.curve.controlPoints.push( intersects[ inx ].point );
        }

        this.curve.redrawPolys();
    }

    pointAdded( mouse )
    {
        const intersects = raycastMouse( mouse );

        const inx = intersects.findIndex( intrs => intrs.object === sphere );

        if( inx !== -1 )
        {
            const pointMesh = drawPoint( intersects[ inx ].point );
            this.curve.meshPoints.push( pointMesh );

            this.curve.controlPoints.push( intersects[ inx ].point );
        }

        return ToolResult.POINT_ADDED;
    }

    objectRemoved( object = null ) // if object is null, deletes the last object
    {
        let index = -1;

        if( object )
        {
            for( let i = 0; i < this.curve.meshPoints.length - 1; i++ )
            {
                if( object === this.curve.meshPoints[ i ] )
                {
                    index = i;
                }
            }
        }
        else if( this.curve.meshPoints.length > 0 )
        {
            index = this.curve.meshPoints.length - 1;
            object = this.curve.meshPoints[ index ];
        }

        if( index !== -1 )
        {
            deleteObject( object );
            this.curve.meshPoints.splice( index, 1 );
            this.curve.controlPoints.splice( index, 1 );
            this.curve.redrawPolys();
        }
    }

    complete()
    {
        let result = false;

        if( this.curve.controlPoints.length >= 3 ) // at least 2 added + 1 interactive points
        {
            // last pt is interactive so it doesn't count
            const lastPt = this.curve.meshPoints.pop();
            deleteObject( lastPt );
            this.curve.controlPoints.pop();

            this.curve.redrawPolys();
            this.curve.assignParent();

            this.curve = new BezierCurveObject();

            result = true;
        }

        return result;
    }
}

export class HermiteCurveTool
{
    constructor()
    {
        this.curve = new HermiteCurveObject();
        this.interactivePoint = null;
        this.interactiveVector = null;
    }

    revert()
    {
        this.curve.clearAll();
        deleteObject( this.interactivePoint );
        deleteObject( this.interactiveVector );
        this.interactivePoint = null;
        this.interactiveVector = null;
    }

    onInteractive( mouse )
    {
        if( this.curve.controlPoints.length === this.curve.controlVectors.length )
        {
            // should add interactive point
            const intersects = raycastMouse( mouse );

            const inx = intersects.findIndex( intrs => intrs.object === sphere );

            if( inx !== -1 )
            {
                const newPos = intersects[ inx ].point;

                if( this.interactivePoint !== null )
                {
                    this.interactivePoint.position.set( newPos.x, newPos.y, newPos.z );
                }
                else
                {
                    this.interactivePoint = drawPoint( newPos );
                }
            }
        }
        else
        {
            // should add interactive vector
            const startPt = this.curve.controlPoints.slice( -1 )[ 0 ];
            const plane = getPlaneAtSpherePoint( startPt );
            const endPt = intersectPlaneWithMouse( mouse, plane );

            if( endPt )
            {
                if( this.interactiveVector )
                {
                    deleteObject( this.interactiveVector );
                }

                this.interactiveVector = drawVector( startPt, endPt );
                this.interactiveVector.def = endPt.sub( startPt );
            }
        }

        if( this.interactivePoint )
        {
            // add a temporary control point and a temporary control vector so that the curve poly is interactive
            this.curve.controlPoints.push( this.interactivePoint.position );
            this.curve.controlVectors.push( new THREE.Vector3( 0, 0, 0 ) );
        }
        else if( this.interactiveVector )
        {
            // add a temporary control vector so that the curve poly is interactive
            this.curve.controlVectors.push( this.interactiveVector.def );
        }

        this.curve.redrawPolys();

        if( this.interactivePoint )
        {
            this.curve.controlPoints.pop();
            this.curve.controlVectors.pop();
        }
        else if( this.interactiveVector )
        {
            this.curve.controlVectors.pop();
        }
    }

    pointAdded( mouse )
    {
        if( this.interactivePoint )
        {
            // should add point
            const intersects = raycastMouse( mouse );

            const inx = intersects.findIndex( intrs => intrs.object === sphere );

            if( inx !== -1 )
            {
                this.interactivePoint.parentCurve = this.curve;
                this.curve.meshPoints.push( this.interactivePoint );
                this.curve.controlPoints.push( this.interactivePoint.position );

                this.interactivePoint = null;
            }
        }
        else if( this.interactiveVector )
        {
            // should add vector
            this.curve.assignAsParentToVector( this.interactiveVector );
            this.curve.visualVectors.push( this.interactiveVector );
            this.curve.controlVectors.push( this.interactiveVector.def );

            this.interactiveVector = null;
        }

        return ToolResult.POINT_ADDED;
    }

    objectRemoved( object = null )
    {
        if( this.curve.meshPoints.length === 0 && this.curve.visualVectors.length === 0 ) // nothing to remove
            return;

        let index = -1;

        // we are storing whether we are deleting the last object because if the last object is a vector
        // then we don't have to delete its corresponding point as well
        // in all other cases we delete both the point and the vector at the index
        let isDeletingLastObject = object === null;

        if( object )
        {
            for( let i = 0; i < this.curve.meshPoints.length; i++ )
            {
                if( object === this.curve.meshPoints[i] )
                {
                    index = i;
                }
            }

            for( let i = 0; i < this.curve.visualVectors.length; i++ )
            {
                if( object.parent === this.curve.visualVectors[i] )
                {
                    index = i;

                    if( index === this.curve.visualVectors.length - 1 && this.curve.visualVectors.length === this.curve.meshPoints.length )
                    {
                        // means that the last vector is selected and it is the last object
                        isDeletingLastObject = true;
                    }
                }
            }
        }
        else
        {
            index = this.curve.meshPoints.length - 1;
        }

        if( isDeletingLastObject ) // only deletes the last point or vector
        {
            if( this.curve.meshPoints.length === this.curve.visualVectors.length + 1 )
            {
                // the last object is a point
                deleteObject( this.curve.meshPoints[ index ] );
                this.curve.meshPoints.splice( index, 1 );
                this.curve.controlPoints.splice( index, 1 );
            }
            else
            {
                // the last object is a vector
                deleteObject( this.curve.visualVectors[ index ] );
                this.curve.visualVectors.splice( index, 1 );
                this.curve.controlVectors.splice( index, 1 );
            }
        }
        else if( index !== -1 ) // deletes both point and vector at the index
        {
            deleteObject( this.curve.meshPoints[ index ] );
            this.curve.meshPoints.splice( index, 1 );
            this.curve.controlPoints.splice( index, 1 );

            if( index < this.curve.visualVectors.length )
            {
                deleteObject( this.curve.visualVectors[ index ] );
                this.curve.visualVectors.splice(index, 1);
                this.curve.controlVectors.splice(index, 1);
            }
        }

        if( this.interactivePoint )
        {
            deleteObject( this.interactivePoint );
            this.interactivePoint = null;
        }

        if( this.interactiveVector )
        {
            deleteObject( this.interactiveVector );
            this.interactiveVector = null;
        }

        this.curve.redrawPolys();
    }

    complete()
    {
        let result = false;

        if( this.curve.controlPoints.length >= 2 && this.curve.controlPoints.length === this.curve.controlVectors.length )
        {
            if( this.interactivePoint )
            {
                deleteObject( this.interactivePoint );
            }

            this.curve.redrawPolys();
            this.curve.assignParent();

            this.curve = new HermiteCurveObject();
            this.interactivePoint = null;
            this.interactiveVector = null;

            result = true;
        }

        return result;
    }
}