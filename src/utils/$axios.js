import axios from "axios";

// 修正 baseURL，确保带有协议双斜杠
axios.defaults.baseURL = "http://127.0.0.1:8115";

export default axios;


