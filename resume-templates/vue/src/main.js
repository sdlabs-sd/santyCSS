import { createApp } from 'vue';
import './santy.css'; // resolved by vite-plugin-santycss (purged in build)
import App from './App.vue';

createApp(App).mount('#app');
