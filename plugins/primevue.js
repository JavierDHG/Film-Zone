import Vue from 'vue'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button' // Ejemplo de un componente
import 'primevue/resources/themes/saga-blue/theme.css'  // Tema
import 'primevue/resources/primevue.min.css'            // Estilos de componentes
import 'primeicons/primeicons.css'                      // Iconos
import ProgressBar from 'primevue/progressbar';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import ToastService from 'primevue/toastservice';

Vue.use(PrimeVue)
Vue.use(ToastService);

Vue.component('Button', Button)
Vue.component('InputText', InputText)
Vue.component('ProgressBar', ProgressBar)
Vue.component('Dialog', Dialog);
