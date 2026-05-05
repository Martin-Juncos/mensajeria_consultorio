# Sistema de Mensajería Interna para Consultorio

Sistema de mensajería en tiempo real para consultorio médico, desarrollado con PERN stack (PostgreSQL, Express, React, Node.js) + Socket.IO.

---

## 📋 Requisitos

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** o **yarn**

---

## 🚀 Instalación

### 1. Clonar el proyecto

```bash
cd mensajeria_consultorio
```

### 2. Instalar dependencias del backend

```bash
cd server
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../client
npm install
```

### 4. Configurar base de datos

1. Crear una base de datos PostgreSQL llamada `mensajeria_consultorio`:

```sql
CREATE DATABASE mensajeria_consultorio;
```

2. Configure las variables de entorno en `server/.env`:

```env
PORT=3001
DB_NAME=mensajeria_consultorio
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
```

---

## 🏃 Ejecución

### Iniciar Backend

```bash
cd server
npm start
```

El backend corre en `http://localhost:3001`

### Iniciar Frontend

```bash
cd client
npm run dev
```

El frontend corre en `http://localhost:5173`

---

## 📚 Estructura del Proyecto

```
mensajeria_consultorio/
├── server/                    # Backend (Express + Sequelize + Socket.IO)
│   ├── src/
│   │   ├── config/          # Configuración de base de datos
│   │   │   └── database.js
│   │   ├── models/         # Modelos Sequelize
│   │   │   ├── User.js
│   │   │   ├── Patient.js
│   │   │   ├── Subject.js
│   │   │   ├── Message.js
│   │   │   ├── MessageRecipient.js
│   │   │   └── index.js
│   │   ├── routes/        # Rutas REST API
│   │   │   ├── users.js
│   │   │   ├── patients.js
│   │   │   ├── subjects.js
│   │   │   └── messages.js
│   │   └── app.js        # Servidor principal + Socket.IO
│   ├── index.js          # Punto de entrada
│   └── package.json
│
├── client/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   │   ├── Sidebar.jsx + .css
│   │   │   ├── Inbox.jsx + .css
│   │   │   ├── MessageList.jsx + .css
│   │   │   ├── MessageDetail.jsx + .css
│   │   │   └── ComposeModal.jsx + .css
│   │   ├── pages/        # Páginas
│   │   │   └── SentPage.jsx
│   │   ├── context/      # Contextos React
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/       # Hooks personalizados
│   │   │   └── useSocket.js
│   │   ├── services/   # Servicios API
│   │   │   └── api.js
│   │   ├── App.tsx     # Componente principal
│   │   └── main.tsx   # Punto de entrada
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🗄️ Base de Datos

### Modelo Entidad-Relación

```
┌─────────────┐       ┌─────────────┐
│    users   │       │  patients  │
├─────────────┤       ├─────────────┤
│ id (PK)    │       │ id (PK)    │
│ name       │       │ name       │
│ email      │       │ dni        │
│ role      │◄─────►│ phone      │
│ active    │  1:N  │ email      │
└─────────────┘       │ birthDate │
        │             │ notes     │
        │             └───────────┘
        │
        │ 1:N
        ▼
┌─────────────┐       ┌─────────────┐
│  messages   │       │  subjects  │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)    │
│ sender_id   │       │ name       │
│ subject_id  │◄─────►│ type       │
│ title      │  N:1  │ patient_id │
│ body       │       └─────────────┘
│ createdAt  │
└─────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────┐
│ message_recipients  │
├─────────────────────┤
│ id (PK)           │
│ message_id (FK)    │
│ recipient_id (FK)   │
│ read_at            │
└─────────────────────┘
```

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema (médicos, recepcionistas) |
| `patients` | Catálogo de pacientes |
| `subjects` | Tipos de asunto (paciente, consulta, informe, administrativo) |
| `messages` | Mensajes enviados |
| `message_recipients` | Destinatariospor mensaje con estado de lectura |

---

## 🔌 API REST

### Endpoints

| Método | Ruta | Descripción |
|-------|------|-------------|
| GET | `/api/users` | Listar usuarios |
| GET | `/api/patients` | Listar pacientes |
| GET | `/api/subjects` | Listar assuntos |
| GET | `/api/messages?userId=X&type=inbox` | Bandeja de entrada |
| GET | `/api/messages?userId=X&type=sent` | Mensajes enviados |
| POST | `/api/messages` | Enviar mensaje |
| PUT | `/api/messages/:id/read` | Marcar como leído |

---

## 🔄 WebSocket (Socket.IO)

### Eventos

| Evento | Descripción |
|--------|-------------|
| `join` | Unirse a sala de usuario |
| `send_message` | Enviar mensaje en tiempo real |
| `new_message` | Receptor recibe mensaje nuevo |
| `mark_read` | Marcar mensaje como leído |
| `message_read` | Remitente recibe notificación de lectura |

---

## 🎨 Uso de la Aplicación

### Flujo de Usuario

1. **Seleccionar usuario**: Usar el dropdown en el sidebar para identificarte
2. **Bandeja de entrada**: Ver mensajes recibidos
3. **Enviados**: Ver mensajes enviados
4. **Redactar**: Crear nuevo mensaje

### Crear Usuario Inicial (vía API)

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Dr. Juan", "email": "juan@consultorio.com", "role": "medico"}'
```

---

## 🛠️ Tecnologías

### Backend
- **Express.js** - Servidor web
- **Sequelize** - ORM para PostgreSQL
- **Socket.IO** - WebSockets en tiempo real
- **PostgreSQL** - Base de datos
- **cors** - CORS
- **dotenv** - Variables de entorno

### Frontend
- **React 18** - UI
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Socket.IO Client** - Cliente WebSocket
- **Axios** - Cliente HTTP
- **date-fns** - Fechas

---

## 📝 Notas

- No hay autenticación (intranet cerrada)
- Usuario activo se selecciona manualmente
- Socket.IO para mensajes en tiempo real
- Sequelize sincroniza tablas automáticamente

---

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit (`git commit -m 'Agrega nueva característica'`)
4. Push (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

---

## 📄 Licencia

MIT

---

Hecho por el Prof. Mercho con mucho 💖 y ☕