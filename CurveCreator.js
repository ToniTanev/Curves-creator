
import * as THREE from 'three';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import {TransformControls} from './three.js-master/examples/jsm/controls/TransformControls.js';
import {EffectComposer} from './three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './three.js-master/examples/jsm/postprocessing/RenderPass.js';
import {OutlinePass} from './three.js-master/examples/jsm/postprocessing/OutlinePass.js';
import {OutputPass} from './three.js-master/examples/jsm/postprocessing/OutputPass.js';
import {getMouse, raycastMouse} from "./Math.js";
import {BezierCurveTool, HermiteCurveTool} from "./Tools/CurveTools.js";
import {MoveTool, AddTool, DeleteTool} from "./Tools/EditTools.js";
import {drawAxes, drawGrid} from "./Objects/GridAndAxes.js";
import {ToolIDs, makeToolsInactive, makeToolActive, hideObjectsSettings} from "./UI/UIHandler.js";
import {isCurveTool, isEditTool, ToolResult} from "./Tools/ToolsBase.js";
import {drawSphere} from "./Objects/Sphere.js";
import {SelectionTool} from "./Tools/SelectionTool.js";
import {enableSettingsEvents} from "./UI/SettingsEvents.js";
import {onSphereScaleChange} from "./Objects/CurveObjects.js";

export let scene, renderer, camera, sphere, composer, hoverOutlinePass, selectionOutlinePass;
let grid = null;
let axes = null;

export const selectionTool = new SelectionTool();
export const bezierTool = new BezierCurveTool();
export const hermiteTool = new HermiteCurveTool();
export const moveTool = new MoveTool();
export const addTool = new AddTool();
export const deleteTool = new DeleteTool();
export let activeTool = selectionTool;

export let transformControls;

function init()
{
    makeToolsInactive();
    hideObjectsSettings();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    const windowH = 0.8 * window.innerHeight;
    const windowW = 0.5 * window.innerWidth;
    renderer.setSize( windowW, windowH, true );

    const canvasContainer = document.querySelector( '.center' );
    canvasContainer.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 'white' );

    const ambLight = new THREE.AmbientLight( 'white', 0.5 );
    scene.add( ambLight );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );

    const aspect = windowW/windowH;
    //var camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 1, 1000 );
    camera = new THREE.PerspectiveCamera( 60, aspect, 1, 10000 );
    camera.position.set( 0,0,50 );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    const pixelRatio = renderer.getPixelRatio();
    const renderTarget = new THREE.WebGLRenderTarget( windowW * pixelRatio, windowH * pixelRatio, { type: THREE.HalfFloatType, samples: 8 } );
    composer = new EffectComposer(renderer, renderTarget);
    //composer.setSize( windowW, windowH );

    const renderPass = new RenderPass(scene, camera);
    composer.addPass( renderPass );

    hoverOutlinePass = new OutlinePass(
        new THREE.Vector2( windowW, windowH ),
        scene,
        camera
    );

    hoverOutlinePass.edgeStrength = 2.0;
    hoverOutlinePass.edgeGlow = 5.0;
    hoverOutlinePass.edgeThickness = 2.0;
    hoverOutlinePass.visibleEdgeColor.set( 0xffcf3d );
    hoverOutlinePass.hiddenEdgeColor.set( 0xffcf3d );
    hoverOutlinePass.selectedObjects = [];

    composer.addPass( hoverOutlinePass );

    selectionOutlinePass = new OutlinePass(
        new THREE.Vector2( windowW, windowH ),
        scene,
        camera
    );

    selectionOutlinePass.edgeStrength = 2.0;
    selectionOutlinePass.edgeGlow = 5.0;
    selectionOutlinePass.edgeThickness = 2.0;
    selectionOutlinePass.visibleEdgeColor.set( 'orange' );
    selectionOutlinePass.hiddenEdgeColor.set( 'orange' );
    selectionOutlinePass.selectedObjects = [];

    composer.addPass( selectionOutlinePass );

    const outputPass = new OutputPass();
    composer.addPass( outputPass );

    sphere = drawSphere();

    if( document.getElementById( "gridCheck" ).checked )
    {
        grid = drawGrid();
    }

    if( document.getElementById( "axesCheck" ).checked )
    {
        axes = drawAxes();
    }

    function animate()
    {
        requestAnimationFrame( animate );

        // use the composer to render the scene with post-processing effects
        composer.render();
    }

    animate();

    const orbitControls = new OrbitControls( camera, renderer.domElement );
    orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
    }

    transformControls = new TransformControls( camera, renderer.domElement );
    transformControls.setMode( "scale" );
    transformControls.addEventListener( 'dragging-changed', ( event ) => {
        orbitControls.enabled = !event.value;  // disable orbit when dragging with TransformControls
    });
    transformControls.addEventListener( 'change', handleScale );
    transformControls.traverse(function (child) {
        child.isTransformControlHelper = true;
    });
}

