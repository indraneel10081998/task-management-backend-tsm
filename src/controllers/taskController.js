const { Task } = require('../models');
const { Op } = require('sequelize');


const validateTaskData = (data) => {
  const errors = [];

  if (!data.title || data.title.length < 3) {
    errors.push('Title is required and should be at least 3 characters long');
  }

  if (!data.description || data.description.length < 5) {
    errors.push('Description is required and should be at least 5 characters long');
  }

  if (!data.createTime || isNaN(Date.parse(data.createTime))) {
    errors.push('Create time is required and should be a valid date');
  }

  return errors;
};

exports.createTask = async (req, res) => {
  const { title, description, submissionTime, createTime } = req.body;

  const validationErrors = validateTaskData({ title, description, submissionTime, createTime });

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const task = await Task.create({
      title, 
      description, 
      userId: req.userId,
      submissionTime,
      createTime
    });
    res.status(201).json({ message: 'Task created', data:task });
  } catch (err) {
    res.status(500).json({ error: 'Task creation failed', msg: err.message });
  }
};

exports.getTasks = async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
  
    try {
      const offset = (page - 1) * limit;
  
      const whereConditions = {
        userId: req.userId,
      };
  
      if (search) {
        whereConditions.title = {
          [Op.iLike]: `%${search}%`,
        };
      }
  
      const tasks = await Task.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createTime', 'DESC']],
      });

      if (tasks.count === 0) {
        return res.status(200).json({
          message: 'No tasks available',
          data: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalTasks: 0,
          },
        });
      }
  
      const totalPages = Math.ceil(tasks.count / limit);
  
      res.status(200).json({
        message: 'Tasks fetched successfully',
        data: tasks.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTasks: tasks.count,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch tasks', msg: err.message });
    }
  };
  


exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, submissionTime, createTime } = req.body;

  const validationErrors = validateTaskData({ title, description, submissionTime, createTime });

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const task = await Task.findOne({ where: { id, userId: req.userId } });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.submissionTime = submissionTime || task.submissionTime;
    task.createTime = createTime || task.createTime;

    await task.save();

    res.status(200).json({ message: 'Task updated', data:task });
  } catch (err) {
    res.status(500).json({ error: 'Task update failed', msg: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({ where: { id, userId: req.userId } });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Task deletion failed', msg: err.message });
  }
};
