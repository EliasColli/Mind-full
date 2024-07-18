import express from 'express';
import mssql from 'mssql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware para parsear JSON en las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos
app.use('/page', express.static(path.join(__dirname, 'page')));

// Configuración de la base de datos
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

// Verificar conexión a la base de datos
mssql.connect(config)
    .then(pool => {
        console.log('Conexión establecida con SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Error al conectar con SQL Server:', err);
        process.exit(1);
    });

// Rutas para servir archivos estáticos (HTML)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "page", "BIENVENIDOS.html"));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'register.html'));
});

// Ruta POST para procesar el registro
app.post('/api/register', async (req, res) => {
    const { first_name, last_name, phone_number, address, email, password } = req.body;

    console.log('Datos recibidos para registro:', req.body);

    try {
        const pool = await mssql.connect(config);
        
        // Verificar si el usuario ya existe
        const checkUserQuery = `SELECT * FROM users WHERE email = @Email`;
        const checkUserResult = await pool.request()
            .input('Email', mssql.VarChar, email)
            .query(checkUserQuery);

        console.log('Resultado de la consulta de usuario:', checkUserResult);

        if (checkUserResult.recordset.length > 0) {
            return res.status(400).json({ message: 'El usuario ya está registrado' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el usuario en la base de datos
        const insertUserQuery = `
            INSERT INTO users (first_name, last_name, phone_number, address, email, password)
            VALUES (@FirstName, @LastName, @PhoneNumber, @Address, @Email, @Password)
        `;
        const insertUserResult = await pool.request()
            .input('FirstName', mssql.VarChar, first_name)
            .input('LastName', mssql.VarChar, last_name)
            .input('PhoneNumber', mssql.VarChar, phone_number)
            .input('Address', mssql.VarChar, address)
            .input('Email', mssql.VarChar, email)
            .input('Password', mssql.VarChar, hashedPassword)
            .query(insertUserQuery);

        console.log('Resultado de la inserción del usuario:', insertUserResult);

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno al registrar usuario' });
    }
});

// Ruta POST para procesar el inicio de sesión
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Datos recibidos para inicio de sesión:', req.body);

    try {
        const pool = await mssql.connect(config);

        // Verificar si el usuario existe
        const checkUserQuery = `SELECT * FROM users WHERE email = @Email`;
        const checkUserResult = await pool.request()
            .input('Email', mssql.VarChar, email)
            .query(checkUserQuery);

        console.log('Resultado de la consulta de usuario:', checkUserResult);

        if (checkUserResult.recordset.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar la contraseña
        const user = checkUserResult.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token de autenticación
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        res.status(500).json({ message: 'Error interno al autenticar usuario' });
    }
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