// Event handler to synchronize scale for uniform scaling
function handleScale()
{
    if( selectionTool.selectedObj )
    {
        // get the current scale of the object
        const scale = selectionTool.selectedObj.scale;

        // calculate the average scale factor
        const averageScale = ( scale.x + scale.y + scale.z ) / 3;

        // apply the same scale to all axes to ensure uniform scaling
        selectionTool.selectedObj.scale.set( averageScale, averageScale, averageScale );

        onSphereScaleChange( averageScale );
    }
}

let previousMousePosition = { x: 0, y: 0 };

function onMouseClick( event )
{
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    selectionTool.isPanning = Math.max( Math.abs( deltaX ), Math.abs( deltaY ) ) > 0.1;

    if ( activeTool )
    {
        activeTool.pointAdded( getMouse( event ) );
    }
}

function onRightClick( event )
{
    if ( isCurveTool( activeTool ) )
    {
        let intersects = raycastMouse( getMouse( event ) );
        intersects = activeTool.curve.filterCurveObjects( intersects );

        if ( intersects.length > 0 )
        {
            activeTool.objectRemoved( intersects[0].object );
        }
    }
}

function onMouseMove( event )
{
    if( activeTool )
    {
        activeTool.onInteractive( getMouse( event ) );
    }
}

function onMouseDown( event )
{
    if (event.button === 0) // Left mouse button (button 0)
    {
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
}

function onToolButton( toolID, event )
{
    if( activeTool )
    {
        activeTool.revert();
        makeToolsInactive();
    }

    if( toolID === ToolIDs.BEZIER )
    {
        activeTool = bezierTool;
    }
    else if( toolID === ToolIDs.HERMITE )
    {
        activeTool = hermiteTool;
    }
    else if( toolID === ToolIDs.MOVE )
    {
        activeTool = moveTool;
    }
    else if( toolID === ToolIDs.ADD )
    {
        activeTool = addTool
    }
    else if( toolID === ToolIDs.DELETE )
    {
        activeTool = deleteTool;
    }

    makeToolActive( toolID );
}
function onBezierToolButton( event )
{
    onToolButton( ToolIDs.BEZIER, event );
}

function onHermiteToolButton( event )
{
    onToolButton( ToolIDs.HERMITE, event );
}

function onMoveToolButton( event )
{
    onToolButton( ToolIDs.MOVE, event );
}

function onAddToolButton( event )
{
    onToolButton( ToolIDs.ADD, event );
}

function onDeleteToolButton( event )
{
    onToolButton( ToolIDs.DELETE, event );
}

function onGridCheckbox( event )
{
    const shouldDrawGrid = document.getElementById( "gridCheck" ).checked;

    if( shouldDrawGrid )
    {
        if( !grid )
        {
            grid = drawGrid();
        }
        else
        {
            scene.add( grid );
        }
    }
    else
    {
        if( grid )
        {
            scene.remove( grid );
        }
    }
}

function onAxesCheckbox( event )
{
    if( document.getElementById( "axesCheck" ).checked )
    {
        if( !axes )
        {
            axes = drawAxes();
        }
        else
        {
            for( const axis of axes )
            {
                scene.add( axis );
            }
        }
    }
    else
    {
        if( axes )
        {
            for( const axis of axes )
            {
                scene.remove( axis );
            }
        }
    }
}

function onKeyPressed( event )
{
    if ( event.key === "Escape" )
    {
        if( activeTool != null )
        {
            activeTool.revert();

            activeTool = selectionTool;

            makeToolsInactive();
        }
    }
    else if ( event.key === "Enter" )
    {
        if( activeTool != null )
        {
            activeTool.complete();
        }
    }
    else if ( event.key === "Backspace" )
    {
        if( isCurveTool( activeTool ) )
        {
            activeTool.objectRemoved();
        }
    }
}

function onLightBackgroundRadio( event )
{
    scene.background = new THREE.Color( 'white' );
}

function onDarkBackgroundRadio( event )
{
    scene.background = new THREE.Color( 'black' );
}

function main()
{
    init();

    renderer.domElement.addEventListener( "click", onMouseClick );
    renderer.domElement.addEventListener( "contextmenu", onRightClick );
    renderer.domElement.addEventListener( "mousemove", onMouseMove );
    renderer.domElement.addEventListener( "mousedown", onMouseDown );
    document.getElementById( "bezierButton" ).addEventListener( "click", onBezierToolButton );
    document.getElementById( "hermiteButton" ).addEventListener( "click", onHermiteToolButton );
    document.getElementById( "moveButton" ).addEventListener( "click", onMoveToolButton );
    document.getElementById( "addButton" ).addEventListener( "click", onAddToolButton );
    document.getElementById( "deleteButton" ).addEventListener( "click", onDeleteToolButton );
    document.getElementById( "gridCheck" ).addEventListener( "click", onGridCheckbox );
    document.getElementById( "axesCheck" ).addEventListener( "click", onAxesCheckbox );
    document.getElementById( "lightBackgroundRadio" ).addEventListener( "click", onLightBackgroundRadio );
    document.getElementById( "darkBackgroundRadio" ).addEventListener( "click", onDarkBackgroundRadio );
    document.addEventListener( 'keydown', onKeyPressed );
    enableSettingsEvents();
}

main();