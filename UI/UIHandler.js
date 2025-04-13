import {isBezierCurveObj, isHermiteCurveObj} from "../Objects/CurveObjects.js";
import {isSphereObj} from "../Objects/Sphere.js";

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
    const display = show ? "inline" : "none";

    if( toolID === ToolIDs.BEZIER )
    {
        document.getElementById( "toolName" ).innerText = show ? "Bezier Tool" : "";

        document.getElementById( "toolShowControlPolyCheck" ).style.display = display;
        document.getElementById( "toolControlPolygonColorPicker" ).style.display = display;
        document.getElementById( "toolCurveColorPicker" ).style.display = display;
        document.getElementById( "toolPointsScaleEdit" ).style.display = display;
        document.getElementById( "toolPointsColorPicker" ).style.display = display;

        const labels = document.getElementsByClassName( "tool-bezier-labels" );
        for( const label of labels )
        {
            label.style.display = display;
        }
    }
    else if( toolID === ToolIDs.HERMITE )
    {
        document.getElementById( "toolName" ).innerText = show ? "Hermite Tool" : "";

        document.getElementById( "toolShowControlPolyCheck" ).style.display = display;
        document.getElementById( "toolControlPolygonColorPicker" ).style.display = display;
        document.getElementById( "toolCurveColorPicker" ).style.display = display;
        document.getElementById( "toolPointsScaleEdit" ).style.display = display;
        document.getElementById( "toolPointsColorPicker" ).style.display = display;
        document.getElementById( "toolVectorsScaleEdit" ).style.display = display;
        document.getElementById( "toolVectorsColorPicker" ).style.display = display;

        const labels = document.getElementsByClassName( "tool-hermite-labels" );
        for( const label of labels )
        {
            label.style.display = display;
        }
    }
}

function showObjectSettings( objectType, show = true )
{
    const display = show ? "inline" : "none";

    if( objectType === ObjectTypes.BEZIER )
    {
        document.getElementById( "objectName" ).innerText = show ? "Bezier Curve" : "";

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

    showToolSettings( ToolIDs.BEZIER, false );
    showToolSettings( ToolIDs.HERMITE, false );
}

export function makeToolActive( toolID )
{
    if( toolID === ToolIDs.BEZIER )
    {
        document.getElementById( "bezierButton" ).style.backgroundColor = activeButtonColor;
        showToolSettings( ToolIDs.BEZIER );
    }
    else if( toolID === ToolIDs.HERMITE )
    {
        document.getElementById( "hermiteButton" ).style.backgroundColor = activeButtonColor;
        showToolSettings( ToolIDs.HERMITE );
    }
    else if( toolID === ToolIDs.MOVE )
    {
        document.getElementById( "moveButton" ).style.backgroundColor = activeButtonColor;
    }
    else if( toolID === ToolIDs.ADD )
    {
        document.getElementById( "addButton" ).style.backgroundColor = activeButtonColor;
    }
    else if( toolID === ToolIDs.DELETE )
    {
        document.getElementById( "deleteButton" ).style.backgroundColor = activeButtonColor;
    }
}

function updateBezierObjectSettingsUI( bezierSettings )
{
    document.getElementById( "objectShowControlPolyCheck" ).checked = bezierSettings.showControlPoly;
    document.getElementById( "objectControlPolygonColorPicker" ).value = bezierSettings.controlPolyColor;
    document.getElementById( "objectCurveColorPicker" ).value = bezierSettings.curveColor;
    document.getElementById( "objectPointsScaleEdit" ).value = bezierSettings.pointScale;
    document.getElementById( "objectPointsColorPicker" ).value = bezierSettings.pointColor;
}

function updateHermiteObjectSettingsUI( hermiteSettings )
{
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
    document.getElementById( "objectSphereScaleEdit" ).value = sphere.scale.x;
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