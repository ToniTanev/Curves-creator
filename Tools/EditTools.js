import * as THREE from 'three';
import {sphere} from "../CurveCreator.js";
import {getMouse, getPlaneAtSpherePoint, intersectPlaneWithMouse, raycastMouse} from "../Math.js";
import {isAxisObj, isGridObj} from "../Objects/GridAndAxes.js";
import {ToolResult} from "./ToolsBase.js";
import {isCurvePointObj, isHermiteCurveObj} from "../Objects/CurveObjects.js";
import {deleteObject} from "../MemoryManagement.js";
import {drawVector} from "../Visualizer.js";

function resetVector( curve, vecInx, startPt, endPt )
{
    deleteObject( curve.visualVectors[ vecInx ] );
    curve.visualVectors[ vecInx ] = drawVector( startPt, endPt );

    curve.visualVectors[ vecInx ].parentCurve = curve;

    curve.visualVectors[ vecInx ].traverse( child =>
        {
            if ( child instanceof THREE.Mesh )
            {
                child.parentCurve = curve;
            }
        }
    );
}

export class MoveTool
{
    constructor()
    {
        this.clear();
    }

    clear()
    {
        this.toolPointsCnt = 0;
        this.pickedObj = null;
        this.objIndex = -1;
        this.oldPos = null;
        this.oldVec = null;
    }

    objectPicked( obj )
    {
        this.pickedObj = obj;
        this.objIndex = -1;

        const curve = obj.parentCurve;

        for( let i = 0; i < curve.meshPoints.length; i++ )
        {
            if( curve.meshPoints[ i ] === obj )
            {
                this.objIndex = i;
                this.oldPos = obj.position.clone();

                if( isHermiteCurveObj( curve ) )
                {
                    this.oldVec = curve.controlVectors[ i ].clone();
                    curve.controlVectors[ i ] = new THREE.Vector3( 0, 0, 0 );
                    deleteObject( curve.visualVectors[ i ] );
                }

                break;
            }
        }

        if( this.objIndex === - 1 && isHermiteCurveObj( curve ) )
        {
            for( let i = 0; i < curve.visualVectors.length; i++ )
            {
                if( curve.visualVectors[ i ] === obj || curve.visualVectors[ i ] === obj.parent )
                {
                    this.objIndex = i;
                    this.oldPos = curve.controlPoints[ i ].clone();
                    this.oldVec = curve.controlVectors[ i ].clone();
                    break;
                }
            }
        }
    }

    pointAdded( mouse )
    {
        if( this.toolPointsCnt === 0 )
        {
            const intersects = raycastMouse( mouse );
            const filteredIntersects = intersects.filter( (inters) => !isGridObj( inters.object ) &&
                !isAxisObj( inters.object ) );

            if( filteredIntersects.length > 0 && filteredIntersects[ 0 ].object.parentCurve !== undefined )
            {
                this.objectPicked( filteredIntersects[ 0 ].object );
                this.toolPointsCnt++;
            }
        }
        else if( this.toolPointsCnt === 1 )
        {
            const curve = this.pickedObj.parentCurve;

            if( isHermiteCurveObj( curve ) && isCurvePointObj( this.pickedObj ) )
            {
                // we're just setting the picked obj to be a vector
                // it doesn't matter what the vector's definition is, it will be fixed in onInteractive
                const dummyPt = new THREE.Vector3( 0, 0, 0 );
                resetVector( curve, this.objIndex, dummyPt, dummyPt );
                this.pickedObj = curve.visualVectors[ this.objIndex ];

                this.toolPointsCnt++;
            }
            else if( this.complete() )
            {
                return ToolResult.COMPLETED;
            }
        }
        else if( this.toolPointsCnt === 2 )
        {
            if( this.complete() )
            {
                return ToolResult.COMPLETED;
            }
        }

        return ToolResult.POINT_ADDED;
    }

