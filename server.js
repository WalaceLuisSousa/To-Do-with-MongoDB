const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Criação do app Express
const app = express();
const PORT = 3000;

// Twilio Credentials (Substitua pelas suas credenciais)
const accountSid = 'ACecfb01446fe6802641f29b9cdbb3f727'; // Encontre no painel do Twilio
const authToken = '57bd91a26f8f7cfd5883d56426fa6ff6';   // Encontre no painel do Twilio
const client = twilio(accountSid, authToken);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexão ao MongoDB (Substitua pela sua URL de conexão do MongoDB Atlas, se estiver usando)
mongoose.connect('mongodb+srv://walacesousamedeiros10:TESTEteste123@bancoteste.gy5mi.mongodb.net/?retryWrites=true&w=majority&appName=Bancoteste', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conectado ao MongoDB');
}).catch((err) => {
  console.error('Erro ao conectar ao MongoDB', err);
});

// Definir o schema da tarefa
const TaskSchema = new mongoose.Schema({
  title: String,
  endDate: Date,
  insertionDate: Date,
  time: String,
  completed: { type: Boolean, default: false }
});

const Task = mongoose.model('Task', TaskSchema);

// Função que envia notifica para o whats
async function sendWhatsAppMessage(message) {
  try {
    await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Número do Twilio Sandbox
      to: 'whatsapp:+5519994552925' // walace
    });
    console.log('Mensagem enviada via WhatsApp');
  } catch (error) {
    console.error('Erro ao enviar mensagem via WhatsApp:', error);
  }
}

// Endpoint para adicionar uma tarefa
app.post('/add-task', async (req, res) => {
  const { title, endDate, insertionDate, time } = req.body;

  const task = new Task({
    title,
    endDate,
    insertionDate,
    time
  });

  await task.save();
  res.json({ message: 'Tarefa adicionada com sucesso!' });

  // Enviar notificação via WhatsApp
  await sendWhatsAppMessage(`Tarefa "${title}" foi adicionada com sucesso!`);
});

// Endpoint para obter todas as tarefas
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Endpoint para concluir tarefas
app.post('/complete-task', async (req, res) => {
  const { taskIds } = req.body;

  try {
    // Marcar as tarefas como concluídas
    const tasks = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: { completed: true } }
    );

    // Enviar notificação via WhatsApp
    await sendWhatsAppMessage('');

    // Enviar notificação para cada tarefa concluída
    for (const taskId of taskIds) {
      const task = await Task.findById(taskId); // Obtém a tarefa para pegar o título
      if (task) {
        await sendWhatsAppMessage(`Tarefa "${task.title}" foi concluída com sucesso!`);
      }
    }

    res.json({ message: '' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao concluir tarefas.' });
  }
});


// Endpoint para excluir tarefas
app.post('/delete-task', async (req, res) => {
  const { taskIds } = req.body;

  try {
    // Obtém as tarefas para enviar notificação
    const tasks = await Task.find({ _id: { $in: taskIds } });

    await Task.deleteMany({ _id: { $in: taskIds } });
    res.json({ message: '' });

    // Enviar notificação via WhatsApp
    await sendWhatsAppMessage('');

    // Enviar notificação para cada tarefa excluída
    for (const task of tasks) {
      await sendWhatsAppMessage(`Tarefa "${task.title}" foi excluída com sucesso!`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir tarefas.' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
