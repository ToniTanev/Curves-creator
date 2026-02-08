import {isBezierCurveObj, isHermiteCurveObj} from "../Objects/CurveObjects.js";
import {getSphereScale, isSphereObj} from "../Objects/Sphere.js";
import {bezierTool, hermiteTool} from "../main.js";
import {
    addTooltip,
    bezierTooltip,
    deleteTooltip,
    hermiteTooltip,
    moveTooltip,
    selectionTooltip
} from "../Constants/Tooltips.js";

export const ToolIDs = Object.freeze({
    BEZIER: 0,
    HERMITE: 1,
    MOVE: 2,
    ADD: 3,
    DELETE: 4,
});

export const ObjectTypes = Object.freeze({
    BEZIER: 0,
    HERMITE: 1,
    SPHERE: 2,
});

const defaultButtonColor = "#008CBA";
const activeButtonColor = "rgb(0, 200, 250)";

function showToolSettings( toolID, show = true )
{
    const visibility = show ? "visible" : "hidden";

    if( toolID === ToolIDs.BEZIER )
    {
        document.getElementById( "toolName" ).innerText = show ? "Bezier Tool" : "";

        document.getElementById( "toolStickToSphereWhenScaledCheck" ).style.visibility = visibility;
        document.getElementById( "toolShowControlPolyCheck" ).style.visibility = visibility;
        document.getElementById( "toolControlPolygonColorPicker" ).style.visibility = visibility;
        document.getElementById( "toolCurveColorPicker" ).style.visibility = visibility;
        document.getElementById( "toolPointsScaleEdit" ).style.visibility = visibility;
        document.getElementById( "toolPointsColorPicker" ).style.visibility = visibility;

        const labels = document.getElementsByClassName( "tool-bezier-labels" );
        for( const label of labels )
        {
            label.style.visibility = visibility;
        }
    }
    else if( toolID === ToolIDs.HERMITE )
    {
        document.getElementById( "toolName" ).innerText = show ? "Hermite Tool" : "";

        document.getElementById( "toolStickToSphereWhenScaledCheck" ).style.visibility = visibility;
        document.getElementById( "toolShowControlPolyCheck" ).style.visibility = visibility;
        document.getElementById( "toolControlPolygonColorPicker" ).style.visibility = visibility;
        document.getElementById( "toolCurveColorPicker" ).style.visibility = visibility;
        document.getElementById( "toolPointsScaleEdit" ).style.visibility = visibility;
        document.getElementById( "toolPointsColorPicker" ).style.visibility = visibility;
        document.getElementById( "toolVectorsScaleEdit" ).style.visibility = visibility;
        document.getElementById( "toolVectorsColorPicker" ).style.visibility = visibility;

        const labels = document.getElementsByClassName( "tool-hermite-labels" );
        for( const label of labels )
        {
            label.style.visibility = visibility;
        }
    }
}

