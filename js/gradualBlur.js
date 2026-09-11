/**
 * GradualBlur Component (ReactBits)
 * Component added by Ansh - github.com/ansh-dhanani
 * Progressive multi-layer backdrop-filter blur with cubic-bezier / exponential masks
 */

class GradualBlur {
  constructor(options = {}) {
    this.target = options.target || 'parent';
    this.position = options.position || 'bottom'; // 'bottom' | 'top' | 'left' | 'right'
    this.height = options.height || '7rem';
    this.width = options.width || '100%';
    this.strength = typeof options.strength === 'number' ? options.strength : 2.5;
    this.divCount = typeof options.divCount === 'number' ? options.divCount : 2;
    this.curve = options.curve || 'bezier'; // 'bezier' | 'linear' | 'exponential'
    this.exponential = options.exponential !== undefined ? options.exponential : true;
    this.opacity = typeof options.opacity === 'number' ? options.opacity : 1;
    this.zIndex = typeof options.zIndex === 'number' ? options.zIndex : 15;
    this.className = options.className || '';
    
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.className = `gradual-blur-container gradual-blur-${this.position} ${this.className}`.trim();
    
    // Container base styling
    Object.assign(this.container.style, {
      position: 'absolute',
      pointerEvents: 'none',
      opacity: this.opacity,
      zIndex: this.zIndex,
      overflow: 'hidden'
    });

    // Position anchoring
    if (this.position === 'bottom') {
      Object.assign(this.container.style, {
        bottom: '0',
        left: '0',
        right: '0',
        width: '100%',
        height: this.height
      });
    } else if (this.position === 'top') {
      Object.assign(this.container.style, {
        top: '0',
        left: '0',
        right: '0',
        width: '100%',
        height: this.height
      });
    } else if (this.position === 'left') {
      Object.assign(this.container.style, {
        top: '0',
        bottom: '0',
        left: '0',
        height: '100%',
        width: this.height || this.width
      });
    } else if (this.position === 'right') {
      Object.assign(this.container.style, {
        top: '0',
        bottom: '0',
        right: '0',
        height: '100%',
        width: this.height || this.width
      });
    }

    this.renderLayers();
    this.attach();
  }

  renderLayers() {
    this.container.innerHTML = '';
    const dir = this.position === 'bottom' ? 'to bottom' 
              : this.position === 'top' ? 'to top'
              : this.position === 'right' ? 'to right' : 'to left';

    for (let i = 0; i < this.divCount; i++) {
      const layer = document.createElement('div');
      layer.className = 'gradual-blur-layer';

      // Calculate blur intensity
      let blurPx;
      if (this.exponential) {
        blurPx = this.strength * Math.pow(2, i);
      } else {
        blurPx = this.strength * (i + 1);
      }

      // Calculate mask gradient stops based on curve
      let maskGradient;
      const stepStart = (i / this.divCount) * 100;
      const stepMid = ((i + 0.5) / this.divCount) * 100;
      const stepEnd = Math.min(100, ((i + 1) / this.divCount) * 100);

      if (this.curve === 'bezier') {
        // Cubic-bezier approximation for ultra smooth progressive fade
        maskGradient = `linear-gradient(${dir}, 
          rgba(0, 0, 0, 0) 0%, 
          rgba(0, 0, 0, 0.05) ${Math.max(0, stepStart - 10)}%, 
          rgba(0, 0, 0, 0.45) ${stepMid}%, 
          rgba(0, 0, 0, 0.88) ${stepEnd}%, 
          rgba(0, 0, 0, 1) 100%)`;
      } else if (this.curve === 'linear') {
        maskGradient = `linear-gradient(${dir}, 
          rgba(0, 0, 0, 0) ${stepStart}%, 
          rgba(0, 0, 0, 1) ${stepEnd}%)`;
      } else {
        maskGradient = `linear-gradient(${dir}, 
          rgba(0, 0, 0, 0) 0%, 
          rgba(0, 0, 0, 0.2) 25%, 
          rgba(0, 0, 0, 0.6) 60%, 
          rgba(0, 0, 0, 1) 100%)`;
      }

      Object.assign(layer.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        width: '100%',
        height: '100%',
        backdropFilter: `blur(${blurPx.toFixed(1)}px)`,
        WebkitBackdropFilter: `blur(${blurPx.toFixed(1)}px)`,
        maskImage: maskGradient,
        WebkitMaskImage: maskGradient,
        pointerEvents: 'none'
      });

      this.container.appendChild(layer);
    }
  }

  attach() {
    let parentElem = null;
    if (this.target === 'parent') {
      parentElem = document.querySelector('.gradual-blur-target') || document.body;
    } else if (typeof this.target === 'string') {
      parentElem = document.querySelector(this.target);
    } else if (this.target instanceof HTMLElement) {
      parentElem = this.target;
    }

    if (parentElem) {
      if (window.getComputedStyle(parentElem).position === 'static') {
        parentElem.style.position = 'relative';
      }
      parentElem.appendChild(this.container);
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  // Static helper to attach blur to any element
  static create(target, options = {}) {
    return new GradualBlur({ target, ...options });
  }

  // Auto-initialize any elements with data-gradual-blur attribute
  static initAuto() {
    document.querySelectorAll('[data-gradual-blur]').forEach(el => {
      if (el.querySelector('.gradual-blur-container')) return; // already initialized
      const pos = el.getAttribute('data-blur-position') || 'bottom';
      const height = el.getAttribute('data-blur-height') || '5rem';
      const strength = parseFloat(el.getAttribute('data-blur-strength')) || 2.5;
      const divCount = parseInt(el.getAttribute('data-blur-divs')) || 2;
      const curve = el.getAttribute('data-blur-curve') || 'bezier';
      const exponential = el.getAttribute('data-blur-exponential') !== 'false';

      new GradualBlur({
        target: el,
        position: pos,
        height: height,
        strength: strength,
        divCount: divCount,
        curve: curve,
        exponential: exponential,
        opacity: 1
      });
    });
  }
}

// Global hook
window.GradualBlur = GradualBlur;

// Auto-run on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GradualBlur.initAuto());
} else {
  GradualBlur.initAuto();
}
