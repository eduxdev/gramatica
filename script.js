function crearNodo(texto, esTerminal = false) {
    return `<span class="tree-node ${esTerminal ? 'node-terminal' : 'node-production'}">${texto}</span>`;
}

function esNumero(valor) {
    // Eliminar espacios en blanco
    valor = valor.trim();
    // Verificar si es un número (entero o decimal)
    return !isNaN(valor) && /^-?\d*\.?\d+$/.test(valor);
}

function crearNodoGrafico(texto, esTerminal = false, hijos = []) {
    const colorFondo = esTerminal ? '#f3e5f5' : '#e3f2fd';
    const colorBorde = esTerminal ? '#ce93d8' : '#90caf9';
    
    const nodo = document.createElement('div');
    nodo.className = 'nodo';
    
    const contenido = document.createElement('div');
    contenido.className = 'nodo-contenido';
    contenido.style.backgroundColor = colorFondo;
    contenido.style.border = `2px solid ${colorBorde}`;
    contenido.textContent = texto;
    
    nodo.appendChild(contenido);
    
    if (hijos.length > 0) {
        const hijosContainer = document.createElement('div');
        hijosContainer.className = 'nodo-hijos';
        
        // Crear líneas para conectar con los hijos
        if (hijos.length >= 1) {
            const lineaIzquierda = document.createElement('div');
            lineaIzquierda.className = 'linea linea-izquierda';
            nodo.appendChild(lineaIzquierda);
        }
        
        if (hijos.length >= 2) {
            const lineaDerecha = document.createElement('div');
            lineaDerecha.className = 'linea linea-derecha';
            nodo.appendChild(lineaDerecha);
        }
        
        // Agregar los nodos hijos
        hijos.forEach(hijo => {
            hijosContainer.appendChild(hijo);
        });
        
        nodo.appendChild(hijosContainer);
    }
    
    return nodo;
}

