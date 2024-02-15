const express = require('express');
const { ConnectionPool } = require('mssql');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const config = {
  server: 'DESKTOP-JNSU3FQ',
  user: 'ajac100',
  password: 'Cosmos.01',
  database: 'registroDeTraslados',
  options: {
    trustServerCertificate: true,
    port: 1433
  },
};

const pool = new ConnectionPool(config);

app.use(express.static(path.join(__dirname, 'public')));

app.post('/transferirViaje', async (req, res) => {
  try {
    const { clienteIds } = req.body;

    for (const clienteId of clienteIds) {
      // Verificar si el cliente existe en la tabla clients
      const checkQuery = `SELECT * FROM clients WHERE id = ${clienteId}`;
      const checkResult = await pool.query(checkQuery);

      if (checkResult.recordset.length > 0) {
        // Si el cliente existe, insertar un nuevo viaje en la tabla travels
        const insertQuery = `INSERT INTO travels (id, travelCant, date) VALUES (${clienteId}, 1, GETDATE())`;
        await pool.query(insertQuery);
      } else {
        return res.status(404).send(`El cliente con ID ${clienteId} no existe`);
      }
    }

    res.status(200).send('Viajes registrados correctamente');
  } catch (error) {
    console.error('Error al transferir viaje:', error);
    res.status(500).send('Error interno del servidor');
  }
});


// app.get('/obtenerDatos', async (req, res) => {
//   try {
//     await pool.connect();
//     const query = "SELECT * FROM clients INNER JOIN travels ON clients.id = travels.id";
//     const result = await pool.query(query);
//     res.json(result.recordset);
//   } catch (error) {
//     console.error("Error al obtener datos:", error);
//     res.status(500).send('Error interno del servidor');
//   }
// });

app.get('/obtenerDatos', async (req, res) => {
  try {
    await pool.connect();
    const query = `
      SELECT 
        c.id, 
        c.lastName, 
        c.firstName, 
        c.price,
        t.payStatus, 
        SUM(t.travelCant) AS totalTravelCant,
        c.price * SUM(t.travelCant) AS total,
        MIN(t.date) AS fechaAntigua,
        MAX(t.date) AS fechaReciente
      FROM 
        clients c
      INNER JOIN 
        travels t ON c.id = t.id
      GROUP BY 
        c.id, 
        c.lastName, 
        c.firstName, 
        c.price,
        t.payStatus
    `;
    const result = await pool.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/obtenerClientes', async (req, res) => {
  try {
    await pool.connect();
    const query = "SELECT id, lastName, firstName FROM clients";
    const result = await pool.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).send('Error interno del servidor');
  }
});

app.post('/agregar-datos', async (req, res) =>{
  try {
    const {lastName, firstName, price} = req.body;

    await pool.connect();

    const insert = await pool.query`INSERT INTO clients (lastName, firstName, price)
    VALUES (${lastName}, ${firstName}, ${price})`; 

    console.log("Conectado a SQL Server para subir datos")
    console.log(req.body)

    // Envía una respuesta al cliente con el mensaje de éxito
    res.status(200).send('Persona agregada satisfactoriamente');

    //res.redirect('http://localhost:3000')

    //res.send('Datos agregados correctamente');

  }catch (error){
    console.error('Error al intentar insertar datos', error);
    res.status(500).send('Error interno del servidor');
  }
})

app.listen(PORT,()=>{
  console.log("Servidor corriendo en el puerto 3000")
})

app.post('/marcarTrasladosPagados', async (req, res) => {
  try {
      // Verificar la conexión a la base de datos
      await pool.connect();

      // Lógica para actualizar el valor de 'status' a 2 en la tabla 'travels'
      const query = `UPDATE travels SET payStatus = 2 WHERE payStatus = 0`; // Cambia el status de 0 a 2
      
      // Ejecutar la consulta
      const result = await pool.query(query);

      // Verificar si la consulta se ejecutó correctamente
      if (result.rowsAffected > 0) {
          res.status(200).send('Traslados marcados como pagados');
      } else {
          res.status(500).send('Hubo un problema al marcar los traslados como pagados');
      }
  } catch (error) {
      // Manejar errores de la consulta SQL
      console.error('Error al marcar los traslados como pagados:', error);
      res.status(500).send('Error interno del servidor');
  }
});
