import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import ToastService from 'primevue/toastservice';
import './style.css'
import 'primeicons/primeicons.css';
import App from './App.vue'

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff2ee',
      100: '#ffe3db',
      200: '#ffc6b8',
      300: '#ffa08a',
      400: '#ff7a5c',
      500: '#f2613f',
      600: '#db5536',
      700: '#b8462c',
      800: '#943723',
      900: '#782c1b',
      950: '#43170f'
    },
  }
});

const app = createApp(App);
app.use(createPinia());
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
  }
});
app.use(ToastService);
app.mount('#app');