function analizar() {
    const input = document.getElementById('inputCode').value.trim();
    const gramaticaDiv = document.getElementById('gramatica');
    const arbolGraficoDiv = document.getElementById('arbol-grafico');
    const formaAnalizadaDiv = document.getElementById('forma-analizada');

    // Limpiar espacios extras y normalizar
    const normalizedInput = input.replace(/\s+/g, ' ');
    
    // Gramática con símbolos terminales separados
    let gramatica = [
        'S -> Y W',
        'Y -> float id',
        'W -> P B W | F K | E',
        'P -> =',
        'F -> ,',
        'E -> ;',
        'K -> id W',
        'B -> id | num'
    ];

    // Analizar el tipo de declaración
    let explicacion = [];
    let arbolGrafico = null;

    // Detectar el caso simple (float a;)
    const esCasoSimple = input.match(/^float\s+[a-zA-Z_]\w*\s*;$/);
    
    // Detectar caso de variables múltiples sin asignación
    const esCasoMultipleSinAsignacion = input.match(/^float\s+([a-zA-Z_]\w*\s*,\s*)+[a-zA-Z_]\w*\s*;$/);
    
    if (esCasoSimple) {
        // Caso simple: float a;
        explicacion.push('float id;');
        
        // Crear árbol gráfico
        const nodoE = crearNodoGrafico('E', false, [
            crearNodoGrafico(';', true)
        ]);
        
        const nodoW = crearNodoGrafico('W', false, [nodoE]);
        
        const nodoB = crearNodoGrafico('id', true);
        const nodoA = crearNodoGrafico('float', true);
        const nodoY = crearNodoGrafico('Y', false, [nodoA, nodoB]);
        
        arbolGrafico = crearNodoGrafico('S', false, [nodoY, nodoW]);
        
    } else if (esCasoMultipleSinAsignacion) {
        // Caso múltiple sin asignación: float a, b;
        const variables = input.substring(input.indexOf('float') + 5, input.indexOf(';')).split(',');
        let explicacionTexto = 'float ';
        
        variables.forEach((variable, index) => {
            explicacionTexto += 'id';
            if (index < variables.length - 1) {
                explicacionTexto += ', ';
            }
        });
        explicacionTexto += ';';
        explicacion.push(explicacionTexto);
        
        // Crear árbol gráfico para caso múltiple
        const nodoE = crearNodoGrafico('E', false, [
            crearNodoGrafico(';', true)
        ]);
        
        // Construir W con las variables adicionales
        let nodoW = crearNodoGrafico('W', false, [nodoE]);
        
        if (variables.length > 1) {
            for (let i = variables.length - 1; i > 0; i--) {
                const nodoId = crearNodoGrafico('id', true);
                const nodoK = crearNodoGrafico('K', false, [nodoId, nodoW]);
                const nodoF = crearNodoGrafico('F', false, [
                    crearNodoGrafico(',', true)
                ]);
                nodoW = crearNodoGrafico('W', false, [nodoF, nodoK]);
            }
        }
        
        const nodoB = crearNodoGrafico('id', true);
        const nodoA = crearNodoGrafico('float', true);
        const nodoY = crearNodoGrafico('Y', false, [nodoA, nodoB]);
        
        arbolGrafico = crearNodoGrafico('S', false, [nodoY, nodoW]);
        
    } else {
        // Analizar la entrada para identificar todas las partes (casos complejos con asignación)
        const declaraciones = [];
        
        // Dividir la entrada en declaraciones
        const declaracionesStr = input.substring(input.indexOf('float') + 5).split(',');
        
        // Procesar cada declaración
        declaracionesStr.forEach(decl => {
            decl = decl.trim().replace(';', '');
            if (decl.includes('=')) {
                const [variable, valor] = decl.split('=').map(part => part.trim());
                declaraciones.push({
                    variable: variable,
                    valor: valor,
                    esNumero: esNumero(valor)
                });
            } else if (decl.trim() !== '') {
                // Para variables sin asignación
                declaraciones.push({
                    variable: decl.trim(),
                    valor: null,
                    esNumero: false
                });
            }
        });

        // Construir la explicación para casos complejos
        let explicacionTexto = 'float ';
        declaraciones.forEach((decl, index) => {
            explicacionTexto += 'id';
            if (decl.valor) {
                explicacionTexto += ' = ' + (decl.esNumero ? 'num' : 'id');
            }
            if (index < declaraciones.length - 1) {
                explicacionTexto += ', ';
            }
        });
        explicacionTexto += ';';
        explicacion.push(explicacionTexto);

        // Crear árbol gráfico para caso complejo
        const nodoE = crearNodoGrafico('E', false, [
            crearNodoGrafico(';', true)
        ]);
        
        // Construir W con las declaraciones
        let nodoW = crearNodoGrafico('W', false, [nodoE]);
        
        // Recorrer declaraciones en orden inverso para construir el árbol
        for (let i = declaraciones.length - 1; i >= 0; i--) {
            const decl = declaraciones[i];
            
            if (decl.valor) {
                // Si hay valor, agregar nodos P y B
                const nodoB = crearNodoGrafico('B', false, [
                    crearNodoGrafico(decl.esNumero ? 'num' : 'id', true)
                ]);
                
                const nodoP = crearNodoGrafico('P', false, [
                    crearNodoGrafico('=', true)
                ]);
                
                if (i > 0) {
                    // Si no es la primera declaración, agregar nodos K y F
                    const nodoK = crearNodoGrafico('K', false, [
                        crearNodoGrafico('id', true),
                        nodoW
                    ]);
                    
                    const nodoF = crearNodoGrafico('F', false, [
                        crearNodoGrafico(',', true)
                    ]);
                    
                    nodoW = crearNodoGrafico('W', false, [nodoP, nodoB, nodoW]);
                } else {
                    // Si es la primera declaración
                    nodoW = crearNodoGrafico('W', false, [nodoP, nodoB, nodoW]);
                }
            } else if (i > 0) {
                // Si no hay valor pero no es la primera declaración
                const nodoK = crearNodoGrafico('K', false, [
                    crearNodoGrafico('id', true),
                    nodoW
                ]);
                
                const nodoF = crearNodoGrafico('F', false, [
                    crearNodoGrafico(',', true)
                ]);
                
                nodoW = crearNodoGrafico('W', false, [nodoF, nodoK]);
            }
        }
        
        const nodoB = crearNodoGrafico('id', true);
        const nodoA = crearNodoGrafico('float', true);
        const nodoY = crearNodoGrafico('Y', false, [nodoA, nodoB]);
        
        arbolGrafico = crearNodoGrafico('S', false, [nodoY, nodoW]);
    }

    // Mostrar resultados
    gramaticaDiv.innerHTML = gramatica.join('\n');
    formaAnalizadaDiv.innerHTML = `<p class="text-gray-600">${explicacion.join('\n')}</p>`;
    
    // Mostrar árbol gráfico
    arbolGraficoDiv.innerHTML = '';
    arbolGraficoDiv.appendChild(arbolGrafico);
} 