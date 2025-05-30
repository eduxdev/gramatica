function crearNodo(texto, esTerminal = false) {
    return `<span class="tree-node ${esTerminal ? 'node-terminal' : 'node-production'}">${texto}</span>`;
}

function esNumero(valor) {
    // Eliminar espacios en blanco
    valor = valor.trim();
    // Verificar si es un número (entero o decimal)
    return !isNaN(valor) && /^-?\d*\.?\d+$/.test(valor);
}

function analizar() {
    const input = document.getElementById('inputCode').value.trim();
    const gramaticaDiv = document.getElementById('gramatica');
    const arbolDiv = document.getElementById('arbol');

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
    let arbolHTML = [];
    let explicacion = [];

    // Detectar el caso simple (float a;)
    const esCasoSimple = input.match(/^float\s+[a-zA-Z_]\w*\s*;$/);
    
    // Detectar caso de variables múltiples sin asignación
    const esCasoMultipleSinAsignacion = input.match(/^float\s+([a-zA-Z_]\w*\s*,\s*)+[a-zA-Z_]\w*\s*;$/);
    
    if (esCasoSimple) {
        // Caso simple: float a;
        explicacion.push('float id;');
        arbolHTML = [
            crearNodo('S'),
            '├─────┬─────┐',
            `│     │     ${crearNodo('W')}`,
            `│     │     └───${crearNodo('E')}`,
            `│     │         └───${crearNodo(';', true)}`,
            `│     ${crearNodo('Y')}`,
            `│     ├───${crearNodo('float', true)}`,
            `│     └───${crearNodo('id', true)}`
        ];
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
        
        // Construir árbol optimizado para múltiples variables
        arbolHTML = [
            crearNodo('S'),
            '├─────┬─────┐',
            `│     │     ${crearNodo('W')}`
        ];
        
        // Primera variable (después del float)
        arbolHTML.push(`│     │     ├───${crearNodo('F')}`);
        arbolHTML.push(`│     │     │   └───${crearNodo(',', true)}`);
        
        // Generar nodos para las variables
        let lastIndex = variables.length - 1;
        for (let i = 1; i < variables.length; i++) {
            arbolHTML.push(`│     │     └───${crearNodo('K')}`);
            arbolHTML.push(`│     │         ├───${crearNodo('id', true)}`);
            
            if (i < lastIndex) {
                arbolHTML.push(`│     │         └───${crearNodo('W')}`);
                arbolHTML.push(`│     │             ├───${crearNodo('F')}`);
                arbolHTML.push(`│     │             │   └───${crearNodo(',', true)}`);
            } else {
                // Última variable
                arbolHTML.push(`│     │         └───${crearNodo('W')}`);
                arbolHTML.push(`│     │             └───${crearNodo('E')}`);
                arbolHTML.push(`│     │                 └───${crearNodo(';', true)}`);
            }
        }
        
        // Agregar la parte Y del árbol
        arbolHTML.push(`│     ${crearNodo('Y')}`);
        arbolHTML.push(`│     ├───${crearNodo('float', true)}`);
        arbolHTML.push(`│     └───${crearNodo('id', true)}`);
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

        // Construir el árbol para casos complejos
        arbolHTML = [
            crearNodo('S'),
            '├─────┬─────┐',
            `│     │     ${crearNodo('W')}`
        ];

        // Construir el árbol para cada declaración
        let lastWithValue = -1;
        for (let i = 0; i < declaraciones.length; i++) {
            if (declaraciones[i].valor) lastWithValue = i;
        }

        declaraciones.forEach((decl, index) => {
            if (index > 0) {
                arbolHTML.push(`│     │     ├───${crearNodo('F')}`);
                arbolHTML.push(`│     │     │   └───${crearNodo(',', true)}`);
                arbolHTML.push(`│     │     └───${crearNodo('K')}`);
                arbolHTML.push(`│     │         ├───${crearNodo('id', true)}`);
                arbolHTML.push(`│     │         └───${crearNodo('W')}`);
            }
            
            if (decl.valor) {
                arbolHTML.push(`│     │     ├───${crearNodo('P')}`);
                arbolHTML.push(`│     │     │   └───${crearNodo('=', true)}`);
                arbolHTML.push(`│     │     ├───${crearNodo('B')}`);
                arbolHTML.push(`│     │     │   └───${crearNodo(decl.esNumero ? 'num' : 'id', true)}`);
                
                // Solo agregar W intermedio si no es la última asignación
                if (index < lastWithValue) {
                    arbolHTML.push(`│     │     └───${crearNodo('W')}`);
                }
            }
        });

        // Agregar el punto y coma final directamente después de la última asignación
        // o después de la última variable sin asignación
        if (lastWithValue >= 0) {
            arbolHTML.push(`│     │     └───${crearNodo('W')}`);
        }
        arbolHTML.push(`│     │         └───${crearNodo('E')}`);
        arbolHTML.push(`│     │             └───${crearNodo(';', true)}`);
        
        // Agregar la parte Y del árbol
        arbolHTML.push(`│     ${crearNodo('Y')}`);
        arbolHTML.push(`│     ├───${crearNodo('float', true)}`);
        arbolHTML.push(`│     └───${crearNodo('id', true)}`);
    }

    // Mostrar resultados
    gramaticaDiv.innerHTML = gramatica.join('\n');
    arbolDiv.innerHTML = `<div class="tree-container">${arbolHTML.join('\n')}</div>
                         <p class="mt-4 text-gray-600">Forma analizada: ${explicacion.join('\n')}</p>`;
} 