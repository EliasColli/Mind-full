import express from 'express';
import mssql from 'mssql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware para parsear JSON en las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'page')));

// Middleware para manejar cookies
app.use(cookieParser());

// Conexión a la base de datos
const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true, // Si estás usando Azure
        enableArithAbort: true,
        trustServerCertificate: true  // Añade esta línea para confiar en el certificado autofirmado
    }
};

mssql.connect(config)
    .then(() => console.log('Conexión establecida con SQL Server'))
    .catch(err => console.error('Error al conectar con SQL Server', err));

// Rutas para servir archivos estáticos (HTML)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "page", "BIENVENIDOS.html"));
});

app.get('/page/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'login.html'));
});

app.get('/page/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'register.html'));
});

app.get('/page/pantalla_inicial.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'pantalla_inicial.html'));
});

app.get('/page/encuesta.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'encuesta.html'));
});

app.get('/page/encuesta1.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'encuesta1.html'));
});

app.get('/page/consejos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'consejos.html'));
});

app.get('/page/infoPsicologos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'infoPsicologos.html'));
});

app.get('/page/Ajustes.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'Ajustes.html'));
});

app.get('/page/datos_personales.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'datos_personales.html'));
});


// Ruta POST para procesar el registro
app.post('/register', async (req, res) => {
    const { first_name, last_name, phone_number, address, email, password } = req.body;

    console.log('Datos recibidos para registro:', req.body);

    try {
        // Verificar si el usuario ya existe
        const checkUserQuery = `SELECT * FROM users WHERE email = @Email`;
        const pool = await mssql.connect(config);
        const result = await pool.request()
            .input('Email', mssql.VarChar, email)
            .query(checkUserQuery);

        console.log('Resultado de la consulta de usuario:', result);

        if (result.recordset.length > 0) {
            return res.status(400).json({ message: 'El usuario ya está registrado' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el usuario en la base de datos
        const insertUserQuery = `
            INSERT INTO users (first_name, last_name, phone_number, address, email, password)
            VALUES (@FirstName, @LastName, @PhoneNumber, @Address, @Email, @Password)
        `;
        const insertResult = await pool.request()
            .input('FirstName', mssql.VarChar, first_name)
            .input('LastName', mssql.VarChar, last_name)
            .input('PhoneNumber', mssql.VarChar, phone_number)
            .input('Address', mssql.VarChar, address)
            .input('Email', mssql.VarChar, email)
            .input('Password', mssql.VarChar, hashedPassword)
            .query(insertUserQuery);

        console.log('Resultado de la inserción del usuario:', insertResult);

        // Redirigir a la página de inicio de sesión
        res.redirect('/page/login.html');
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno al registrar usuario' });
    }
});

// Ruta POST para procesar el inicio de sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Datos recibidos para inicio de sesión:', req.body);

    try {
        // Verificar si el usuario existe
        const checkUserQuery = `SELECT * FROM users WHERE email = @Email`;
        const pool = await mssql.connect(config);
        const result = await pool.request()
            .input('Email', mssql.VarChar, email)
            .query(checkUserQuery);

        console.log('Resultado de la consulta de usuario:', result);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar la contraseña
        const user = result.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token de autenticación
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Establecer token en una cookie y redirigir
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/page/pantalla_inicial.html');
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        res.status(500).json({ message: 'Error interno al autenticar usuario' });
    }
});

// Middleware de autenticación
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó un token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido' });
        }
        req.user = user;
        next();
    });
}

// Ruta para obtener datos del usuario autenticado
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const pool = await mssql.connect(config);
        const result = await pool.request()
            .input('UserId', mssql.Int, userId)
            .query('SELECT first_name, last_name, phone_number, address, email FROM users WHERE id = @UserId');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        res.status(500).json({ message: 'Error interno al obtener datos del usuario' });
    }
});

// Ruta para actualizar datos del usuario
app.put('/api/user', authenticateToken, async (req, res) => {
    const { first_name, last_name, phone_number, address, email } = req.body;
    try {
        const userId = req.user.userId;
        const pool = await mssql.connect(config);
        await pool.request()
            .input('UserId', mssql.Int, userId)
            .input('FirstName', mssql.VarChar, first_name)
            .input('LastName', mssql.VarChar, last_name)
            .input('PhoneNumber', mssql.VarChar, phone_number)
            .input('Address', mssql.VarChar, address)
            .input('Email', mssql.VarChar, email)
            .query('UPDATE users SET first_name = @FirstName, last_name = @LastName, phone_number = @PhoneNumber, address = @Address, email = @Email WHERE id = @UserId');

        res.json({ message: 'Datos actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        res.status(500).json({ message: 'Error interno al actualizar datos del usuario' });
    }
});

// Ruta para eliminar al usuario
app.delete('/api/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const pool = await mssql.connect(config);
        await pool.request()
            .input('UserId', mssql.Int, userId)
            .query('DELETE FROM users WHERE id = @UserId');

        res.clearCookie('token');
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno al eliminar usuario' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
