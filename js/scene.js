import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

    const canvas=document.querySelector("#hero-canvas");

    if(canvas){
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);
      camera.position.set(0,0,6.2);

      const renderer=new THREE.WebGLRenderer({
        canvas,
        alpha:true,
        antialias:true
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      renderer.setSize(innerWidth,innerHeight);
      renderer.outputColorSpace=THREE.SRGBColorSpace;

      /* -------------------------
         CUSTOM FLOWING RIBBON
      ------------------------- */

      const segments=220;
      const width=.52;
      const positions=[];
      const uvs=[];
      const indices=[];

      function centerPoint(t){
        const a=t*Math.PI*1.8;
        return new THREE.Vector3(
          Math.sin(a)*1.55,
          Math.sin(a*1.32)*.72 + Math.cos(a*.58)*.18,
          Math.cos(a*.86)*.78
        );
      }

      for(let i=0;i<=segments;i++){
        const t=i/segments;
        const tPrev=Math.max(0,t-1/segments);
        const tNext=Math.min(1,t+1/segments);

        const c=centerPoint(t);
        const p0=centerPoint(tPrev);
        const p1=centerPoint(tNext);

        const tangent=p1.clone().sub(p0).normalize();

        let side=new THREE.Vector3(0,1,0).cross(tangent);
        if(side.lengthSq()<.0001){
          side=new THREE.Vector3(1,0,0);
        }
        side.normalize();

        const twist=(t-.5)*Math.PI*3.2 + Math.sin(t*Math.PI*2)*.42;
        const q=new THREE.Quaternion().setFromAxisAngle(tangent,twist);
        side.applyQuaternion(q).normalize();

        const taper=.72 + Math.sin(t*Math.PI)*.34;
        const half=width*.5*taper;

        const left=c.clone().add(side.clone().multiplyScalar(half));
        const right=c.clone().add(side.clone().multiplyScalar(-half));

        positions.push(left.x,left.y,left.z,right.x,right.y,right.z);
        uvs.push(0,t,1,t);
      }

      for(let i=0;i<segments;i++){
        const a=i*2;
        const b=a+1;
        const c=a+2;
        const d=a+3;

        indices.push(a,b,c);
        indices.push(b,d,c);
      }

      const ribbonGeometry=new THREE.BufferGeometry();
      ribbonGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions,3)
      );
      ribbonGeometry.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(uvs,2)
      );
      ribbonGeometry.setIndex(indices);
      ribbonGeometry.computeVertexNormals();

      const ribbonMaterial=new THREE.MeshPhysicalMaterial({
        color:0x111111,
        metalness:1,
        roughness:.18,
        clearcoat:1,
        clearcoatRoughness:.1,
        side:THREE.DoubleSide
      });

      const ribbon=new THREE.Mesh(ribbonGeometry,ribbonMaterial);
      ribbon.position.set(.72,.02,0);
      ribbon.rotation.set(-.12,.28,-.18);
      ribbon.scale.setScalar(1.02);
      scene.add(ribbon);

      /* faint secondary ribbon for depth */
      const ribbon2=new THREE.Mesh(
        ribbonGeometry.clone(),
        new THREE.MeshPhysicalMaterial({
          color:0x080808,
          metalness:.92,
          roughness:.32,
          clearcoat:.7,
          side:THREE.DoubleSide,
          transparent:true,
          opacity:.42
        })
      );
      ribbon2.position.set(.98,-.18,-.9);
      ribbon2.rotation.set(.18,-.55,.3);
      ribbon2.scale.setScalar(.64);
      scene.add(ribbon2);

      /* LIGHTING */
      const key=new THREE.DirectionalLight(0xffffff,5.8);
      key.position.set(4,5,7);
      scene.add(key);

      const rim=new THREE.DirectionalLight(0xffffff,3.2);
      rim.position.set(-5,-1,-4);
      scene.add(rim);

      const topLight=new THREE.PointLight(0xffffff,10,14);
      topLight.position.set(1.5,3.5,4);
      scene.add(topLight);

      const sideLight=new THREE.PointLight(0x777777,6,12);
      sideLight.position.set(-2,-2,3);
      scene.add(sideLight);

      scene.add(new THREE.AmbientLight(0xffffff,.27));

      let mx=0,my=0,sy=scrollY;

      addEventListener("mousemove",e=>{
        mx=e.clientX/innerWidth-.5;
        my=e.clientY/innerHeight-.5;
      });

      addEventListener("scroll",()=>{
        sy=scrollY;
      });

      const clock=new THREE.Clock();

      function animate(){
        const t=clock.getElapsedTime();
        const p=Math.min(sy/innerHeight,1);

        ribbon.rotation.y=.28 + Math.sin(t*.33)*.08 + mx*.22 + p*.42;
        ribbon.rotation.x=-.12 + my*.14 - p*.08;
        ribbon.rotation.z=-.18 + Math.sin(t*.28)*.055;

        ribbon.position.x+=(.72 + mx*.16 + p*.22 - ribbon.position.x)*.035;
        ribbon.position.y+=(.02 - my*.07 - p*.11 - ribbon.position.y)*.035;
        ribbon.position.z=-p*.35;

        const scale=1.02 - p*.10;
        ribbon.scale.setScalar(scale);

        ribbon2.rotation.y=-.55 - Math.sin(t*.25)*.06 - mx*.12;
        ribbon2.rotation.z=.3 + Math.cos(t*.22)*.05;
        ribbon2.position.y=-.28 + Math.sin(t*.5)*.04;

        renderer.render(scene,camera);
        requestAnimationFrame(animate);
      }

      animate();

      addEventListener("resize",()=>{
        camera.aspect=innerWidth/innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(innerWidth,innerHeight);
        renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      });
    }
