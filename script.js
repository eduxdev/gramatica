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
        
        // Crear contenedor para las líneas
        const lineasContainer = document.createElement('div');
        lineasContainer.className = 'lineas-container';
        lineasContainer.style.position = 'absolute';
        lineasContainer.style.width = '100%';
        lineasContainer.style.height = '40px';
        lineasContainer.style.top = '45px';
        lineasContainer.style.left = '0';
        lineasContainer.style.zIndex = '1';
        nodo.appendChild(lineasContainer);
        
        // Si solo hay un hijo, línea vertical recta
        if (hijos.length === 1) {
            const lineaVertical = document.createElement('div');
            lineaVertical.className = 'linea';
            lineaVertical.style.position = 'absolute';
            lineaVertical.style.left = '50%';
            lineaVertical.style.top = '0';
            lineaVertical.style.height = '40px';
            lineaVertical.style.width = '0';
            lineaVertical.style.borderLeft = '2px solid #666';
            lineaVertical.style.transform = 'translateX(-50%)';
            lineasContainer.appendChild(lineaVertical);
        } 
        // Si hay múltiples hijos, crear líneas específicas para cada uno
        else if (hijos.length > 1) {
            const totalHijos = hijos.length;
            
            // Crear una línea para cada hijo
            for (let i = 0; i < totalHijos; i++) {
                const linea = document.createElement('div');
                linea.className = 'linea';
                linea.style.position = 'absolute';
                linea.style.borderTop = '2px solid #666';
                
                // Primer hijo (extremo izquierdo)
                if (i === 0) {
                    linea.style.width = '50px';
                    linea.style.transform = 'rotate(-30deg)';
                    linea.style.transformOrigin = 'right';
                    linea.style.right = '50%';
                    linea.style.top = '20px';
                }
                // Último hijo (extremo derecho)
                else if (i === totalHijos - 1) {
                    linea.style.width = '50px';
                    linea.style.transform = 'rotate(30deg)';
                    linea.style.transformOrigin = 'left';
                    linea.style.left = '50%';
                    linea.style.top = '20px';
                }
                // Hijos del medio (si hay más de 2 hijos)
                else if (totalHijos > 2) {
                    // Calcular posición proporcional
                    const posicion = i / (totalHijos - 1);
                    const angulo = -30 + (posicion * 60);
                    
                    linea.style.width = '50px';
                    linea.style.transform = `rotate(${angulo}deg)`;
                    
                    if (angulo < 0) {
                        linea.style.transformOrigin = 'right';
                        // Ajustar posición horizontal según índice
                        const offsetRight = 50 - (Math.abs(angulo) / 2);
                        linea.style.right = `${offsetRight}%`;
                    } else {
                        linea.style.transformOrigin = 'left';
                        // Ajustar posición horizontal según índice
                        const offsetLeft = 50 - (angulo / 2);
                        linea.style.left = `${offsetLeft}%`;
                    }
                    
                    linea.style.top = '20px';
                }
                
                lineasContainer.appendChild(linea);
            }
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

    // Extraer las partes de la declaración
    const tipoMatch = normalizedInput.match(/^(float)\s+/);
    
    if (tipoMatch) {
        const tipo = tipoMatch[1];
        const resto = normalizedInput.substring(tipoMatch[0].length);
        
        // Dividir por comas para identificar cada declaración de variable
        const declaraciones = resto.split(',').map(d => d.trim());
        
        // Procesar cada declaración para identificar su estructura
        const variablesInfo = declaraciones.map(decl => {
            // Eliminar punto y coma si existe
            decl = decl.replace(';', '');
            
            if (decl.includes('=')) {
                const [variable, valor] = decl.split('=').map(part => part.trim());
                return {
                    variable: variable,
                    valor: valor,
                    tieneValor: true,
                    esNumero: esNumero(valor)
                };
            } else {
                return {
                    variable: decl,
                    valor: null,
                    tieneValor: false,
                    esNumero: false
                };
            }
        });
        
        // Construir el árbol desde la raíz
        // Crear nodo S (raíz)
        const nodoS = crearNodoGrafico('S', false);
        
        // Crear nodo Y (float id)
        const nodoY = crearNodoGrafico('Y', false, [
            crearNodoGrafico('float', true),
            crearNodoGrafico('id', true)
        ]);
        
        // Construir el árbol W recursivamente de atrás hacia adelante
        let ultimoNodoW;
        
        // El último nodo W siempre termina con E (;)
        const nodoE = crearNodoGrafico('E', false, [
            crearNodoGrafico(';', true)
        ]);
        ultimoNodoW = crearNodoGrafico('W', false, [nodoE]);
        
        // Procesar las declaraciones en orden inverso
        for (let i = variablesInfo.length - 1; i >= 0; i--) {
            const info = variablesInfo[i];
            
            // Si no es la primera declaración, siempre se agrega F (,) y K (id W)
            if (i < variablesInfo.length - 1) {
                // Crear K (id W)
                const nodoK = crearNodoGrafico('K', false, [
                    crearNodoGrafico('id', true),
                    ultimoNodoW
                ]);
                
                // Crear F (,)
                const nodoF = crearNodoGrafico('F', false, [
                    crearNodoGrafico(',', true)
                ]);
                
                // Si la declaración tiene valor (a=b)
                if (info.tieneValor) {
                    // Crear B (id o num)
                    const nodoB = crearNodoGrafico('B', false, [
                        crearNodoGrafico(info.esNumero ? 'num' : 'id', true)
                    ]);
                    
                    // Crear P (=)
                    const nodoP = crearNodoGrafico('P', false, [
                        crearNodoGrafico('=', true)
                    ]);
                    
                    // W -> P B W
                    const nuevoW = crearNodoGrafico('W', false, [nodoP, nodoB, crearNodoGrafico('W', false, [nodoF, nodoK])]);
                    ultimoNodoW = nuevoW;
                } else {
                    // W -> F K
                    ultimoNodoW = crearNodoGrafico('W', false, [nodoF, nodoK]);
                }
            } 
            // Para la primera declaración
            else {
                if (info.tieneValor) {
                    // Crear B (id o num)
                    const nodoB = crearNodoGrafico('B', false, [
                        crearNodoGrafico(info.esNumero ? 'num' : 'id', true)
                    ]);
                    
                    // Crear P (=)
                    const nodoP = crearNodoGrafico('P', false, [
                        crearNodoGrafico('=', true)
                    ]);
                    
                    // W -> P B W
                    ultimoNodoW = crearNodoGrafico('W', false, [nodoP, nodoB, ultimoNodoW]);
                }
                // Si la primera declaración no tiene valor, no se hace nada especial
                // porque ya se manejó con el nodo E (;)
            }
        }
        
        // Conectar todo el árbol con estructura clara
        // Primero añadir los hijos principales de S: Y y W
        arbolGrafico = crearNodoGrafico('S', false, [nodoY, ultimoNodoW]);
        
        // Construir la explicación para mostrar
        let explicacionTexto = 'float ';
        variablesInfo.forEach((info, index) => {
            explicacionTexto += 'id';
            if (info.tieneValor) {
                explicacionTexto += ' = ' + (info.esNumero ? 'num' : 'id');
            }
            if (index < variablesInfo.length - 1) {
                explicacionTexto += ', ';
            }
        });
        explicacionTexto += ';';
        explicacion.push(explicacionTexto);
    } else {
        // Si no coincide con un patrón válido
        explicacion.push('Entrada no válida. Use el formato: float variable1 = valor1, variable2 = valor2, ...');
    }

    // Mostrar resultados
    gramaticaDiv.innerHTML = gramatica.join('\n');
    formaAnalizadaDiv.innerHTML = `<p class="text-gray-600">${explicacion.join('\n')}</p>`;
    
    // Mostrar árbol gráfico
    arbolGraficoDiv.innerHTML = '';
    if (arbolGrafico) {
        arbolGraficoDiv.appendChild(arbolGrafico);
    } else {
        arbolGraficoDiv.innerHTML = '<p class="text-red-500">No se pudo generar el árbol para esta entrada.</p>';
    }
} 