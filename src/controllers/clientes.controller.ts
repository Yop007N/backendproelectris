import { Request, Response } from 'express';
import Cliente from '../models/Cliente';

// PROBLEMA ARREGLADO: Se agregó validación completa de entrada, paginación y manejo de errores mejorado

interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
}

// Función de validación de email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función de validación de RUC (Paraguay - formato simplificado)
const isValidRUC = (ruc: string): boolean => {
  const rucRegex = /^[0-9]{6,8}-[0-9]$/;
  return rucRegex.test(ruc);
};

// Función de validación de CI (Paraguay)
const isValidCI = (ci: string): boolean => {
  const ciRegex = /^[0-9]{1,8}$/;
  return ciRegex.test(ci);
};

// Función de validación de teléfono
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[0-9\s\-()]{8,15}$/;
  return phoneRegex.test(phone);
};

export const getAllClientes = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', search } = req.query as PaginationQuery;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 registros por página
    const offset = (pageNum - 1) * limitNum;

    let whereClause = {};

    // PROBLEMA ARREGLADO: Se agregó búsqueda segura sin SQL injection
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      whereClause = {
        [Cliente.sequelize!.Sequelize.Op.or]: [
          { nombre: { [Cliente.sequelize!.Sequelize.Op.iLike]: `%${searchTerm}%` } },
          { email: { [Cliente.sequelize!.Sequelize.Op.iLike]: `%${searchTerm}%` } },
          { ruc: { [Cliente.sequelize!.Sequelize.Op.iLike]: `%${searchTerm}%` } }
        ]
      };
    }

    const { count, rows: clientes } = await Cliente.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      data: clientes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords: count,
        recordsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener clientes',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const { nombre, direccion, telefono, email, ruc, ci } = req.body;

    // VALIDACIONES AGREGADAS
    const errors: string[] = [];

    if (!nombre || nombre.trim().length < 2) {
      errors.push('El nombre es requerido y debe tener al menos 2 caracteres');
    }

    if (!direccion || direccion.trim().length < 5) {
      errors.push('La dirección es requerida y debe tener al menos 5 caracteres');
    }

    if (!telefono || !isValidPhone(telefono)) {
      errors.push('El teléfono es requerido y debe tener un formato válido');
    }

    if (!email || !isValidEmail(email)) {
      errors.push('El email es requerido y debe tener un formato válido');
    }

    if (ruc && !isValidRUC(ruc)) {
      errors.push('El RUC debe tener el formato válido (ej: 1234567-8)');
    }

    if (ci && !isValidCI(ci)) {
      errors.push('La CI debe contener solo números');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }

    // Verificar duplicados
    const existingClienteByEmail = await Cliente.findOne({ where: { email } });
    if (existingClienteByEmail) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un cliente con este email'
      });
    }

    if (ruc) {
      const existingClienteByRUC = await Cliente.findOne({ where: { ruc } });
      if (existingClienteByRUC) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un cliente con este RUC'
        });
      }
    }

    const nuevoCliente = await Cliente.create({
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      ruc: ruc?.trim(),
      ci: ci?.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: nuevoCliente
    });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear cliente',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const clienteId = req.params.id;
    const { nombre, direccion, telefono, email, ruc, ci } = req.body;

    // VALIDACIÓN: Verificar que el ID sea válido
    if (!clienteId || isNaN(parseInt(clienteId))) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // VALIDACIONES (similar al create pero solo valida campos que vienen)
    const errors: string[] = [];

    if (nombre !== undefined && (!nombre || nombre.trim().length < 2)) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (direccion !== undefined && (!direccion || direccion.trim().length < 5)) {
      errors.push('La dirección debe tener al menos 5 caracteres');
    }

    if (telefono !== undefined && (!telefono || !isValidPhone(telefono))) {
      errors.push('El teléfono debe tener un formato válido');
    }

    if (email !== undefined && (!email || !isValidEmail(email))) {
      errors.push('El email debe tener un formato válido');
    }

    if (ruc !== undefined && ruc && !isValidRUC(ruc)) {
      errors.push('El RUC debe tener el formato válido (ej: 1234567-8)');
    }

    if (ci !== undefined && ci && !isValidCI(ci)) {
      errors.push('La CI debe contener solo números');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }

    // Verificar duplicados (excluyendo el cliente actual)
    if (email && email !== cliente.email) {
      const existingClienteByEmail = await Cliente.findOne({
        where: {
          email,
          id: { [Cliente.sequelize!.Sequelize.Op.ne]: clienteId }
        }
      });
      if (existingClienteByEmail) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otro cliente con este email'
        });
      }
    }

    // Actualizar solo los campos proporcionados
    if (nombre !== undefined) cliente.nombre = nombre.trim();
    if (direccion !== undefined) cliente.direccion = direccion.trim();
    if (telefono !== undefined) cliente.telefono = telefono.trim();
    if (email !== undefined) cliente.email = email.trim().toLowerCase();
    if (ruc !== undefined) cliente.ruc = ruc?.trim();
    if (ci !== undefined) cliente.ci = ci?.trim();

    await cliente.save();

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: cliente
    });

  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar cliente',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const clienteId = req.params.id;

    // VALIDACIÓN: Verificar que el ID sea válido
    if (!clienteId || isNaN(parseInt(clienteId))) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    await cliente.destroy();

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      data: { id: clienteId }
    });

  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar cliente',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

export const getClienteById = async (req: Request, res: Response) => {
  try {
    const clienteId = req.params.id;

    if (!clienteId || isNaN(parseInt(clienteId))) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente
    });

  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener cliente',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};
