
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
    const display = show ? "inline" : "none";

    if( toolID === ToolIDs.BEZIER )
    {
        document.getElementById( "toolName" ).innerText = show ? "Bezier Tool" : "";

        document.getElementById( "toolShowControlPolyCheck" ).style.display = display;
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