import {raycastMouse} from "../Math.js";
import {filterIntersects} from "./ToolsBase.js";


export class SelectionTool
{
    constructor()
    {
        this.selectedObj = null;
        this.clear();
    }

    clear()
    {
        if( this.selectedObj && this.selectedObj.scaler !== undefined )
        {
            this.selectedObj.scaler.show( false );
        }

        this.toolPointsCnt = 0;
        this.selectedObj = null;
        this.selectedScaler = null;
    }

    pointAdded( mouse )
    {
        const intersects = raycastMouse( mouse );
        const filteredIntersects = filterIntersects( intersects );

        if( this.toolPointsCnt === 0 )
        {
            if( filteredIntersects.length > 0 )
            {
                if( this.selectedObj && this.selectedObj.scaler !== undefined &&
                    filteredIntersects[ 0 ].object.parent === this.selectedObj.scaler.geometry )
                {
                    // begin the scaler interactive
                    this.selectedScaler = this.selectedObj.scaler;
                    this.toolPointsCnt++;
                }
                else
                {
                    this.selectedObj = filteredIntersects[ 0 ].object;

                    if( filteredIntersects[ 0 ].object.scaler !== undefined )
                    {
                        filteredIntersects[ 0 ].object.scaler.show();
                    }
                }
            }
            else // deselect all
            {
                this.clear();
            }
        }
        else if( this.toolPointsCnt === 1 ) // complete the scaler interactive
        {
            this.toolPointsCnt = 0;
            this.selectedScaler = null;
        }
    }

    onInteractive( mouse )
    {

    }

    complete()
    {
        this.clear();

        return true;
    }

    revert()
    {
        this.clear();
    }
}