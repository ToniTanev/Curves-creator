import {raycastMouse} from "../Math.js";
import {filterIntersects} from "./ToolsBase.js";


export class SelectionTool
{
    constructor()
    {
        this.clear();
    }

    clear()
    {
        this.selectedObj = null;
        this.selectedScaler = null;
    }

    pointAdded( mouse )
    {
        const intersects = raycastMouse( mouse );
        const filteredIntersects = filterIntersects( intersects );

        if( filteredIntersects.length > 0 )
        {
            if( this.selectedObj && this.selectedObj.scaler !== undefined &&
                filteredIntersects[ 0 ].object.parent === this.selectedObj.scaler.geometry )
            {
                this.selectedScaler = this.selectedObj.scaler;
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
            if( this.selectedObj && this.selectedObj.scaler !== undefined )
            {
                this.selectedObj.scaler.show( false );
            }

            this.clear();
        }
    }

    onInteractive( mouse )
    {

    }

    complete()
    {

    }

    revert()
    {

    }
}