    onInteractive( mouse )
    {
        if( this.pickedObj && this.objIndex !== -1 )
        {
            const curveObject = this.pickedObj.parentCurve;

            if( isCurvePointObj( this.pickedObj ) )
            {
                const intersects = raycastMouse( mouse );

                const inx = intersects.findIndex( intrs => intrs.object === sphere );

                if( inx !== -1 )
                {
                    const newPos = intersects[ inx ].point;
                    curveObject.controlPoints[ this.objIndex ] = newPos;
                    curveObject.meshPoints[ this.objIndex ].position.set( newPos.x, newPos.y, newPos.z );
                }
            }
            else // it is a Hermite vector obj
            {
                const startPt = curveObject.controlPoints[ this.objIndex ];
                const plane = getPlaneAtSpherePoint( startPt );
                const endPt = intersectPlaneWithMouse( mouse, plane );
                curveObject.controlVectors[ this.objIndex ] = endPt.clone().sub( startPt );
                resetVector( curveObject, this.objIndex, startPt, endPt );
            }

            curveObject.redrawPolys();
        }
    }

    complete()
    {
        this.clear();

        return true;
    }

    revert()
    {
        if( this.pickedObj && this.objIndex !== -1 )
        {
            const curveObject = this.pickedObj.parentCurve;
            curveObject.controlPoints[ this.objIndex ] = this.oldPos;
            curveObject.meshPoints[ this.objIndex ].position.set( this.oldPos.x, this.oldPos.y, this.oldPos.z );

            if( isHermiteCurveObj( curveObject ) )
            {
                curveObject.controlVectors[ this.objIndex ] = this.oldVec;
                const oldEndPt = this.oldPos.clone().add( this.oldVec );
                resetVector( curveObject, this.objIndex, this.oldPos, oldEndPt );
            }

            curveObject.redrawPolys();
        }

        this.clear();
    }
}

export class AddTool
{
    constructor()
    {
        this.pickedObj = null;
    }

    objectPicked( obj )
    {
        this.pickedObj = obj;
    }

    pointAdded( mouse )
    {

    }

    onInteractive( mouse )
    {

    }

    complete()
    {

    }

    revert()
    {

    }
}

export class DeleteTool
{
    constructor()
    {
        this.clear();
    }

    clear()
    {
        this.pickedObj = null;
        this.objIndex = -1;
    }

    objectPicked( obj )
    {
        this.pickedObj = obj;
        this.objIndex = -1;

        const curve = obj.parentCurve;

        for( let i = 0; i < curve.meshPoints.length; i++ )
        {
            if( curve.meshPoints[ i ] === obj )
            {
                this.objIndex = i;
                break;
            }
        }

        if( this.objIndex === - 1 && isHermiteCurveObj( curve ) )
        {
            for( let i = 0; i < curve.visualVectors.length; i++ )
            {
                if( curve.visualVectors[ i ] === obj || curve.visualVectors[ i ] === obj.parent )
                {
                    this.objIndex = i;
                    break;
                }
            }
        }
    }

    pointAdded( mouse )
    {
        const intersects = raycastMouse( mouse );
        const filteredIntersects = intersects.filter( (inters) => !isGridObj( inters.object ) &&
            !isAxisObj( inters.object ) );

        if( filteredIntersects.length > 0 && filteredIntersects[ 0 ].object.parentCurve !== undefined )
        {
            this.objectPicked( filteredIntersects[ 0 ].object );
            if( this.complete() )
            {
                return ToolResult.COMPLETED;
            }
        }

        return ToolResult.POINT_ADDED;
    }

    complete()
    {
        if( this.pickedObj && this.objIndex !== -1 )
        {
            const curve = this.pickedObj.parentCurve;

            deleteObject( curve.meshPoints[ this.objIndex ] );
            curve.controlPoints.splice( this.objIndex, 1 );
            curve.meshPoints.splice( this.objIndex, 1 );

            if( isHermiteCurveObj( curve ) )
            {
                deleteObject( curve.visualVectors[ this.objIndex ] );
                curve.controlVectors.splice( this.objIndex, 1 );
                curve.visualVectors.splice( this.objIndex, 1 );
            }

            curve.redrawPolys();
        }

        this.clear();

        return true;
    }

    revert()
    {
        this.clear();
    }
}