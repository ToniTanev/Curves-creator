import {sphere} from "../CurveCreator.js";
import {raycastMouse} from "../Math.js";

export class MoveTool
{
    constructor()
    {
        this.clear();
    }

    clear()
    {
        this.pickedObj = null;
        this.objIndex = -1;
        this.objIsPoint = true;
        this.oldPos = null;
        this.oldVec = null;
    }

    objectPicked( obj )
    {
        this.pickedObj = obj;
        this.oldPos = obj.position.clone();
        this.objIndex = -1;

        for( let i = 0; i < obj.parentCurve.meshPoints.length; i++ )
        {
            if( obj.parentCurve.meshPoints[ i ] === obj )
            {
                this.objIndex = i;
                break;
            }
        }
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
        this.pickedObj = null;
    }

    objectPicked( obj )
    {
        this.pickedObj = obj;
    }

    complete()
    {

    }

    revert()
    {

    }
}