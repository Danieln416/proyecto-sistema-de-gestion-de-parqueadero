const Espacio = require('../models/Espacio');
const Cliente = require('../models/Cliente');
const Vehiculo = require('../models/Vehiculo');
const Registro = require('../models/Registro'); // Asumiendo que tienes un modelo para registros de entrada/salida

/**
 * Genera reporte de ocupación actual del parqueadero
 */
exports.reporteOcupacion = async (req, res) => {
    try {
        // Obtener estadísticas de ocupación por tipo de espacio
        const espaciosTotales = await Espacio.countDocuments();
        const espaciosOcupados = await Espacio.countDocuments({ estado: 'ocupado' });
        const espaciosMantenimiento = await Espacio.countDocuments({ estado: 'mantenimiento' });
        const espaciosDisponibles = await Espacio.countDocuments({ estado: 'disponible' });
        
        // Ocupación por tipo de vehículo
        const ocupacionCarros = await Espacio.countDocuments({ tipoEspacio: 'carro', estado: 'ocupado' });
        const ocupacionMotos = await Espacio.countDocuments({ tipoEspacio: 'moto', estado: 'ocupado' });
        const ocupacionBicicletas = await Espacio.countDocuments({ tipoEspacio: 'bicicleta', estado: 'ocupado' });
        
        // Disponibilidad por tipo de vehículo
        const disponibilidadCarros = await Espacio.countDocuments({ tipoEspacio: 'carro', estado: 'disponible' });
        const disponibilidadMotos = await Espacio.countDocuments({ tipoEspacio: 'moto', estado: 'disponible' });
        const disponibilidadBicicletas = await Espacio.countDocuments({ tipoEspacio: 'bicicleta', estado: 'disponible' });
        
        // Calcular porcentaje de ocupación
        const porcentajeOcupacion = espaciosTotales > 0 ? (espaciosOcupados / espaciosTotales) * 100 : 0;
        
        res.status(200).json({
            totalEspacios: espaciosTotales,
            resumen: {
                ocupados: espaciosOcupados,
                disponibles: espaciosDisponibles,
                mantenimiento: espaciosMantenimiento,
                porcentajeOcupacion: porcentajeOcupacion.toFixed(2) + '%'
            },
            ocupacionPorTipo: {
                carros: ocupacionCarros,
                motos: ocupacionMotos,
                bicicletas: ocupacionBicicletas
            },
            disponibilidadPorTipo: {
                carros: disponibilidadCarros,
                motos: disponibilidadMotos,
                bicicletas: disponibilidadBicicletas
            }
        });
    } catch (error) {
        console.error('Error al generar reporte de ocupación:', error);
        res.status(500).json({ mensaje: 'Error al generar reporte de ocupación', error: error.message });
    }
};

/**
 * Genera reporte de ingresos en un rango de fechas
 */
exports.reporteIngresos = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        // Validar fechas
        let inicio = fechaInicio ? new Date(fechaInicio) : new Date(new Date().setDate(new Date().getDate() - 30)); // Por defecto, último mes
        let fin = fechaFin ? new Date(fechaFin) : new Date();
        
        // Asegurar que la fecha fin sea hasta el final del día
        fin.setHours(23, 59, 59, 999);
        
        // Consultar registros en el rango de fechas
        const registros = await Registro.find({
            fechaSalida: { $gte: inicio, $lte: fin },
            estado: 'finalizado' // Solo considerar registros finalizados
        }).populate('cliente', 'nombre documento tipoSuscripcion');
        
        // Calcular ingresos totales
        const ingresoTotal = registros.reduce((total, registro) => total + (registro.valorTotal || 0), 0);
        
        // Ingresos por tipo de suscripción
        const ingresosPorSuscripcion = {
            ninguna: 0,
            diaria: 0,
            mensual: 0
        };
        
        // Ingresos por día
        const ingresosPorDia = {};
        
        registros.forEach(registro => {
            // Agregar a ingresos por suscripción
            const tipoSuscripcion = registro.cliente?.tipoSuscripcion || 'ninguna';
            ingresosPorSuscripcion[tipoSuscripcion] += registro.valorTotal || 0;
            
            // Agregar a ingresos por día
            const fechaDia = registro.fechaSalida.toISOString().split('T')[0];
            if (!ingresosPorDia[fechaDia]) {
                ingresosPorDia[fechaDia] = 0;
            }
            ingresosPorDia[fechaDia] += registro.valorTotal || 0;
        });
        
        res.status(200).json({
            periodo: {
                desde: inicio.toISOString().split('T')[0],
                hasta: fin.toISOString().split('T')[0]
            },
            ingresoTotal,
            ingresosPorSuscripcion,
            ingresosPorDia,
            totalRegistros: registros.length
        });
    } catch (error) {
        console.error('Error al generar reporte de ingresos:', error);
        res.status(500).json({ mensaje: 'Error al generar reporte de ingresos', error: error.message });
    }
};

/**
 * Genera reporte de vehículos por tipo
 */
