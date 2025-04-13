import * as THREE from 'three';
import {BezierCurve, offsetPoints, getPlaneAtSpherePoint, raycastMouse, intersectPlaneWithMouse, CubicHermiteCurves} from "../Math.js";
import {defaultPointSize, defaultVectorSize, drawPoint, drawPolygon, drawVector} from "../Visualizer.js";
import {scene, sphere} from "../CurveCreator.js";
import {deleteObject} from "../MemoryManagement.js";
import {BezierCurveObject, HermiteCurveObject, isCurveVectorObj} from "../Objects/CurveObjects.js";
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
        this.curve = new BezierCurveObject();
        this.interactivePoint = null;
    }

    revert()
    {
        this.curve.clearAll();
        deleteObject( this.interactivePoint );
        this.interactivePoint = null;
    }

    onInteractive( mouse )
    {
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
                const pointSize = this.curve.settings.pointScale * defaultPointSize;
                this.interactivePoint = drawPoint( newPos, this.curve.settings.pointColor, pointSize );
            }
        }

        if( this.interactivePoint )
        {
            // add a temporary control point so that the curve poly is interactive
            this.curve.controlPoints.push( this.interactivePoint.position );
        }

        this.curve.redrawPolys();

        if( this.interactivePoint )
        {
            this.curve.controlPoints.pop();
        }
    }

    pointAdded( mouse )
    {
        if( this.interactivePoint )
        {
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

        return ToolResult.POINT_ADDED;
    }

    objectRemoved( object = null ) // if object is null, deletes the last object
    {
        let index = -1;

        if( object )
        {
            index = this.curve.findIndex( object );
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

        if( this.curve.controlPoints.length >= 2 )
        {
            if( this.interactivePoint )
            {
                deleteObject( this.interactivePoint );
            }

            this.curve.redrawPolys();

            this.curve = new BezierCurveObject();
            this.interactivePoint = null;

            result = true;
        }

        return result;
    }

    redrawInteractive()
    {
        if( this.interactivePoint )
        {
            const pos = this.interactivePoint.position;

            deleteObject( this.interactivePoint );

            const pointSize = this.curve.settings.pointScale * defaultPointSize;
            this.interactivePoint = drawPoint( pos, this.curve.settings.pointColor, pointSize );
        }
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
                    const pointSize = this.curve.settings.pointScale * defaultPointSize;
                    this.interactivePoint = drawPoint( newPos, this.curve.settings.pointColor, pointSize );
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

                const vectorSize = this.curve.settings.vectorScale * defaultVectorSize;
                this.interactiveVector = drawVector( startPt, endPt, this.curve.settings.vectorColor, vectorSize );
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

        // we are storing whether we are deleting the last vector when it is the last object
        // because then we don't have to delete its corresponding point as well
        // in all other cases we delete both the point and the vector at the index
        let isDeletingLastVector = object === null && this.curve.visualVectors.length === this.curve.meshPoints.length;

        if( object )
        {
            index = this.curve.findIndex( object );

            if( isCurveVectorObj( object ) && index === this.curve.visualVectors.length - 1 && this.curve.visualVectors.length === this.curve.meshPoints.length )
            {
                // means that the last vector is selected and it is the last object
                isDeletingLastVector = true;
            }
        }
        else
        {
            index = this.curve.meshPoints.length - 1;
        }

        if( isDeletingLastVector ) // only deletes the last vector when it is the last object
        {
            deleteObject( this.curve.visualVectors[ index ] );
            this.curve.visualVectors.splice( index, 1 );
            this.curve.controlVectors.splice( index, 1 );
        }
        else if( index !== -1 ) // deletes both point and vector at the index
        {
            deleteObject( this.curve.meshPoints[ index ] );
            this.curve.meshPoints.splice( index, 1 );
            this.curve.controlPoints.splice( index, 1 );

            if( index < this.curve.visualVectors.length ) // if the point is not the last object, then it has a corresponding vector
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

        const needsFakeVec = this.curve.controlPoints.length === this.curve.controlVectors.length + 1;
        if( needsFakeVec )
        {
            this.curve.controlVectors.push( new THREE.Vector3( 0, 0, 0 ) );
        }

        this.curve.redrawPolys();

        if( needsFakeVec )
        {
            this.curve.controlVectors.pop();
        }
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

            this.curve = new HermiteCurveObject();
            this.interactivePoint = null;
            this.interactiveVector = null;

            result = true;
        }

        return result;
    }

    redrawInteractive()
    {
        if( this.interactivePoint )
        {
            const pos = this.interactivePoint.position;

            deleteObject( this.interactivePoint );

            const pointSize = this.curve.settings.pointScale * defaultPointSize;
            this.interactivePoint = drawPoint( pos, this.curve.settings.pointColor, pointSize );
        }

        if( this.interactiveVector )
        {
            const def = this.interactiveVector.def;

            deleteObject( this.interactiveVector );

            const startPt = this.curve.controlPoints.slice( -1 )[ 0 ];
            const endPt = startPt.clone().add( def );

            const vectorSize = this.curve.settings.vectorScale * defaultVectorSize;
            this.interactiveVector = drawVector( startPt, endPt, this.curve.settings.vectorColor, vectorSize );
            this.interactiveVector.def = def;
        }
    }
}