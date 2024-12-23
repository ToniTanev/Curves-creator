import {addTool, bezierTool, deleteTool, hermiteTool, moveTool} from "../CurveCreator.js";

export function isCurveTool( tool )
{
    return tool === bezierTool || tool === hermiteTool;
}

export function isEditTool( tool )
{
    return tool === moveTool || tool === addTool || tool === deleteTool;
}