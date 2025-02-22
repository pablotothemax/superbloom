if (!customElements.get('product-modal')) {
  customElements.define(
    'product-modal',
    class ProductModal extends ModalDialog {
      constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
        this.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.addEventListener('touchend', this.handleTouchEnd.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        // Initialize touch tracking variables
        this.touchState = {
          startX: 0,
          startY: 0,
          startDistance: 0,
          currentScale: 1,
          isDragging: false,
          translateX: 0,
          translateY: 0,
          lastTranslateX: 0,
          lastTranslateY: 0,
          isZoomed: false,
        };
      }

      handleClick(event) {
        if (event.target === this || event.target.classList.contains('product-media-modal__dialog')) {
          this.hide();
          return;
        }

        const activeMedia = this.querySelector('.product-media-modal__content .active');
        if (activeMedia && event.target === activeMedia && !this.touchState.isDragging) {
          if (!this.touchState.isZoomed) {
            this.touchState.currentScale = 1.5;
            this.touchState.isZoomed = true;
            this.querySelector('.product-media-modal__dialog').classList.add('zoomed');
          } else {
            this.resetZoom();
            this.querySelector('.product-media-modal__dialog').classList.remove('zoomed');
          }
          this.applyTransform(activeMedia);
        }
      }

      handleTouchStart(event) {
        if (event.touches.length === 1) {
          // Single touch - prepare for potential drag
          const touch = event.touches[0];
          this.touchState.startX = touch.clientX;
          this.touchState.startY = touch.clientY;
          this.touchState.isDragging = true;
        } else if (event.touches.length === 2) {
          // Pinch gesture - prepare for zoom
          this.touchState.startDistance = this.getDistance(event.touches[0], event.touches[1]);
          this.touchState.isDragging = false;
          const dialog = this.querySelector('.product-media-modal__dialog');
          dialog.classList.add('zoomed');
        }
      }

      handleTouchMove(event) {
        event.preventDefault();
        const activeMedia = this.querySelector('.product-media-modal__dialog .active');
        if (!activeMedia) return;

        if (event.touches.length === 1 && this.touchState.isDragging && this.touchState.currentScale > 1) {
          // Handle panning when zoomed in
          const touch = event.touches[0];
          const deltaX = touch.clientX - this.touchState.startX;
          const deltaY = touch.clientY - this.touchState.startY;

          this.touchState.translateX = this.touchState.lastTranslateX + deltaX;
          this.touchState.translateY = this.touchState.lastTranslateY + deltaY;

          // Apply boundaries to prevent dragging too far
          const maxTranslate = ((this.touchState.currentScale - 1) * activeMedia.offsetWidth) / 2;
          this.touchState.translateX = Math.min(Math.max(this.touchState.translateX, -maxTranslate), maxTranslate);
          this.touchState.translateY = Math.min(Math.max(this.touchState.translateY, -maxTranslate), maxTranslate);

          this.applyTransform(activeMedia);
        } else if (event.touches.length === 2) {
          // Handle pinch zoom with reduced maximum zoom
          const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
          const scale = Math.min(
            Math.max((currentDistance / this.touchState.startDistance) * this.touchState.currentScale, 1),
            2.5 // Reduced maximum zoom level
          );

          this.touchState.currentScale = scale;
          this.touchState.isZoomed = scale > 1;
          this.applyTransform(activeMedia);
        }
      }

      handleTouchEnd() {
        if (this.touchState.isDragging) {
          this.touchState.lastTranslateX = this.touchState.translateX;
          this.touchState.lastTranslateY = this.touchState.translateY;
        }

        // Reset to initial state if zoomed out
        if (this.touchState.currentScale <= 1) {
          this.resetZoom();
          const dialog = this.querySelector('.product-media-modal__dialog');
          dialog.classList.remove('zoomed');
        }
      }

      resetZoom() {
        this.touchState.currentScale = 1;
        this.touchState.translateX = 0;
        this.touchState.translateY = 0;
        this.touchState.lastTranslateX = 0;
        this.touchState.lastTranslateY = 0;
        this.touchState.isZoomed = false;

        const activeMedia = this.querySelector('.product-media-modal__dialog .active');
        if (activeMedia) {
          this.applyTransform(activeMedia);
        }
      }

      getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      }

      applyTransform(element) {
        element.style.transform = `translate(${this.touchState.translateX}px, ${this.touchState.translateY}px) scale(${this.touchState.currentScale})`;
      }

      handleResize() {
        if (this.hasAttribute('open')) {
          this.adjustModalDimensions();
        }
      }

      adjustModalDimensions() {
        const dialog = this.querySelector('.product-media-modal__dialog');
        const content = this.querySelector('.product-media-modal__content');

        if (!dialog || !content) return;

        const isMobile = window.innerWidth < 750;

        if (isMobile) {
          // Reset any previous styles
          this.style.cssText = `
            width: 100% !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          `;

          dialog.style.cssText = `
            width: 90% !important;
            max-width: 90vw !important;
            height: 85vh !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          `;

          content.style.cssText = `
            width: 100% !important;
            height: 100% !important;
            max-width: 90vw !important;
            max-height: 85vh !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          `;

          // Prevent body scrolling
          document.body.style.overflow = 'hidden';

          // Handle all media elements
          const mediaElements = content.querySelectorAll('img, video, iframe, model-viewer');
          mediaElements.forEach((media) => {
            media.style.cssText = `
              width: auto !important;
              height: auto !important;
              max-width: 100% !important;
              max-height: 85vh !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              object-fit: contain !important;
            `;
          });

          // Ensure active media is properly sized
          const activeMedia = content.querySelector('.active');
          if (activeMedia) {
            activeMedia.style.cssText = `
              width: auto !important;
              height: auto !important;
              max-width: 100% !important;
              max-height: 85vh !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              object-fit: contain !important;
            `;
          }
        } else {
          // Reset body overflow
          document.body.style.overflow = '';

          // Desktop behavior
          dialog.style.minHeight = `${window.innerHeight}px`;
          content.style.maxWidth = 'var(--page-width)';
        }

        // Center active media
        const activeMedia = content.querySelector('.active');
        if (activeMedia) {
          requestAnimationFrame(() => {
            activeMedia.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        }
      }

      hide() {
        super.hide();
        this.resetZoom();
        document.body.style.overflow = '';

        // Remove active state and restore opacity of product images
        document.querySelectorAll('.product__media-toggle').forEach((toggle) => {
          toggle.classList.remove('active');
        });
        const productMedia = document.querySelector('.product__media');
        if (productMedia) {
          productMedia.style.opacity = '';
          productMedia.style.transition = '';
        }

        const content = this.querySelector('.product-media-modal__content');
        if (content) {
          content.scrollTop = 0;
          content.style = '';
          content.querySelectorAll('img, video, iframe, model-viewer').forEach((media) => {
            media.style = '';
          });
        }
      }

      show(opener) {
        super.show(opener);
        this.showActiveMedia();
        this.resetZoom();

        // Add active state and fade effect to the clicked image
        if (opener) {
          opener.classList.add('active');
          const productMedia = document.querySelector('.product__media');
          if (productMedia) {
            productMedia.style.opacity = '0.8';
            productMedia.style.transition = 'opacity 0.3s ease';
          }
        }

        requestAnimationFrame(() => {
          this.adjustModalDimensions();
        });
      }

      showActiveMedia() {
        this.querySelectorAll('[data-media-id]').forEach((element) => {
          element.classList.remove('active');
        });

        const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute('data-media-id')}"]`);

        if (activeMedia) {
          activeMedia.classList.add('active');

          requestAnimationFrame(() => {
            const content = this.querySelector('.product-media-modal__content');
            if (content) {
              content.style.overflowY = 'auto';
            }

            activeMedia.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });

          const activeMediaTemplate = activeMedia.querySelector('template');
          if (activeMedia.nodeName === 'DEFERRED-MEDIA' && activeMediaTemplate?.content?.querySelector('.js-youtube')) {
            activeMedia.loadContent();
          }
        }
      }
    }
  );
}
