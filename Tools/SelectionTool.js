import {raycastMouse} from "../Math.js";
import {filterIntersects} from "./ToolsBase.js";
import {scene, transformControls, sphere} from "../CurveCreator.js";


export class SelectionTool
{
    constructor()
    {
        this.selectedObj = null;
        this.isPanning = false;
    }

    showTransformControls( shouldShow = true )
    {
        if( shouldShow )
        {
            if( this.selectedObj )
            {
                transformControls.attach( this.selectedObj );
            }
            scene.add( transformControls );
        }
        else
        {
            if( this.selectedObj )
            {
                transformControls.detach( this.selectedObj );
            }
            scene.remove( transformControls );
        }
    }

    clear()
    {
        this.showTransformControls( false );

        this.selectedObj = null;
        this.isPanning = false;
    }

    pointAdded( mouse )
    {
        const intersects = raycastMouse( mouse );
        const filteredIntersects = filterIntersects( intersects );

        if ( filteredIntersects.length > 0 )
        {
            this.selectedObj = filteredIntersects[0].object;

            if (filteredIntersects[0].object === sphere)
            {
                this.showTransformControls();
            }
        }
        else if( !this.isPanning ) // deselect all
        {
            this.clear();
        }
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