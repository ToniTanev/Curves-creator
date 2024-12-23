import {sphere} from "../CurveCreator.js";
import {getMouse, raycastMouse} from "../Math.js";
import {isAxisObj, isGridObj} from "../Objects/GridAndAxes.js";
import {ToolResult} from "./ToolsBase.js";
import {isHermiteCurveObj} from "../Objects/CurveObjects.js";
import {deleteObject} from "../MemoryManagement.js";

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
            const intersects = raycastMouse( mouse );

            const inx = intersects.findIndex( intrs => intrs.object === sphere );

            if( inx !== -1 )
            {
                const curveObject = this.pickedObj.parentCurve;
                const newPos = intersects[ inx ].point;
                curveObject.controlPoints[ this.objIndex ] = newPos;
                curveObject.meshPoints[ this.objIndex ].position.set( newPos.x, newPos.y, newPos.z );

                curveObject.redrawPolys();
            }
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