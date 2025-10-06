// codigo/1.js

// Esperar a que A-Frame esté completamente cargado
if (typeof AFRAME === 'undefined') {
    throw new Error('A-Frame no está cargado');
  }
  
  AFRAME.registerComponent('shooter', {
    init: function () {
      console.log('Shooter inicializado');
      this.score = 0;
      this.scoreEl = document.getElementById('score');
      const scene = this.el;
      
      // Función para crear y disparar una pelota
      this.shootBullet = () => {
        console.log('¡Disparando!');
        const camera = document.querySelector('#camera');
        
        if (!camera) {
          console.error('No se encontró la cámara');
          return;
        }
        
        // Obtener posición de la cámara
        const cameraEl = camera.object3D;
        const position = cameraEl.getWorldPosition(new THREE.Vector3());
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(cameraEl.quaternion);
        
        console.log('Posición:', position);
        console.log('Dirección:', direction);
        
        // Crear la pelota
        const bullet = document.createElement('a-sphere');
        bullet.setAttribute('radius', '0.1');
        bullet.setAttribute('color', '#000000');
        bullet.setAttribute('material', 'shader: flat');
        
        // Posición inicial (un poco adelante de la cámara)
        const startPos = position.clone().add(direction.clone().multiplyScalar(0.5));
        bullet.setAttribute('position', `${startPos.x} ${startPos.y} ${startPos.z}`);
        
        // Añadir la pelota a la escena
        scene.appendChild(bullet);
        console.log('Pelota creada');
        
        // Calcular posición final
        const speed = 20;
        const endPos = startPos.clone().add(direction.clone().multiplyScalar(speed));
        
        // Animar
        bullet.setAttribute('animation', {
          property: 'position',
          to: `${endPos.x} ${endPos.y} ${endPos.z}`,
          dur: 800,
          easing: 'linear'
        });
        
        // Verificar colisiones continuamente durante el vuelo
        const cursor = document.querySelector('#cursor');
        let bulletRemoved = false;
        
        const checkCollision = setInterval(() => {
          if (bulletRemoved || !bullet.parentNode) {
            clearInterval(checkCollision);
            return;
          }
          
          if (cursor && cursor.components && cursor.components.raycaster) {
            const intersects = cursor.components.raycaster.intersectedEls;
            
            if (intersects.length > 0) {
              const target = intersects[0];
              if (target.classList.contains('shootable')) {
                console.log('¡Objetivo alcanzado!');
                
                // Eliminar el objetivo
                target.parentNode.removeChild(target);
                
                // Eliminar la pelota inmediatamente
                if (bullet.parentNode) {
                  bullet.parentNode.removeChild(bullet);
                  bulletRemoved = true;
                  console.log('Pelota y objetivo eliminados');
                }
                
                // Sumar puntos
                this.score += 10;
                this.scoreEl.textContent = 'Puntos: ' + this.score;
                
                clearInterval(checkCollision);
              }
            }
          }
        }, 10);
        
        // Eliminar la pelota después de la animación si no ha colisionado
        setTimeout(() => {
          clearInterval(checkCollision);
          if (bullet.parentNode && !bulletRemoved) {
            bullet.parentNode.removeChild(bullet);
            console.log('Pelota eliminada por timeout');
          }
        }, 850);
      };
    }
  });
  
  // Configurar los controles cuando todo esté listo
  window.addEventListener('load', () => {
    console.log('Página cargada');
    
    const scene = document.querySelector('a-scene');
    
    scene.addEventListener('loaded', () => {
      console.log('Escena A-Frame cargada');
      
      // Aplicar el componente shooter
      scene.setAttribute('shooter', '');
      
      // Obtener el componente
      setTimeout(() => {
        const shooterComponent = scene.components.shooter;
        
        if (shooterComponent) {
          console.log('Componente shooter encontrado');
          
          // Disparar con click
          window.addEventListener('click', (e) => {
            console.log('Click detectado');
            shooterComponent.shootBullet();
          });
          
          // Disparar con espacio
          window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
              console.log('Espacio presionado');
              e.preventDefault();
              shooterComponent.shootBullet();
            }
          });
          
          console.log('Controles configurados. Usa CLICK o ESPACIO para disparar');
        } else {
          console.error('No se pudo obtener el componente shooter');
        }
      }, 100);
    });
  });