import axios from "axios";
import { APP_CONFIG } from '/src/utils/appConfig.js';

// 配置 axios
axios.defaults.baseURL = APP_CONFIG.API_BASE_URL;

export default axios;