function showObjectSettings( objectType, show = true )
{
    const display = show ? "inline" : "none";

    if( objectType === ObjectTypes.BEZIER )
    {
        document.getElementById( "objectName" ).innerText = show ? "Bezier Curve" : "";

        document.getElementById( "objectStickToSphereWhenScaledCheck" ).style.display = display;
        document.getElementById( "objectShowControlPolyCheck" ).style.display = display;
        document.getElementById( "objectControlPolygonColorPicker" ).style.display = display;
        document.getElementById( "objectCurveColorPicker" ).style.display = display;
        document.getElementById( "objectPointsScaleEdit" ).style.display = display;
        document.getElementById( "objectPointsColorPicker" ).style.display = display;

        const labels = document.getElementsByClassName( "object-bezier-labels" );
        for( const label of labels )
        {
            label.style.display = display;
        }
    }
    else if( objectType === ObjectTypes.HERMITE )
    {
        document.getElementById( "objectName" ).innerText = show ? "Hermite Curve" : "";

        document.getElementById( "objectStickToSphereWhenScaledCheck" ).style.display = display;
        document.getElementById( "objectShowControlPolyCheck" ).style.display = display;
        document.getElementById( "objectControlPolygonColorPicker" ).style.display = display;
        document.getElementById( "objectCurveColorPicker" ).style.display = display;
        document.getElementById( "objectPointsScaleEdit" ).style.display = display;
        document.getElementById( "objectPointsColorPicker" ).style.display = display;
        document.getElementById( "objectVectorsScaleEdit" ).style.display = display;
        document.getElementById( "objectVectorsColorPicker" ).style.display = display;

        const labels = document.getElementsByClassName( "object-hermite-labels" );
        for( const label of labels )
        {
            label.style.display = display;
        }
    }
    else if( objectType === ObjectTypes.SPHERE )
    {
        document.getElementById( "objectName" ).innerText = show ? "Sphere" : "";

        document.getElementById( "objectSphereScaleEdit" ).style.display = display;
        document.getElementById( "objectSphereColorPicker" ).style.display = display;

        const labels = document.getElementsByClassName( "object-sphere-labels" );
        for( const label of labels )
        {
            label.style.display = display;
        }
    }
}

export function showObjectSettingsByObj( obj, show )
{
    hideObjectsSettings();

    let objectType = ObjectTypes.BEZIER;

    if( isBezierCurveObj( obj ) )
    {
        objectType = ObjectTypes.BEZIER;
    }
    else if( isHermiteCurveObj( obj ) )
    {
        objectType = ObjectTypes.HERMITE;
    }
    else if( isSphereObj( obj ) )
    {
        objectType = ObjectTypes.SPHERE;
    }

    showObjectSettings( objectType, show );
}

export function hideObjectsSettings()
{
    showObjectSettings( ObjectTypes.BEZIER, false );
    showObjectSettings( ObjectTypes.HERMITE, false );
    showObjectSettings( ObjectTypes.SPHERE, false );
}

export function makeToolsInactive()
{
    document.getElementById( "bezierButton" ).style.backgroundColor = defaultButtonColor;
    document.getElementById( "hermiteButton" ).style.backgroundColor = defaultButtonColor;
    document.getElementById( "moveButton" ).style.backgroundColor = defaultButtonColor;
    document.getElementById( "addButton" ).style.backgroundColor = defaultButtonColor;
    document.getElementById( "deleteButton" ).style.backgroundColor = defaultButtonColor;
    document.getElementById( "tooltip" ).innerHTML = selectionTooltip;

    showToolSettings( ToolIDs.BEZIER, false );
    showToolSettings( ToolIDs.HERMITE, false );
}

export function makeToolActive( toolID )
{
    if( toolID === ToolIDs.BEZIER )
    {
        document.getElementById( "bezierButton" ).style.backgroundColor = activeButtonColor;
        showToolSettings( ToolIDs.BEZIER );
        updateBezierToolSettingsUI( bezierTool.curve.settings );
        document.getElementById( "tooltip" ).innerHTML = bezierTooltip;
    }
    else if( toolID === ToolIDs.HERMITE )
    {
        document.getElementById( "hermiteButton" ).style.backgroundColor = activeButtonColor;
        showToolSettings( ToolIDs.HERMITE );
        updateHermiteToolSettingsUI( hermiteTool.curve.settings );
        document.getElementById( "tooltip" ).innerHTML = hermiteTooltip;
    }
    else if( toolID === ToolIDs.MOVE )
    {
        document.getElementById( "moveButton" ).style.backgroundColor = activeButtonColor;
        document.getElementById( "tooltip" ).innerHTML = moveTooltip;
    }
    else if( toolID === ToolIDs.ADD )
    {
        document.getElementById( "addButton" ).style.backgroundColor = activeButtonColor;
        document.getElementById( "tooltip" ).innerHTML = addTooltip;
    }
    else if( toolID === ToolIDs.DELETE )
    {
        document.getElementById( "deleteButton" ).style.backgroundColor = activeButtonColor;
        document.getElementById( "tooltip" ).innerHTML = deleteTooltip;
    }
}

