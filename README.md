# Sistema de Gestión de Parqueadero

## Descripción
API para gestionar un sistema de parqueadero. Incluye autenticación, gestión de clientes, espacios, vehículos y generación de reportes.

---

## Instalación

### **Requisitos previos**
- Node.js (versión 14 o superior)
- MongoDB (local o en la nube)

### **Pasos para la instalación**
1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd sistema-de-gestion-de-parqueadero
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Configura las variables de entorno en un archivo `.env` en la raíz del proyecto:
   ```plaintext
   MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@cluster0.mongodb.net/<nombre_base_datos>
   JWT_SECRET=tu_secreto_jwt
   PORT=3000
   ```
5. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

---

## Endpoints

### **Autenticación**
- **POST** `/api/auth/login`  
  **Body:**
  ```json
  {
    "email": "admin@uptc.com",
    "password": "admin123"
  }
  ```
  **Respuesta:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### **Clientes**
- **GET** `/api/clientes`  
  **Headers:**  
  - `Authorization: Bearer <token>`  
  **Respuesta:** Lista de clientes.

---

### **Espacios**
- **GET** `/api/espacios`  
  **Headers:**  
  - `Authorization: Bearer <token>`  
  **Respuesta:** Lista de espacios disponibles.

---

### **Vehículos**
- **POST** `/api/vehiculos`  
  **Headers:**  
  - `Authorization: Bearer <token>`  
  **Body:**
  ```json
  {
    "placa": "ABC123",
    "tipo": "Carro",
    "clienteId": "1234567890"
  }
  ```
  **Respuesta:** Vehículo registrado.

---

### **Reportes**
- **GET** `/api/reportes`  
  **Headers:**  
  - `Authorization: Bearer <token>`  
  **Respuesta:** Reporte generado.

---

## Datos para pruebas
- **Administrador:**
  ```json
  {
    "email": "admin@uptc.com",
    "password": "admin123"
  }
  ```
- **Usuario regular:**
  ```json
  {
    "email": "user@uptc.com",
    "password": "user123"
  }
  ```

---

## Scripts útiles
- **Iniciar el servidor en modo desarrollo:**
  ```bash
  npm run dev
  ```
- **Iniciar el servidor en modo producción:**
  ```bash
  npm start
  ```

---

## Tecnologías utilizadas
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Cors
- Morgan

---

## Contribuciones
Si deseas contribuir a este proyecto, por favor realiza un fork del repositorio, crea una rama con tus cambios y envía un pull request.

---

## Licencia
Este proyecto está bajo la licencia MIT.