import {addTool, bezierTool, deleteTool, hermiteTool, moveTool} from "../main.js";
import {isAxisObj, isGridObj} from "../Objects/GridAndAxes.js";

export function isCurveTool( tool )
{
    return tool === bezierTool || tool === hermiteTool;
}

export function isEditTool( tool )
{
    return tool === moveTool || tool === addTool || tool === deleteTool;
}

export const ToolResult = Object.freeze({
    POINT_ADDED: 0,
    COMPLETED: 1,
});

export function filterIntersects( intersects )
{
    return intersects.filter( (inters) => !isGridObj( inters.object ) &&
        !isAxisObj( inters.object ) && !inters.object.isTransformControlHelper );
}

function isHighlightableObj( obj )
{
    return obj.type !== "Line2";
}

export function filterHighlightableIntersects( intersects )
{
    return intersects.filter( (inters) => isHighlightableObj( inters.object ) );
}

export function highlightVisualVectorObj( obj, outlinePass )
{
    let group = obj.children.length === 2 ? obj : obj.parent;

    for( const child of group.children )
    {
        outlinePass.selectedObjects.push( child );
    }
}