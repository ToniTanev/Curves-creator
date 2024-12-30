import {addTool, bezierTool, deleteTool, hermiteTool, moveTool} from "../CurveCreator.js";
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