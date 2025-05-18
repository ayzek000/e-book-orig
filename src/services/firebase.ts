import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Конфигурация Firebase
// ВНИМАНИЕ: В реальном приложении эти ключи должны храниться в переменных окружения
// Для тестирования используем тестовый проект Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBdcJHNUPHCGQUUlvlUgCJGGu4_9m5aDBk",
  authDomain: "test-project-12345.firebaseapp.com",
  projectId: "test-project-12345",
  storageBucket: "test-project-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Получение экземпляра Firestore
export const db = getFirestore(app);

export default app;
