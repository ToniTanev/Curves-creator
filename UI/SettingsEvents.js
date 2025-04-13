import {activeTool, selectionOutlinePass, selectionTool} from "../CurveCreator.js";
import {isCurveTool} from "../Tools/ToolsBase.js";
import {isCurveObj, isHermiteCurveObj} from "../Objects/CurveObjects.js";
import {isSphereObj} from "../Objects/Sphere.js";


// tool settings events
function onToolShowControlPolygonCheckbox( event )
{
    if( isCurveTool( activeTool ) )
    {
        activeTool.curve.settings.showControlPoly = document.getElementById( "toolShowControlPolyCheck" ).checked;
        activeTool.curve.redrawPolys();
    }
}

function onToolControlPolygonColorChange( event )
{
    if( isCurveTool( activeTool ) )
    {
        activeTool.curve.settings.controlPolyColor = document.getElementById( "toolControlPolygonColorPicker" ).value;
        activeTool.curve.redrawPolys();
    }
}

function onToolCurveColorChange( event )
{
    if( isCurveTool( activeTool ) )
    {
        activeTool.curve.settings.curveColor = document.getElementById( "toolCurveColorPicker" ).value;
        activeTool.curve.redrawPolys();
    }
}

function onToolPointsScaleEdit( event )
{
    if( isCurveTool( activeTool ) )
    {
        activeTool.curve.settings.pointScale = parseFloat( document.getElementById( "toolPointsScaleEdit" ).value );
        activeTool.curve.redrawPointsAndVectors();
        activeTool.curve.highlight( selectionOutlinePass );
        activeTool.redrawInteractive();
    }
}

function onToolPointsColorChange( event )
{
    if( isCurveTool( activeTool ) )
    {
        activeTool.curve.settings.pointColor = document.getElementById( "toolPointsColorPicker" ).value;
        activeTool.curve.redrawPointsAndVectors();
        activeTool.curve.highlight( selectionOutlinePass );
        activeTool.redrawInteractive();
    }
}

function onToolVectorsScaleEdit( event )
{
    if( isCurveTool( activeTool ) && isHermiteCurveObj( activeTool.curve ) )
    {
        activeTool.curve.settings.vectorScale = parseFloat( document.getElementById( "toolVectorsScaleEdit" ).value );
        activeTool.curve.redrawPointsAndVectors();
        activeTool.curve.highlight( selectionOutlinePass );
        activeTool.redrawInteractive();
    }
}

function onToolVectorsColorChange( event )
{
    if( isCurveTool( activeTool ) && isHermiteCurveObj( activeTool.curve ) )
    {
        activeTool.curve.settings.vectorColor = document.getElementById( "toolVectorsColorPicker" ).value;
        activeTool.curve.redrawPointsAndVectors();
        activeTool.curve.highlight( selectionOutlinePass );
        activeTool.redrawInteractive();
    }
}

// object settings events
function onObjectShowControlPolygonCheckbox( event )
{
    if( activeTool === selectionTool && isCurveObj( activeTool.selectedObj ) )
    {
        const curve = activeTool.selectedObj;
        curve.settings.showControlPoly = document.getElementById( "objectShowControlPolyCheck" ).checked;
        curve.redrawPolys();
    }
}

function onObjectControlPolygonColorChange( event )
{
    if( activeTool === selectionTool && isCurveObj( activeTool.selectedObj ) )
    {
        const curve = activeTool.selectedObj;
        curve.settings.controlPolyColor = document.getElementById( "objectControlPolygonColorPicker" ).value;
        curve.redrawPolys();
    }
}

function onObjectCurveColorChange( event )
{
    if( activeTool === selectionTool && isCurveObj( activeTool.selectedObj ) )
    {
        const curve = activeTool.selectedObj;
        curve.settings.curveColor = document.getElementById( "objectCurveColorPicker" ).value;
        curve.redrawPolys();
    }
}

function onObjectPointsScaleEdit( event )
{
    if( activeTool === selectionTool && isCurveObj( activeTool.selectedObj ) )
    {
        const curve = activeTool.selectedObj;
        curve.settings.pointScale = parseFloat( document.getElementById( "objectPointsScaleEdit" ).value );
        curve.redrawPointsAndVectors();
        curve.highlight( selectionOutlinePass );
    }
}

