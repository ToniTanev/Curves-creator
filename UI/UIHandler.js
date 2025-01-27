
export const ToolIDs = Object.freeze({
    BEZIER: 0,
    HERMITE: 1,
    MOVE: 2,
    ADD: 3,
    DELETE: 4,
});

const defaultButtonColor = "#008CBA";
const activeButtonColor = "rgb(0, 200, 250)";

function showToolSettings( toolID, show = true )
{
    const visibility = show ? "visible" : "hidden";

    if( toolID === ToolIDs.BEZIER )
    {
        document.getElementById( "toolName" ).innerText = show ? "Bezier Tool" : "";

        document.getElementById( "showControlPolyCheck" ).style.visibility = visibility;
        document.getElementById( "toolPointsScaleEdit" ).style.visibility = visibility;
        document.getElementById( "toolPointsColorPicker" ).style.visibility = visibility;

        const labels = document.getElementsByClassName( "bezier-labels" );
        for( const label of labels )
        {
            label.style.visibility = visibility;
        }
    }
    else if( toolID === ToolIDs.HERMITE )
    {
        document.getElementById( "toolName" ).innerText = show ? "Hermite Tool" : "";

        document.getElementById( "showControlPolyCheck" ).style.visibility = visibility;
        document.getElementById( "toolPointsScaleEdit" ).style.visibility = visibility;
        document.getElementById( "toolPointsColorPicker" ).style.visibility = visibility;
        document.getElementById( "toolVectorsScaleEdit" ).style.visibility = visibility;
        document.getElementById( "toolVectorsColorPicker" ).style.visibility = visibility;

        const labels = document.getElementsByClassName( "hermite-labels" );
        for( const label of labels )
        {
            label.style.visibility = visibility;
        }
    }
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