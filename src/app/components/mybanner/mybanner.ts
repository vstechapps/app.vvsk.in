import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';

@Component({
    selector: 'app-mybanner',
    standalone: true,
    imports: [],
    templateUrl: './mybanner.html',
    styleUrl: './mybanner.css',
})
export class MyBanner implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private textMesh!: THREE.Mesh;
    private stars: THREE.Points[] = [];
    private animationId: number = 0;

    ngOnInit() {
        this.initScene();
        this.createStarfield();
        this.createText();
        //this.animate();
        this.renderer.render(this.scene, this.camera);
    }

    ngAfterViewInit() {
        if (this.canvasContainer) {
            this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);
        }
    }

    ngOnDestroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.renderer.dispose();
    }

    private initScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / 400,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, 400);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x3f51b5, 2);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xff00ff, 1.5);
        pointLight2.position.set(-5, -5, 5);
        this.scene.add(pointLight2);
    }

    private createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
        });

        const starVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(starVertices, 3)
        );

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        this.stars.push(stars);
    }

    private createText() {
        // Create 3D text using TextGeometry would require loading fonts
        // For simplicity, we'll create extruded shapes for "LA"
        const shapes: THREE.Shape[] = [];

        // Letter L
        const lShape = new THREE.Shape();
        lShape.lineTo(0, 2);
        lShape.lineTo(2, 4);
        shapes.push(lShape);

        // Letter A
        const aShape = new THREE.Shape();
        aShape.moveTo(1.5, 0);
        aShape.lineTo(2, 2);
        aShape.lineTo(2.3, 2);
        aShape.lineTo(2.8, 0);
        aShape.lineTo(2.5, 0);
        aShape.lineTo(2.35, 0.8);
        aShape.lineTo(1.95, 0.8);
        aShape.lineTo(1.8, 0);
        aShape.lineTo(1.5, 0);
        //shapes.push(aShape);

        // const extrudeSettings = {
        //     depth: 0.5,
        //     bevelEnabled: true,
        //     bevelThickness: 0.1,
        //     bevelSize: 0.05,
        //     bevelSegments: 3,
        // };

        const geometry = new THREE.ExtrudeGeometry(shapes);
        geometry.center();

        const material = new THREE.MeshPhongMaterial({
            color: 0x3f51b5,
            emissive: 0x1a237e,
            specular: 0x5c6bc0,
            shininess: 100,
        });

        this.textMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.textMesh);
    }

    private animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        // Rotate text
        if (this.textMesh) {
            this.textMesh.rotation.y += 0.01;
            this.textMesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
        }

        // Animate stars
        this.stars.forEach((star) => {
            star.rotation.y += 0.0005;
            star.rotation.x += 0.0002;
        });

        this.renderer.render(this.scene, this.camera);
    };

    onWindowResize() {
        this.camera.aspect = window.innerWidth / 400;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, 400);
    }
}
