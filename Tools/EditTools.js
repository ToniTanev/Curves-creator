import * as THREE from 'three';
import {hoverOutlinePass} from "../CurveCreator.js";
import {getMouse, getPlaneAtSpherePoint, intersectPlaneWithMouse, raycastMouse, raycastMouseOnSphere} from "../Math.js";
import {isAxisObj, isGridObj} from "../Objects/GridAndAxes.js";
import {filterHighlightableIntersects, filterIntersects, highlightVisualVectorObj, ToolResult} from "./ToolsBase.js";
import {isCurvePointObj, isCurveVectorObj, isHermiteCurveObj, onDeleteCurveObject} from "../Objects/CurveObjects.js";
import {deleteObject} from "../MemoryManagement.js";
import {defaultPointSize, defaultVectorSize, drawPoint, drawVector} from "../Visualizer.js";

function resetVector( curve, vecInx, startPt, endPt )
{
    deleteObject( curve.visualVectors[ vecInx ] );
    const vectorSize = curve.settings.vectorScale * defaultVectorSize;
    curve.visualVectors[ vecInx ] = drawVector( startPt, endPt, curve.settings.vectorColor, vectorSize );

    curve.assignAsParentToVector( curve.visualVectors[ vecInx ] );
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
            const filteredIntersects = filterIntersects( intersects );

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
        hoverOutlinePass.selectedObjects = [];

        if( this.pickedObj && this.objIndex !== -1 )
        {
            const curveObject = this.pickedObj.parentCurve;

            if( isCurvePointObj( this.pickedObj ) )
            {
                const newPos = raycastMouseOnSphere( mouse );

                if( newPos )
                {
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
        else
        {
            const intersects = raycastMouse( mouse );
            let filteredIntersects = filterIntersects( intersects );
            filteredIntersects = filterHighlightableIntersects( filteredIntersects );

            if( filteredIntersects.length > 0 )
            {
                const hoveredObj = filteredIntersects[ 0 ].object;
                if( isCurveVectorObj( hoveredObj ) )
                {
                    highlightVisualVectorObj( hoveredObj, hoverOutlinePass );
                }
                else if( isCurvePointObj( hoveredObj ) )
                {
                    hoverOutlinePass.selectedObjects.push( hoveredObj );
                }
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
        this.clear();
    }

    clear()
    {
        this.toolPointsCnt = 0;
        this.pickedObj = null;
        this.objIndex = -1;
    }

    objectPicked( obj )
    {
        const curve = obj.parentCurve;

        let prevInx = curve.findIndex( obj );

        if( prevInx !== -1 )
        {
            this.objIndex = prevInx + 1;
            // the point's definition doesn't matter, it will be fixed in onInteractive
            const newPt = new THREE.Vector3( 0, 0, 0 );
            curve.controlPoints.splice( this.objIndex, 0, newPt );
            const pointSize = curve.settings.pointScale * defaultPointSize;
            curve.meshPoints.splice( this.objIndex, 0, drawPoint( newPt, curve.settings.pointColor, pointSize ) );
            curve.meshPoints[ this.objIndex ].parentCurve = curve;
            this.pickedObj = curve.meshPoints[ this.objIndex ];

            if( isHermiteCurveObj( curve ) )
            {
                // the vector's definition doesn't matter, it will be fixed in onInteractive
                curve.controlVectors.splice( this.objIndex, 0, newPt );
            }
        }
    }

    pointAdded( mouse )
    {
        if( this.toolPointsCnt === 0 )
        {
            const intersects = raycastMouse( mouse );
            const filteredIntersects = filterIntersects( intersects );

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
                // we're setting the picked obj to be the new vector
                // it doesn't matter what the vector's definition is, it will be fixed in onInteractive
                const dummyPt = new THREE.Vector3( 0, 0, 0 );
                const vectorSize = curve.settings.vectorScale * defaultVectorSize;
                curve.visualVectors.splice( this.objIndex, 0, drawVector( dummyPt, dummyPt, curve.settings.vectorColor, vectorSize ) );

                curve.assignAsParentToVector( curve.visualVectors[ this.objIndex ] );

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
    }

    onInteractive( mouse )
    {
        hoverOutlinePass.selectedObjects = [];

        if( this.pickedObj && this.objIndex !== -1 )
        {
            const curveObject = this.pickedObj.parentCurve;

            if( isCurvePointObj( this.pickedObj ) )
            {
                const newPos = raycastMouseOnSphere( mouse );

                if( newPos )
                {
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
        else
        {
            const intersects = raycastMouse( mouse );
            let filteredIntersects = filterIntersects( intersects );
            filteredIntersects = filterHighlightableIntersects( filteredIntersects );

            if( filteredIntersects.length > 0 )
            {
                const hoveredObj = filteredIntersects[ 0 ].object;

                if( hoveredObj.parentCurve !== undefined )
                {
                    const curve = hoveredObj.parentCurve;
                    const inx = curve.findIndex( hoveredObj );
                    hoverOutlinePass.selectedObjects.push( curve.meshPoints[ inx ] );

                    if( isHermiteCurveObj( curve ) )
                    {
                        highlightVisualVectorObj( curve.visualVectors[ inx ], hoverOutlinePass );
                    }
                }
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
            curveObject.controlPoints.splice( this.objIndex, 1 );
            deleteObject( curveObject.meshPoints[ this.objIndex ] );
            curveObject.meshPoints.splice( this.objIndex, 1 );

            if( isHermiteCurveObj( curveObject ) )
            {
                curveObject.controlVectors.splice( this.objIndex, 1 );

                if( this.toolPointsCnt === 2 ) // means that the visual vector has been added
                {
                    deleteObject( curveObject.visualVectors[ this.objIndex ] );
                    curveObject.visualVectors.splice( this.objIndex, 1 );
                }
            }

            curveObject.redrawPolys();
        }

        this.clear();
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
        this.objIndex = obj.parentCurve.findIndex( obj );
    }

    pointAdded( mouse )
    {
        const intersects = raycastMouse( mouse );
        const filteredIntersects = filterIntersects( intersects );

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

    onInteractive( mouse )
    {
        hoverOutlinePass.selectedObjects = [];

        const intersects = raycastMouse( mouse );
        let filteredIntersects = filterIntersects( intersects );
        filteredIntersects = filterHighlightableIntersects( filteredIntersects );

        if( filteredIntersects.length > 0 )
        {
            const hoveredObj = filteredIntersects[ 0 ].object;

            if( hoveredObj.parentCurve !== undefined )
            {
                const curve = hoveredObj.parentCurve;
                const inx = curve.findIndex( hoveredObj );
                hoverOutlinePass.selectedObjects.push( curve.meshPoints[ inx ] );

                if( isHermiteCurveObj( curve ) )
                {
                    highlightVisualVectorObj( curve.visualVectors[ inx ], hoverOutlinePass );
                }
            }
        }
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

            if( curve.controlPoints.length === 0 )
            {
                onDeleteCurveObject( curve );
            }
        }

        this.clear();

        return true;
    }

    revert()
    {
        this.clear();
    }
}