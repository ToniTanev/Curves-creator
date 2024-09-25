
import * as THREE from 'three';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { BezierCurve } from "./Math.js";
import {BezierCurveTool, HermiteCurveTool} from "./Tools.js";
import {drawPolygon, drawVector} from "./Visualizer.js";

export let scene, renderer, camera;

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
    const sphere = new THREE.Mesh( geometry, material );
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

function raycastMouse( event )
{
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    //const mouse = new THREE.Vector2;
    //mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    //mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    const mouse = new THREE.Vector2;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

    const raycaster = new THREE.Raycaster();

    camera.updateMatrixWorld();

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    return raycaster.intersectObjects(scene.children);
}

function onMouseClick( event )
{
    if (activeTool != null)
    {
        const intersects = raycastMouse( event );

        if (intersects.length > 0)
        {
            activeTool.pointAdded( intersects[0].point, intersects[0].object, event );
        }
    }
}

function onRightClick( event )
{
    if (activeTool != null)
    {
        const intersects = raycastMouse( event );

        if (intersects.length > 0)
        {
            activeTool.pointRemoved( intersects[0].object );
        }
    }
}

function startBezierCurve( event )
{
    if( activeTool )
    {
        activeTool.revert();
    }

    bezierTool.curveDegree = Number( document.getElementById( "bezierDegreeEdit" ).value );
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
            if( !activeTool.complete() )
            {
                activeTool.revert();
            }

            activeTool = null;
        }
    }
    else if ( event.key === "Backspace" )
    {
        if( activeTool )
        {
            activeTool.pointRemoved();
        }
    }
}

function updateBezierDegree( event )
{
    bezierTool.curveDegree = Number( event.target.value );
}

function main()
{
    init();

    renderer.domElement.addEventListener( "click", onMouseClick );
    renderer.domElement.addEventListener( "contextmenu", onRightClick );
    document.getElementById( "createBezierButton" ).addEventListener( "click", startBezierCurve );
    document.getElementById( "createHermiteButton" ).addEventListener( "click", startHermiteCurve );
    document.getElementById( "bezierDegreeEdit" ).addEventListener( "change", updateBezierDegree );
    document.addEventListener( 'keydown', onKeyPressed );
}

main();