exports.reporteVehiculos = async (req, res) => {
    try {
        // Contar vehículos por tipo
        const totalVehiculos = await Vehiculo.countDocuments();
        const carros = await Vehiculo.countDocuments({ tipoVehiculo: 'carro' });
        const motos = await Vehiculo.countDocuments({ tipoVehiculo: 'moto' });
        const bicicletas = await Vehiculo.countDocuments({ tipoVehiculo: 'bicicleta' });
        
        // Vehículos más frecuentes (top 5 marcas)
        const marcasPopulares = await Vehiculo.aggregate([
            { $group: { _id: '$marca', cantidad: { $sum: 1 } } },
            { $sort: { cantidad: -1 } },
            { $limit: 5 }
        ]);
        
        res.status(200).json({
            totalVehiculos,
            distribucionPorTipo: {
                carros,
                motos,
                bicicletas
            },
            porcentajePorTipo: {
                carros: totalVehiculos > 0 ? ((carros / totalVehiculos) * 100).toFixed(2) + '%' : '0%',
                motos: totalVehiculos > 0 ? ((motos / totalVehiculos) * 100).toFixed(2) + '%' : '0%',
                bicicletas: totalVehiculos > 0 ? ((bicicletas / totalVehiculos) * 100).toFixed(2) + '%' : '0%'
            },
            marcasMasComunes: marcasPopulares.map(item => ({
                marca: item._id || 'No especificada',
                cantidad: item.cantidad
            }))
        });
    } catch (error) {
        console.error('Error al generar reporte de vehículos:', error);
        res.status(500).json({ mensaje: 'Error al generar reporte de vehículos', error: error.message });
    }
};

/**
 * Genera reporte de suscripciones
 */
exports.reporteSuscripciones = async (req, res) => {
    try {
        // Contar clientes por tipo de suscripción
        const totalClientes = await Cliente.countDocuments();
        const sinSuscripcion = await Cliente.countDocuments({ tipoSuscripcion: 'ninguna' });
        const suscripcionDiaria = await Cliente.countDocuments({ tipoSuscripcion: 'diaria' });
        const suscripcionMensual = await Cliente.countDocuments({ tipoSuscripcion: 'mensual' });
        
        // Calcular ingresos por suscripciones (asumiendo valores fijos por tipo)
        const valorDiario = 5000; // Valor ejemplo
        const valorMensual = 100000; // Valor ejemplo
        
        const ingresosDiarios = suscripcionDiaria * valorDiario;
        const ingresosMensuales = suscripcionMensual * valorMensual;
        const ingresosTotales = ingresosDiarios + ingresosMensuales;
        
        res.status(200).json({
            totalClientes,
            distribucionSuscripciones: {
                ninguna: sinSuscripcion,
                diaria: suscripcionDiaria,
                mensual: suscripcionMensual
            },
            porcentajeSuscripciones: {
                ninguna: totalClientes > 0 ? ((sinSuscripcion / totalClientes) * 100).toFixed(2) + '%' : '0%',
                diaria: totalClientes > 0 ? ((suscripcionDiaria / totalClientes) * 100).toFixed(2) + '%' : '0%',
                mensual: totalClientes > 0 ? ((suscripcionMensual / totalClientes) * 100).toFixed(2) + '%' : '0%'
            },
            ingresos: {
                diarios: ingresosDiarios,
                mensuales: ingresosMensuales,
                total: ingresosTotales
            }
        });
    } catch (error) {
        console.error('Error al generar reporte de suscripciones:', error);
        res.status(500).json({ mensaje: 'Error al generar reporte de suscripciones', error: error.message });
    }
};

/**
 * Genera reporte de uso diario
 */
exports.reporteUsoDiario = async (req, res) => {
    try {
        const { fecha } = req.query;
        
        // Si no se proporciona fecha, usar la fecha actual
        const fechaConsulta = fecha ? new Date(fecha) : new Date();
        
        // Establecer inicio y fin del día
        const inicioDia = new Date(fechaConsulta.setHours(0, 0, 0, 0));
        const finDia = new Date(fechaConsulta.setHours(23, 59, 59, 999));
        
        // Consultar registros del día
        const registrosDia = await Registro.find({
            $or: [
                { fechaEntrada: { $gte: inicioDia, $lte: finDia } },
                { fechaSalida: { $gte: inicioDia, $lte: finDia } },
                {
                    fechaEntrada: { $lte: inicioDia },
                    fechaSalida: { $gte: finDia } // Vehículos que estaban antes y siguen después
                }
            ]
        }).populate('vehiculo', 'placa tipoVehiculo')
          .populate('cliente', 'nombre documento');
        
        // Agrupar registros por hora
        const registrosPorHora = Array(24).fill(0);
        
        registrosDia.forEach(registro => {
            if (registro.fechaEntrada >= inicioDia && registro.fechaEntrada <= finDia) {
                const hora = registro.fechaEntrada.getHours();
                registrosPorHora[hora]++;
            }
        });
        
        // Estadísticas generales
        const entradasTotales = registrosDia.filter(r => 
            r.fechaEntrada >= inicioDia && r.fechaEntrada <= finDia
        ).length;
        
        const salidasTotales = registrosDia.filter(r => 
            r.fechaSalida >= inicioDia && r.fechaSalida <= finDia
        ).length;
        
        const ocupacionMaxima = registrosDia.reduce((max, _, i) => {
            // Contar vehículos presentes a cada hora
            const presentes = registrosDia.filter(r => {
                const hora = new Date(inicioDia);
                hora.setHours(i);
                return r.fechaEntrada <= hora && (!r.fechaSalida || r.fechaSalida >= hora);
            }).length;
            return Math.max(max, presentes);
        }, 0);
        
        res.status(200).json({
            fecha: inicioDia.toISOString().split('T')[0],
            resumen: {
                entradas: entradasTotales,
                salidas: salidasTotales,
                ocupacionMaxima
            },
            registrosPorHora,
            horasMasOcupadas: registrosPorHora
                .map((valor, hora) => ({ hora, valor }))
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 3)
                .map(item => `${item.hora}:00 (${item.valor} entradas)`)
        });
    } catch (error) {
        console.error('Error al generar reporte de uso diario:', error);
        res.status(500).json({ mensaje: 'Error al generar reporte de uso diario', error: error.message });
    }
};