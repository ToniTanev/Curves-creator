import {raycastMouse} from "../Math.js";
import {filterHighlightableIntersects, filterIntersects, highlightVisualVectorObj} from "./ToolsBase.js";
import {scene, transformControls, sphere, hoverOutlinePass, selectionOutlinePass} from "../CurveCreator.js";
import {isCurveVectorObj} from "../Objects/CurveObjects.js";


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

    onInteractive( mouse )
    {
        hoverOutlinePass.selectedObjects = [];
        const intersects = raycastMouse( mouse );
        let filteredIntersects = filterIntersects( intersects );
        filteredIntersects = filterHighlightableIntersects( filteredIntersects );
        if( filteredIntersects.length > 0 && filteredIntersects[ 0 ].object !== this.selectedObj )
        {
            const hoveredObj = filteredIntersects[ 0 ].object;
            if( isCurveVectorObj( hoveredObj ) )
            {
                highlightVisualVectorObj( hoveredObj, hoverOutlinePass );
                //hoverOutlinePass.selectedObjects.push( hoveredObj.parentCurve.poly );
            }
            else
            {
                hoverOutlinePass.selectedObjects.push( hoveredObj );
            }
        }

        selectionOutlinePass.selectedObjects = [];
        if( this.selectedObj )
        {
            if( isCurveVectorObj( this.selectedObj ) )
            {
                highlightVisualVectorObj( this.selectedObj, selectionOutlinePass );
            }
            else
            {
                selectionOutlinePass.selectedObjects.push( this.selectedObj );
            }
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