//Maneja el botón para agregar el traslado

document.addEventListener('DOMContentLoaded', () => {
    const personCheckboxDiv = document.getElementById('personCheckbox');
    const transferRegisterButton = document.getElementById('transferRegister');

    transferRegisterButton.addEventListener('click', async () => {
        try {
            const clientesSeleccionados = document.querySelectorAll('input[name="clientes"]:checked');
            const idsClientesSeleccionados = Array.from(clientesSeleccionados).map(checkbox => checkbox.value);

            const response = await fetch('/transferirViaje', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ clienteIds: idsClientesSeleccionados })
            });

            if (response.ok) {
                const mensaje = await response.text();
                alert(mensaje); // Muestra el mensaje al usuario 
                
                // Desmarcar los checkboxes después de enviar la información
                desmarcarCheckboxes();
            } else {
                console.error('Error al transferir viaje:', response.statusText);
            }
        } catch (error) {
            console.error('Error al transferir viaje:', error);
        }
    });

    // Función para desmarcar todos los checkboxes dentro de personCheckbox
    function desmarcarCheckboxes() {
        // Obtener todos los checkboxes dentro del div 'personCheckbox'
        const checkboxes = personCheckboxDiv.querySelectorAll('input[type="checkbox"]');

        // Iterar sobre cada checkbox y desmarcarlo
        checkboxes.forEach(function(checkbox) {
            checkbox.checked = false;
        });
    }
});

//Actualiza la lista de personas para registrar el traslado
document.addEventListener('DOMContentLoaded', async () => {
    const personCheckboxDiv = document.getElementById('personCheckbox');

    try {
        const response = await fetch('/obtenerClientes');
        if (response.ok) {
            const clientes = await response.json();
            clientes.forEach(cliente => {
                const checkbox = document.createElement('input');
                checkbox.className = 'checkbox;'
                checkbox.type = 'checkbox';
                checkbox.name = 'clientes';
                checkbox.value = cliente.id;

                const label = document.createElement('label');
                label.htmlFor = cliente.id;
                label.appendChild(document.createTextNode(`${cliente.lastName}, ${cliente.firstName}`));

                const br = document.createElement('br');

                personCheckboxDiv.appendChild(checkbox);
                personCheckboxDiv.appendChild(label);
                personCheckboxDiv.appendChild(br);
            });
        } else {
            console.error('Error al obtener los clientes del servidor');
        }
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const showRegisterButton = document.getElementById('showRegister');
    const tableRegister = document.getElementById('tableRegister');

    showRegisterButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/obtenerDatos');
            if (response.ok) {
                const data = await response.json();
                // Limpiar la tabla antes de mostrar los datos
                tableRegister.innerHTML = '';
                // Agregar el encabezado de la tabla
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr>
                        <th>ID de cliente</th>
                        <th>Apellido</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Cantidad de traslados</th>
                        <th>Total</th>
                        <th>Rango de Fechas</th>
                    </tr>`;
                tableRegister.appendChild(thead);
                
                // Construir la tabla con los datos recibidos
                data.forEach(entry => {
                    const fechaAntigua = new Date(entry.fechaAntigua);
                    const fechaReciente = new Date(entry.fechaReciente);
                
                    const fechaAntiguaFormateada = `${fechaAntigua.getFullYear()}-${('0' + (fechaAntigua.getMonth() + 1)).slice(-2)}-${('0' + fechaAntigua.getDate()).slice(-2)}`;
                    const fechaRecienteFormateada = `${fechaReciente.getFullYear()}-${('0' + (fechaReciente.getMonth() + 1)).slice(-2)}-${('0' + fechaReciente.getDate()).slice(-2)}`;
                
                    const row = tableRegister.insertRow();
                    row.innerHTML = `<td>${entry.id}</td>
                                     <td>${entry.lastName}</td>
                                     <td>${entry.firstName}</td>
                                     <td>$${entry.price}</td>
                                     <td>${entry.totalTravelCant}</td>
                                     <td>$${entry.total}</td>
                                     <td>desde ${fechaAntiguaFormateada} al ${fechaRecienteFormateada}</td>
                                     <td>${entry.payStatus}</td>`;
                      if(entry.payStatus !== 0){
                      row.style.display = 'none';
                      }             
                });
                
            } else {
                console.error('Error al obtener los datos del servidor');
            }
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    });
});

//Maneja el boton de traslados pagados

document.addEventListener('DOMContentLoaded', () => {
    const deleteRegisterButton = document.getElementById('deleteRegister');

    deleteRegisterButton.addEventListener('click', async () => {
        // Mostrar el cuadro de diálogo de confirmación
        const confirmacion = confirm('¿Está seguro de marcar como pagados los traslados de la tabla?');

        // Verificar si el usuario confirmó la acción
        if (confirmacion) {
            try {
                const response = await fetch('/marcarTrasladosPagados', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ payStatus: 2 }) // Envía el nuevo valor de status
                });

                if (response.ok) {
                    alert('Traslados marcados como pagados');
                } else {
                    alert('Hubo un problema al marcar los traslados como pagados');
                }
            } catch (error) {
                console.error('Error al enviar la solicitud:', error);
                alert('Error al conectar con el servidor');
            }
        } else {
            // El usuario ha cancelado la acción
            console.log('El usuario canceló la operación');
        }
    });
});

//Maneja el formulario y modal para agregar personas

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('myModal');
    const btn = document.getElementById('add-person');
    const registroForm = document.getElementById('registroForm');
    const mensajeDiv = document.getElementById('mensaje');
    const closeBtn = document.querySelector('.close');

    btn.addEventListener('click', () => {
        modal.style.display = 'block'; // Muestra el modal al hacer clic en el botón
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });

    window.addEventListener('click', (event) => {
        // Cierra el modal si se hace clic fuera de él
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    registroForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada

        const formData = new FormData(registroForm);
        const lastName = formData.get('lastName');
        const firstName = formData.get('firstName');
        const price = formData.get('price');

        if (lastName.trim() === '' || firstName.trim() === '' || price.trim() === '') {
            alert("Por favor, completa todos los campos del formulario.");
            return; // Detener la ejecución si hay campos vacíos
        }

        try {
            const response = await fetch('/agregar-datos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lastName, firstName, price })
            });

            if (response.ok) {
                alert("Persona agregada satisfactoriamente");
                // Vaciar los campos del formulario
                registroForm.reset();
                modal.style.display = 'none'; // Oculta el modal después de enviar el formulario
            } else {
                mensajeDiv.textContent = "Hubo un problema al agregar la persona";
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            mensajeDiv.textContent = "Error al conectar con el servidor";
        }
    });
});
