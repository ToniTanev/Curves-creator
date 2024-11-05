
export const ToolIDs = Object.freeze({
    BEZIER: 0,
    HERMITE: 1,
});

const defaultButtonColor = "#008CBA";
const activeButtonColor = "rgb(0, 200, 250)";

export function makeToolsInactive()
{
    document.getElementById( "bezierButton" ).style.backgroundColor = defaultButtonColor;
    document.getElementById( "hermiteButton" ).style.backgroundColor = defaultButtonColor;
}

export function makeToolActive( toolID )
{
    if( toolID === ToolIDs.BEZIER )
    {
        document.getElementById( "bezierButton" ).style.backgroundColor = activeButtonColor;
    }
    else if( toolID === ToolIDs.HERMITE )
    {
        document.getElementById( "hermiteButton" ).style.backgroundColor = activeButtonColor;
    }
}