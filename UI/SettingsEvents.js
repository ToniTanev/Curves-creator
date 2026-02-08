import {activeTool, selectionOutlinePass, selectionTool} from "../main.js";
import {isCurveTool} from "../Tools/ToolsBase.js";
import {isBezierCurveObj, isCurveObj, isHermiteCurveObj, onSphereScaleChange} from "../Objects/CurveObjects.js";
import {defaultSphereRadius, getSphereScale, isSphereObj, stickToSphere} from "../Objects/Sphere.js";


// tool settings events
function onToolStickToSphereCheckbox( event )
{
    if( isCurveTool( activeTool ) )
    {
        activeTool.curve.settings.stickToSphere = document.getElementById( "toolStickToSphereWhenScaledCheck" ).checked;
    }
}

function onToolShowControlPolygonCheckbox( event )
{
    if( isCurveTool( activeTool ) )
    {
        activeTool.curve.settings.showControlPoly = document.getElementById( "toolShowControlPolyCheck" ).checked;
        activeTool.curve.redrawPolys();

        const key = isBezierCurveObj( activeTool.curve ) ? "bezierShowControlPoly" : "hermiteShowControlPoly";
        localStorage.setItem( key, activeTool.curve.settings.showControlPoly );
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
        const toolPointsScaleEdit = document.getElementById( "toolPointsScaleEdit" );
        activeTool.curve.settings.pointScale = parseFloat( toolPointsScaleEdit.value );

        if( isNaN( activeTool.curve.settings.pointScale ) )
        {
            activeTool.curve.settings.pointScale = 1.0;
            toolPointsScaleEdit.value = activeTool.curve.settings.pointScale;
        }

        activeTool.curve.redrawPointsAndVectors();
        activeTool.redrawInteractive();

        const key = isBezierCurveObj( activeTool.curve ) ? "bezierPointsScale" : "hermitePointsScale";
        localStorage.setItem( key, activeTool.curve.settings.pointScale );
    }
}

function onToolPointsColorChange( event )
{
    if( isCurveTool( activeTool ) )
    {
        activeTool.curve.settings.pointColor = document.getElementById( "toolPointsColorPicker" ).value;
        activeTool.curve.redrawPointsAndVectors();
        activeTool.redrawInteractive();
    }
}

function onToolVectorsScaleEdit( event )
{
    if( isCurveTool( activeTool ) && isHermiteCurveObj( activeTool.curve ) )
    {
        const toolVectorsScaleEdit = document.getElementById( "toolVectorsScaleEdit" );
        activeTool.curve.settings.vectorScale = parseFloat( toolVectorsScaleEdit.value );

        if( isNaN( activeTool.curve.settings.vectorScale ) )
        {
            activeTool.curve.settings.vectorScale = 1.0;
            toolVectorsScaleEdit.value = activeTool.curve.settings.vectorScale;
        }

        activeTool.curve.redrawPointsAndVectors();
        activeTool.redrawInteractive();

        localStorage.setItem( "hermiteVectorsScale", activeTool.curve.settings.vectorScale );
    }
}

function onToolVectorsColorChange( event )
{
    if( isCurveTool( activeTool ) && isHermiteCurveObj( activeTool.curve ) )
    {
        activeTool.curve.settings.vectorColor = document.getElementById( "toolVectorsColorPicker" ).value;
        activeTool.curve.redrawPointsAndVectors();
        activeTool.redrawInteractive();
    }
}

// object settings events
function onObjectStickToSphereCheckbox( event )
{
    if( activeTool === selectionTool && isCurveObj( activeTool.selectedObj ) )
    {
        const curve = activeTool.selectedObj;
        curve.settings.stickToSphere = document.getElementById( "objectStickToSphereWhenScaledCheck" ).checked;

        if( curve.settings.stickToSphere )
        {
            const sphereRadius = defaultSphereRadius * getSphereScale();

            if( curve.controlPoints.length > 0 && curve.controlPoints[ 0 ].length() !== sphereRadius )
            {
                for( const pt of curve.controlPoints )
                {
                    stickToSphere( pt );
                }

                curve.redrawPointsAndVectors();
                curve.redrawPolys();
                curve.highlight( selectionOutlinePass );
            }
        }
    }
}

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
        const objectPointsScaleEdit = document.getElementById( "objectPointsScaleEdit" );
        curve.settings.pointScale = parseFloat( objectPointsScaleEdit.value );

        if( isNaN( curve.settings.pointScale ) )
        {
            curve.settings.pointScale = 1.0;
            objectPointsScaleEdit.value = curve.settings.pointScale;
        }

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

        const objectVectorsScaleEdit = document.getElementById( "objectVectorsScaleEdit" );
        curve.settings.vectorScale = parseFloat( objectVectorsScaleEdit.value );

        if( isNaN( curve.settings.vectorScale ) )
        {
            curve.settings.vectorScale = 1.0;
            objectVectorsScaleEdit.value = curve.settings.vectorScale;
        }

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

        const objectSphereScaleEdit = document.getElementById( "objectSphereScaleEdit" );
        let sphereScale = parseFloat( objectSphereScaleEdit.value );

        if( isNaN( sphereScale ) )
        {
            sphereScale = 1.0;
            objectSphereScaleEdit.value = sphereScale;
        }

        sphere.scale.set( sphereScale, sphereScale, sphereScale );

        onSphereScaleChange( sphereScale );
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
    document.getElementById( "toolStickToSphereWhenScaledCheck" ).addEventListener( "click", onToolStickToSphereCheckbox );
    document.getElementById( "toolShowControlPolyCheck" ).addEventListener( "click", onToolShowControlPolygonCheckbox );
    document.getElementById( "toolControlPolygonColorPicker" ).addEventListener( "change", onToolControlPolygonColorChange );
    document.getElementById( "toolCurveColorPicker" ).addEventListener( "change", onToolCurveColorChange );
    document.getElementById( "toolPointsScaleEdit" ).addEventListener( "change", onToolPointsScaleEdit );
    document.getElementById( "toolPointsColorPicker" ).addEventListener( "change", onToolPointsColorChange );
    document.getElementById( "toolVectorsScaleEdit" ).addEventListener( "change", onToolVectorsScaleEdit );
    document.getElementById( "toolVectorsColorPicker" ).addEventListener( "change", onToolVectorsColorChange );

    // object settings events
    document.getElementById( "objectStickToSphereWhenScaledCheck" ).addEventListener( "click", onObjectStickToSphereCheckbox );
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