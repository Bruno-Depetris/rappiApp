
class NotificationManager {
  constructor() {
    this.notyf = null;
    this.init();
  }

  init() {
    if (typeof window !== 'undefined' && window.Notyf) {
      this.notyf = new Notyf({
        duration: 4000,
        position: {
          x: 'right',
          y: 'top',
        },
        ripple: true,
        dismissible: true,
        types: [
          {
            type: 'warning',
            background: '#FFA726',
            icon: {
              className: 'material-icons',
              tagName: 'i',
              text: 'warning'
            }
          },
          {
            type: 'info',
            background: '#2196F3',
            icon: {
              className: 'material-icons',
              tagName: 'i',
              text: 'info'
            }
          },
          {
            type: 'pedido',
            background: '#FF6B35',
            icon: {
              className: 'material-icons',
              tagName: 'i',
              text: 'local_shipping'
            }
          },


        ]
      });
    }
  }

  mostrar(tipo, mensaje, duracion = 4000) {
    if (!this.notyf) {
      console.warn('Notyf no funciona o no esta bien declarado en el index principal');
      return;
    }

    const config = {
      message: mensaje,
      duration: duracion
    };

    switch (tipo) {
      case 'success':
      case 'exito':
        this.notyf.success(mensaje);
        break;
      case 'error':
        this.notyf.error(mensaje);
        break;
      case 'warning':
      case 'advertencia':
        this.notyf.advertencia(mensaje);
        break;      
    }
  }


}

// instanciamos
const notificationManager = new NotificationManager();

export const Notificar = {
  exito: (mensaje, duracion) => notificationManager.mostrar('success', mensaje, duracion),
  error: (mensaje, duracion) => notificationManager.mostrar('error', mensaje, duracion),
  advertencia: (mensaje, duracion) => notificationManager.mostrar('warning', mensaje, duracion),
  

  
  mostrar: (tipo, mensaje, duracion) => notificationManager.mostrar(tipo, mensaje, duracion)
};


export default Notificar;