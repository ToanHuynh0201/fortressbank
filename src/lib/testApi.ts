import {ApiService} from "./api";

/**
 * Test API service using JSONPlaceholder
 * Public API for testing: https://jsonplaceholder.typicode.com
 */
const testApiService = new ApiService("https://jsonplaceholder.typicode.com");

export default testApiService;
