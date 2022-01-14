let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click',guardarCliente);

function guardarCliente(){
    const mesa = document.querySelector('#mesa').value;                                                                                                     const hora = document.querySelector('#hora').value;

    const camposVacios = [mesa,hora].some(campo =>campo ==='');// son detecta que por lo menos un campo cumpla esa condicion
    if(camposVacios){
            const alerta = document.querySelector('.invalid-feedback');
            if(!alerta){
                const alerta = document.createElement('div');
                alerta.classList.add('invalid-feedback','d-block','text-center');
                alerta.textContent = 'Todos los campos son obligatorios';
                document.querySelector('.modal-body form').appendChild(alerta);
                setTimeout(()=>{
                    alerta.remove()
                },3000)   
            }
            return;
        } 
        // Obtener datos de cliente
        cliente = {...cliente,hora,mesa }; // primero hago una copia actual de cliente para traer la informacion de cliente y luego pasarle la hora y mesa
        
        // Ocultar modal con unos metodos de boostrap
        const modalFormulario = document.querySelector('#formulario');
        const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
        modalBootstrap.hide();

        // Mostrar secciones
        mostrarSecciones();

        obtenerPlatillos();
    }
function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none'); // es un nodeList que es un array
    seccionesOcultas.forEach(seccion =>seccion.classList.remove('d-none'))
}
function obtenerPlatillos(){
    const url ='http://localhost:4000/platillos';
    fetch(url)
        .then(respuesta=>respuesta.json())
        .then(resultado=>mostrarPlatillos(resultado));
}
function mostrarPlatillos(platillos){
    const contenido = document.querySelector('#platillos .contenido');
    const categorias = {
        1:'Comida',
        2:'Bebida',
        3:'Postre'
    }
    platillos.forEach(platillo=>{
        const row = document.createElement('div');
        row.classList.add('row','py-3','border-top');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3','fw-bold');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria];
        
        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;

        /* PARA PONER UN INPUT NUMBER CON MULTIPLOS ES CON STEP
        // ----------------- IMPORTANTE------------
        inputCantidad.step ='2';
        */

        inputCantidad.id =  `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control','col-md-2');
        //Funcion o evento al input
        inputCantidad.onchange = (e)=>{

            const cantidad = parseInt(inputCantidad.value);
            // Hago un objeto en el argumento que contiene el platillo completo y la cantidad del input
            // Con el express operation crea un unico objeto hace una copia del platillo, sino lo se para en un objeto y la cantidad afuera de las propiedades del platillo
            //ES DECIR EL EXPRESS OPERATION PUEDE UNIR HACER UN OBJETO SOLO, es muy poderoso el express operation tiene varias funciones piolas
            agregarPlatillo({...platillo,cantidad});
        }

        const divCantidad = document.createElement('div');
        divCantidad.classList.add('col-md-2');
        divCantidad.appendChild(inputCantidad);
        
        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(divCantidad);


        contenido.appendChild(row)
    })
}
function agregarPlatillo(producto){

    // extraer el pedido actua
    let {pedido} = cliente;
   
    if(producto.cantidad>0){
        if(pedido.some(articulo =>articulo.id===producto.id)){
            // El articulo ya existe, Actualizar la cantidad
            // hace un arreglo nuevo, si la comple cambia la cantidad y si no la cumple lo deja como esta, IMPORTANCIA DE ESE return
            const pedidoActualizado = pedido.map(articulo=>{
                if(articulo.id===producto.id){
                    articulo.cantidad = producto.cantidad;
                }
                return articulo; // lo tengo que poner para que lo vaya almacenando en la variable
            })
            cliente.pedido = [...pedidoActualizado]; // en este caso permite que no mute el arrgleo crea uno nuevo
        } else {
            // El articulo no existe, agrego al arreglo de pedido
            cliente.pedido = [...pedido,producto];
        }
    } else { 
        const resultado = pedido.filter(articulo=> articulo.id !== producto.id);
        cliente.pedido = [...resultado]; // EL EXPRESS OPERATO HACE UN NUEVO ARREGLO CON LA COPIA ACTUAL DE RESULTADO
    }
// console.log(cliente.pedido) Con este veo el mecanismo y su logica de las cantidades
    limpiarHTML();
    // la ultima version de pedido haciendo cliente.pedido
    if(cliente.pedido.length){
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }
}
function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6','card','shadow','px-3','my-2');

    const mesa = document.createElement('p');
    mesa.classList.add('fw-bold');
    mesa.textContent = 'Mesa: ';

    const mesaSpan = document.createElement('span');
    mesaSpan.classList.add('fw-light');
    mesaSpan.textContent = cliente.mesa;

    const hora = document.createElement('p');
    hora.classList.add('fw-bold');
    hora.textContent = 'Hora: ';

    const horaSpan = document.createElement('span');
    horaSpan.classList.add('fw-normal');
    horaSpan.textContent = cliente.hora;

    // Titulo
    const titulo = document.createElement('h3');
    titulo.textContent = 'Platillos Consumidos';
    titulo.classList.add('my-4','text-center');

    // Iterar sobre el arreglo de pedido
    const grupo = document.createElement('ul');
    grupo.classList.add('list-group');

    const {pedido} = cliente;
    pedido.forEach(articulo=>{
        const {nombre,cantidad,id,precio} = articulo;

        const lista = document.createElement('li');
        lista.classList.add('list-group-item');
        // Nombre del articulo
        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('my-4')
        nombreEl.textContent = nombre;
        // Cantidad del articulo
        const cantidadEl = document.createElement('p');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadSpan = document.createElement('span');
        cantidadSpan.classList.add('fw-normal');
        cantidadSpan.textContent = cantidad;
        cantidadEl.appendChild(cantidadSpan);
        // Precio del articulo
        const precioEl = document.createElement('p');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: $';

        const precioSpan = document.createElement('span');
        precioSpan.classList.add('fw-normal');
        precioSpan.textContent = precio;
        precioEl.appendChild(precioSpan);
        // Subtotal
        const subtotalEl = document.createElement('p');
        subtotalEl.classList.add('fw-bold','border-top');
        subtotalEl.textContent = 'Subtotal: $';

        const subtotalSpan = document.createElement('span');
        subtotalSpan.classList.add('fw-normal');
        subtotalSpan.textContent = calcularSubtotalArticulo(cantidad,precio);
        subtotalEl.appendChild(subtotalSpan);
        
        // Boton Eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn','btn-danger');
        btnEliminar.textContent = 'Botón Eliminar';

        // llamando asi a la function, es una especie de callback
        btnEliminar.onclick = function (){
            eliminarProducto(id);
        }

        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        grupo.appendChild(lista);
       
    })
    // Total de todos los productos
    const total = document.createElement('p');
    total.classList.add('fw-bold','mx-3','my-2','h4');
    total.textContent = 'Total: ';

    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal','h4');
    let resultadoTotal =0;
    cliente.pedido.forEach( articulo => resultadoTotal += articulo.precio * articulo.cantidad );
    totalSpan.textContent = `$${resultadoTotal}`;
    total.appendChild(totalSpan);
   
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);
    
    resumen.appendChild(titulo);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);
    resumen.appendChild(total);

    contenido.appendChild(resumen);

    // Mostrar Formulario de Propinas
    mostrarPropinas();
}
function calcularSubtotalArticulo(cantidad,precio){
    return cantidad * precio;
}
function eliminarProducto(id){
    
    const {pedido} = cliente;
    const resultado = pedido.filter(articulo=>articulo.id !==id);
    cliente.pedido = [...resultado];
    limpiarHTML();

    if(cliente.pedido.length){
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }
    // El producto se elimino por lo tanto regresamos la cantidad a cero
    const productoEliminado = `#producto-${id}`;
    const inputAcero = document.querySelector(productoEliminado);
    inputAcero.value = 0;
}
function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent ='Añade los elementos del pedido';
    contenido.appendChild(texto);
}
function mostrarPropinas(){
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6','formulario','px-0');

    const divFormulario = document.createElement('div');
    divFormulario.classList.add('card','py-4','px-3','my-2','shadow');

    const heading = document.createElement('h3');
    heading.classList.add('text-center');
    heading.textContent = 'Propina';

    // Radio button 10%
    /*                  -------IMPORTANTE--------
        El name es para que en un radio button puedas seleccionar uno u otro, SIno html los trata 
        como diferentes y podrias seleccionar todos
    */
    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = "10";
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('label');
    radio10Label.classList.add('form-check-label');
    radio10Label.textContent = '10%';

    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check');
    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);
    
    // Radio button 25%
    const radio25 = document.createElement('input');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = "25";
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('label');
    radio25Label.classList.add('form-check-label');
    radio25Label.textContent = '25%';

    const radio25Div = document.createElement('div');
    radio25Div.classList.add('form-check');
    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // Radio button 50%
    const radio50 = document.createElement('input');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = "50";
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('label');
    radio50Label.classList.add('form-check-label');
    radio50Label.textContent = '50%';

    const radio50Div = document.createElement('div');
    radio50Div.classList.add('form-check');
    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    // Agregar al Div Principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);
    // Agregarlo al formulario
    formulario.appendChild(divFormulario);

    contenido.appendChild(formulario);
}
function calcularPropina(){
    // Calcular subtotal a pagar
    let subtotal = 0;
    cliente.pedido.forEach(articulo=>{
        subtotal += articulo.cantidad * articulo.precio
    })
    // Utilizando un selector de atributo, para seleccionar la propina
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;
    // Calcular propina
    const propina = (subtotal * parseInt(propinaSeleccionada))/100;
    // Calcular total a pagar
    const total = subtotal + propina;
    mostrarTotalHTML(subtotal,propina,total);
}
function mostrarTotalHTML(subtotal,propina,total){

    const divTotales = document.createElement('div');
    divTotales.classList.add('total-pagar');
    
    // Agrego Subtotal al formulario de propinas
    const subtotalParrafo = document.createElement('p');
    subtotalParrafo.classList.add('fs-4','fw-bold','mt-5');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('span');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;
    subtotalParrafo.appendChild(subtotalSpan);
    // Agrego Propina a formulario
    const propinaParrafo = document.createElement('p');
    propinaParrafo.classList.add('fs-4','fw-bold','mt-2');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('span');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;
    propinaParrafo.appendChild(propinaSpan);
    // Agrego Total a formulario
    const totalParrafo = document.createElement('p');
    totalParrafo.classList.add('fs-3','fw-bold','mt-2');
    totalParrafo.textContent = 'Total: ';

    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;
    totalParrafo.appendChild(totalSpan);
    //Eliminar el resultado previo, sino deja los anteriores importante
    const divTotalPagar = document.querySelector('.total-pagar');
    if(divTotalPagar){
        divTotalPagar.remove();
    }
    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);
    // Seleccionó formulario creado en mostrarPropina linea 292
    const formularioPropina = document.querySelector('.formulario > div'); // para llavar y que entre en el card tengo que poner el signo mayor seria selecciona el primer div, buen selector de css
    formularioPropina.appendChild(divTotales);
    
}
function limpiarHTML(){
    const contenido = document.querySelector('#resumen .contenido')
    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild)
    }
}