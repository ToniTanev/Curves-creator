
import * as THREE from 'three';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import {BezierCurve, getMouse, raycastMouse} from "./Math.js";
import {BezierCurveTool, HermiteCurveTool} from "./Tools.js";
import {drawPolygon, drawVector} from "./Visualizer.js";

export let scene, renderer, camera, sphere;

const bezierTool = new BezierCurveTool();
const hermiteTool = new HermiteCurveTool();
let activeTool = null;
function init()
{
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    const windowH = 0.8 * window.innerHeight;
    const windowW = 0.5 * window.innerWidth;
    renderer.setSize( windowW, windowH, true );

    document.body.appendChild( renderer.domElement );
    //document.body.style.margin = 0;
    //document.body.style.overflow = 'hidden';

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 'white' );

    const aspect = windowW/windowH;
    //var camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 1, 1000 );
    camera = new THREE.PerspectiveCamera( 60, aspect, 1, 10000 );
    camera.position.set( 0,0,50 );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    const ambLight = new THREE.AmbientLight( 'white', 0.5 );
    scene.add( ambLight );

    const light = new THREE.PointLight( 'white', 1, 0, 0 );
    light.position.set( 100, 100, 100 );
    //scene.add( light );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );

    const geometry = new THREE.SphereGeometry( 10 );
    const material = new THREE.MeshPhongMaterial( { color: 0x049ef4 } );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

    //sphere.position.z = 10;
    //sphere.position.x = 10;

    renderer.setAnimationLoop( frame );
    function frame( time )
    {
        renderer.render( scene, camera );
    }

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
    }
}

function onMouseClick( event )
{
    if (activeTool != null)
    {
        activeTool.pointAdded( getMouse( event ) );
    }
}

function onRightClick( event )
{
    if (activeTool != null)
    {
        const intersects = raycastMouse( getMouse( event ) );

        if (intersects.length > 0)
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

function startBezierCurve( event )
{
    if( activeTool )
    {
        activeTool.revert();
    }

    activeTool = bezierTool;
}

function startHermiteCurve( event )
{
    if( activeTool )
    {
        activeTool.revert();
    }

    activeTool = hermiteTool;
}

function onKeyPressed( event )
{
    if ( event.key === "Escape" )
    {
        if( activeTool != null )
        {
            activeTool.revert();

            activeTool = null;
        }
    }
    else if ( event.key === "Enter" )
    {
        if( activeTool != null )
        {
            if( activeTool.complete() )
            {
                activeTool = null;
            }
        }
    }
    else if ( event.key === "Backspace" )
    {
        if( activeTool )
        {
            activeTool.objectRemoved();
        }
    }
}

function main()
{
    init();

    renderer.domElement.addEventListener( "click", onMouseClick );
    renderer.domElement.addEventListener( "contextmenu", onRightClick );
    renderer.domElement.addEventListener( "mousemove", onMouseMove );
    document.getElementById( "createBezierButton" ).addEventListener( "click", startBezierCurve );
    document.getElementById( "createHermiteButton" ).addEventListener( "click", startHermiteCurve );
    document.addEventListener( 'keydown', onKeyPressed );
}

main();