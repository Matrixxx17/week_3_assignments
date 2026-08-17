const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "data", "tasks.json");

app.use(cors());
app.use(express.json());

function readTasks() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// GET all tasks
app.get("/tasks", (req, res) => {
  const tasks = readTasks();
  res.status(200).json(tasks);
});

// GET one task
app.get("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.status(200).json(task);
});

// POST create task
app.post("/tasks", (req, res) => {
  const { title, description } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }

  const tasks = readTasks();
  const newTask = {
    id: Date.now().toString(),
    title,
    description: description || "",
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

// PUT update task
app.put("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  const { title, description, completed } = req.body;
  tasks[index] = {
    ...tasks[index],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(completed !== undefined && { completed }),
  };

  writeTasks(tasks);
  res.status(200).json(tasks[index]);
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  const [deleted] = tasks.splice(index, 1);
  writeTasks(tasks);
  res.status(200).json(deleted);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
