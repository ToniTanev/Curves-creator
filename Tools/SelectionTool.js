import {raycastMouse} from "../Math.js";
import {filterHighlightableIntersects, filterIntersects, highlightVisualVectorObj} from "./ToolsBase.js";
import {scene, transformControls, sphere, hoverOutlinePass, selectionOutlinePass} from "../CurveCreator.js";
import {isCurveObj, isCurveVectorObj} from "../Objects/CurveObjects.js";
import {hideObjectsSettings, showObjectSettingsByObj} from "../UI/UIHandler.js";


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

        selectionOutlinePass.selectedObjects = [];

        hideObjectsSettings();
    }

    pointAdded( mouse )
    {
        const intersects = raycastMouse( mouse );
        const filteredIntersects = filterIntersects( intersects );

        if ( filteredIntersects.length > 0 )
        {
            const obj = filteredIntersects[ 0 ].object;

            if ( obj === sphere )
            {
                this.selectedObj = obj;
                this.showTransformControls();
            }
            else if( obj.parentCurve !== undefined )
            {
                this.showTransformControls( false );
                this.selectedObj = obj.parentCurve;
            }

            if( this.selectedObj )
            {
                // remove the highlight of the hovered object
                // because the hovered object is now selected
                hoverOutlinePass.selectedObjects = [];
                this.highlightSelection();
                showObjectSettingsByObj( this.selectedObj );
            }
        }
        else if( !this.isPanning ) // deselect all
        {
            this.clear();
        }
    }

    onInteractive( mouse )
    {
        // highlight hovered
        hoverOutlinePass.selectedObjects = [];

        const intersects = raycastMouse( mouse );
        let filteredIntersects = filterIntersects( intersects );
        filteredIntersects = filterHighlightableIntersects( filteredIntersects );

        if( filteredIntersects.length > 0 && !this.isSelected( filteredIntersects[ 0 ].object ) )
        {
            const hoveredObj = filteredIntersects[ 0 ].object;

            if( hoveredObj.parentCurve !== undefined )
            {
                hoveredObj.parentCurve.highlight( hoverOutlinePass );
            }
            else if( hoveredObj === sphere )
            {
                hoverOutlinePass.selectedObjects.push( hoveredObj );
            }
        }
    }

    complete()
    {
        return true;
    }

    revert()
    {
        this.clear();
    }

    // works also on curve elements (visual points and vectors)
    isSelected( obj )
    {
        if( isCurveObj( obj ) || obj === sphere )
        {
            return obj === this.selectedObj;
        }
        else if( obj.parentCurve !== undefined )
        {
            return obj.parentCurve === this.selectedObj;
        }
    }

    highlightSelection()
    {
        selectionOutlinePass.selectedObjects = [];

        if( this.selectedObj )
        {
            if( isCurveObj( this.selectedObj ) )
            {
                this.selectedObj.highlight( selectionOutlinePass );
            }
            else if( this.selectedObj === sphere )
            {
                selectionOutlinePass.selectedObjects.push( this.selectedObj );
            }
        }
    }
}