function onObjectPointsColorChange( event )
{
    if( activeTool === selectionTool && isCurveObj( activeTool.selectedObj ) )
    {
        const curve = activeTool.selectedObj;
        curve.settings.pointColor = document.getElementById( "objectPointsColorPicker" ).value;
        curve.redrawPointsAndVectors();
        curve.highlight( selectionOutlinePass );
    }
}

function onObjectVectorsScaleEdit( event )
{
    if( activeTool === selectionTool && isHermiteCurveObj( activeTool.selectedObj ) )
    {
        const curve = activeTool.selectedObj;
        curve.settings.vectorScale = parseFloat( document.getElementById( "objectVectorsScaleEdit" ).value );
        curve.redrawPointsAndVectors();
        curve.highlight( selectionOutlinePass );
    }
}

function onObjectVectorsColorChange( event )
{
    if( activeTool === selectionTool && isHermiteCurveObj( activeTool.selectedObj ) )
    {
        const curve = activeTool.selectedObj;
        curve.settings.vectorColor = document.getElementById( "objectVectorsColorPicker" ).value;
        curve.redrawPointsAndVectors();
        curve.highlight( selectionOutlinePass );
    }
}

// sphere settings events
function onObjectSphereScaleEdit( event )
{
    if( activeTool === selectionTool && isSphereObj( activeTool.selectedObj ) )
    {
        const sphere = activeTool.selectedObj;
        const sphereScale = parseFloat( document.getElementById( "objectSphereScaleEdit" ).value );
        sphere.scale.set( sphereScale, sphereScale, sphereScale );
    }
}

function onObjectSphereColorChange( event )
{
    if( activeTool === selectionTool && isSphereObj( activeTool.selectedObj ) )
    {
        const sphere = activeTool.selectedObj;
        const sphereColor = document.getElementById( "objectSphereColorPicker" ).value;
        sphere.material.color.set( sphereColor );
    }
}

export function enableSettingsEvents()
{
    // tool settings events
    document.getElementById( "toolShowControlPolyCheck" ).addEventListener( "click", onToolShowControlPolygonCheckbox );
    document.getElementById( "toolControlPolygonColorPicker" ).addEventListener( "change", onToolControlPolygonColorChange );
    document.getElementById( "toolCurveColorPicker" ).addEventListener( "change", onToolCurveColorChange );
    document.getElementById( "toolPointsScaleEdit" ).addEventListener( "change", onToolPointsScaleEdit );
    document.getElementById( "toolPointsColorPicker" ).addEventListener( "change", onToolPointsColorChange );
    document.getElementById( "toolVectorsScaleEdit" ).addEventListener( "change", onToolVectorsScaleEdit );
    document.getElementById( "toolVectorsColorPicker" ).addEventListener( "change", onToolVectorsColorChange );

    // object settings events
    document.getElementById( "objectShowControlPolyCheck" ).addEventListener( "click", onObjectShowControlPolygonCheckbox );
    document.getElementById( "objectControlPolygonColorPicker" ).addEventListener( "change", onObjectControlPolygonColorChange );
    document.getElementById( "objectCurveColorPicker" ).addEventListener( "change", onObjectCurveColorChange );
    document.getElementById( "objectPointsScaleEdit" ).addEventListener( "change", onObjectPointsScaleEdit );
    document.getElementById( "objectPointsColorPicker" ).addEventListener( "change", onObjectPointsColorChange );
    document.getElementById( "objectVectorsScaleEdit" ).addEventListener( "change", onObjectVectorsScaleEdit );
    document.getElementById( "objectVectorsColorPicker" ).addEventListener( "change", onObjectVectorsColorChange );

    // sphere settings events
    document.getElementById( "objectSphereScaleEdit" ).addEventListener( "change", onObjectSphereScaleEdit );
    document.getElementById( "objectSphereColorPicker" ).addEventListener( "change", onObjectSphereColorChange );
}