function updateBezierObjectSettingsUI( bezierSettings )
{
    document.getElementById( "objectStickToSphereWhenScaledCheck" ).checked = bezierSettings.stickToSphere;
    document.getElementById( "objectShowControlPolyCheck" ).checked = bezierSettings.showControlPoly;
    document.getElementById( "objectControlPolygonColorPicker" ).value = bezierSettings.controlPolyColor;
    document.getElementById( "objectCurveColorPicker" ).value = bezierSettings.curveColor;
    document.getElementById( "objectPointsScaleEdit" ).value = bezierSettings.pointScale;
    document.getElementById( "objectPointsColorPicker" ).value = bezierSettings.pointColor;
}

function updateHermiteObjectSettingsUI( hermiteSettings )
{
    document.getElementById( "objectStickToSphereWhenScaledCheck" ).checked = hermiteSettings.stickToSphere;
    document.getElementById( "objectShowControlPolyCheck" ).checked = hermiteSettings.showControlPoly;
    document.getElementById( "objectControlPolygonColorPicker" ).value = hermiteSettings.controlPolyColor;
    document.getElementById( "objectCurveColorPicker" ).value = hermiteSettings.curveColor;
    document.getElementById( "objectPointsScaleEdit" ).value = hermiteSettings.pointScale;
    document.getElementById( "objectPointsColorPicker" ).value = hermiteSettings.pointColor;
    document.getElementById( "objectVectorsScaleEdit" ).value = hermiteSettings.vectorScale;
    document.getElementById( "objectVectorsColorPicker" ).value = hermiteSettings.vectorColor;
}

function updateSphereObjectSettingsUI( sphere )
{
    document.getElementById( "objectSphereScaleEdit" ).value = getSphereScale();
    document.getElementById( "objectSphereColorPicker" ).value = "#" + sphere.material.color.getHexString();
}

export function updateObjectSettingsUI( obj )
{
    if( isBezierCurveObj( obj ) )
    {
        updateBezierObjectSettingsUI( obj.settings );
    }
    else if( isHermiteCurveObj( obj ) )
    {
        updateHermiteObjectSettingsUI( obj.settings );
    }
    else if( isSphereObj( obj ) )
    {
        updateSphereObjectSettingsUI( obj );
    }
}

function updateBezierToolSettingsUI( bezierSettings )
{
    document.getElementById( "toolStickToSphereWhenScaledCheck" ).checked = bezierSettings.stickToSphere;
    document.getElementById( "toolShowControlPolyCheck" ).checked = bezierSettings.showControlPoly;
    document.getElementById( "toolControlPolygonColorPicker" ).value = bezierSettings.controlPolyColor;
    document.getElementById( "toolCurveColorPicker" ).value = bezierSettings.curveColor;
    document.getElementById( "toolPointsScaleEdit" ).value = bezierSettings.pointScale;
    document.getElementById( "toolPointsColorPicker" ).value = bezierSettings.pointColor;
}

function updateHermiteToolSettingsUI( hermiteSettings )
{
    document.getElementById( "toolStickToSphereWhenScaledCheck" ).checked = hermiteSettings.stickToSphere;
    document.getElementById( "toolShowControlPolyCheck" ).checked = hermiteSettings.showControlPoly;
    document.getElementById( "toolControlPolygonColorPicker" ).value = hermiteSettings.controlPolyColor;
    document.getElementById( "toolCurveColorPicker" ).value = hermiteSettings.curveColor;
    document.getElementById( "toolPointsScaleEdit" ).value = hermiteSettings.pointScale;
    document.getElementById( "toolPointsColorPicker" ).value = hermiteSettings.pointColor;
    document.getElementById( "toolVectorsScaleEdit" ).value = hermiteSettings.vectorScale;
    document.getElementById( "toolVectorsColorPicker" ).value = hermiteSettings.vectorColor;
}